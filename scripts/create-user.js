/**
 * سكريبت لإنشاء مستخدم جديد في النظام
 * يستخدم Firebase Admin SDK
 */

const admin = require('firebase-admin');
const readline = require('readline');

// تهيئة Firebase Admin
if (!admin.apps.length) {
  try {
    // محاولة استخدام Application Default Credentials
    admin.initializeApp({
      projectId: 'najd-5e7c7',
    });
  } catch (error) {
    // استخدام emulator في حالة الفشل
    process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
    process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
    admin.initializeApp({
      projectId: 'najd-5e7c7',
    });
  }
}

const auth = admin.auth();
const db = admin.firestore();

// واجهة لقراءة المدخلات
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// دالة لطرح سؤال
function question(query) {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

// بيانات الأدوار المتاحة
const ROLES = {
  '1': { role: 'ceo', department: 'management', name: 'المدير التنفيذي', isHead: true },
  '2': { role: 'sales', department: 'sales', name: 'موظف مبيعات', isHead: false },
  '3': { role: 'sales_head', department: 'sales', name: 'مدير المبيعات', isHead: true },
  '4': { role: 'design', department: 'design', name: 'مصمم', isHead: false },
  '5': { role: 'design_head', department: 'design', name: 'مدير التصميم', isHead: true },
  '6': { role: 'printing', department: 'printing', name: 'موظف طباعة', isHead: false },
  '7': { role: 'printing_head', department: 'printing', name: 'مدير الطباعة', isHead: true },
  '8': { role: 'accounting', department: 'accounting', name: 'محاسب', isHead: false },
  '9': { role: 'accounting_head', department: 'accounting', name: 'مدير الحسابات', isHead: true },
  '10': { role: 'dispatch', department: 'dispatch', name: 'موظف إرسال', isHead: false },
  '11': { role: 'dispatch_head', department: 'dispatch', name: 'مدير الإرسال', isHead: true },
};

async function createUser() {
  try {
    console.log('\n========================================');
    console.log('   إنشاء مستخدم جديد - نظام نجد');
    console.log('========================================\n');

    // إدخال البيانات
    const email = await question('البريد الإلكتروني: ');
    const password = await question('كلمة المرور: ');
    const displayName = await question('الاسم الكامل: ');
    const phoneNumber = await question('رقم الهاتف (اختياري): ');

    // اختيار الدور
    console.log('\nاختر الدور:');
    console.log('1. المدير التنفيذي (CEO)');
    console.log('2. موظف مبيعات');
    console.log('3. مدير المبيعات');
    console.log('4. مصمم');
    console.log('5. مدير التصميم');
    console.log('6. موظف طباعة');
    console.log('7. مدير الطباعة');
    console.log('8. محاسب');
    console.log('9. مدير الحسابات');
    console.log('10. موظف إرسال');
    console.log('11. مدير الإرسال');
    
    const roleChoice = await question('\nالدور (1-11): ');
    const roleData = ROLES[roleChoice];

    if (!roleData) {
      console.error('❌ اختيار غير صحيح!');
      rl.close();
      return;
    }

    console.log('\n⏳ جاري إنشاء المستخدم...\n');

    // 1. إنشاء المستخدم في Firebase Authentication
    const userRecord = await auth.createUser({
      email,
      password,
      displayName,
      ...(phoneNumber && { phoneNumber }),
    });

    console.log('✅ تم إنشاء المستخدم في Authentication');
    console.log(`   UID: ${userRecord.uid}`);

    // 2. إضافة بيانات المستخدم في Firestore
    const userData = {
      uid: userRecord.uid,
      email,
      displayName,
      ...(phoneNumber && { phoneNumber }),
      role: roleData.role,
      department: roleData.department,
      isHead: roleData.isHead,
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection('users').doc(userRecord.uid).set(userData);

    console.log('✅ تم حفظ بيانات المستخدم في Firestore');

    console.log('\n========================================');
    console.log('   تم إنشاء المستخدم بنجاح! 🎉');
    console.log('========================================');
    console.log(`\nالبريد الإلكتروني: ${email}`);
    console.log(`كلمة المرور: ${password}`);
    console.log(`الاسم: ${displayName}`);
    console.log(`الدور: ${roleData.name}`);
    console.log(`القسم: ${roleData.department}`);
    console.log('\nيمكنك الآن تسجيل الدخول على: http://localhost:3000/login\n');

  } catch (error) {
    console.error('\n❌ حدث خطأ:', error.message);
    
    if (error.code === 'auth/email-already-exists') {
      console.error('البريد الإلكتروني مستخدم بالفعل!');
    } else if (error.code === 'auth/invalid-email') {
      console.error('البريد الإلكتروني غير صحيح!');
    } else if (error.code === 'auth/invalid-password') {
      console.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل!');
    }
  } finally {
    rl.close();
  }
}

// إنشاء مستخدم CEO سريع بدون إدخال
async function createQuickCEO() {
  try {
    console.log('\n⏳ جاري إنشاء مستخدم CEO تجريبي...\n');

    const email = 'ceo@najd.com';
    const password = 'Najd@2024';
    const displayName = 'المدير التنفيذي';

    // 1. إنشاء المستخدم في Firebase Authentication
    const userRecord = await auth.createUser({
      email,
      password,
      displayName,
    });

    console.log('✅ تم إنشاء المستخدم في Authentication');

    // 2. إضافة بيانات المستخدم في Firestore
    const userData = {
      uid: userRecord.uid,
      email,
      displayName,
      role: 'ceo',
      department: 'management',
      isHead: true,
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection('users').doc(userRecord.uid).set(userData);

    console.log('✅ تم حفظ بيانات المستخدم في Firestore');
    console.log('\n========================================');
    console.log('   تم إنشاء مستخدم CEO بنجاح! 🎉');
    console.log('========================================');
    console.log(`\nالبريد الإلكتروني: ${email}`);
    console.log(`كلمة المرور: ${password}`);
    console.log(`الاسم: ${displayName}`);
    console.log(`الدور: المدير التنفيذي (CEO)`);
    console.log('\nيمكنك الآن تسجيل الدخول على: http://localhost:3000/login\n');

  } catch (error) {
    console.error('\n❌ حدث خطأ:', error.message);
    
    if (error.code === 'auth/email-already-exists') {
      console.error('\n⚠️  المستخدم موجود بالفعل! يمكنك تسجيل الدخول بـ:');
      console.error(`   البريد الإلكتروني: ceo@najd.com`);
      console.error(`   كلمة المرور: Najd@2024\n`);
    }
  }
}

// التحقق من المعاملات
const args = process.argv.slice(2);

if (args.includes('--quick') || args.includes('-q')) {
  createQuickCEO();
} else {
  createUser();
}

