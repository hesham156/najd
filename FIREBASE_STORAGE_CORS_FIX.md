# إصلاح مشكلة CORS في Firebase Storage ✅

## 🐛 المشكلة

```
Access to XMLHttpRequest at 'https://firebasestorage.googleapis.com/...' 
from origin 'http://localhost:3000' has been blocked by CORS policy
```

### السبب:
Firebase Storage يحتاج إعدادات CORS صحيحة للسماح برفع وتنزيل الملفات من التطبيق.

## ✅ الحل

### الطريقة 1: باستخدام Google Cloud SDK (الموصى بها)

#### الخطوة 1: تثبيت Google Cloud SDK

إذا لم يكن مثبتاً:

**Windows:**
1. قم بتحميل: https://cloud.google.com/sdk/docs/install
2. قم بالتثبيت
3. افتح PowerShell أو Command Prompt

**Mac/Linux:**
```bash
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

#### الخطوة 2: تسجيل الدخول

```bash
gcloud auth login
```

ستفتح نافذة المتصفح لتسجيل الدخول بحساب Google الخاص بـ Firebase.

#### الخطوة 3: تطبيق إعدادات CORS

```bash
# استبدل najd-5e7c7 باسم مشروعك
gsutil cors set cors.json gs://najd-5e7c7.firebasestorage.app
```

**ملاحظة:** تم إنشاء ملف `cors.json` في مجلد المشروع.

#### الخطوة 4: التحقق من الإعدادات

```bash
gsutil cors get gs://najd-5e7c7.firebasestorage.app
```

يجب أن ترى إعدادات CORS المطبقة.

---

### الطريقة 2: حل مؤقت (للتطوير فقط)

إذا لم تستطع تطبيق CORS، يمكنك:

#### 1. استخدام Firebase Storage Rules فقط

قد تكون المشكلة في Security Rules وليس CORS. تحقق من `storage.rules`:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /orders/{orderId}/{fileName} {
      // السماح للمستخدمين المسجلين فقط
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

#### 2. نشر Storage Rules

```bash
firebase deploy --only storage
```

---

### الطريقة 3: حل بديل - استخدام Firebase SDK بشكل صحيح

تأكد من أنك تستخدم Firebase SDK بالطريقة الصحيحة:

```typescript
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

// رفع ملف
const fileRef = ref(storage, `orders/${orderNumber}/${file.name}`);
await uploadBytes(fileRef, file);

// الحصول على URL
const url = await getDownloadURL(fileRef);
```

**لا تستخدم URL مباشر!** استخدم Firebase SDK دائماً.

---

## 📝 محتوى ملف cors.json

تم إنشاء الملف في مجلد المشروع:

```json
[
  {
    "origin": ["*"],
    "method": ["GET", "POST", "PUT", "DELETE", "HEAD"],
    "maxAgeSeconds": 3600,
    "responseHeader": [
      "Content-Type", 
      "Authorization", 
      "Content-Length", 
      "User-Agent", 
      "X-Requested-With"
    ]
  }
]
```

### شرح الإعدادات:

| الخاصية | القيمة | الوصف |
|---------|--------|-------|
| **origin** | `["*"]` | السماح لجميع النطاقات (للتطوير) |
| **method** | GET, POST, PUT, DELETE, HEAD | الطرق المسموحة |
| **maxAgeSeconds** | 3600 | مدة تخزين إعدادات CORS (ساعة) |
| **responseHeader** | قائمة Headers | Headers المسموحة في الاستجابة |

### للإنتاج (Production):

غيّر `origin` لتحديد النطاقات المسموحة:

```json
{
  "origin": [
    "https://najd-company.com",
    "https://www.najd-company.com",
    "http://localhost:3000"
  ],
  // ... باقي الإعدادات
}
```

---

## 🔧 الأوامر الكاملة

### تثبيت Google Cloud SDK:

**Windows (PowerShell كمسؤول):**
```powershell
(New-Object Net.WebClient).DownloadFile("https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe", "$env:Temp\GoogleCloudSDKInstaller.exe")
& $env:Temp\GoogleCloudSDKInstaller.exe
```

**أو قم بالتحميل يدوياً من:**
https://cloud.google.com/sdk/docs/install

### تطبيق CORS:

```bash
# 1. تسجيل الدخول
gcloud auth login

