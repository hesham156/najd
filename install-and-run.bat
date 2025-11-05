@echo off
echo ========================================
echo   Installing Najd Project Dependencies
echo ========================================
echo.

REM Setup environment files first
call setup-env.bat

echo Installing shared package...
cd packages\shared
call npm install
cd ..\..

echo.
echo Installing web app...
cd apps\web
call npm install
cd ..\..

echo.
echo ========================================
echo   Installation Complete!
echo   Starting Web Application...
echo ========================================
echo.

cd apps\web
start cmd /k "npm run dev"

echo.
echo Web app is starting on http://localhost:3000
echo.
echo Press any key to exit this window...
pause > nul

