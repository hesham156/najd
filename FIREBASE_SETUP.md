# إعداد Firebase لمشروع نجد

## 📋 نظرة عامة على قاعدة البيانات

### Collections الرئيسية:

#### 1. **users** - المستخدمين
```typescript
{
  uid: string;                    // معرف المستخدم (Firebase Auth UID)
  email: string;                  // البريد الإلكتروني
  displayName: string;            // الاسم الكامل
  phoneNumber?: string;           // رقم الهاتف
  role: UserRole;                 // الدور الوظيفي
  department: Department;         // القسم
  isHead: boolean;                // هل هو رئيس القسم
  isActive: boolean;              // هل الحساب نشط
  photoURL?: string;              // رابط الصورة الشخصية
  fcmToken?: string;              // رمز الإشعارات
  createdAt: Timestamp;           // تاريخ الإنشاء
  updatedAt: Timestamp;           // تاريخ آخر تحديث
}
```

**الأدوار المتاحة:**
- `ceo` - المدير التنفيذي
- `sales` - موظف مبيعات
- `sales_head` - رئيس المبيعات
- `design` - مصمم
- `design_head` - رئيس التصميم
- `printing` - عامل طباعة
- `printing_head` - رئيس الطباعة
- `accounting` - محاسب
- `accounting_head` - رئيس الحسابات
- `dispatch` - موظف إرسال
- `dispatch_head` - رئيس الإرسال

---

#### 2. **orders** - الطلبات
```typescript
{
  id: string;                           // معرف الطلب
  orderNumber: string;                  // رقم الطلب (NAJD-2024-0001)
  status: OrderStatus;                  // حالة الطلب
  priority: OrderPriority;              // الأولوية
  
  // معلومات العميل
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string;
  
  // تفاصيل الطلب
  printType: PrintType;                 // نوع الطباعة
  quantity: number;                     // الكمية
  needsDesign: boolean;                 // يحتاج تصميم
  designDescription?: string;           // وصف التصميم
  
  // المواد
  materials: Material[];                // قائمة المواد المطلوبة
  
  // الملفات
  files: AttachedFile[];                // الملفات المرفقة
  
  // الملاحظات
  notes: string;                        // ملاحظات عامة
  internalNotes?: string;               // ملاحظات داخلية
  
  // المالية
  estimatedCost?: number;
  finalCost?: number;
  paidAmount?: number;
  paymentStatus: PaymentStatus;
  
  // التواريخ
  requestedDeliveryDate?: Timestamp;
  estimatedDeliveryDate?: Timestamp;
  actualDeliveryDate?: Timestamp;
  
  // الإسنادات
  createdBy: string;
  createdByName: string;
  assignedToDesign?: string;
  assignedToPrinting?: string;
  assignedToDispatch?: string;
  
  // التعليقات والمتابعة
  comments: OrderComment[];
  timeline: OrderTimeline[];
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  tags?: string[];
  isUrgent: boolean;
}
```

**حالات الطلب (Workflow):**
1. `draft` → `pending_ceo_review`
2. إذا تمت الموافقة:
   - إذا يحتاج تصميم → `pending_design` → `in_design` → `design_completed`
   - إذا يحتاج مواد → `pending_materials` → `materials_in_progress` → `materials_ready`
3. `pending_printing` → `in_printing` → `printing_completed`
4. `pending_payment` → `payment_confirmed`
5. `ready_for_dispatch` → `in_dispatch` → `delivered`

**حالات خاصة:**
- `rejected_by_ceo` - مرفوض من المدير
- `returned_to_sales` - معاد للمبيعات للتعديل
- `cancelled` - ملغي
- `on_hold` - معلق

---

#### 3. **notifications** - الإشعارات
```typescript
{
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  recipientId: string;              // معرف المستلم
  recipientRole: string;            // دور المستلم
  orderId?: string;
  orderNumber?: string;
  isRead: boolean;
  isActionRequired: boolean;
  createdAt: Timestamp;
  readAt?: Timestamp;
  actionUrl?: string;
  metadata?: Record<string, any>;
}
```

---

#### 4. **counters** - العدادات
```typescript
{
  count: number;                    // العدد الحالي
  lastUpdated: Timestamp;           // آخر تحديث
}
```

---

