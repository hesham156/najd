/**
 * مُحفِّز العدادات - Counter Triggers
 * لتوليد أرقام الطلبات التسلسلية
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

/**
 * توليد رقم طلب جديد
 */
export const generateOrderNumber = functions.https.onCall(async (data, context) => {
  // التحقق من الصلاحيات
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'يجب تسجيل الدخول');
  }

  try {
    const counterRef = db.collection('counters').doc('orders');
    
    // استخدام Transaction لضمان التسلسل الصحيح
    const orderNumber = await db.runTransaction(async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      
      let currentCount = 0;
      
      if (!counterDoc.exists) {
        // إنشاء العداد للمرة الأولى
        transaction.set(counterRef, {
          count: 1,
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        });
        currentCount = 1;
      } else {
        // زيادة العداد
        const counterData = counterDoc.data();
        currentCount = (counterData?.count || 0) + 1;
        
        transaction.update(counterRef, {
          count: currentCount,
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      // توليد رقم الطلب بالصيغة: NAJD-YYYY-XXXX
      const year = new Date().getFullYear();
      const paddedNumber = currentCount.toString().padStart(4, '0');
      
      return `NAJD-${year}-${paddedNumber}`;
    });

    return { orderNumber };
  } catch (error) {
    console.error('Error generating order number:', error);
    throw new functions.https.HttpsError('internal', 'فشل توليد رقم الطلب');
  }
});

