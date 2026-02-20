# PowerShell script to run SQL via Supabase REST API
# This will execute the stock reduction fix directly on the remote database

$SUPABASE_URL = "https://tnofewwkwlyjsqgwjjga.supabase.co"
$SERVICE_ROLE_KEY = $env:SUPABASE_SERVICE_ROLE_KEY

if (!$SERVICE_ROLE_KEY) {
    Write-Error "SUPABASE_SERVICE_ROLE_KEY environment variable not found!"
    Write-Host "Please set it first:"
    Write-Host 'Set environment variable SUPABASE_SERVICE_ROLE_KEY with your service role key from Supabase dashboard'
    exit 1
}

# Read the SQL file
$sqlContent = Get-Content -Path "fix-stock-reduction.sql" -Raw

Write-Host "🔄 Executing stock reduction fix via Supabase REST API..."

# Execute SQL via RPC call
$headers = @{
    'Authorization' = "Bearer $SERVICE_ROLE_KEY"
    'apikey' = $SERVICE_ROLE_KEY
    'Content-Type' = 'application/json'
}

try {
    # We'll use a simple approach: execute the SQL as a database function call
    $body = @{
        query = $sqlContent
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/rpc/execute_sql" -Method POST -Headers $headers -Body $body -ErrorAction Stop
    
    Write-Host "✅ SQL executed successfully!"
    Write-Host $response | ConvertTo-Json -Depth 3
    
} catch {
    # If direct SQL execution fails, let's try creating a temp function to execute it
    Write-Host "⚠️  Direct SQL execution failed. Trying alternative method..."
    
    try {
        # Create and call a temporary SQL execution function
        $tempFunc = @"
CREATE OR REPLACE FUNCTION temp_execute_fix() 
RETURNS text 
LANGUAGE plpgsql 
SECURITY DEFINER 
AS `$`$
BEGIN
  $sqlContent
  RETURN 'Stock reduction function updated successfully';
END;
`$`$;

SELECT temp_execute_fix();
DROP FUNCTION temp_execute_fix();
"@

        $body2 = @{
            query = $tempFunc
        } | ConvertTo-Json

        $response2 = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/rpc/sql" -Method POST -Headers $headers -Body $body2 -ErrorAction Stop
        
        Write-Host "✅ SQL executed via temp function!"
        Write-Host $response2 | ConvertTo-Json -Depth 3
        
    } catch {
        Write-Error "❌ Failed to execute SQL: $($_.Exception.Message)"
        Write-Host ""
        Write-Host "🔧 Manual steps needed:"
        Write-Host "1. Go to: https://supabase.com/dashboard/project/tnofewwkwlyjsqgwjjga/sql"
        Write-Host "2. Copy and paste the content of fix-stock-reduction.sql"
        Write-Host "3. Click 'Run' button"
        exit 1
    }
}

Write-Host ""
Write-Host "🧪 Testing the fix..."

# Test the fixed function
$testBody = @{
    p_order_id = "8a9ea6bf-14a3-4634-ade2-78b8b2e4e96a"
} | ConvertTo-Json

try {
    $testResponse = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/rpc/process_order_stock_reduction" -Method POST -Headers $headers -Body $testBody
    
    Write-Host "🔧 Test result:"
    Write-Host "Processed items: $($testResponse.processed_count)"
    Write-Host "Failed products: $($testResponse.failed_products -join ', ')"
    
    if ($testResponse.processed_count -gt 0) {
        Write-Host "✅ SUCCESS! Stock reduction is now working!"
    } else {
        Write-Host "❌ Still having issues. Check failed products above."
    }
    
} catch {
    Write-Error "❌ Failed to test: $($_.Exception.Message)"
}
