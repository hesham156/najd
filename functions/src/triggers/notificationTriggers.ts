/**
 * مُحفِّزات الإشعارات - Notification Triggers
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

/**
 * إرسال إشعار لمستخدم محدد
 */
export const sendNotificationToUser = functions.https.onCall(async (data, context) => {
  // التحقق من الصلاحيات
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'يجب تسجيل الدخول');
  }

  const { userId, title, message, orderId, orderNumber, type = 'order_comment' } = data;

  try {
    const notificationRef = db.collection('notifications').doc();
    
    await notificationRef.set({
      id: notificationRef.id,
      type,
      title,
      message,
      recipientId: userId,
      recipientRole: '',
      orderId: orderId || null,
      orderNumber: orderNumber || null,
      isRead: false,
      isActionRequired: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      actionUrl: orderId ? `/orders/${orderId}` : null,
    });

    // إرسال Push Notification إذا كان المستخدم لديه FCM Token
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();

    if (userData?.fcmToken) {
      await admin.messaging().send({
        token: userData.fcmToken,
        notification: {
          title,
          body: message,
        },
        data: {
          orderId: orderId || '',
          orderNumber: orderNumber || '',
          type,
        },
      });
    }

    return { success: true, notificationId: notificationRef.id };
  } catch (error) {
    console.error('Error sending notification:', error);
    throw new functions.https.HttpsError('internal', 'فشل إرسال الإشعار');
  }
});

/**
 * إرسال إشعار لجميع المستخدمين بدور معين
 */
export const sendNotificationToRole = functions.https.onCall(async (data, context) => {
  // التحقق من الصلاحيات
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'يجب تسجيل الدخول');
  }

  const { role, title, message, orderId, orderNumber, type = 'order_status_changed' } = data;

  try {
    const users = await db.collection('users')
      .where('role', '==', role)
      .where('isActive', '==', true)
      .get();

    const batch = db.batch();
    const fcmTokens: string[] = [];

    users.forEach(doc => {
      const userData = doc.data();
      
      // إضافة الإشعار لقاعدة البيانات
      const notificationRef = db.collection('notifications').doc();
      batch.set(notificationRef, {
        id: notificationRef.id,
        type,
        title,
        message,
        recipientId: doc.id,
        recipientRole: role,
        orderId: orderId || null,
        orderNumber: orderNumber || null,
        isRead: false,
        isActionRequired: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        actionUrl: orderId ? `/orders/${orderId}` : null,
      });

      // جمع FCM Tokens
      if (userData.fcmToken) {
        fcmTokens.push(userData.fcmToken);
      }
    });

    await batch.commit();

    // إرسال Push Notifications
    if (fcmTokens.length > 0) {
      await admin.messaging().sendMulticast({
        tokens: fcmTokens,
        notification: {
          title,
          body: message,
        },
        data: {
          orderId: orderId || '',
          orderNumber: orderNumber || '',
          type,
        },
      });
    }

    return { success: true, sentTo: users.size };
  } catch (error) {
    console.error('Error sending notification to role:', error);
    throw new functions.https.HttpsError('internal', 'فشل إرسال الإشعارات');
  }
});

