/**
 * Firebase Cloud Functions - Najd Company
 * وظائف الأتمتة والإشعارات
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// تهيئة Firebase Admin
admin.initializeApp();

// استيراد الوظائف
export { onOrderCreated, onOrderStatusChanged } from './triggers/orderTriggers';
export { sendNotificationToUser, sendNotificationToRole } from './triggers/notificationTriggers';
export { generateOrderNumber } from './triggers/counterTriggers';
export { cleanupOldNotifications } from './scheduled/cleanup';