# 2. تعيين المشروع
gcloud config set project najd-5e7c7

# 3. تطبيق CORS
gsutil cors set cors.json gs://najd-5e7c7.firebasestorage.app

# 4. التحقق
gsutil cors get gs://najd-5e7c7.firebasestorage.app
```

---

## ⚠️ تحذير: Storage Rules

تأكد من أن Storage Rules صحيحة:

### ملف `storage.rules`:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // ملفات الطلبات
    match /orders/{orderId}/{fileName} {
      // القراءة: المستخدمون المسجلون فقط
      allow read: if request.auth != null;
      
      // الكتابة: المستخدمون المسجلون فقط
      allow write: if request.auth != null
                   && request.resource.size < 10 * 1024 * 1024  // حد أقصى 10MB
                   && request.resource.contentType.matches('.*'); // أي نوع ملف
    }
    
    // منع الوصول لأي شيء آخر
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

### نشر Rules:

```bash
firebase deploy --only storage
```

---

## 🧪 اختبار الحل

### 1. بعد تطبيق CORS:

افتح Console (`F12`) وحاول رفع ملف:

```javascript
// يجب أن لا ترى خطأ CORS
console.log('Testing file upload...');
```

### 2. رفع ملف اختباري:

1. اذهب إلى: http://localhost:3000/orders/new
2. املأ النموذج
3. أرفق ملف PDF صغير
4. أرسل الطلب
5. يجب أن يعمل بدون أخطاء CORS

---

## 🆘 إذا استمرت المشكلة

### تحقق من:

#### 1. Storage Rules منشورة؟

```bash
firebase deploy --only storage
```

#### 2. أنت مسجل دخول في التطبيق؟

CORS قد يكون بسبب عدم تسجيل الدخول.

#### 3. اسم الـ bucket صحيح؟

في الأمر، استبدل `najd-5e7c7.firebasestorage.app` بـ bucket الخاص بك.

تحقق من Firebase Console → Storage → Files

#### 4. Google Cloud SDK مثبت؟

```bash
gcloud --version
```

يجب أن يعرض رقم الإصدار.

#### 5. لديك صلاحيات؟

تأكد أن حسابك في Firebase لديه صلاحيات Owner أو Editor.

---

## 💡 حل سريع (مؤقت للتطوير)

إذا كنت تريد حل سريع للاستمرار في التطوير:

### تعديل Storage Rules ليكون أكثر تساهلاً:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      // للتطوير فقط! ليس للإنتاج!
      allow read, write: if request.auth != null;
    }
  }
}
```

**⚠️ تحذير:** لا تستخدم هذا في الإنتاج!

---

## 📊 ملخص الحلول

| الحل | السهولة | الأمان | للإنتاج؟ |
|------|---------|--------|-----------|
| **Google Cloud SDK + CORS** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ نعم |
| **Storage Rules فقط** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ نعم |
| **Rules متساهلة** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ❌ لا |

---

## 🎯 الإجراء الموصى به

### للتطوير الآن:

1. ✅ نشر Storage Rules:
   ```bash
   firebase deploy --only storage
   ```

2. ✅ تسجيل الدخول في التطبيق

3. ✅ جرب رفع ملف

### قبل الإنتاج:

1. ✅ تثبيت Google Cloud SDK
2. ✅ تطبيق CORS بشكل صحيح
3. ✅ تشديد Storage Rules
4. ✅ اختبار شامل

---

## 📚 مراجع مفيدة

- [Firebase Storage CORS](https://firebase.google.com/docs/storage/web/download-files#cors_configuration)
- [Google Cloud Storage CORS](https://cloud.google.com/storage/docs/configuring-cors)
- [gsutil CORS documentation](https://cloud.google.com/storage/docs/gsutil/commands/cors)

---

## ✅ الملخص

**المشكلة:** CORS error عند رفع ملفات لـ Firebase Storage

**الحل السريع:**
```bash
firebase deploy --only storage
```

**الحل الكامل:**
```bash
gcloud auth login
gsutil cors set cors.json gs://najd-5e7c7.firebasestorage.app
```

**ملف cors.json موجود في مجلد المشروع** ✅

---

© 2024 شركة نجد - جميع الحقوق محفوظة


