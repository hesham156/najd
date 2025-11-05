# دليل بناء ملف APK 📦

## الطريقة الموصى بها: EAS Build ⭐

### 1. تثبيت EAS CLI
```bash
npm install -g eas-cli
```

### 2. تسجيل الدخول
```bash
eas login
```

**ليس لديك حساب؟**
- سجل مجاناً: https://expo.dev/signup
- أو استخدم حساب Google/GitHub

### 3. بناء APK
```bash
cd D:/najd/apps/mobile

# للتجربة (APK)
eas build --platform android --profile preview

# للإنتاج (AAB)
eas build --platform android --profile production
```

### 4. انتظر البناء
- ⏱️ يستغرق 10-20 دقيقة
- 🔗 سيعطيك رابط تحميل
- 📱 حمّل APK مباشرة!

---

## ملفات الإعداد

### eas.json
تم إنشاؤه تلقائياً في المجلد. يحتوي على:

```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"  // ← ينتج APK
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"  // ← ينتج AAB للـ Play Store
      }
    }
  }
}
```

---

## الطريقة المحلية (بدون حساب Expo)

### المتطلبات:
- ✅ Android Studio مثبت
- ✅ Android SDK مكون
- ✅ Java JDK 11 أو أحدث
- ✅ مساحة قرص 10GB+

### الخطوات:

#### 1. Prebuild
```bash
cd D:/najd/apps/mobile
npx expo prebuild --platform android
```

هذا ينشئ مجلد `android/`

#### 2. بناء APK
```bash
cd android

# على Windows:
gradlew.bat assembleRelease

# على Mac/Linux:
./gradlew assembleRelease
```

#### 3. موقع APK
```
android/app/build/outputs/apk/release/app-release.apk
```

---

## بناء APK موقّع (Signed)

### 1. إنشاء Keystore

```bash
keytool -genkeypair -v -keystore najd-release-key.keystore -alias najd-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

احفظ:
- 🔑 Password
- 🔑 Alias
- 📍 مكان ملف keystore

### 2. إضافة للمشروع

أنشئ ملف `android/gradle.properties`:

```properties
MYAPP_RELEASE_STORE_FILE=najd-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=najd-key-alias
MYAPP_RELEASE_STORE_PASSWORD=your_password
MYAPP_RELEASE_KEY_PASSWORD=your_password
```

### 3. تعديل build.gradle

في `android/app/build.gradle`:

```gradle
android {
    ...
    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
                storeFile file(MYAPP_RELEASE_STORE_FILE)
                storePassword MYAPP_RELEASE_STORE_PASSWORD
                keyAlias MYAPP_RELEASE_KEY_ALIAS
                keyPassword MYAPP_RELEASE_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            ...
        }
    }
}
```

### 4. بناء APK موقّع
```bash
cd android
gradlew.bat assembleRelease
```

---

## البناء باستخدام EAS محلياً

إذا أردت بناء محلي لكن باستخدام EAS:

```bash
# يتطلب Docker
eas build --platform android --profile preview --local
```

**المميزات:**
- ✅ بناء محلي على جهازك
- ✅ لا يستهلك من quota حسابك
- ✅ أسرع (بدون رفع على السيرفر)
- ⚠️ يحتاج Docker Desktop

---

## اختبار APK

### 1. على الجهاز الحقيقي:
```bash
# فعّل USB Debugging على الهاتف
adb install app-release.apk
```

### 2. على Emulator:
```bash
# شغّل Emulator من Android Studio
adb -e install app-release.apk
```

### 3. مشاركة الملف:
- ارفعه على Google Drive
- أو استخدم خدمة مثل Dropbox
- أو Firebase App Distribution

---

## حجم APK 📊

**للتقليل من حجم APK:**

### 1. تفعيل ProGuard
في `android/app/build.gradle`:

```gradle
buildTypes {
    release {
        minifyEnabled true
        shrinkResources true
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
}
```

### 2. إزالة المكتبات غير المستخدمة
```bash
npm prune
```

### 3. استخدام App Bundle بدلاً من APK
```bash
eas build --platform android --profile production
```

App Bundle أصغر بـ 30-50% عادةً!

---

## نشر على Google Play Store 🚀

### 1. بناء App Bundle
```bash
eas build --platform android --profile production
```

### 2. إنشاء حساب Developer
- https://play.google.com/console
- رسوم لمرة واحدة: $25

### 3. رفع AAB
- افتح Google Play Console
- أنشئ تطبيق جديد
- ارفع ملف AAB
- املأ معلومات التطبيق
- اطلب المراجعة

### 4. التحديثات
```bash
# زود version number في app.json
# ثم:
eas build --platform android --profile production
```

---

## استكشاف الأخطاء 🔧

### خطأ: "Build failed"
```bash
# امسح cache
eas build:cancel
eas build --platform android --clear-cache
```

### خطأ: "Out of memory"
في `android/gradle.properties`:
```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=512m
```

### خطأ: "SDK not found"
```bash
# ثبّت Android SDK من Android Studio
# ثم اضبط ANDROID_HOME في environment variables
```

### خطأ في التوقيع
```bash
# تحقق من صحة keystore
keytool -list -v -keystore najd-release-key.keystore
```

---

## الخلاصة السريعة 🎯

**للتجربة السريعة:**
```bash
eas build --platform android --profile preview
```

**للنشر على Play Store:**
```bash
eas build --platform android --profile production
```

**للبناء المحلي:**
```bash
npx expo prebuild --platform android
cd android && gradlew.bat assembleRelease
```

---

## الموارد 📚

- [Expo EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [Android Studio](https://developer.android.com/studio)
- [Signing Android Apps](https://reactnative.dev/docs/signed-apk-android)
- [Google Play Console](https://play.google.com/console)

---

**بالتوفيق في بناء التطبيق! 🚀**

