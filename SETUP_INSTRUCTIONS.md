# تعليمات التشغيل السريع 🚀

## الطريقة الأولى (الأسرع): استخدام السكريبت التلقائي

### على Windows:

افتح **PowerShell** في مجلد المشروع وشغل:

```powershell
.\install-and-run.bat
```

أو إذا لم يعمل، استخدم:

```powershell
.\setup-and-run.ps1
```

---

## الطريقة الثانية (يدوية): خطوة بخطوة

### 1. إنشاء ملف `apps/web/.env.local`

أنشئ الملف وأضف:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyA-ZRrKs-ELQlDDZTFPdo7BD4MeoZ2v_gY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=najd-5e7c7.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=najd-5e7c7
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=najd-5e7c7.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=193143900640
NEXT_PUBLIC_FIREBASE_APP_ID=1:193143900640:web:bdb4e1cc5b5c3a6cf78385
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-QMMXQQZ977
NEXT_PUBLIC_USE_FIREBASE_EMULATORS=false
```

### 2. تثبيت المكتبات

```bash
cd packages/shared
npm install

cd ../../apps/web
npm install
```

### 3. تشغيل التطبيق

```bash
npm run dev
```

افتح: **http://localhost:3000**

---

## 🔥 إعداد Firebase (مهم!)

قبل تسجيل الدخول، يجب إعداد Firebase Console:

### 1. تفعيل Authentication
1. اذهب إلى: https://console.firebase.google.com/project/najd-5e7c7
2. Authentication → Sign-in method
3. فعّل **Email/Password**

### 2. إنشاء Firestore Database
1. Firestore Database → Create database
2. اختر **Start in test mode** (سنغيره لاحقاً)
3. اختر الموقع: **eur3** أو **us-central1**

### 3. تفعيل Storage
1. Storage → Get started
2. Start in test mode

### 4. نشر Security Rules
```bash
firebase login
firebase deploy --only firestore:rules,storage:rules
```

### 5. إنشاء مستخدم CEO
1. Authentication → Users → Add user
   - Email: `ceo@najd.com`
   - Password: `Test@123456`
   - احفظ الـ **UID**

2. Firestore Database → Start collection → `users`
   - Document ID: (الصق الـ UID)
   - أضف الحقول:

```json
{
  "uid": "paste-uid-here",
  "email": "ceo@najd.com",
  "displayName": "المدير التنفيذي",
  "role": "ceo",
  "department": "management",
  "isHead": true,
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

## ✅ تسجيل الدخول

افتح: **http://localhost:3000**

```
Email: ceo@najd.com
Password: Test@123456
```

---

## 🎉 مبروك!

الآن يمكنك:
- ✅ تصفح لوحة التحكم
- ✅ إنشاء طلبات جديدة (إذا كنت Sales)
- ✅ إدارة المستخدمين (إذا كنت CEO)
- ✅ تصفح الإشعارات

---

## 🐛 مشاكل شائعة

### المشكلة: `Permission denied` في Firestore
**الحل:** انشر Security Rules:
```bash
firebase deploy --only firestore:rules
```

### المشكلة: لا يمكن تسجيل الدخول
**الحل:** تأكد من:
1. تفعيل Email/Password في Firebase Console
2. إنشاء المستخدم في Authentication
3. إضافة بيانات المستخدم في Firestore

### المشكلة: Port 3000 مستخدم
**الحل:**
```bash
PORT=3001 npm run dev
```

---

للمساعدة: راجع [`QUICKSTART.md`](QUICKSTART.md)

