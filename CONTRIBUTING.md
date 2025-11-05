# دليل المساهمة 🤝

<div dir="rtl">

شكراً لاهتمامك بالمساهمة في نظام إدارة نجد!

## 📋 قبل البدء

1. تأكد من قراءة [README.md](./README.md)
2. راجع [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
3. افهم هيكل المشروع والـ Workflow

## 🔧 إعداد بيئة التطوير

```bash
# استنساخ المشروع
git clone [repository-url]
cd najd

# تثبيت المكتبات
npm install --workspaces

# إعداد Firebase
cp apps/web/.env.example apps/web/.env.local
cp apps/mobile/.env.example apps/mobile/.env.local

# تشغيل Emulators
firebase emulators:start
```

## 📝 معايير الكود

### TypeScript

- استخدم TypeScript في جميع الملفات
- حدد الأنواع بوضوح
- تجنب `any` إلا عند الضرورة القصوى

### React

- استخدم Function Components
- استخدم Hooks بدلاً من Class Components
- اتبع مبادئ SOLID

### Naming Conventions

- **المكونات**: PascalCase (مثل `OrderCard.tsx`)
- **الوظائف**: camelCase (مثل `getUserData()`)
- **الثوابت**: UPPER_SNAKE_CASE (مثل `COLLECTIONS`)
- **الملفات**: kebab-case أو PascalCase حسب المحتوى

### التعليقات

- اكتب تعليقات بالعربية للوظائف الرئيسية
- استخدم JSDoc للدوال المعقدة
- اشرح "لماذا" وليس "ماذا"

```typescript
/**
 * توليد رقم طلب تسلسلي بالصيغة NAJD-YYYY-XXXX
 * يستخدم Transaction لضمان عدم التكرار
 */
export async function generateOrderNumber() {
  // ...
}
```

## 🎨 معايير التصميم

### الويب (Tailwind CSS)

- استخدم classes جاهزة قدر الإمكان
- اتبع نظام الألوان المحدد
- تأكد من RTL support

### الموبايل (React Native)

- استخدم StyleSheet.create
- تجنب inline styles
- اختبر على Android و iOS

## 🧪 الاختبار

### قبل الـ Commit

```bash
# فحص الأخطاء
npm run lint

# فحص الأنواع
npm run type-check

# تشغيل Tests
npm test
```

## 📤 عملية الـ Pull Request

1. **أنشئ branch جديد**
   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **أضف تغييراتك**
   ```bash
   git add .
   git commit -m "feat: إضافة ميزة رائعة"
   ```

3. **اتبع معايير Commit Messages**
   - `feat:` - ميزة جديدة
   - `fix:` - إصلاح مشكلة
   - `docs:` - تحديث الوثائق
   - `style:` - تنسيق الكود
   - `refactor:` - إعادة هيكلة
   - `test:` - إضافة tests
   - `chore:` - مهام صيانة

4. **ادفع للـ Repository**
   ```bash
   git push origin feature/amazing-feature
   ```

5. **أنشئ Pull Request**
   - اشرح التغييرات بوضوح
   - أضف Screenshots إن وجدت
   - اذكر الـ Issues ذات الصلة

## 🐛 الإبلاغ عن المشاكل

استخدم GitHub Issues وحدد:
- وصف واضح للمشكلة
- خطوات إعادة إنتاج المشكلة
- النتيجة المتوقعة والفعلية
- Screenshots إن وجدت
- بيئة التشغيل (Browser, OS, etc.)

## 🔒 الأمان

- **لا تشارك** مفاتيح API أو بيانات حساسة
- **لا تضف** ملفات `.env` للـ Repository
- **راجع** Security Rules قبل النشر
- **أبلغ** عن الثغرات الأمنية مباشرة

## 📚 الموارد

- [React Documentation](https://react.dev/)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Native Documentation](https://reactnative.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## ❓ الأسئلة

إذا كان لديك أي أسئلة، لا تتردد في:
- فتح Issue للمناقشة
- التواصل مع الفريق

---

شكراً لمساهمتك! 🎉

</div>

