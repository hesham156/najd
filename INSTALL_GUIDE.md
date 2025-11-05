# 🚀 دليل التثبيت المبسط - مشروع نجد

## ✅ تم حل مشكلة الصلاحيات!

تم إصلاح المشكلة وإزالة الـ workspaces. الآن يمكنك التثبيت بسهولة.

---

## 📝 خطوة واحدة للتثبيت

### 1️⃣ أنشئ ملف البيئة

أنشئ ملف `apps/web/.env.local` وانسخ:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyA-ZRrKs-ELQlDDZTFPdo7BD4MeoZ2v_gY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=najd-5e7c7.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=najd-5e7c7
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=najd-5e7c7.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=193143900640
NEXT_PUBLIC_FIREBASE_APP_ID=1:193143900640:web:bdb4e1cc5b5c3a6cf78385
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-QMMXQQZ977
```

### 2️⃣ افتح PowerShell وشغل:

```powershell
cd apps/web
npm install
npm run dev
```

### 3️⃣ افتح المتصفح

**http://localhost:3000**

---

## ✅ هذا كل شيء!

لا حاجة لتثبيت packages/shared أو workspaces. كل شيء مبسط الآن.

---

## 🔥 قبل تسجيل الدخول

### أعد Firebase Console:

1. افتح: https://console.firebase.google.com/project/najd-5e7c7

2. **Authentication** → Sign-in method → فعّل **Email/Password**

3. **Firestore Database** → Create database → **Test mode**

4. **Storage** → Get started → **Test mode**

5. **Authentication** → Users → Add user:
   ```
   Email: ceo@najd.com
   Password: Test@123456
   ```
   احفظ الـ **UID**

6. **Firestore** → Start collection → `users`:
   - Document ID: (الصق الـ UID)
   - أضف هذه الحقول:

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

## 🎉 تسجيل الدخول

```
Email: ceo@najd.com
Password: Test@123456
```

---

## 💡 ملاحظات

- ✅ تم إزالة مشكلة الـ workspaces
- ✅ تم نقل الـ types محلياً في `apps/web/src/types/shared.ts`
- ✅ لا حاجة لصلاحيات Administrator
- ✅ التثبيت سريع ومباشر

---

## 🐛 إذا واجهت أي مشكلة

```bash
# امسح node_modules وأعد التثبيت
cd apps/web
rm -rf node_modules package-lock.json
npm install
```

---

جاهز للتشغيل! 🚀

