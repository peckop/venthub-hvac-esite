# Edge Function'ı test etmek için basit PowerShell scripti
# Bu script tam hata detaylarını gösterecek

$headers = @{
    'Content-Type' = 'application/json'
    'Authorization' = "Bearer $env:SUPABASE_ANON_KEY"
    'apikey' = $env:SUPABASE_ANON_KEY
}

$body = @{
    amount = 1250
    user_id = "test-user-123"
    customerInfo = @{
        email = "test@example.com"
        name = "Test User"
        phone = "+905551234567"
    }
    shippingAddress = @{
        fullAddress = "Test Mahallesi Test Sokak No:1"
        city = "İSTANBUL"
        postalCode = "34000"
    }
    cartItems = @(
        @{
            product_id = "test-product-123"
            quantity = 1
            price = 1250
            product_name = "Test Ürün"
        }
    )
} | ConvertTo-Json -Depth 4

try {
    $response = Invoke-WebRequest -Uri "https://tnofewwkwlyjsqgwjjga.supabase.co/functions/v1/iyzico-payment?debug=1" -Method POST -Body $body -Headers $headers -ErrorAction Stop
    Write-Host "SUCCESS: $($response.StatusCode)"
    Write-Host "Response: $($response.Content)"
} catch {
    Write-Host "ERROR: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error Body: $errorBody"
    }
}
