# نشر Security Rules للشات 🔒

<div dir="rtl">

## ⚠️ المشكلة:
```
Error fetching chats: FirebaseError: Missing or insufficient permissions.
```

هذا يعني أن Security Rules الجديدة للشات لم يتم نشرها على Firebase بعد.

---

## 🔧 الحل - نشر Security Rules:

### الطريقة 1: عبر Firebase Console (الأسهل) ✅

1. **افتح Firebase Console**:
   ```
   https://console.firebase.google.com
   ```

2. **اختر مشروعك** (najd)

3. **انتقل إلى Firestore Database**:
   - من القائمة الجانبية → Build → Firestore Database

4. **اضغط على تبويب "Rules"**

5. **انسخ والصق Security Rules الكاملة**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ==========================
    // Helper Functions
    // ==========================
    
    // التحقق من تسجيل الدخول
    function isSignedIn() {
      return request.auth != null;
    }
    
    // التحقق من أن المستخدم نشط
    function isActiveUser() {
      return isSignedIn() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isActive == true;
    }
    
    // الحصول على بيانات المستخدم الحالي
    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }
    
    // التحقق من الدور
    function hasRole(role) {
      return isActiveUser() && getUserData().role == role;
    }
    
    // التحقق من القسم
    function hasDepartment(department) {
      return isActiveUser() && getUserData().department == department;
    }
    
    // التحقق من أن المستخدم رئيس قسم
    function isHead() {
      return isActiveUser() && getUserData().isHead == true;
    }
    
    // التحقق من أن المستخدم CEO
    function isCEO() {
      return hasRole('ceo');
    }
    
    // التحقق من أن المستخدم في قسم المبيعات
    function isSales() {
      return hasDepartment('sales');
    }
    
    // التحقق من أن المستخدم مالك المورد
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }
    
    // ==========================
    // Users Collection
    // ==========================
    match /users/{userId} {
      allow read: if isOwner(userId) || isCEO();
      allow create: if (isSignedIn() && request.auth.uid == userId) || isCEO();
      allow update: if (isOwner(userId) && 
                       !request.resource.data.diff(resource.data).affectedKeys().hasAny(['role', 'department', 'isHead', 'isActive'])
                      ) || isCEO();
      allow delete: if isCEO();
    }
    
    // ==========================
    // Chats Collection - نظام الشات الهرمي
    // ==========================
    match /chats/{chatId} {
      // دالة للتحقق من أن المستخدم مشارك في المحادثة
      function isParticipant() {
        return request.auth.uid in resource.data.participants;
      }
      
      // دالة للتحقق من إمكانية إنشاء محادثة بين مستخدمين
      function canChatWith(otherUserId) {
        let currentUser = getUserData();
        let otherUser = get(/databases/$(database)/documents/users/$(otherUserId)).data;
        
        // لا يمكن للمستخدم التواصل مع نفسه
        return request.auth.uid != otherUserId && (
          // CEO يتواصل مع رؤساء الأقسام فقط
          (currentUser.role == 'ceo' && otherUser.isHead == true && otherUser.role != 'ceo') ||
          
          // رئيس القسم يتواصل مع CEO
          (currentUser.isHead == true && otherUser.role == 'ceo') ||
          
          // رئيس القسم يتواصل مع موظفي قسمه
          (currentUser.isHead == true && otherUser.isHead == false && 
           currentUser.department == otherUser.department) ||
          
          // موظف عادي يتواصل مع رئيس قسمه
          (currentUser.isHead == false && otherUser.isHead == true && 
           currentUser.department == otherUser.department)
        );
      }
      
      // القراءة: المستخدم يمكنه قراءة المحادثات التي هو مشارك فيها
      allow read: if isActiveUser() && isParticipant();
      
      // الإنشاء: المستخدم يمكنه إنشاء محادثة مع مستخدمين مصرح لهم
      allow create: if isActiveUser() && 
                      request.auth.uid in request.resource.data.participants &&
                      request.resource.data.participants.size() == 2 &&
                      canChatWith(request.resource.data.participants[request.resource.data.participants[0] == request.auth.uid ? 1 : 0]);
      
      // التحديث: المستخدمون المشاركون يمكنهم تحديث المحادثة
      allow update: if isActiveUser() && isParticipant();
      
      // الحذف: لا يمكن حذف المحادثات
      allow delete: if false;
      
      // ==========================
      // Messages Subcollection
      // ==========================
      match /messages/{messageId} {
        // دالة للتحقق من أن المستخدم مشارك في المحادثة الأب
        function isParticipantInParentChat() {
          return request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
        }
        
        // القراءة: المستخدمون المشاركون في المحادثة فقط
        allow read: if isActiveUser() && isParticipantInParentChat();
        
        // الإنشاء: المستخدمون المشاركون يمكنهم إرسال رسائل
        allow create: if isActiveUser() && 
                        isParticipantInParentChat() &&
                        request.resource.data.senderId == request.auth.uid;
        
        // التحديث: المرسل يمكنه تحديث رسالته
        allow update: if isActiveUser() && (
          (resource.data.senderId == request.auth.uid) ||
          (isParticipantInParentChat() && 
           request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status', 'readBy', 'updatedAt']))
        );
        
        // الحذف: المرسل يمكنه حذف رسالته
        allow delete: if isActiveUser() && resource.data.senderId == request.auth.uid;
      }
    }
    
    // ==========================
    // Typing Indicators Collection
    // ==========================
    match /typing_indicators/{indicatorId} {
      allow read: if isActiveUser();
      allow write: if isActiveUser() && 
                     request.resource.data.userId == request.auth.uid;
    }
    
    // باقي الـ Collections موجودة في firestore.rules
    // (Orders, Notifications, Quotations, إلخ...)
    
    // رفض الوصول لأي شيء آخر
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

6. **اضغط على "Publish"** (نشر)

7. **انتظر حتى يظهر**: "Your rules have been published"

---

### الطريقة 2: عبر Firebase CLI (للمطورين المحترفين)

```bash
# تأكد من تسجيل الدخول
firebase login

# نشر Security Rules فقط
firebase deploy --only firestore:rules
```

---

## 🔍 للتحقق من نجاح النشر:

1. افتح Firebase Console
2. اذهب إلى Firestore Database → Rules
3. تأكد من وجود قسم `match /chats/{chatId}` في الـ Rules

---

## ⚡ بعد النشر:

1. **أعد تحميل صفحة الشات**:
   ```
   http://localhost:3000/chat
   ```

2. **يجب أن يعمل الآن بدون أخطاء!** ✅

---

## 🚨 إذا استمرت المشكلة:

### تحقق من:

1. **هل أنت مسجل دخول؟**
   - تأكد من تسجيل الدخول في التطبيق

2. **هل حسابك نشط؟**
   - تحقق من أن `isActive: true` في Firestore

3. **راجع Console للأخطاء**:
   ```javascript
   // افتح Developer Tools (F12)
   // شاهد Console للأخطاء
   ```

---

## 💡 نصيحة:

**دائماً بعد تعديل `firestore.rules`، قم بنشرها على Firebase!**

يمكنك إضافة script في `package.json`:

```json
{
  "scripts": {
    "deploy:rules": "firebase deploy --only firestore:rules"
  }
}
```

ثم:
```bash
npm run deploy:rules
```

---

## ✅ الخلاصة:

1. افتح Firebase Console
2. انتقل إلى Firestore → Rules
3. الصق الـ rules الكاملة من الأعلى
4. اضغط Publish
5. أعد تحميل صفحة الشات

**والآن جرب النظام!** 🎉

</div>


