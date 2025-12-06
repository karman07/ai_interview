# Script to remove all Swagger decorators and imports from TypeScript files

$files = Get-ChildItem -Path "src" -Recurse -Filter "*.ts"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $modified = $false
    
    # Remove Swagger import lines
    if ($content -match "import.*from\s+['\`"]@nestjs/swagger['\`"];?") {
        $content = $content -replace "import\s+\{[^}]+\}\s+from\s+['\`"]@nestjs/swagger['\`"];?\r?\n?", ""
        $modified = $true
    }
    
    # Remove ApiTags decorator
    if ($content -match "@ApiTags\(") {
        $content = $content -replace "@ApiTags\([^\)]*\)\r?\n?", ""
        $modified = $true
    }
    
    # Remove ApiBearerAuth decorator
    if ($content -match "@ApiBearerAuth\(") {
        $content = $content -replace "@ApiBearerAuth\([^\)]*\)\r?\n?", ""
        $modified = $true
    }
    
    # Remove ApiOperation decorator
    if ($content -match "@ApiOperation\(") {
        $content = $content -replace "@ApiOperation\(\{[^}]+\}\)\r?\n?\s*", ""
        $modified = $true
    }
    
    # Remove ApiResponse decorator
    if ($content -match "@ApiResponse\(") {
        $content = $content -replace "@ApiResponse\(\{(?:[^{}]|\{[^}]*\})*\}\)\r?\n?\s*", ""
        $modified = $true
    }
    
    # Remove ApiParam decorator
    if ($content -match "@ApiParam\(") {
        $content = $content -replace "@ApiParam\(\{(?:[^{}]|\{[^}]*\})*\}\)\r?\n?\s*", ""
        $modified = $true
    }
    
    # Remove ApiBody decorator
    if ($content -match "@ApiBody\(") {
        $content = $content -replace "@ApiBody\(\{(?:[^{}]|\{[^}]*\})*\}\)\r?\n?\s*", ""
        $modified = $true
    }
    
    # Remove ApiConsumes decorator
    if ($content -match "@ApiConsumes\(") {
        $content = $content -replace "@ApiConsumes\([^\)]*\)\r?\n?\s*", ""
        $modified = $true
    }
    
    # Remove ApiProperty decorator
    if ($content -match "@ApiProperty\(") {
        $content = $content -replace "@ApiProperty\(\{(?:[^{}]|\{[^}]*\})*\}\)\r?\n?\s*", ""
        $content = $content -replace "@ApiProperty\(\)\r?\n?\s*", ""
        $modified = $true
    }
    
    # Remove ApiPropertyOptional decorator
    if ($content -match "@ApiPropertyOptional\(") {
        $content = $content -replace "@ApiPropertyOptional\(\{(?:[^{}]|\{[^}]*\})*\}\)\r?\n?\s*", ""
        $content = $content -replace "@ApiPropertyOptional\(\)\r?\n?\s*", ""
        $modified = $true
    }
    
    # Replace PartialType from swagger with mapped-types
    if ($content -match "PartialType.*from\s+['\`"]@nestjs/swagger") {
        $content = $content -replace "from\s+['\`"]@nestjs/swagger['\`"]", "from '@nestjs/mapped-types'"
        $modified = $true
    }
    
    # Clean up multiple empty lines
    $content = $content -replace "(\r?\n){3,}", "`r`n`r`n"
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Updated: $($file.FullName)"
    }
}

Write-Host "`nSwagger decorators removed from all files!"
