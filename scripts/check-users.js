/**
 * فحص المستخدمين في Firebase
 */

const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// تهيئة Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function checkUsers() {
  try {
    console.log('\n📋 جاري جلب المستخدمين...\n');

    const usersSnapshot = await db.collection('users').get();

    if (usersSnapshot.empty) {
      console.log('❌ لا يوجد مستخدمين في النظام!\n');
      return;
    }

    console.log(`✅ تم العثور على ${usersSnapshot.size} مستخدم(ين):\n`);
    console.log('═'.repeat(80));

    usersSnapshot.forEach((doc) => {
      const user = doc.data();
      console.log(`
📧 البريد: ${user.email}
👤 الاسم: ${user.displayName}
🎭 الدور: ${user.role}
🏢 القسم: ${user.department}
👔 رئيس القسم: ${user.isHead ? 'نعم' : 'لا'}
✅ نشط: ${user.isActive ? 'نعم' : 'لا'}
🆔 UID: ${user.uid}
      `);
      console.log('═'.repeat(80));
    });

    // التحقق من وجود مدير مبيعات
    const salesHeads = usersSnapshot.docs.filter(
      (doc) => doc.data().role === 'sales_head'
    );

    if (salesHeads.length === 0) {
      console.log('\n⚠️  لا يوجد مدير مبيعات (sales_head) في النظام!');
      console.log('📝 يجب إنشاء مدير مبيعات أولاً باستخدام:');
      console.log('   node scripts/create-sales-head.js\n');
    } else {
      console.log(`\n✅ يوجد ${salesHeads.length} مدير(ين) مبيعات في النظام\n`);
    }

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    process.exit(0);
  }
}

checkUsers();


