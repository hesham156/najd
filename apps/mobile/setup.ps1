# React Native CLI Setup Script for Windows
# نص إعداد React Native CLI لنظام Windows

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "React Native CLI Setup" -ForegroundColor Cyan
Write-Host "إعداد React Native CLI" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if google-services.json exists
Write-Host "Checking for google-services.json..." -ForegroundColor Yellow
Write-Host "البحث عن ملف google-services.json..." -ForegroundColor Yellow

if (Test-Path "android\app\google-services.json") {
    Write-Host "✓ google-services.json found!" -ForegroundColor Green
    Write-Host "✓ تم العثور على ملف google-services.json!" -ForegroundColor Green
} else {
    Write-Host "✗ google-services.json NOT found!" -ForegroundColor Red
    Write-Host "✗ لم يتم العثور على ملف google-services.json!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please download google-services.json from Firebase Console and place it in:" -ForegroundColor Yellow
    Write-Host "الرجاء تحميل google-services.json من Firebase Console ووضعه في:" -ForegroundColor Yellow
    Write-Host "  android\app\google-services.json" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "See REACT_NATIVE_CLI_SETUP.md for instructions" -ForegroundColor Yellow
    Write-Host "راجع ملف REACT_NATIVE_CLI_SETUP.md للتعليمات" -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "Continue anyway? (y/n) / هل تريد المتابعة؟"
    if ($continue -ne "y") {
        exit
    }
}

Write-Host ""
Write-Host "Step 1: Cleaning old installation..." -ForegroundColor Yellow
Write-Host "الخطوة 1: تنظيف التثبيت القديم..." -ForegroundColor Yellow

if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force node_modules
    Write-Host "✓ Removed node_modules" -ForegroundColor Green
}

if (Test-Path "package-lock.json") {
    Remove-Item -Force package-lock.json
    Write-Host "✓ Removed package-lock.json" -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 2: Installing dependencies..." -ForegroundColor Yellow
Write-Host "الخطوة 2: تثبيت الحزم..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Dependencies installed successfully!" -ForegroundColor Green
    Write-Host "✓ تم تثبيت الحزم بنجاح!" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
    Write-Host "✗ فشل تثبيت الحزم" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 3: Cleaning Android build..." -ForegroundColor Yellow
Write-Host "الخطوة 3: تنظيف بناء الأندرويد..." -ForegroundColor Yellow
cd android
.\gradlew clean
cd ..

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Setup completed successfully!" -ForegroundColor Green
Write-Host "تم الإعداد بنجاح!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "الخطوات التالية:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Make sure Android emulator is running or device is connected" -ForegroundColor White
Write-Host "   تأكد من تشغيل محاكي الأندرويد أو توصيل جهاز" -ForegroundColor White
Write-Host ""
Write-Host "2. In one terminal, start Metro:" -ForegroundColor White
Write-Host "   في terminal واحد، شغّل Metro:" -ForegroundColor White
Write-Host "   npx react-native start" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. In another terminal, run the app:" -ForegroundColor White
Write-Host "   في terminal آخر، شغّل التطبيق:" -ForegroundColor White
Write-Host "   npx react-native run-android" -ForegroundColor Yellow
Write-Host ""

