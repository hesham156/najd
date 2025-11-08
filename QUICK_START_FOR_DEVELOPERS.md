# دليل البداية السريع للمطورين 🚀

<div dir="rtl">

**للمطورين الجدد على المشروع**

---

## 📌 أول 5 أشياء يجب معرفتها

### 1. بنية المشروع 🏗️

```
najd/
├── apps/
│   ├── web/              # Next.js (Web Application)
│   └── mobile/           # React Native (Mobile App)
├── packages/
│   └── shared/           # Types & Constants (مشتركة)
├── functions/            # Cloud Functions (Firebase)
└── ملفات التوثيق
```

### 2. التقنيات المستخدمة 💻

- **Frontend**: React, Next.js 14, TypeScript, Tailwind CSS
- **Mobile**: React Native (CLI - ليس Expo بعد الآن)
- **Backend**: Firebase (Auth, Firestore, Storage, Functions)
- **State Management**: React Context API
- **Forms**: React Hook Form (مقترح، قد لا يكون مطبق)

### 3. الأدوار والصلاحيات 👥

```typescript
CEO → الوصول الكامل
Sales / Sales Head → إنشاء الطلبات
Design / Design Head → التصميم
Printing / Printing Head → الطباعة
Accounting / Accounting Head → الفواتير والدفعات
Dispatch / Dispatch Head → المواد والإرسال
```

### 4. سير عمل الطلب الأساسي 📋

```
المبيعات → CEO → التصميم → [المواد] → الطباعة → 
الحسابات (التسعيرة) → الدفع → الإرسال → التسليم ✅
```

### 5. الملفات المهمة 📁

```typescript
// Types المشتركة
packages/shared/src/types/

// Firestore Rules
firestore.rules

// Cloud Functions
functions/src/

// Web Pages
apps/web/src/app/

// Mobile Screens
apps/mobile/src/screens/
```

---

## 🎯 ما يجب فعله أولاً (حسب الأولوية)

### المستوى 1: عاجل جداً 🔴

#### 1. تحسين Security Rules (30 دقيقة)

**المشكلة**:
```javascript
// في firestore.rules
allow update: if isActiveUser();  // ❌ أي مستخدم يمكنه تحديث أي طلب!
```

**الحل**:
```javascript
// راجع ملف LOGIC_ISSUES_AND_RECOMMENDATIONS.md → القسم 6
// طبّق القواعد المحسّنة
```

**الملف**: `firestore.rules` → قسم Orders

---

#### 2. تأمين Counters (15 دقيقة)

**المشكلة**:
```javascript
allow write: if isSignedIn();  // ❌ أي مستخدم يمكنه تغيير العدادات
```

**الحل**:
```javascript
allow write: if false;  // ✅ فقط عبر Cloud Functions
```

**الملفات**:
- `firestore.rules` → قسم Counters
- `functions/src/triggers/counterTriggers.ts` (أنشئ إذا لم يكن موجود)

---

#### 3. إضافة materialsStatus للطلبات (1-2 ساعة)

**المشكلة**: لا نعرف أي مواد تم تجهيزها عندما يحتاج الطلب مواد متعددة.

**الحل**:
```typescript
// في packages/shared/src/types/order.types.ts
interface MaterialStatus {
  type: MaterialType;
  status: 'pending' | 'in_progress' | 'ready';
  assignedTo?: string;
  completedAt?: string;
}

interface Order {
  // ... الحقول الموجودة
  materialsStatus?: MaterialStatus[];  // ← أضف هذا
}
```

**الملفات**:
- `packages/shared/src/types/order.types.ts`
- `apps/web/src/app/orders/[id]/page.tsx` (واجهة تيم الإرسال)

**راجع**: `LOGIC_ISSUES_AND_RECOMMENDATIONS.md` → القسم 2

---

### المستوى 2: مهم جداً 🟡

#### 4. نظام الفواتير الكامل (2-3 أيام)

**الوضع**: Types موجودة، لكن لا UI

**خطوات**:

1. **إنشاء الصفحات** (4-6 ساعات)
   ```
   apps/web/src/app/accounting/invoices/
   ├── page.tsx           # قائمة الفواتير
   ├── new/
   │   └── page.tsx       # إنشاء فاتورة
   └── [id]/
       └── page.tsx       # تفاصيل الفاتورة
   ```

2. **واجهة تسجيل الدفعات** (3-4 ساعات)
   - نموذج لتسجيل دفعة
   - جدول سجل الدفعات
   - حساب المبلغ المتبقي

3. **Cloud Functions** (2-3 ساعات)
   ```typescript
   // functions/src/triggers/invoiceTriggers.ts
   - generateInvoiceNumber()
   - onInvoiceCreated()
   - onPaymentRecorded()
   ```

4. **توليد PDF** (3-4 ساعات)
   - استخدم `jspdf` أو `@react-pdf/renderer`
   - قالب الفاتورة
   - معلومات الشركة + QR Code

**ابدأ من**: `DEVELOPMENT_ROADMAP.md` → المرحلة 1 → الأسبوع 1-2

---

#### 5. Dispatch Dashboard (1-2 يوم)

**الوضع**: لا يوجد Dashboard خاص

**خطوات**:

1. **إنشاء الصفحة**
   ```
   apps/web/src/app/dispatch/page.tsx
   ```

2. **المكونات**:
   - قائمة الطلبات التي تحتاج مواد
   - واجهة تحديث حالة المواد
   - قائمة الطلبات الجاهزة للإرسال
   - تتبع الشحنات

3. **التكامل**:
   - استخدم `useOrders()` hook
   - تصفية الطلبات حسب الحالة
   - تحديث `materialsStatus`

