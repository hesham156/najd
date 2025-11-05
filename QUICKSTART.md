# دليل البدء السريع ⚡

<div dir="rtl">

دليل سريع للبدء باستخدام نظام إدارة نجد في 5 دقائق!

## ✅ المتطلبات

- [x] Node.js 18+
- [x] npm أو yarn
- [x] حساب Firebase
- [x] Git

## 🚀 5 خطوات للبدء

### 1️⃣ استنساخ المشروع

```bash
git clone [repository-url]
cd najd
```

### 2️⃣ تثبيت المكتبات

```bash
npm install --workspaces
```

أو إذا واجهت مشاكل:

```bash
cd apps/web && npm install
cd ../mobile && npm install
cd ../../packages/shared && npm install
cd ../../functions && npm install
```

### 3️⃣ إعداد Firebase

#### أ. إنشاء مشروع Firebase

1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. انقر "Add project"
3. أدخل اسم المشروع: `najd-company`
4. فعّل Google Analytics (اختياري)
5. انقر "Create project"

#### ب. تفعيل الخدمات المطلوبة

في Firebase Console:
- **Authentication** → Sign-in method → Email/Password (فعّل)
- **Firestore Database** → Create database → Start in test mode
- **Storage** → Get started
- **Functions** → Get started

#### ج. الحصول على مفاتيح Firebase

1. Project Settings → General
2. في "Your apps" → انقر Web icon (</>)
3. سجل التطبيق
4. انسخ firebaseConfig

#### د. إضافة ملفات البيئة

```bash
# Web
cp apps/web/.env.example apps/web/.env.local
# افتح apps/web/.env.local وأضف مفاتيح Firebase

# Mobile
cp apps/mobile/.env.example apps/mobile/.env.local
# افتح apps/mobile/.env.local وأضف مفاتيح Firebase
```

### 4️⃣ نشر Security Rules و Functions

```bash
# تسجيل الدخول
firebase login

# نشر
firebase deploy
```

أو نشر كل شيء على حدة:

```bash
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
firebase deploy --only functions
```

### 5️⃣ تشغيل التطبيقات

#### تطبيق الويب

```bash
npm run dev:web
# أو
cd apps/web && npm run dev
```

افتح: http://localhost:3000

#### تطبيق الموبايل

```bash
npm run dev:mobile
# أو
cd apps/mobile && npm start
```

امسح QR code بتطبيق Expo Go

## 👤 إنشاء أول مستخدم (CEO)

### الطريقة 1: Firebase Console

1. اذهب إلى Authentication → Users
2. انقر "Add user"
3. أدخل:
   - Email: `ceo@najd.com`
   - Password: `password123` (غيرها لاحقاً!)
4. انسخ UID
5. اذهب إلى Firestore Database
6. أنشئ document جديد في collection `users` بـ ID = UID
7. أضف الحقول:

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

### الطريقة 2: Firebase CLI + Script

قريباً...

## 🎉 مبروك!

الآن يمكنك:
1. تسجيل الدخول على الويب بـ `ceo@najd.com`
2. استكشاف لوحة التحكم
3. إنشاء مستخدمين جدد
4. إنشاء أول طلب

## 🆘 المشاكل الشائعة

### مشكلة: `Permission denied` في Firestore

**الحل**: تأكد من نشر Security Rules:
```bash
firebase deploy --only firestore:rules
```

### مشكلة: `Module not found: @najd/shared`

**الحل**: أعد تثبيت المكتبات:
```bash
npm install --workspaces
```

### مشكلة: Functions لا تعمل

**الحل**: تأكد من:
1. نشرها: `firebase deploy --only functions`
2. تفعيل Billing في Firebase Console

### مشكلة: Expo لا يفتح

**الحل**: تأكد من تثبيت Expo CLI:
```bash
npm install -g expo-cli
```

## 📚 الخطوات التالية

- [ ] اقرأ [README.md](./README.md) الكامل
- [ ] راجع [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
- [ ] استكشف الكود في `apps/web` و `apps/mobile`
- [ ] جرب إنشاء طلب جديد
- [ ] اقرأ [CONTRIBUTING.md](./CONTRIBUTING.md) إذا كنت تريد المساهمة

## 💬 تحتاج مساعدة؟

- افتح Issue في GitHub
- راجع الوثائق التفصيلية
- تواصل مع الفريق

---

استمتع باستخدام نظام نجد! 🚀

</div>

