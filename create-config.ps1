# Create config.js from .env for Digital Wallet Extension with Firestore support
param(
    [string]$EnvFile = ".env",
    [string]$OutputFile = "config.js"
)

Write-Host "Digital Wallet - Generating Configuration from $EnvFile" -ForegroundColor Cyan

# Check if .env file exists
if (-not (Test-Path $EnvFile)) {
    Write-Host "ERROR: $EnvFile file not found!" -ForegroundColor Red
    
    if (Test-Path ".env.template") {
        Write-Host "Found .env.template - copying to .env..." -ForegroundColor Yellow
        Copy-Item ".env.template" ".env"
        Write-Host "Please edit .env with your Firebase credentials and run this script again." -ForegroundColor Yellow
    } else {
        Write-Host "Please create a $EnvFile file with your Firebase configuration." -ForegroundColor Yellow
    }
    
    exit 1
}

# Read .env file and parse variables
$envVars = @{}
$envContent = Get-Content $EnvFile -ErrorAction SilentlyContinue

foreach ($line in $envContent) {
    # Skip empty lines and comments
    if ([string]::IsNullOrWhiteSpace($line) -or $line.StartsWith('#')) {
        continue
    }
    
    # Parse KEY=VALUE pairs
    if ($line -match '^([^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        
        # Remove quotes if present
        if ($value -match '^"(.*)"$' -or $value -match "^'(.*)'$") {
            $value = $matches[1]
        }
        
        $envVars[$key] = $value
    }
}

Write-Host "Found $($envVars.Count) environment variables" -ForegroundColor Green

# Generate config.js content
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$configContent = @"
// Environment Configuration for Digital Wallet Extension
// This file is generated from .env - DO NOT EDIT MANUALLY
// Generated on: $timestamp

window.ENV_CONFIG = {
  // Firebase/Firestore Configuration
  FIREBASE_API_KEY: '$($envVars['FIREBASE_API_KEY'] -replace "'", "\'")',
  FIREBASE_AUTH_DOMAIN: '$($envVars['FIREBASE_AUTH_DOMAIN'] -replace "'", "\'")',
  FIREBASE_PROJECT_ID: '$($envVars['FIREBASE_PROJECT_ID'] -replace "'", "\'")',
  FIREBASE_STORAGE_BUCKET: '$($envVars['FIREBASE_STORAGE_BUCKET'] -replace "'", "\'")',
  FIREBASE_MESSAGING_SENDER_ID: '$($envVars['FIREBASE_MESSAGING_SENDER_ID'] -replace "'", "\'")',
  FIREBASE_APP_ID: '$($envVars['FIREBASE_APP_ID'] -replace "'", "\'")',
  
  // Legacy MongoDB Config (deprecated - kept for reference)
  MONGODB_CONNECTION_STRING: '$($envVars['MONGODB_CONNECTION_STRING'] -replace "'", "\'")',
  MONGODB_ATLAS_API_KEY: '$($envVars['MONGODB_ATLAS_API_KEY'] -replace "'", "\'")',
  MONGODB_ATLAS_DATA_API_URL: '$($envVars['MONGODB_ATLAS_DATA_API_URL'] -replace "'", "\'")',
  MONGODB_CLUSTER_NAME: '$($envVars['MONGODB_CLUSTER_NAME'] -replace "'", "\'")',
  MONGODB_DATABASE_NAME: '$($envVars['MONGODB_DATABASE_NAME'] -replace "'", "\'")',
  MONGODB_COLLECTION_NAME: '$($envVars['MONGODB_COLLECTION_NAME'] -replace "'", "\'")' 
};

"@

# Write config.js file
try {
    Set-Content -Path $OutputFile -Value $configContent -Encoding UTF8
    Write-Host "Success: Configuration file generated: $OutputFile" -ForegroundColor Green
    
    # Validate Firebase configuration
    $requiredFirebaseVars = @('FIREBASE_API_KEY', 'FIREBASE_AUTH_DOMAIN', 'FIREBASE_PROJECT_ID', 'FIREBASE_STORAGE_BUCKET', 'FIREBASE_MESSAGING_SENDER_ID', 'FIREBASE_APP_ID')
    $missingVars = @()
    
    foreach ($var in $requiredFirebaseVars) {
        if ([string]::IsNullOrWhiteSpace($envVars[$var]) -or $envVars[$var] -like '*your-*' -or $envVars[$var] -like '*123456*') {
            $missingVars += $var
        }
    }
    
    if ($missingVars.Count -gt 0) {
        Write-Host ""
        Write-Host "WARNING: Some Firebase variables need to be configured:" -ForegroundColor Yellow
        foreach ($var in $missingVars) {
            Write-Host "   - $var" -ForegroundColor Yellow
        }
        Write-Host ""
        Write-Host "To set up Firebase:" -ForegroundColor Cyan
        Write-Host "1. Go to https://console.firebase.google.com/" -ForegroundColor White
        Write-Host "2. Create a project or select existing one" -ForegroundColor White
        Write-Host "3. Go to Project Settings, General, Your apps" -ForegroundColor White
        Write-Host "4. Add a Web app and copy the config values" -ForegroundColor White
        Write-Host "5. Update your .env file with the real values" -ForegroundColor White
        Write-Host "6. Run this script again" -ForegroundColor White
    } else {
        Write-Host "Success: All Firebase variables are configured" -ForegroundColor Green
    }
    
} catch {
    Write-Host "ERROR: Failed to write $OutputFile" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Configuration generation complete!" -ForegroundColor Green
