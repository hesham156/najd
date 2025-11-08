# نظام الشات الهرمي - Najd Company 💬

<div dir="rtl">

**تاريخ الإنشاء**: 6 نوفمبر 2025  
**الحالة**: ✅ مكتمل

---

## 📋 نظرة عامة

تم إضافة **نظام شات هرمي متكامل** يسمح للموظفين بالتواصل حسب الهيكل التنظيمي:

### قواعد التواصل:

1. **الموظف العادي** 👤
   - يتواصل مع **مديره المباشر** فقط
   
2. **مدير القسم** 👨‍💼
   - يتواصل مع **CEO** (المدير التنفيذي)
   - يتواصل مع **جميع موظفي فريقه**
   
3. **CEO** 👑
   - يتواصل مع **جميع مدراء الأقسام**

---

## 🏗️ البنية التقنية

### 1. أنواع البيانات (Types)

الملف: `packages/shared/src/types/chat.types.ts`

```typescript
// أنواع المحادثات
export enum ChatType {
  DIRECT = 'direct',     // محادثة مباشرة بين شخصين
  GROUP = 'group',       // محادثة جماعية (للمستقبل)
}

// أنواع الرسائل
export enum MessageType {
  TEXT = 'text',         // رسالة نصية
  IMAGE = 'image',       // صورة
  FILE = 'file',         // ملف
  AUDIO = 'audio',       // تسجيل صوتي
}

// حالة الرسالة
export enum MessageStatus {
  SENT = 'sent',         // تم الإرسال
  DELIVERED = 'delivered', // تم التوصيل
  READ = 'read',         // تم القراءة
}
```

#### الدوال المساعدة:

**`getAllowedChatUsers()`**
- تحدد المستخدمين المسموح التواصل معهم حسب الدور والقسم

**`canCreateChat()`**
- تتحقق من إمكانية إنشاء محادثة بين مستخدمين

**`createChatId()`**
- تنشئ معرف فريد للمحادثة بين مستخدمين

---

### 2. قاعدة البيانات (Firestore)

#### Collection: `chats`

