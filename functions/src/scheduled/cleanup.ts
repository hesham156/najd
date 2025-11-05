/**
 * وظائف مجدولة - Scheduled Functions
 * تنظيف البيانات القديمة
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

/**
 * تنظيف الإشعارات القديمة (أكثر من 30 يوم والمقروءة)
 * يتم تشغيلها يومياً في الساعة 2 صباحاً
 */
export const cleanupOldNotifications = functions.pubsub
  .schedule('0 2 * * *')
  .timeZone('Asia/Riyadh')
  .onRun(async (context) => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const snapshot = await db.collection('notifications')
        .where('isRead', '==', true)
        .where('createdAt', '<', thirtyDaysAgo)
        .get();

      if (snapshot.empty) {
        console.log('No old notifications to clean up');
        return null;
      }

      const batch = db.batch();
      let count = 0;

      snapshot.forEach(doc => {
        batch.delete(doc.ref);
        count++;
      });

      await batch.commit();
      console.log(`Cleaned up ${count} old notifications`);

      return null;
    } catch (error) {
      console.error('Error cleaning up notifications:', error);
      throw error;
    }
  });

