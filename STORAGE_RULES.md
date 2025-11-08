# 📦 Firebase Storage Rules

<div dir="rtl">

## ⚠️ مطلوب: نشر Storage Rules

لكي تعمل التسجيلات الصوتية، يجب نشر Storage Rules.

---

## 📝 إنشاء ملف storage.rules

**أنشئ ملف جديد في المجلد الرئيسي**:

`storage.rules`

**المحتوى**:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // ==========================
    // Chat Audio Files
    // ==========================
    match /chat_audio/{chatId}/{fileName} {
      // القراءة: أي مستخدم مسجل (يمكن تضييقها لاحقاً)
      allow read: if request.auth != null;
      
      // الكتابة: المستخدمون المسجلون فقط
      allow write: if request.auth != null &&
                     request.resource.size < 10 * 1024 * 1024 && // حد أقصى 10 MB
                     request.resource.contentType.matches('audio/.*');
    }
    
    // ==========================
    // Order Files (الموجود مسبقاً)
    // ==========================
    match /orders/{orderId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // ==========================
    // Design Files (الموجود مسبقاً)
    // ==========================
    match /designs/{designId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // ==========================
    // User Photos (الموجود مسبقاً)
    // ==========================
    match /users/photos/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                     request.auth.uid == userId;
    }
    
    // رفض الوصول لأي شيء آخر
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 🚀 نشر Storage Rules

### الطريقة 1: Firebase CLI

```bash
firebase deploy --only storage
```

### الطريقة 2: Firebase Console

1. افتح: https://console.firebase.google.com/project/najd-5e7c7
2. اذهب إلى **Storage** → **Rules**
3. الصق المحتوى أعلاه
4. اضغط **Publish**

---

## 🔐 شرح القواعد

### للتسجيلات الصوتية:

```javascript
match /chat_audio/{chatId}/{fileName} {
  allow read: if request.auth != null;
  
  allow write: if request.auth != null &&
    request.resource.size < 10 * 1024 * 1024 &&  // حد أقصى 10 MB
    request.resource.contentType.matches('audio/.*');  // ملفات صوتية فقط
}
```

**التحققات**:
1. ✅ المستخدم مسجل دخول
2. ✅ حجم الملف أقل من 10 MB
3. ✅ نوع الملف صوتي (audio/*)

---

## ⚡ بعد النشر

### اختبر:

1. **افتح محادثة**
2. **اضغط 🎙️ للتسجيل**
3. **اضغط ⏹️ للإرسال**
4. **يجب أن يُرفع بنجاح!** ✅

### إذا فشل:

- تأكد من نشر Storage Rules
- تأكد من إذن الميكروفون
- راجع Console للأخطاء

---

## 📊 الحدود والقيود

### Firebase Storage (Spark Plan - Free):

- **التخزين**: 5 GB
- **التحميل**: 1 GB/يوم
- **الرفع**: 1 GB/يوم

### التوصيات:

- ✅ تسجيلات قصيرة (1-3 دقائق)
- ✅ حذف التسجيلات القديمة دورياً
- ✅ ضغط الملفات عند الإمكان

---

## 🎯 ملخص

1. ✅ أنشئ ملف `storage.rules`
2. ✅ الصق المحتوى أعلاه
3. ✅ انشره: `firebase deploy --only storage`
4. ✅ جرب التسجيل الصوتي

**والآن استمتع بالميزات الصوتية!** 🎙️📞

</div>


