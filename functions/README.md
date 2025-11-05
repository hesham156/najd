# Cloud Functions - نجد ☁️

Cloud Functions للأتمتة والإشعارات في نظام نجد.

## 📋 الوظائف المتاحة

### Triggers

#### `onOrderCreated`
يتم تشغيلها عند إنشاء طلب جديد.

**الإجراءات**:
- إضافة Timeline Entry
- إرسال إشعار للـ CEO
- إرسال إشعار لمدير المبيعات

#### `onOrderStatusChanged`
يتم تشغيلها عند تغيير حالة الطلب.

**الإجراءات**:
- إضافة Timeline Entry
- إرسال إشعارات للقسم المعني

### Callable Functions

#### `generateOrderNumber`
توليد رقم طلب تسلسلي.

**Parameters**: لا شيء

**Returns**: `{ orderNumber: string }`

**مثال**:
```typescript
const result = await httpsCallable(functions, 'generateOrderNumber')();
console.log(result.data.orderNumber); // "NAJD-2024-0001"
```

#### `sendNotificationToUser`
إرسال إشعار لمستخدم محدد.

**Parameters**:
```typescript
{
  userId: string;
  title: string;
  message: string;
  orderId?: string;
  orderNumber?: string;
  type?: string;
}
```

#### `sendNotificationToRole`
إرسال إشعار لجميع المستخدمين بدور معين.

**Parameters**:
```typescript
{
  role: string;
  title: string;
  message: string;
  orderId?: string;
  orderNumber?: string;
  type?: string;
}
```

### Scheduled Functions

#### `cleanupOldNotifications`
تنظيف الإشعارات القديمة (أكثر من 30 يوم والمقروءة).

**Schedule**: يومياً في الساعة 2 صباحاً (توقيت الرياض)

## 🚀 التشغيل

### محلياً

```bash
npm run serve
```

### النشر

```bash
npm run deploy
# أو
firebase deploy --only functions
```

## 🧪 الاختبار

```bash
npm run build
npm test
```

## 📝 الإضافات المستقبلية

- [ ] وظيفة لتوليد التقارير
- [ ] وظيفة للنسخ الاحتياطي التلقائي
- [ ] وظيفة لإرسال البريد الإلكتروني
- [ ] وظيفة للتذكير بالطلبات المتأخرة

