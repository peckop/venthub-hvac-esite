Write-Host "--- VentHub Rapid CI Health Check ---"

# 1. Lint Check
Write-Host "[1/3] Checking Linter..."
pnpm run lint:ci > lint_results.txt 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "LINT FAILURES DETECTED:"
    Get-Content -Path lint_results.txt | Select-String "error" | Select-Object -First 10
} else {
    Write-Host "Linter passed."
}

# 2. Type Check
Write-Host "[2/3] Checking Types (TSC)..."
pnpm exec tsc -b tsconfig.build.json > tsc_errors.txt 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "TYPE ERRORS DETECTED:"
    Get-Content -Path tsc_errors.txt | Select-String "error" | Select-Object -First 10
} else {
    Write-Host "Type check passed."
}

# 3. Test Check
Write-Host "[3/3] Running Unit Tests..."
pnpm test -- --run > test_failures.txt 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "TEST FAILURES DETECTED:"
    Get-Content -Path test_failures.txt | Select-String "FAIL" | Select-Object -First 5
} else {
    Write-Host "Tests passed."
}

Write-Host "--- HEALTH CHECK COMPLETE ---"
