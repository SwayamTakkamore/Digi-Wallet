# Digital Wallet Extension Setup Script with Firestore Support
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Digital Wallet Extension Setup" -ForegroundColor Cyan  
Write-Host "   Now with Firestore Cloud Sync!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running from the correct directory
if (-not (Test-Path "manifest.json")) {
    Write-Host "ERROR: manifest.json not found!" -ForegroundColor Red
    Write-Host "Please run this script from the extension directory." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "1. Checking extension files..." -ForegroundColor Yellow
$missingFiles = $false

$requiredFiles = @("popup.html", "popup.js", "background.js")
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "   ✓ $file found" -ForegroundColor Green
    } else {
        Write-Host "   ✗ $file is missing" -ForegroundColor Red
        $missingFiles = $true
    }
}

# Check icons folder
if (-not (Test-Path "icons")) {
    Write-Host "   ! icons folder not found - creating it..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path "icons" | Out-Null
    Write-Host "   ✓ Created icons folder" -ForegroundColor Green
} else {
    Write-Host "   ✓ icons folder found" -ForegroundColor Green
}

# Check for icon files
$iconSizes = @("16", "32", "48", "128")
foreach ($size in $iconSizes) {
    $iconFile = "icons\icon$size.png"
    if (-not (Test-Path $iconFile)) {
        Write-Host "   ! icon$size.png missing" -ForegroundColor Yellow
    } else {
        Write-Host "   ✓ icon$size.png found" -ForegroundColor Green
    }
}

Write-Host ""

if ($missingFiles) {
    Write-Host "ERROR: Some required files are missing!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "2. Checking Firestore configuration..." -ForegroundColor Yellow

# Check for .env file and generate config.js
if (Test-Path ".env") {
    Write-Host "   ✓ .env file found - generating config.js..." -ForegroundColor Green
    
    try {
        # Run the config generation script
        & .\create-config.ps1
        Write-Host "   ✓ config.js generated successfully" -ForegroundColor Green
    }
    catch {
        Write-Host "   ✗ Failed to generate config.js" -ForegroundColor Red
        Write-Host "   Please run: .\create-config.ps1 manually" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ! .env file not found" -ForegroundColor Yellow
    Write-Host "   Copy .env.template to .env and add your Firebase credentials" -ForegroundColor White
    
    if (Test-Path ".env.template") {
        Write-Host "   ✓ .env.template found - copying to .env..." -ForegroundColor Yellow
        Copy-Item ".env.template" ".env"
        Write-Host "   ✓ Created .env file - please edit with your Firebase credentials" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "3. Opening Edge Extensions page..." -ForegroundColor Yellow
Start-Process "msedge.exe" -ArgumentList "edge://extensions/"

Write-Host ""
Write-Host "4. Installation Instructions:" -ForegroundColor Cyan
Write-Host "   a) Enable 'Developer mode' in the left sidebar" -ForegroundColor White
Write-Host "   b) Click 'Load unpacked'" -ForegroundColor White
Write-Host "   c) Select this folder: $PWD" -ForegroundColor White
Write-Host "   d) The extension will appear in your toolbar" -ForegroundColor White

Write-Host ""
Write-Host "5. Firestore Setup (for cloud sync):" -ForegroundColor Cyan
Write-Host "   a) Go to https://console.firebase.google.com/" -ForegroundColor White
Write-Host "   b) Create a new project" -ForegroundColor White
Write-Host "   c) Enable Firestore Database" -ForegroundColor White
Write-Host "   d) Add Web app and copy config to .env file" -ForegroundColor White
Write-Host "   e) Run: .\create-config.ps1 to update config" -ForegroundColor White

Write-Host ""
Write-Host "6. Creating Icons (if needed):" -ForegroundColor Cyan
Write-Host "   - Open icon-generator.html in your browser for help" -ForegroundColor White
Write-Host "   - Or use online tools like favicon.io" -ForegroundColor White
Write-Host "   - Create 16x16, 32x32, 48x48, and 128x128 PNG files" -ForegroundColor White
Write-Host "   - Save them in the 'icons' folder" -ForegroundColor White

Write-Host ""
Write-Host "Setup complete! 🎉" -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to exit"
