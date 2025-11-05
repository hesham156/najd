# 🚀 تشغيل المشروع في 3 خطوات

## ✅ الخطوة 1: إنشاء ملف البيئة

أنشئ ملف `apps/web/.env.local` وانسخ فيه:

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyA-ZRrKs-ELQlDDZTFPdo7BD4MeoZ2v_gY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=najd-5e7c7.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=najd-5e7c7
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=najd-5e7c7.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=193143900640
NEXT_PUBLIC_FIREBASE_APP_ID=1:193143900640:web:bdb4e1cc5b5c3a6cf78385
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-QMMXQQZ977
```

---

## ✅ الخطوة 2: تثبيت وتشغيل

افتح PowerShell وشغل:

```powershell
# تثبيت المكتبات
cd packages/shared
npm install

cd ../../apps/web  
npm install

# تشغيل التطبيق
npm run dev
```

---

## ✅ الخطوة 3: افتح المتصفح

افتح: **http://localhost:3000**

---

## ⚠️ قبل تسجيل الدخول

يجب إعداد Firebase Console أولاً:

### افتح: https://console.firebase.google.com/project/najd-5e7c7

1. **Authentication** → Sign-in method → فعّل **Email/Password**

2. **Firestore Database** → Create database → Test mode

3. **Storage** → Get started → Test mode

4. **Authentication** → Users → Add user:
   - Email: `ceo@najd.com`
   - Password: `Test@123456`
   - احفظ الـ **UID**

5. **Firestore Database** → Start collection → `users`:
   - Document ID: (الصق الـ UID من الخطوة 4)
   - أضف الحقول التالية:

| Field | Type | Value |
|-------|------|-------|
| uid | string | (الصق الـ UID) |
| email | string | ceo@najd.com |
| displayName | string | المدير التنفيذي |
| role | string | ceo |
| department | string | management |
| isHead | boolean | true |
| isActive | boolean | true |
| createdAt | string | 2024-01-01T00:00:00.000Z |
| updatedAt | string | 2024-01-01T00:00:00.000Z |

---

## 🎉 جاهز!

سجل دخول بـ:
- Email: `ceo@najd.com`
- Password: `Test@123456`

