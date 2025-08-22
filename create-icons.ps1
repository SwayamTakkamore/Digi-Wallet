# PowerShell script to create simple icon files for the extension
# This creates basic PNG files so the extension can load

Add-Type -AssemblyName System.Drawing

# Create a simple icon with text
function Create-Icon {
    param(
        [int]$Size,
        [string]$FilePath
    )
    
    # Create bitmap
    $bitmap = New-Object System.Drawing.Bitmap($Size, $Size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    
    # Set background color (blue)
    $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(0, 120, 212))
    $graphics.FillRectangle($brush, 0, 0, $Size, $Size)
    
    # Add text (pin emoji or P)
    $font = New-Object System.Drawing.Font("Arial", [math]::max(8, $Size / 3), [System.Drawing.FontStyle]::Bold)
    $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    
    $text = if ($Size -ge 32) { "📌" } else { "P" }
    $stringFormat = New-Object System.Drawing.StringFormat
    $stringFormat.Alignment = [System.Drawing.StringAlignment]::Center
    $stringFormat.LineAlignment = [System.Drawing.StringAlignment]::Center
    
    $rect = New-Object System.Drawing.RectangleF(0, 0, $Size, $Size)
    $graphics.DrawString($text, $font, $textBrush, $rect, $stringFormat)
    
    # Save as PNG
    $bitmap.Save($FilePath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    # Cleanup
    $graphics.Dispose()
    $bitmap.Dispose()
    $brush.Dispose()
    $textBrush.Dispose()
    $font.Dispose()
    
    Write-Host "Created: $FilePath ($Size x $Size)" -ForegroundColor Green
}

# Create icons folder if it doesn't exist
$iconsPath = "icons"
if (-not (Test-Path $iconsPath)) {
    New-Item -ItemType Directory -Path $iconsPath | Out-Null
    Write-Host "Created icons folder" -ForegroundColor Yellow
}

# Create all required icon sizes
Write-Host "Creating extension icons..." -ForegroundColor Cyan

try {
    Create-Icon -Size 16 -FilePath "icons\icon16.png"
    Create-Icon -Size 32 -FilePath "icons\icon32.png"
    Create-Icon -Size 48 -FilePath "icons\icon48.png"
    Create-Icon -Size 128 -FilePath "icons\icon128.png"
    
    Write-Host ""
    Write-Host "✅ All icon files created successfully!" -ForegroundColor Green
    Write-Host "You can now load the extension in Edge without errors." -ForegroundColor White
    Write-Host ""
    Write-Host "💡 For better icons:" -ForegroundColor Yellow
    Write-Host "   - Visit https://favicon.io/emoji-favicons/pushpin/" -ForegroundColor White
    Write-Host "   - Or open icon-generator.html for more options" -ForegroundColor White
    
} catch {
    Write-Host "Error creating icons: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternative: Download icons from https://favicon.io" -ForegroundColor Yellow
}

Write-Host ""
Read-Host "Press Enter to continue"
