# Simple PowerShell script to create placeholder icon files

# Create icons directory if it doesn't exist
$iconsDir = "icons"
if (-not (Test-Path $iconsDir)) {
    New-Item -ItemType Directory -Path $iconsDir | Out-Null
    Write-Host "Created icons directory"
}

# Function to create a simple colored square with text
function Create-SimpleIcon {
    param (
        [int]$size,
        [string]$outputPath
    )

    Add-Type -AssemblyName System.Drawing
    
    # Create a new bitmap
    $bitmap = New-Object System.Drawing.Bitmap($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    
    # Fill with blue background
    $bgColor = [System.Drawing.Color]::FromArgb(0, 120, 212)
    $graphics.Clear($bgColor)
    
    # Add text
    $font = New-Object System.Drawing.Font("Arial", [Math]::Max(($size / 4), 8), [System.Drawing.FontStyle]::Bold)
    $textColor = [System.Drawing.Color]::White
    $brush = New-Object System.Drawing.SolidBrush($textColor)
    $format = New-Object System.Drawing.StringFormat
    $format.Alignment = [System.Drawing.StringAlignment]::Center
    $format.LineAlignment = [System.Drawing.StringAlignment]::Center
    
    # Use "P" for small icons, "PIN" for larger ones
    $text = if ($size -lt 32) { "P" } else { "PIN" }
    
    $graphics.DrawString($text, $font, $brush, [System.Drawing.RectangleF]::new(0, 0, $size, $size), $format)
    
    # Save the image
    $bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    # Clean up
    $graphics.Dispose()
    $bitmap.Dispose()
    
    Write-Host "Created $outputPath ($size x $size)"
}

# Create each icon size
Write-Host "Creating icon files..."
Create-SimpleIcon -size 16 -outputPath "icons\icon16.png"
Create-SimpleIcon -size 32 -outputPath "icons\icon32.png"
Create-SimpleIcon -size 48 -outputPath "icons\icon48.png"
Create-SimpleIcon -size 128 -outputPath "icons\icon128.png"

Write-Host "Icon creation complete!"
