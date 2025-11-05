# دليل إعداد وتشغيل تطبيق الموبايل

## المشكلة الشائعة وحلها

إذا واجهت خطأ مثل:
```
npm error 404 Not Found - GET https://registry.npmjs.org/@najd%2fshared
```

فهذا يعني أنك تحاول تشغيل `npm install` في مجلد `apps/mobile` مباشرة.

## الحل الصحيح ✅

### الطريقة الأولى: التثبيت من مجلد mobile
إذا كنت في مجلد `apps/mobile`، قم بتشغيل:

```bash
npm install
```

الآن تم حل المشكلة! المشروع لم يعد يعتمد على `@najd/shared` في تطبيق الموبايل.

### الطريقة الثانية: التثبيت من الـ root (اختياري)
يمكنك أيضاً التثبيت من الـ root directory:

```bash
# من مجلد d:/najd
npm run install:all
```

## خطوات التشغيل

### 1. تثبيت Dependencies
```bash
cd /d/najd/apps/mobile
npm install
```

### 2. تشغيل التطبيق
```bash
npm start
```

سيفتح Expo DevTools في المتصفح.

### 3. تشغيل على الجهاز/المحاكي

#### Android:
```bash
npm run android
```

أو اضغط `a` في terminal بعد تشغيل `npm start`

#### iOS (macOS فقط):
```bash
npm run ios
```

أو اضغط `i` في terminal بعد تشغيل `npm start`

#### Web (للتجربة السريعة):
```bash
npm run web
```

أو اضغط `w` في terminal بعد تشغيل `npm start`

## استخدام Expo Go

### على الهاتف:
1. حمّل تطبيق **Expo Go** من:
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) (Android)
   - [App Store](https://apps.apple.com/app/expo-go/id982107779) (iOS)

2. تأكد أن الهاتف والكمبيوتر على نفس الشبكة

3. امسح QR code الذي يظهر في terminal أو في المتصفح

## المتطلبات الأساسية

- Node.js v18+ مثبت
- npm مثبت
- Expo CLI (يتم تثبيته تلقائياً مع dependencies)

### للتطوير على Android:
- Android Studio مثبت
- Android SDK مكون
- محاكي Android جاهز أو هاتف Android متصل بوضع USB debugging

### للتطوير على iOS (macOS فقط):
- Xcode مثبت
- iOS Simulator جاهز أو iPhone متصل

## حل المشاكل الشائعة

### المشكلة: Cannot find module
**الحل**: احذف `node_modules` و أعد التثبيت:
```bash
rm -rf node_modules
npm install
```

### المشكلة: Port already in use
**الحل**: أغلق أي عملية Expo أخرى أو استخدم:
```bash
npm start -- --port 19001
```

### المشكلة: Metro bundler error
**الحل**: امسح cache وأعد التشغيل:
```bash
npm start -- --clear
```

## ملاحظات مهمة

1. **Firebase Configuration**: تأكد من وجود ملف `src/config/firebase.ts` بإعدادات Firebase الصحيحة

2. **Environment Variables**: ضع معلومات Firebase في ملف منفصل لعدم رفعها على Git

3. **Hot Reloading**: Expo يدعم hot reloading - لا حاجة لإعادة التشغيل عند تعديل الكود

4. **TypeScript**: المشروع يستخدم TypeScript - تأكد من إصلاح أي أخطاء type checking

## الميزات المتاحة

✅ نظام تسجيل الدخول
✅ لوحات تحكم متخصصة لكل دور:
  - لوحة المدير التنفيذي (CEO)
  - لوحة قسم المحاسبة
  - لوحة قسم التصميم
  - لوحة قسم الطباعة
✅ إدارة الطلبات
✅ عروض الأسعار
✅ إدارة المستخدمين (للCEO)
✅ الإشعارات
✅ نظام التنقل المتكامل

## Build للإنتاج

### Android APK:
```bash
expo build:android
```

### iOS IPA:
```bash
expo build:ios
```

ملاحظة: قد تحتاج لحساب Expo مدفوع لبعض خدمات البناء.

## المساعدة والدعم

- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation Docs](https://reactnavigation.org/)
- [Firebase React Native Guide](https://rnfirebase.io/)

---

**آخر تحديث**: نوفمبر 2025