**مثال**: راجع `apps/web/src/app/designer/page.tsx` (نفس الفكرة)

---

#### 6. التقارير الأساسية (2-3 أيام)

**الوضع**: بعض الإحصائيات في الـ Dashboards فقط

**الأولويات**:

1. **تقرير الطلبات** (أهم شيء)
   ```typescript
   // apps/web/src/app/reports/orders/page.tsx
   - تصفية: الفترة، الحالة، القسم
   - عرض: جدول + إحصائيات
   - تصدير: Excel
   ```

2. **تقرير المبيعات**
   ```typescript
   // apps/web/src/app/reports/sales/page.tsx
   - إجمالي المبيعات
   - توزيع حسب نوع الطباعة
   - رسم بياني
   ```

3. **تقرير الفواتير**
   ```typescript
   // apps/web/src/app/reports/invoices/page.tsx
   - المدفوعة / الغير مدفوعة
   - المتأخرة
   - التدفقات النقدية
   ```

**مكتبات مفيدة**:
- `recharts` للرسوم البيانية
- `xlsx` لتصدير Excel
- `date-fns` للتواريخ

---

### المستوى 3: مفيد 🟢

#### 7. نظام العملاء (CRM) (2-3 أيام)

- قاعدة بيانات مستقلة للعملاء
- صفحة قائمة العملاء
- صفحة تفاصيل العميل + تاريخه
- Auto-complete عند اختيار عميل

#### 8. Sales Head Dashboard (1 يوم)

- إحصائيات المبيعات
- أداء فريق المبيعات

#### 9. نظام البريد الإلكتروني (2-3 أيام)

- إرسال عروض الأسعار
- إرسال الفواتير
- تذكيرات الدفع

---

## 🛠️ الأدوات والأوامر المفيدة

### تشغيل المشروع محلياً:

```bash
# Web App
cd apps/web
npm run dev
# http://localhost:3000

# Mobile App (Android)
cd apps/mobile
npm run android

# Firebase Emulators
firebase emulators:start

# Cloud Functions (local)
cd functions
npm run serve
```

### اختبار Security Rules:

```bash
# في جذر المشروع
firebase emulators:start --only firestore

# في متصفح آخر
# افتح: http://localhost:4000
# اذهب لـ Firestore Emulator
# اختبر القواعد
```

### نشر التحديثات:

```bash
# نشر Functions فقط
firebase deploy --only functions

# نشر Rules فقط
firebase deploy --only firestore:rules

# نشر الكل
firebase deploy
```

---

## 📚 موارد مفيدة

### التوثيق الداخلي:
1. `SYSTEM_AUDIT_REPORT.md` - فحص شامل للنظام
2. `LOGIC_ISSUES_AND_RECOMMENDATIONS.md` - المشاكل المنطقية والحلول
3. `DEVELOPMENT_ROADMAP.md` - خارطة الطريق الكاملة
4. `CORRECT_WORKFLOW.md` - سير العمل الصحيح

### Firebase:
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Cloud Functions](https://firebase.google.com/docs/functions)

### Next.js:
- [App Router](https://nextjs.org/docs/app)
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

### TypeScript:
- [Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

---

## 🐛 مشاكل شائعة وحلولها

### 1. خطأ في Firebase Authentication

```bash
# تأكد من ملف .env.local
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
# ... إلخ
```

### 2. خطأ في Firestore Rules

```javascript
// إذا كان الوصول مرفوض:
// 1. تحقق من Security Rules
// 2. تأكد من أن المستخدم لديه الصلاحية
// 3. راجع console.log للأخطاء
```

### 3. Cloud Functions لا تعمل محلياً

```bash
# تأكد من تثبيت Dependencies
cd functions
npm install

# تأكد من أن Firebase CLI محدث
npm install -g firebase-tools@latest

# شغل Emulators
firebase emulators:start
```

### 4. Mobile App لا يبني

```bash
# Android
cd apps/mobile/android
./gradlew clean

# iOS (Mac only)
cd apps/mobile/ios
pod install
```

---

## ✅ Checklist للمطور الجديد

- [ ] قرأت `README.md`
- [ ] قرأت `SYSTEM_AUDIT_REPORT.md`
- [ ] فهمت بنية المشروع
- [ ] شغلت المشروع محلياً (Web)
- [ ] شغلت Firebase Emulators
- [ ] أنشأت مستخدم تجريبي لكل دور
- [ ] اختبرت سير العمل الأساسي
- [ ] قرأت `LOGIC_ISSUES_AND_RECOMMENDATIONS.md`
- [ ] اطلعت على `DEVELOPMENT_ROADMAP.md`
- [ ] جاهز للبدء! 🚀

---

## 📞 تواصل مع الفريق

إذا واجهت مشكلة:
1. راجع التوثيق أولاً
2. ابحث في Issues (GitHub)
3. اسأل في قناة الفريق (Slack/Teams)
4. أنشئ Issue جديد إذا لزم الأمر

---

## 🎯 هدفك الأول

**الهدف**: إكمال المرحلة 1 من Roadmap

**الأولويات**:
1. ✅ تحسين Security Rules (30 دقيقة)
2. ✅ تأمين Counters (15 دقيقة)
3. ✅ إضافة materialsStatus (1-2 ساعة)
4. 🚧 نظام الفواتير (2-3 أيام)
5. 🚧 Dispatch Dashboard (1-2 يوم)
6. 🚧 التقارير الأساسية (2-3 أيام)

**المدة الإجمالية**: ~2-3 أسابيع

---

**مُعد بواسطة**: System Architect  
**تاريخ**: 6 نوفمبر 2025  
**الحالة**: جاهز للاستخدام ✅

</div>



