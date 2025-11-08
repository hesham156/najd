# دليل حل المشاكل | Troubleshooting Guide

## المشاكل التي تم اكتشافها

### ❌ Problem 1: Java Version Issue (CRITICAL)

**الخطأ:**
```
Unsupported class file major version 68
```

**السبب:**
أنت تستخدم Java 24، لكن React Native يحتاج Java 17 (JDK 17).

**الحل:**

#### الخطوة 1: تحميل Java 17

1. حمّل **Java 17 (JDK 17)** من:
   - [Oracle JDK 17](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html)
   - أو [Microsoft OpenJDK 17](https://learn.microsoft.com/en-us/java/openjdk/download#openjdk-17)

2. ثبّت JDK 17

#### الخطوة 2: تعيين JAVA_HOME

**في Windows:**

1. افتح Start Menu واكتب "Environment Variables"
2. اضغط "Edit the system environment variables"
3. اضغط "Environment Variables..."
4. في System Variables، أضف أو عدّل:
   ```
   Variable name: JAVA_HOME
   Variable value: C:\Program Files\Java\jdk-17
   ```
   (غيّر المسار حسب مكان تثبيتك)

5. أضف إلى PATH:
   ```
   %JAVA_HOME%\bin
   ```

6. أعد تشغيل PowerShell / Command Prompt

#### الخطوة 3: تحقق من الإصدار

```powershell
java -version
```

يجب أن ترى:
```
java version "17.x.x"
```

---

### ❌ Problem 2: Android SDK Not Found

**الخطأ:**
```
'adb' is not recognized
```

**السبب:**
Android SDK غير مثبت أو غير موجود في PATH.

**الحل:**

#### الخطوة 1: تثبيت Android Studio

1. حمّل [Android Studio](https://developer.android.com/studio)
2. ثبّته مع جميع المكونات الافتراضية
3. افتح Android Studio
4. اذهب إلى: Tools → SDK Manager
5. تأكد من تثبيت:
   - ✅ Android SDK Platform 34
   - ✅ Android SDK Build-Tools 34
   - ✅ Android SDK Platform-Tools
   - ✅ Android SDK Tools

#### الخطوة 2: إعداد متغيرات البيئة

**في Windows:**

1. افتح Environment Variables (كما في الأعلى)
2. أضف المتغيرات التالية في System Variables:

```
Variable name: ANDROID_HOME
Variable value: C:\Users\YOUR_USERNAME\AppData\Local\Android\Sdk
```

(غيّر `YOUR_USERNAME` باسم المستخدم الخاص بك)

3. أضف إلى PATH:
```
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
%ANDROID_HOME%\tools\bin
%ANDROID_HOME%\emulator
```

4. أعد تشغيل PowerShell

#### الخطوة 3: تحقق من adb

```powershell
adb version
```

يجب أن ترى نسخة ADB.

---

### ❌ Problem 3: No Android Emulator

**الخطأ:**
```
No emulators found
```

**الحل:**

#### الخيار A: إنشاء محاكي Android

1. افتح Android Studio
2. اذهب إلى: Tools → Device Manager
3. اضغط "Create Device"
4. اختر جهاز (مثلاً: Pixel 5)
5. اختر System Image (يُنصح بـ API 34 - Android 14)
6. اضغط Finish
7. شغّل المحاكي من Device Manager

#### الخيار B: استخدام جهاز فعلي

1. على هاتف Android:
   - اذهب إلى Settings → About Phone
   - اضغط على "Build Number" 7 مرات (لتفعيل Developer Options)
   - ارجع إلى Settings → Developer Options
   - فعّل "USB Debugging"

2. وصّل الهاتف بالكمبيوتر عبر USB

3. تحقق من الاتصال:
```powershell
adb devices
```

يجب أن ترى جهازك في القائمة.

---

### ❌ Problem 4: Missing google-services.json

**المشكلة:**
ملف `google-services.json` غير موجود في `android/app/`

**الحل:**

#### الخطوة 1: الحصول على الملف من Firebase

1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. اختر مشروعك (أو أنشئ مشروع جديد)
3. اذهب إلى Project Settings (⚙️ بجانب "Project Overview")
4. في تبويب "General"، انزل إلى "Your apps"
5. إذا لم يكن لديك تطبيق Android:
   - اضغط "Add app" → اختر Android
   - أدخل Package name: `com.najd.mobile`
   - اضغط "Register app"
6. حمّل ملف `google-services.json`
7. ضع الملف في: `D:\najd\apps\mobile\android\app\google-services.json`

#### الخطوة 2: تفعيل Firebase Services

في Firebase Console:
1. **Authentication**:
   - اذهب إلى Build → Authentication
   - اضغط "Get Started"
   - فعّل Sign-in method: Email/Password

2. **Firestore Database**:
   - اذهب إلى Build → Firestore Database
   - اضغط "Create database"
   - اختر production mode أو test mode

3. **Storage**:
   - اذهب إلى Build → Storage
   - اضغط "Get Started"

---

## الحل الكامل (خطوة بخطوة)

### 1️⃣ ثبّت Java 17 وعيّن JAVA_HOME

```powershell
# تحقق من الإصدار
java -version
# يجب أن يكون 17.x.x
```

### 2️⃣ ثبّت Android Studio وعيّن ANDROID_HOME

```powershell
# تحقق من adb
adb version
```

### 3️⃣ شغّل محاكي Android أو وصّل جهاز

```powershell
# تحقق من الأجهزة المتصلة
adb devices
# يجب أن ترى على الأقل جهاز واحد
```

### 4️⃣ أضف google-services.json

```powershell
# تحقق من وجود الملف
Test-Path D:\najd\apps\mobile\android\app\google-services.json
# يجب أن يكون True
```

### 5️⃣ امسح الـ cache

```powershell
cd D:\najd\apps\mobile

# امسح Gradle cache
Remove-Item -Recurse -Force $env:USERPROFILE\.gradle\caches

# امسح node_modules
Remove-Item -Recurse -Force node_modules
npm install
```

### 6️⃣ شغّل التطبيق

في **Terminal 1**:
```powershell
cd D:\najd\apps\mobile
npx react-native start
```

في **Terminal 2**:
```powershell
cd D:\najd\apps\mobile
npx react-native run-android
```

---

## أوامر التحقق السريع

قبل تشغيل التطبيق، تأكد من:

```powershell
# 1. Java 17
java -version

# 2. ADB يعمل
adb version

# 3. جهاز متصل أو محاكي يعمل
adb devices

# 4. ملف Firebase موجود
Test-Path android\app\google-services.json

# 5. تشخيص React Native
npx react-native doctor
```

---

## إذا استمرت المشاكل

### مسح شامل

```powershell
cd D:\najd\apps\mobile

# امسح node_modules
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json

# امسح Android build
cd android
.\gradlew clean
cd ..

# امسح Metro cache
npx react-native start --reset-cache
```

### إعادة تثبيت كاملة

```powershell
# حذف كل شيء وإعادة التثبيت
Remove-Item -Recurse -Force node_modules, android\build, android\app\build
npm install
cd android
.\gradlew clean
cd ..
```

---

## موارد إضافية

- [React Native Environment Setup](https://reactnative.dev/docs/environment-setup)
- [React Native Firebase Setup](https://rnfirebase.io/)
- [Android Studio Setup Guide](https://developer.android.com/studio/install)

---

## اتصل للدعم

إذا واجهت مشاكل إضافية:
1. استخدم `npx react-native doctor` للتشخيص
2. تحقق من logs في `npx react-native log-android`
3. راجع [React Native Troubleshooting](https://reactnative.dev/docs/troubleshooting)

---

**بعد حل جميع المشاكل أعلاه، يجب أن يعمل التطبيق بنجاح! 🚀**

