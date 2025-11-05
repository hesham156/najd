@echo off
echo Creating environment files for Najd project...

REM Create Web .env.local
echo NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyA-ZRrKs-ELQlDDZTFPdo7BD4MeoZ2v_gY > apps\web\.env.local
echo NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=najd-5e7c7.firebaseapp.com >> apps\web\.env.local
echo NEXT_PUBLIC_FIREBASE_PROJECT_ID=najd-5e7c7 >> apps\web\.env.local
echo NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=najd-5e7c7.firebasestorage.app >> apps\web\.env.local
echo NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=193143900640 >> apps\web\.env.local
echo NEXT_PUBLIC_FIREBASE_APP_ID=1:193143900640:web:bdb4e1cc5b5c3a6cf78385 >> apps\web\.env.local
echo NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-QMMXQQZ977 >> apps\web\.env.local
echo NEXT_PUBLIC_USE_FIREBASE_EMULATORS=false >> apps\web\.env.local

REM Create Mobile .env.local
echo EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyA-ZRrKs-ELQlDDZTFPdo7BD4MeoZ2v_gY > apps\mobile\.env.local
echo EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=najd-5e7c7.firebaseapp.com >> apps\mobile\.env.local
echo EXPO_PUBLIC_FIREBASE_PROJECT_ID=najd-5e7c7 >> apps\mobile\.env.local
echo EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=najd-5e7c7.firebasestorage.app >> apps\mobile\.env.local
echo EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=193143900640 >> apps\mobile\.env.local
echo EXPO_PUBLIC_FIREBASE_APP_ID=1:193143900640:web:bdb4e1cc5b5c3a6cf78385 >> apps\mobile\.env.local

echo.
echo Environment files created successfully!
echo.