#### 5. **activity_logs** - سجل النشاطات
```typescript
{
  id: string;
  userId: string;
  userName: string;
  action: string;                   // نوع الإجراء
  targetType: string;               // نوع الهدف (order, user, etc)
  targetId: string;                 // معرف الهدف
  details: Record<string, any>;
  timestamp: Timestamp;
}
```

---

## 🔐 قواعد الأمان (Security Rules)

### الصلاحيات حسب الدور:

| الدور | الصلاحيات |
|-------|-----------|
| **CEO** | الوصول الكامل، الموافقة/الرفض، إدارة المستخدمين |
| **Sales** | إنشاء الطلبات، تعديل طلباتهم |
| **Sales Head** | كل صلاحيات Sales + عرض كل الطلبات |
| **Design** | استلام الطلبات، تحديث حالة التصميم |
| **Design Head** | كل صلاحيات Design + تعيين المهام |
| **Printing** | استلام الطلبات، تحديث حالة الطباعة |
| **Printing Head** | كل صلاحيات Printing + تعيين المهام |
| **Accounting** | مراجعة المدفوعات، تأكيد الدفع |
| **Accounting Head** | كل صلاحيات Accounting + التقارير |
| **Dispatch** | تحديث حالة الإرسال، إدارة المواد |
| **Dispatch Head** | كل صلاحيات Dispatch + التقارير |

---

## 🚀 خطوات الإعداد

### 1. إنشاء مشروع Firebase

```bash
# تسجيل الدخول
firebase login

# تهيئة المشروع
firebase init

# اختر:
# - Firestore
# - Functions
# - Hosting
# - Storage
```

### 2. إعداد Firebase في التطبيقات

#### Web (Next.js):
```typescript
// apps/web/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

#### Mobile (React Native + Expo):
```typescript
// apps/mobile/config/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// نفس الـ Config
```

### 3. نشر Cloud Functions

```bash
cd functions
npm install
npm run build
firebase deploy --only functions
```

### 4. نشر Security Rules

```bash
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

### 5. إنشاء المستخدم الأول (CEO)

استخدم Firebase Console أو الكود التالي:

```typescript
// إنشاء المستخدم في Authentication
const userCredential = await createUserWithEmailAndPassword(
  auth,
  'ceo@najd.com',
  'password'
);

// إضافة بيانات المستخدم في Firestore
await setDoc(doc(db, 'users', userCredential.user.uid), {
  uid: userCredential.user.uid,
  email: 'ceo@najd.com',
  displayName: 'المدير التنفيذي',
  role: 'ceo',
  department: 'management',
  isHead: true,
  isActive: true,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
});
```

---

## 📊 المؤشرات المطلوبة (Indexes)

تم تعريفها في `firestore.indexes.json` وستُنشر تلقائياً.

---

## 🔔 الإشعارات (FCM)

### إعداد Firebase Cloud Messaging:

1. قم بتنزيل `google-services.json` (Android) و `GoogleService-Info.plist` (iOS)
2. ضعها في المسارات الصحيحة في تطبيق Expo
3. أضف FCM Token للمستخدم عند تسجيل الدخول

```typescript
import * as Notifications from 'expo-notifications';

// طلب الصلاحيات
const { status } = await Notifications.requestPermissionsAsync();

// الحصول على Token
const token = (await Notifications.getExpoPushTokenAsync()).data;

// حفظه في Firestore
await updateDoc(doc(db, 'users', userId), {
  fcmToken: token,
});
```

---

## 📈 المراقبة والتحليلات

تفعيل Firebase Analytics:

```typescript
import { getAnalytics } from 'firebase/analytics';

const analytics = getAnalytics(app);
```

---

## 🧪 الاختبار

استخدام Firebase Emulators:

```bash
firebase emulators:start
```

سيعمل على:
- Firestore: http://localhost:8080
- Functions: http://localhost:5001
- Auth: http://localhost:9099
- Storage: http://localhost:9199
- UI: http://localhost:4000

---

## 📝 ملاحظات مهمة

1. **الأمان**: لا تشارك مفاتيح API العامة أبداً
2. **التكلفة**: راقب استخدام Firestore و Functions
3. **النسخ الاحتياطي**: قم بجدولة النسخ الاحتياطي الدوري
4. **الفهرسة**: راجع الفهارس المستخدمة بانتظام
5. **التحديث**: حدّث مكتبات Firebase بانتظام

---

## 🆘 الدعم

للمساعدة أو الأسئلة:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Console](https://console.firebase.google.com/)

