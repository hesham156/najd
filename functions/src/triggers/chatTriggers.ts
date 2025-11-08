/**
 * Cloud Functions لنظام الشات
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * إرسال إشعار عند إرسال رسالة جديدة
 */
export const onNewMessage = functions.firestore
  .document('chats/{chatId}/messages/{messageId}')
  .onCreate(async (snapshot, context) => {
    try {
      const message = snapshot.data();
      const { chatId } = context.params;

      // جلب بيانات المحادثة
      const chatDoc = await admin
        .firestore()
        .collection('chats')
        .doc(chatId)
        .get();

      if (!chatDoc.exists) {
        console.error('Chat not found');
        return;
      }

      const chat = chatDoc.data();
      if (!chat) return;

      // الحصول على المستقبلين (جميع المشاركين ما عدا المرسل)
      const recipientIds = chat.participants.filter(
        (id: string) => id !== message.senderId
      );

      // إنشاء إشعارات للمستقبلين
      const batch = admin.firestore().batch();

      for (const recipientId of recipientIds) {
        // جلب FCM token للمستقبل
        const userDoc = await admin
          .firestore()
          .collection('users')
          .doc(recipientId)
          .get();

        if (!userDoc.exists) continue;
        const userData = userDoc.data();
        if (!userData) continue;

        // إنشاء إشعار في Firestore
        const notificationRef = admin
          .firestore()
          .collection('notifications')
          .doc();

        batch.set(notificationRef, {
          type: 'new_message',
          title: `رسالة جديدة من ${message.senderName}`,
          message: message.text || '[رسالة]',
          recipientId,
          relatedId: chatId,
          relatedType: 'chat',
          isRead: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          metadata: {
            chatId,
            messageId: snapshot.id,
            senderId: message.senderId,
            senderName: message.senderName,
          },
        });

        // إرسال push notification إذا كان FCM token متوفر
        if (userData.fcmToken) {
          try {
            await admin.messaging().send({
              token: userData.fcmToken,
              notification: {
                title: `رسالة جديدة من ${message.senderName}`,
                body: message.text || '[رسالة]',
              },
              data: {
                type: 'new_message',
                chatId,
                messageId: snapshot.id,
                senderId: message.senderId,
              },
              android: {
                priority: 'high',
                notification: {
                  channelId: 'chat_messages',
                  sound: 'default',
                  priority: 'high',
                },
              },
              apns: {
                payload: {
                  aps: {
                    sound: 'default',
                    badge: 1,
                  },
                },
              },
            });
          } catch (error) {
            console.error('Error sending push notification:', error);
          }
        }
      }

      // تحديث عدد الرسائل غير المقروءة
      const unreadCountUpdate: any = {};
      for (const recipientId of recipientIds) {
        unreadCountUpdate[`unreadCount.${recipientId}`] =
          admin.firestore.FieldValue.increment(1);
      }

      batch.update(admin.firestore().collection('chats').doc(chatId), {
        ...unreadCountUpdate,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      await batch.commit();

      console.log(`Notifications sent for message ${snapshot.id} in chat ${chatId}`);
    } catch (error) {
      console.error('Error in onNewMessage trigger:', error);
    }
  });

/**
 * تحديث حالة القراءة للرسائل
 */
export const onMessageRead = functions.firestore
  .document('chats/{chatId}/messages/{messageId}')
  .onUpdate(async (change, context) => {
    try {
      const before = change.before.data();
      const after = change.after.data();

      // التحقق من أن حالة القراءة تغيرت
      if (
        before.readBy &&
        after.readBy &&
        after.readBy.length > before.readBy.length
      ) {
        const { chatId } = context.params;

        // تحديث حالة الرسالة
        if (after.status !== 'read') {
          await change.after.ref.update({
            status: 'read',
          });
        }

        console.log(`Message ${context.params.messageId} marked as read in chat ${chatId}`);
      }
    } catch (error) {
      console.error('Error in onMessageRead trigger:', error);
    }
  });

/**
 * تنظيف المحادثات القديمة (اختياري - يمكن تشغيله كل أسبوع)
 */
export const cleanupOldChats = functions.pubsub
  .schedule('every sunday 00:00')
  .timeZone('Asia/Riyadh')
  .onRun(async (context) => {
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const oldChatsSnapshot = await admin
        .firestore()
        .collection('chats')
        .where('updatedAt', '<', admin.firestore.Timestamp.fromDate(sixMonthsAgo))
        .get();

      const batch = admin.firestore().batch();
      let count = 0;

      for (const doc of oldChatsSnapshot.docs) {
        // حذف جميع الرسائل في المحادثة
        const messagesSnapshot = await doc.ref.collection('messages').get();
        for (const messageDoc of messagesSnapshot.docs) {
          batch.delete(messageDoc.ref);
          count++;
        }

        // حذف المحادثة نفسها
        batch.delete(doc.ref);
        count++;

        // تنفيذ الدفعة كل 500 عملية (حد Firestore)
        if (count >= 450) {
          await batch.commit();
          count = 0;
        }
      }

      // تنفيذ الدفعة المتبقية
      if (count > 0) {
        await batch.commit();
      }

      console.log(`Cleaned up ${oldChatsSnapshot.size} old chats`);
    } catch (error) {
      console.error('Error in cleanupOldChats:', error);
    }
  });

/**
 * تحديث عدد الرسائل غير المقروءة عند حذف رسالة
 */
export const onMessageDeleted = functions.firestore
  .document('chats/{chatId}/messages/{messageId}')
  .onDelete(async (snapshot, context) => {
    try {
      const message = snapshot.data();
      const { chatId } = context.params;

      // جلب بيانات المحادثة
      const chatDoc = await admin
        .firestore()
        .collection('chats')
        .doc(chatId)
        .get();

      if (!chatDoc.exists) return;

      const chat = chatDoc.data();
      if (!chat) return;

      // تحديث عدد الرسائل غير المقروءة إذا كانت الرسالة غير مقروءة
      const unreadCountUpdate: any = {};
      
      for (const participantId of chat.participants) {
        if (
          participantId !== message.senderId &&
          !message.readBy.includes(participantId)
        ) {
          unreadCountUpdate[`unreadCount.${participantId}`] =
            admin.firestore.FieldValue.increment(-1);
        }
      }

      if (Object.keys(unreadCountUpdate).length > 0) {
        await admin
          .firestore()
          .collection('chats')
          .doc(chatId)
          .update(unreadCountUpdate);
      }

      console.log(`Updated unread count after deleting message ${snapshot.id}`);
    } catch (error) {
      console.error('Error in onMessageDeleted trigger:', error);
    }
  });


