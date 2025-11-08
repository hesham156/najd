# 🔥 الحصول على Firebase Configuration

<div dir="rtl">

## ⚠️ المشكلة الحقيقية:

**لا يوجد ملف `.env.local`** في `apps/web/`!

لذلك التطبيق **لا يعرف كيف يتصل بـ Firebase!**

---

## ✅ الحل (5 دقائق):

### الخطوة 1: افتح Firebase Console

```
https://console.firebase.google.com/project/najd-5e7c7
```

### الخطوة 2: اذهب إلى Project Settings

1. اضغط على **⚙️ (أيقونة الترس)** أعلى اليسار
2. اختر **Project settings**

### الخطوة 3: اذهب إلى Your apps

1. في الأسفل، ابحث عن قسم **"Your apps"**
2. إذا لم يكن هناك Web App:
   - اضغط **</> (Web icon)**
   - سمّها: `Najd Web App`
   - اضغط **Register app**
   - **لا تفعّل** Firebase Hosting
   - اضغط **Continue to console**

### الخطوة 4: انسخ Firebase Config

ستجد كود مثل هذا:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "najd-5e7c7.firebaseapp.com",
  projectId: "najd-5e7c7",
  storageBucket: "najd-5e7c7.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
  measurementId: "G-ABC123"
};
```

### الخطوة 5: أنشئ ملف .env.local

في مجلد `apps/web/`، أنشئ ملف اسمه `.env.local` واكتب:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=najd-5e7c7.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=najd-5e7c7
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=najd-5e7c7.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABC123
NEXT_PUBLIC_USE_FIREBASE_EMULATORS=false
```

**⚠️ استبدل القيم بالقيم الحقيقية من Firebase Console!**

### الخطوة 6: أعد تشغيل Dev Server

```bash
# أوقف السيرفر الحالي (Ctrl + C)
# ثم أعد تشغيله
cd apps/web
npm run dev
```

---

## 🎯 بعد ذلك:

1. افتح المتصفح: `http://localhost:3000`
2. سجل دخول
3. افتح صفحة الشات
4. **سيعمل كل شيء!** ✅

---

## 💡 ملاحظة مهمة:

ملف `.env.local`:
- ❌ **لا تضعه في Git** (موجود بالفعل في `.gitignore`)
- ✅ احتفظ بنسخة آمنة منه
- ✅ كل مطور يحتاج نسخته الخاصة

---

## 🆘 إذا احتجت مساعدة:

أرسل لي screenshot من:
1. Firebase Console → Project Settings → General
2. أو الـ firebaseConfig الظاهر

وسأساعدك في إنشاء ملف `.env.local` الصحيح!

</div>


