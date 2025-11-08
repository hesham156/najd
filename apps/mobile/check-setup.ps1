# React Native Setup Checker

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "React Native Setup Checker" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Check 1: Java Version
Write-Host "1. Checking Java version..." -ForegroundColor Yellow
try {
    $javaVersion = java -version 2>&1 | Select-String "version" | Select-Object -First 1
    Write-Host "   $javaVersion" -ForegroundColor White
    
    if ($javaVersion -match "17\.") {
        Write-Host "   [OK] Java 17 found!" -ForegroundColor Green
    } else {
        Write-Host "   [ERROR] Java 17 required! Current version is not 17" -ForegroundColor Red
        $allGood = $false
    }
} catch {
    Write-Host "   [ERROR] Java not found!" -ForegroundColor Red
    $allGood = $false
}
Write-Host ""

# Check 2: JAVA_HOME
Write-Host "2. Checking JAVA_HOME..." -ForegroundColor Yellow
if ($env:JAVA_HOME) {
    Write-Host "   [OK] JAVA_HOME is set: $env:JAVA_HOME" -ForegroundColor Green
} else {
    Write-Host "   [ERROR] JAVA_HOME is not set!" -ForegroundColor Red
    $allGood = $false
}
Write-Host ""

# Check 3: ADB (Android SDK)
Write-Host "3. Checking Android SDK (adb)..." -ForegroundColor Yellow
try {
    $adbVersion = adb version 2>&1 | Select-String "Android Debug Bridge" | Select-Object -First 1
    Write-Host "   $adbVersion" -ForegroundColor White
    Write-Host "   [OK] ADB found!" -ForegroundColor Green
} catch {
    Write-Host "   [ERROR] ADB not found! Install Android Studio" -ForegroundColor Red
    $allGood = $false
}
Write-Host ""

# Check 4: ANDROID_HOME
Write-Host "4. Checking ANDROID_HOME..." -ForegroundColor Yellow
if ($env:ANDROID_HOME) {
    Write-Host "   [OK] ANDROID_HOME is set: $env:ANDROID_HOME" -ForegroundColor Green
} else {
    Write-Host "   [ERROR] ANDROID_HOME is not set!" -ForegroundColor Red
    $allGood = $false
}
Write-Host ""

# Check 5: Connected Devices/Emulators
Write-Host "5. Checking for connected devices..." -ForegroundColor Yellow
try {
    $devices = adb devices 2>&1 | Select-String "device$" | Measure-Object
    if ($devices.Count -gt 0) {
        Write-Host "   [OK] Found $($devices.Count) device(s)" -ForegroundColor Green
        adb devices
    } else {
        Write-Host "   [WARNING] No devices connected!" -ForegroundColor Yellow
        Write-Host "   Start an emulator or connect a device" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   [ERROR] Cannot check devices (adb not working)" -ForegroundColor Red
    $allGood = $false
}
Write-Host ""

# Check 6: google-services.json
Write-Host "6. Checking google-services.json..." -ForegroundColor Yellow
if (Test-Path "android\app\google-services.json") {
    Write-Host "   [OK] google-services.json found!" -ForegroundColor Green
} else {
    Write-Host "   [ERROR] google-services.json NOT found!" -ForegroundColor Red
    Write-Host "   Path: android\app\google-services.json" -ForegroundColor Yellow
    $allGood = $false
}
Write-Host ""

# Check 7: node_modules
Write-Host "7. Checking node_modules..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "   [OK] node_modules found!" -ForegroundColor Green
} else {
    Write-Host "   [ERROR] node_modules NOT found! Run npm install" -ForegroundColor Red
    $allGood = $false
}
Write-Host ""

# Final Summary
Write-Host "========================================" -ForegroundColor Cyan
if ($allGood) {
    Write-Host "[SUCCESS] All checks passed! Ready to run!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Run these commands:" -ForegroundColor White
    Write-Host "Terminal 1: npx react-native start" -ForegroundColor Yellow
    Write-Host "Terminal 2: npx react-native run-android" -ForegroundColor Yellow
} else {
    Write-Host "[FAILED] Some checks failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please fix the issues above and run this script again." -ForegroundColor Yellow
    Write-Host "See TROUBLESHOOTING.md for detailed solutions" -ForegroundColor Cyan
}
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

