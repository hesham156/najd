# Najd Project Setup and Run Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Najd Project Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Create environment files
Write-Host "Creating environment files..." -ForegroundColor Yellow

# Web .env.local
$webEnvContent = @"
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyA-ZRrKs-ELQlDDZTFPdo7BD4MeoZ2v_gY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=najd-5e7c7.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=najd-5e7c7
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=najd-5e7c7.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=193143900640
NEXT_PUBLIC_FIREBASE_APP_ID=1:193143900640:web:bdb4e1cc5b5c3a6cf78385
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-QMMXQQZ977
NEXT_PUBLIC_USE_FIREBASE_EMULATORS=false
"@

# Mobile .env.local
$mobileEnvContent = @"
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyA-ZRrKs-ELQlDDZTFPdo7BD4MeoZ2v_gY
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=najd-5e7c7.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=najd-5e7c7
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=najd-5e7c7.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=193143900640
EXPO_PUBLIC_FIREBASE_APP_ID=1:193143900640:web:bdb4e1cc5b5c3a6cf78385
"@

# Write files
$webEnvContent | Out-File -FilePath "apps\web\.env.local" -Encoding UTF8
$mobileEnvContent | Out-File -FilePath "apps\mobile\.env.local" -Encoding UTF8

Write-Host "Environment files created!" -ForegroundColor Green
Write-Host ""

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
Write-Host ""

Write-Host "1. Installing shared package..." -ForegroundColor White
Set-Location "packages\shared"
npm install --silent
Set-Location "..\..\"

Write-Host "2. Installing web app..." -ForegroundColor White
Set-Location "apps\web"
npm install --silent
Set-Location "..\..\"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   Installation Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Start web app
Write-Host "Starting web application..." -ForegroundColor Yellow
Write-Host "Open: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""

Set-Location "apps\web"
npm run dev