```typescript
{
  id: string,                           // معرف المحادثة
  type: 'direct' | 'group',            // نوع المحادثة
  participants: string[],               // معرفات المشاركين
  participantsData: {
    [uid: string]: {
      uid: string,
      displayName: string,
      photoURL?: string,
      role: UserRole,
      department: Department,
      isHead: boolean
    }
  },
  lastMessage?: {
    text: string,
    senderId: string,
    senderName: string,
    timestamp: Timestamp,
    type: MessageType
  },
  unreadCount: {
    [uid: string]: number              // عدد الرسائل غير المقروءة لكل مستخدم
  },
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### Subcollection: `chats/{chatId}/messages`

```typescript
{
  id: string,
  chatId: string,
  senderId: string,
  senderName: string,
  senderRole: UserRole,
  senderPhotoURL?: string,
  type: MessageType,
  text?: string,
  fileURL?: string,
  fileName?: string,
  status: MessageStatus,
  readBy: string[],                     // قائمة المستخدمين الذين قرأوا الرسالة
  replyTo?: {                          // الرد على رسالة
    messageId: string,
    text: string,
    senderName: string
  },
  createdAt: Timestamp,
  isEdited?: boolean
}
```

#### Collection: `typing_indicators`

```typescript
{
  chatId: string,
  userId: string,
  userName: string,
  isTyping: boolean,
  timestamp: Timestamp
}
```

---

### 3. قواعد الأمان (Security Rules)

الملف: `firestore.rules`

#### قواعد المحادثات (Chats):

```javascript
match /chats/{chatId} {
  // القراءة: المستخدم يمكنه قراءة محادثاته فقط
  allow read: if isActiveUser() && isParticipant();
  
  // الإنشاء: يمكن إنشاء محادثة مع المستخدمين المصرح بهم
  allow create: if isActiveUser() && 
                  request.auth.uid in request.resource.data.participants &&
                  canChatWith(otherUserId);
  
  // التحديث: المشاركون فقط
  allow update: if isActiveUser() && isParticipant();
  
  // الحذف: ممنوع
  allow delete: if false;
}
```

#### قواعد الرسائل (Messages):

```javascript
match /chats/{chatId}/messages/{messageId} {
  // القراءة: المشاركون في المحادثة فقط
  allow read: if isActiveUser() && isParticipantInParentChat();
  
  // الإنشاء: المشاركون فقط ومن المرسل الحقيقي
  allow create: if isActiveUser() && 
                  isParticipantInParentChat() &&
                  request.resource.data.senderId == request.auth.uid;
  
  // التحديث: المرسل أو لتحديث حالة القراءة
  allow update: if isActiveUser() && (
    resource.data.senderId == request.auth.uid ||
    isParticipantInParentChat()
  );
  
  // الحذف: المرسل فقط
  allow delete: if isActiveUser() && 
                  resource.data.senderId == request.auth.uid;
}
```

#### التحقق من صلاحية المحادثة:

```javascript
function canChatWith(otherUserId) {
  let currentUser = getUserData();
  let otherUser = get(/databases/$(database)/documents/users/$(otherUserId)).data;
  
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
```

---

## 🌐 واجهة الويب (Web App)

### الملفات الرئيسية:

1. **`apps/web/src/hooks/useChat.ts`**
   - Hook للتعامل مع المحادثات
   - Hook لجلب الرسائل
   - Hook لجلب المستخدمين المسموح التواصل معهم

2. **`apps/web/src/app/chat/page.tsx`**
   - صفحة الشات الرئيسية
   - قائمة المحادثات
   - نافذة المحادثة
   - نموذج إنشاء محادثة جديدة

### المميزات:

✅ **قائمة المحادثات**:
- عرض جميع المحادثات
- آخر رسالة في كل محادثة
- عدد الرسائل غير المقروءة
- بحث في المحادثات

✅ **نافذة المحادثة**:
- عرض الرسائل بشكل فقاعات
- تمييز رسائل المستخدم الحالي
- وقت كل رسالة
- إرسال رسائل نصية
- تحديث حالة القراءة تلقائياً

✅ **إنشاء محادثة جديدة**:
- عرض المستخدمين المسموح التواصل معهم فقط
- بحث في المستخدمين
- عرض الدور والقسم لكل مستخدم

### إضافة الرابط في Navbar:

```typescript
<Link
  href="/chat"
  className="relative p-2 rounded-full hover:bg-primary-700 transition"
  title="المحادثات"
>
  <svg>...</svg> {/* أيقونة الشات */}
</Link>
```

---

## 📱 واجهة الموبايل (Mobile App)

### الملفات الرئيسية:

1. **`apps/mobile/src/screens/ChatScreen.tsx`**
   - شاشة الشات الرئيسية
   - قائمة المحادثات
   - نافذة المحادثة
   - Modal لإنشاء محادثة جديدة

### المميزات:

✅ **تصميم متجاوب**:
- قائمة محادثات منظمة
- فقاعات رسائل واضحة
- أزرار كبيرة سهلة الاستخدام

✅ **تجربة مستخدم محسّنة**:
- KeyboardAvoidingView للتعامل مع لوحة المفاتيح
- التمرير التلقائي للرسائل الجديدة
- Loading indicators
- رسائل خطأ واضحة

✅ **إضافة في Navigation**:
```typescript
<Tab.Screen
  name="Chat"
  component={ChatScreen}
  options={{
    tabBarLabel: 'المحادثات',
    tabBarIcon: ({ focused }) => <TabIcon icon="💬" focused={focused} />,
  }}
/>
```

---

## ☁️ Cloud Functions

الملف: `functions/src/triggers/chatTriggers.ts`

### 1. إرسال إشعار عند رسالة جديدة

```typescript
export const onNewMessage = functions.firestore
  .document('chats/{chatId}/messages/{messageId}')
  .onCreate(async (snapshot, context) => {
    // جلب بيانات المحادثة
    // تحديد المستقبلين
    // إنشاء إشعارات في Firestore
    // إرسال Push Notifications
    // تحديث عدد الرسائل غير المقروءة
  });
```

### 2. تحديث حالة القراءة

```typescript
export const onMessageRead = functions.firestore
  .document('chats/{chatId}/messages/{messageId}')
  .onUpdate(async (change, context) => {
    // التحقق من تغيير حالة القراءة
    // تحديث حالة الرسالة إلى 'read'
  });
```

### 3. تنظيف المحادثات القديمة

```typescript
export const cleanupOldChats = functions.pubsub
  .schedule('every sunday 00:00')
  .timeZone('Asia/Riyadh')
  .onRun(async (context) => {
    // حذف المحادثات الأقدم من 6 أشهر
    // حذف جميع الرسائل في هذه المحادثات
  });
```

### 4. تحديث العدادات عند حذف رسالة

```typescript
export const onMessageDeleted = functions.firestore
  .document('chats/{chatId}/messages/{messageId}')
  .onDelete(async (snapshot, context) => {
    // تحديث عدد الرسائل غير المقروءة
  });
```

---

## 🔐 الأمان والخصوصية

### مستويات الحماية:

1. **Firestore Rules** ✅
   - منع الوصول غير المصرح به
   - التحقق من الهيكل الهرمي
   - التحقق من المشاركين في كل محادثة

2. **Client-Side Validation** ✅
   - عرض المستخدمين المسموح بهم فقط
   - منع إنشاء محادثات غير مصرح بها
   - التحقق من الصلاحيات قبل الإرسال

3. **Cloud Functions** ✅
   - معالجة آمنة للبيانات
   - إرسال إشعارات موثوقة
   - تنظيف تلقائي للبيانات القديمة

---

## 📊 أمثلة الاستخدام

### مثال 1: موظف تصميم يريد التواصل

```typescript
// موظف تصميم: design (isHead: false, department: design)
// يمكنه التواصل مع: design_head فقط
```

### مثال 2: مدير التصميم يريد التواصل

```typescript
// مدير التصميم: design_head (isHead: true, department: design)
// يمكنه التواصل مع:
// 1. CEO
// 2. جميع موظفي التصميم (design)
```

### مثال 3: CEO يريد التواصل

```typescript
// CEO: ceo (isHead: true, department: management)
// يمكنه التواصل مع:
// 1. sales_head
// 2. design_head
// 3. printing_head
// 4. accounting_head
// 5. dispatch_head
```

---

## 🚀 المميزات المستقبلية (اختياري)

- [ ] إرسال الصور والملفات
- [ ] التسجيلات الصوتية
- [ ] الرد على رسائل محددة
- [ ] تعديل وحذف الرسائل
- [ ] مؤشر "يكتب الآن..."
- [ ] المحادثات الجماعية
- [ ] البحث في الرسائل
- [ ] الإشعارات الصوتية

---

## 📝 ملاحظات مهمة

1. **عدم إمكانية حذف المحادثات**:
   - المحادثات لا يمكن حذفها لأغراض التوثيق
   - يتم تنظيف المحادثات القديمة (6+ أشهر) تلقائياً

2. **تحديث Real-time**:
   - جميع المحادثات والرسائل تعمل بنظام real-time
   - باستخدام `onSnapshot` من Firestore

3. **الأداء**:
   - تم تحسين الاستعلامات باستخدام Indexes
   - تحميل الرسائل بشكل تدريجي (Pagination)

4. **التوافق**:
   - يعمل على الويب والموبايل
   - تصميم متجاوب

---

## 🎯 الخلاصة

تم إنشاء **نظام شات هرمي متكامل** مع:

✅ أنواع بيانات قوية ومتينة  
✅ قواعد أمان صارمة  
✅ واجهات ويب وموبايل جميلة  
✅ Cloud Functions للأتمتة  
✅ Real-time updates  
✅ Push notifications  
✅ تجربة مستخدم ممتازة

النظام جاهز للاستخدام وآمن ومُحسّن للأداء! 🎉

</div>


