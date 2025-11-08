/**
 * Firebase Cloud Functions - Najd Company
 * وظائف الأتمتة والإشعارات
 */

import * as admin from 'firebase-admin';

// تهيئة Firebase Admin
admin.initializeApp();

// استيراد الوظائف
export { onOrderCreated, onOrderStatusChanged } from './triggers/orderTriggers';
export { sendNotificationToUser, sendNotificationToRole } from './triggers/notificationTriggers';
export { generateOrderNumber } from './triggers/counterTriggers';
export { cleanupOldNotifications } from './scheduled/cleanup';
export { assignTask, startTask, completeTask, reassignTask } from './triggers/taskAssignmentTriggers';
export { onNewMessage, onMessageRead, cleanupOldChats, onMessageDeleted } from './triggers/chatTriggers';
export {
  onOrderCreatedNotifyCEO,
  onOrderStatusChangeNotifyCEO,
  onMaterialRequestNotifyCEO,
  onInventoryOutOfStockNotifyCEO,
  onQuotationCreatedNotifyCEO,
  onInvoiceCreatedNotifyCEO,
  onPaymentConfirmedNotifyCEO,
  onTaskCompletedNotifyCEO,
} from './triggers/ceoNotificationTriggers';

