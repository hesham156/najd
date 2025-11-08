"use strict";
/**
 * مُحفِّزات الإشعارات - Notification Triggers
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotificationToRole = exports.sendNotificationToUser = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
/**
 * إرسال إشعار لمستخدم محدد
 */
exports.sendNotificationToUser = functions.https.onCall(async (data, context) => {
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
        if (userData === null || userData === void 0 ? void 0 : userData.fcmToken) {
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
    }
    catch (error) {
        console.error('Error sending notification:', error);
        throw new functions.https.HttpsError('internal', 'فشل إرسال الإشعار');
    }
});
/**
 * إرسال إشعار لجميع المستخدمين بدور معين
 */
exports.sendNotificationToRole = functions.https.onCall(async (data, context) => {
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
        const fcmTokens = [];
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
    }
    catch (error) {
        console.error('Error sending notification to role:', error);
        throw new functions.https.HttpsError('internal', 'فشل إرسال الإشعارات');
    }
});
//# sourceMappingURL=notificationTriggers.js.map