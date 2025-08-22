@echo off
echo ================================
echo    Item Pinner Extension Setup
echo ================================
echo.

REM Check if running from the correct directory
if not exist "manifest.json" (
    echo ERROR: manifest.json not found!
    echo Please run this script from the extension directory.
    pause
    exit /b 1
)

echo 1. Checking extension files...
set MISSING_FILES=0

if not exist "popup.html" (
    echo   X popup.html is missing
    set MISSING_FILES=1
) else (
    echo   ✓ popup.html found
)

if not exist "popup.js" (
    echo   X popup.js is missing
    set MISSING_FILES=1
) else (
    echo   ✓ popup.js found
)

if not exist "background.js" (
    echo   X background.js is missing
    set MISSING_FILES=1
) else (
    echo   ✓ background.js found
)

if not exist "icons" (
    echo   ! icons folder not found - you'll need to create icons
    mkdir icons
    echo   ✓ Created icons folder
) else (
    echo   ✓ icons folder found
)

REM Check for icon files
if not exist "icons\icon16.png" echo   ! icon16.png missing
if not exist "icons\icon32.png" echo   ! icon32.png missing  
if not exist "icons\icon48.png" echo   ! icon48.png missing
if not exist "icons\icon128.png" echo   ! icon128.png missing

echo.
if %MISSING_FILES% == 1 (
    echo ERROR: Some required files are missing!
    pause
    exit /b 1
)

echo 2. Opening Edge Extensions page...
start msedge.exe "edge://extensions/"

echo.
echo 3. Instructions:
echo   a) Enable "Developer mode" in the left sidebar
echo   b) Click "Load unpacked"
echo   c) Select this folder: %CD%
echo   d) The extension will appear in your toolbar
echo.
echo 4. Creating icons (if needed):
echo   - Open icon-generator.html in your browser for help
echo   - Or use online tools like favicon.io
echo   - Create 16x16, 32x32, 48x48, and 128x128 PNG files
echo.

echo Setup complete! 🎉
echo.
pause
