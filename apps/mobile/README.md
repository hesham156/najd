# تطبيق نجد للموبايل 📱

تطبيق React Native + Expo للإدارة الداخلية لشركة نجد.

## 🚀 البدء

```bash
# تثبيت المكتبات
cd apps/mobile
npm install

# تشغيل Expo
npm start

# تشغيل على Android
npm run android

# تشغيل على iOS
npm run ios

# تشغيل في المتصفح
npm run web
```

⚠️ **ملاحظة مهمة**: إذا واجهت مشاكل في التثبيت، راجع [SETUP.md](./SETUP.md) للحلول التفصيلية.

## 📁 هيكل المشروع

```
src/
├── screens/                      # شاشات التطبيق
│   ├── LoginScreen.tsx           # تسجيل الدخول
│   ├── DashboardScreen.tsx       # لوحة التحكم (مع توجيه تلقائي)
│   ├── CEODashboardScreen.tsx    # 👑 لوحة المدير التنفيذي
│   ├── AccountingDashboardScreen.tsx  # 💰 لوحة المحاسبة
│   ├── DesignerDashboardScreen.tsx    # 🎨 لوحة التصميم
│   ├── PrintingDashboardScreen.tsx    # 🖨️ لوحة الطباعة
│   ├── OrdersScreen.tsx          # قائمة الطلبات
│   ├── OrderDetailsScreen.tsx    # تفاصيل الطلب
│   ├── NewOrderScreen.tsx        # طلب جديد
│   ├── QuotationsScreen.tsx      # عروض الأسعار
│   ├── UsersScreen.tsx           # إدارة المستخدمين
│   ├── NotificationsScreen.tsx   # الإشعارات
│   └── ProfileScreen.tsx         # الملف الشخصي
├── navigation/                   # React Navigation
│   └── AppNavigator.tsx          # نظام التنقل المحدث
├── contexts/                     # React Contexts
│   └── AuthContext.tsx           # سياق المصادقة
└── config/                       # Configurations
    └── firebase.ts               # Firebase Config
```

## 🎨 التصميم

- **RTL Support**: كامل
- **Native Components**: استخدام مكونات React Native الأصلية
- **Theme**: ألوان نجد (أزرق وذهبي)
- **Platform Specific**: تصميم يتكيف مع Android و iOS

## 📱 الشاشات الرئيسية

### 🔐 المصادقة
- **Login** - تسجيل الدخول

### 📊 لوحات التحكم المتخصصة
- **CEO Dashboard** - لوحة المدير التنفيذي (موافقة الطلبات، الإحصائيات الشاملة)
- **Accounting Dashboard** - لوحة المحاسبة (إدارة المدفوعات وعروض الأسعار)
- **Designer Dashboard** - لوحة التصميم (نظام Kanban للتصميم)
- **Printing Dashboard** - لوحة الطباعة (نظام Kanban للطباعة)
- **Dashboard** - لوحة عامة (للأقسام الأخرى)

### 📋 الطلبات
- **Orders** - قائمة الطلبات
- **Order Details** - تفاصيل الطلب الكاملة
- **New Order** - إنشاء طلب جديد

### 💰 عروض الأسعار
- **Quotations** - عرض وإدارة عروض الأسعار

### 👥 إدارة النظام
- **Users Management** - إدارة المستخدمين (فقط للCEO)

### 🔔 الإشعارات
- **Notifications** - الإشعارات والتنبيهات

### 👤 الحساب
- **Profile** - الملف الشخصي والإعدادات

## 🔧 البيئة

ملف `.env.local`:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 📦 المكتبات الرئيسية

- `expo` - Development Platform
- `react-native` - Mobile Framework
- `@react-navigation` - Navigation (Stack + Bottom Tabs)
- `firebase` - Backend Services (Firestore, Auth)
- `date-fns` - Date Formatting
- `expo-notifications` - Push Notifications
- `expo-image-picker` - Image Selection
- `expo-document-picker` - Document Selection

## 🔔 الإشعارات

### إعداد Push Notifications

1. إضافة `google-services.json` في المجلد الجذر
2. إضافة `GoogleService-Info.plist` في المجلد الجذر
3. تشغيل `expo build` لإنشاء النسخة

### طلب الصلاحيات

```typescript
import * as Notifications from 'expo-notifications';

const { status } = await Notifications.requestPermissionsAsync();
```

## 🚢 البناء والنشر

### Android

```bash
expo build:android
```

### iOS

```bash
expo build:ios
```

### EAS Build (موصى به)

```bash
npm install -g eas-cli
eas build --platform android
eas build --platform ios
```

## 📸 Screenshots

*(سيتم إضافة screenshots قريباً)*

