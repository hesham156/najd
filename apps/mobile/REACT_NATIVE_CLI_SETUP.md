# دليل تشغيل التطبيق بعد التحويل إلى React Native CLI

تم تحويل المشروع بنجاح من Expo إلى React Native CLI! 🎉

## التغييرات الرئيسية

1. ✅ إزالة جميع حزم Expo
2. ✅ إضافة React Native Firebase بدلاً من Firebase Web SDK
3. ✅ تحديث نقطة الدخول (index.js)
4. ✅ تحديث إعدادات Babel و Metro
5. ✅ تحديث AuthContext للعمل مع React Native Firebase

## الخطوات المطلوبة لإكمال الإعداد

### 1. حذف الحزم القديمة وتثبيت الجديدة

```bash
cd apps/mobile

# حذف node_modules و package-lock.json
rm -rf node_modules package-lock.json

# تثبيت الحزم الجديدة
npm install
```

### 2. إعداد Firebase للأندرويد

#### أ. الحصول على ملف google-services.json

1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. اختر مشروعك
3. اذهب إلى Project Settings > Your apps
4. انقر على "Add app" واختر Android (إذا لم يكن موجوداً)
5. استخدم Package name: `com.najd.mobile`
6. حمّل ملف `google-services.json`
7. ضع الملف في: `apps/mobile/android/app/google-services.json`

#### ب. تفعيل Firebase Authentication و Firestore

في Firebase Console:
- اذهب إلى Authentication > Sign-in method
- فعّل Email/Password
- اذهب إلى Firestore Database وتأكد من تفعيله

### 3. تشغيل التطبيق

#### تشغيل Metro Bundler

في terminal منفصل:
```bash
cd apps/mobile
npx react-native start
```

#### تشغيل التطبيق على Android

في terminal آخر:
```bash
cd apps/mobile
npx react-native run-android
```

أو يمكنك استخدام npm scripts:
```bash
npm run android
```

### 4. متطلبات التشغيل

تأكد من أن لديك:
- ✅ Android Studio مثبت
- ✅ Android SDK مثبت (API 34 أو أحدث)
- ✅ Java JDK 17 أو أحدث
- ✅ Android Emulator يعمل أو جهاز Android متصل مع USB Debugging مفعّل

### 5. التحقق من البيئة

قبل تشغيل التطبيق، تحقق من إعداد البيئة:

```bash
npx react-native doctor
```

## الفروقات المهمة عن Expo

### استخدام Firebase

**قبل (Expo):**
```typescript
import { getAuth } from 'firebase/auth';
const auth = getAuth(app);
```

**بعد (React Native CLI):**
```typescript
import auth from '@react-native-firebase/auth';
auth().signInWithEmailAndPassword(email, password);
```

### StatusBar

**قبل (Expo):**
```typescript
import { StatusBar } from 'expo-status-bar';
<StatusBar style="auto" />
```

**بعد (React Native CLI):**
```typescript
import { StatusBar } from 'react-native';
<StatusBar barStyle="dark-content" backgroundColor="#fff" />
```

## استبدال الحزم

| حزمة Expo القديمة | حزمة React Native الجديدة |
|-------------------|---------------------------|
| `expo-notifications` | `react-native-push-notification` |
| `expo-image-picker` | `react-native-image-picker` |
| `expo-document-picker` | `react-native-document-picker` |
| `firebase` (web) | `@react-native-firebase/*` |

## الأوامر المتاحة

```bash
# تشغيل Metro bundler
npm start
# أو
npx react-native start

# تشغيل على Android
npm run android
# أو
npx react-native run-android

# تشغيل على iOS (macOS فقط)
npm run ios
# أو
npx react-native run-ios

# بناء APK
cd android
./gradlew assembleRelease
```

## حل المشاكل الشائعة

### خطأ: "SDK location not found"

أنشئ ملف `apps/mobile/android/local.properties`:
```properties
sdk.dir=C:\\Users\\YOUR_USERNAME\\AppData\\Local\\Android\\Sdk
```
(غيّر المسار حسب موقع Android SDK لديك)

### خطأ: "Unable to load script"

```bash
# امسح الـ cache وأعد التشغيل
npx react-native start --reset-cache
```

### خطأ في Firebase

تأكد من:
1. ملف `google-services.json` موجود في `android/app/`
2. Package name في Firebase يطابق `com.najd.mobile`
3. Firebase Authentication مفعّل في Console

### خطأ في Build

```bash
# امسح الـ build
cd android
./gradlew clean

# ثم أعد البناء
cd ..
npx react-native run-android
```

## ملاحظات مهمة

1. **google-services.json**: هذا الملف ضروري للتطبيق. لا تنساه!
2. **Native Modules**: بعض الحزم قد تحتاج إلى إعدادات إضافية في الملفات Native
3. **Hot Reload**: يعمل بشكل طبيعي كما في Expo
4. **Debugging**: يمكنك استخدام React Native Debugger أو Flipper

## الخطوات التالية

1. ✅ تثبيت الحزم
2. ✅ إضافة ملف google-services.json
3. ✅ تشغيل التطبيق
4. 🔄 اختبار جميع الميزات (Login, Orders, etc.)
5. 🔄 إضافة أي إعدادات إضافية للحزم الجديدة إذا لزم الأمر

## الدعم

إذا واجهت أي مشاكل:
1. راجع [React Native Documentation](https://reactnative.dev/)
2. راجع [React Native Firebase Documentation](https://rnfirebase.io/)
3. استخدم `npx react-native doctor` للتحقق من البيئة

---

**تم التحويل بنجاح من Expo إلى React Native CLI! 🚀**

