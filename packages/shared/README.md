# Shared Package - نجد 📦

حزمة مشتركة تحتوي على الأنواع والثوابت والوظائف المشتركة بين الويب والموبايل.

## 📋 المحتويات

### Types

#### `user.types.ts`
- `UserRole` - أدوار المستخدمين
- `Department` - الأقسام
- `User` - نوع بيانات المستخدم
- `UserPermissions` - صلاحيات المستخدم
- `getPermissionsForRole()` - دالة للحصول على الصلاحيات

#### `order.types.ts`
- `OrderStatus` - حالات الطلب
- `PrintType` - أنواع الطباعة
- `MaterialType` - أنواع المواد
- `PaymentStatus` - حالات الدفع
- `OrderPriority` - أولويات الطلب
- `Order` - نوع بيانات الطلب
- `getNextStatus()` - دالة لتحديد الحالة التالية
- `getDepartmentForStatus()` - دالة لتحديد القسم المسؤول

#### `notification.types.ts`
- `NotificationType` - أنواع الإشعارات
- `Notification` - نوع بيانات الإشعار

### Constants

#### `firebase.ts`
- `COLLECTIONS` - أسماء Collections في Firestore
- `STORAGE_PATHS` - مسارات Storage

### Utils

#### `status-labels.ts`
- `ORDER_STATUS_LABELS` - تسميات الحالات بالعربية
- `PRINT_TYPE_LABELS` - تسميات أنواع الطباعة
- `PAYMENT_STATUS_LABELS` - تسميات حالات الدفع
- `PRIORITY_LABELS` - تسميات الأولويات
- `MATERIAL_TYPE_LABELS` - تسميات أنواع المواد
- `getStatusColor()` - دالة للحصول على لون الحالة
- `getPriorityColor()` - دالة للحصول على لون الأولوية

## 🔧 الاستخدام

### في تطبيق الويب

```typescript
import { Order, OrderStatus, COLLECTIONS } from '@najd/shared';
```

### في تطبيق الموبايل

```typescript
import { User, UserRole, getPermissionsForRole } from '@najd/shared';
```

## 📦 التصدير

```typescript
// الاستيراد من الحزمة مباشرة
import { ... } from '@najd/shared';

// أو من الملفات المحددة
import { Order } from '@najd/shared/types/order.types';
```

