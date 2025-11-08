/**
 * إنشاء مدير مبيعات سريع
 */

const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const auth = admin.auth();
const db = admin.firestore();

async function createSalesHead() {
  try {
    console.log('\n⏳ جاري إنشاء مدير مبيعات...\n');

    const email = 'sales.head@najd.com';
    const password = 'Najd@2024';
    const displayName = 'مدير المبيعات';

    // 1. إنشاء المستخدم في Firebase Authentication
    const userRecord = await auth.createUser({
      email,
      password,
      displayName,
    });

    console.log('✅ تم إنشاء المستخدم في Authentication');
    console.log(`   UID: ${userRecord.uid}`);

    // 2. إضافة بيانات المستخدم في Firestore
    const userData = {
      uid: userRecord.uid,
      email,
      displayName,
      role: 'sales_head',
      department: 'sales',
      isHead: true,
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection('users').doc(userRecord.uid).set(userData);

    console.log('✅ تم حفظ بيانات المستخدم في Firestore');
    console.log('\n========================================');
    console.log('   تم إنشاء مدير المبيعات بنجاح! 🎉');
    console.log('========================================');
    console.log(`\nالبريد الإلكتروني: ${email}`);
    console.log(`كلمة المرور: ${password}`);
    console.log(`الاسم: ${displayName}`);
    console.log(`الدور: مدير المبيعات (sales_head)`);
    console.log(`القسم: sales`);
    console.log('\nيمكنك الآن تسجيل الدخول على: http://localhost:3000/login\n');

  } catch (error) {
    console.error('\n❌ حدث خطأ:', error.message);
    
    if (error.code === 'auth/email-already-exists') {
      console.log('\n✅ المستخدم موجود بالفعل! يمكنك تسجيل الدخول بـ:');
      console.log(`   البريد الإلكتروني: ${email}`);
      console.log(`   كلمة المرور: ${password}\n`);
    }
  } finally {
    process.exit(0);
  }
}

createSalesHead();


