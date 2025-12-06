# Comprehensive Swagger removal script

# Remove all @ApiResponse, @ApiQuery decorators from DSA controllers
$filesToFix = @(
    "src/dsa-questions/code-execution.controller.ts",
    "src/dsa-questions/dsa-progress.controller.ts",
    "src/dsa-questions/dsa-questions.controller.ts",
    "src/dsa-questions/dto/execute-code.dto.ts",
    "src/users/users.controller.ts",
    "src/payments/dto/payment-response.dto.ts",
    "src/subscriptions/dto/create-subscription.dto.ts"
)

foreach ($file in $filesToFix) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        
        # Remove @ApiResponse decorators (multiline)
        $content = $content -replace "@ApiResponse\(\{[^}]*status:[^}]*\}\)\r?\n?\s*", ""
        
        # Remove @ApiQuery decorators (multiline)
        $content = $content -replace "@ApiQuery\(\{[^}]*\}\)\r?\n?\s*", ""
        
        # Remove @ApiBody decorators
        $content = $content -replace "@ApiBody\(\{[^}]*\}\)\r?\n?\s*", ""
        
        # Remove orphaned decorator content (lines like "enum: PaymentMethod,")
        $content = $content -replace "\s+enum:\s+\w+,\r?\n?", ""
        $content = $content -replace "\s+example:\s+[^,]+,\r?\n?", ""
        $content = $content -replace "\s+required:\s+\w+,\r?\n?", ""
        $content = $content -replace "\s+\}\)\r?\n?\s+method", "  method"
        
        Set-Content -Path $file -Value $content -NoNewline
        Write-Host "Fixed: $file"
    }
}

Write-Host "`nAll decorators removed!"
