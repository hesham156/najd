/**
 * مُحفِّزات الطلبات - Order Triggers
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

/**
 * عند إنشاء طلب جديد
 */
export const onOrderCreated = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snap, context) => {
    const order = snap.data();
    const orderId = context.params.orderId;

    try {
      // 1. إنشاء Timeline Entry
      const timelineEntry = {
        id: admin.firestore.FieldValue.serverTimestamp().toString(),
        status: order.status,
        userId: order.createdBy,
        userName: order.createdByName,
        userRole: 'sales',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        action: 'تم إنشاء الطلب',
      };

      await snap.ref.update({
        timeline: admin.firestore.FieldValue.arrayUnion(timelineEntry),
      });

      // 2. إرسال إشعار للـ CEO للمراجعة
      if (order.status === 'pending_ceo_review') {
        await sendNotificationToCEO(orderId, order);
      }

      // 3. إرسال إشعار لمدير المبيعات
      await sendNotificationToSalesHead(orderId, order);

      console.log(`Order ${orderId} created successfully with notifications sent`);
    } catch (error) {
      console.error('Error in onOrderCreated:', error);
      throw error;
    }
  });

/**
 * عند تحديث حالة الطلب
 */
export const onOrderStatusChanged = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context): Promise<any> => {
    const before = change.before.data();
    const after = change.after.data();
    const orderId = context.params.orderId;

    // التحقق من تغيير الحالة
    if (before.status === after.status) {
      return null;
    }

    try {
      const newStatus = after.status;
      
      // 1. إضافة Timeline Entry
      const timelineEntry = {
        id: Date.now().toString(),
        status: newStatus,
        userId: 'system',
        userName: 'النظام',
        userRole: 'system',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        action: `تغيرت الحالة إلى: ${getStatusLabel(newStatus)}`,
      };

      await change.after.ref.update({
        timeline: admin.firestore.FieldValue.arrayUnion(timelineEntry),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // 2. إرسال الإشعارات حسب الحالة الجديدة
      await handleStatusChangeNotifications(orderId, after, newStatus);

      console.log(`Order ${orderId} status changed from ${before.status} to ${newStatus}`);
    } catch (error) {
      console.error('Error in onOrderStatusChanged:', error);
      throw error;
    }
  });

/**
 * إرسال إشعار للمدير التنفيذي
 */
async function sendNotificationToCEO(orderId: string, order: any) {
  const ceoUsers = await db.collection('users')
    .where('role', '==', 'ceo')
    .where('isActive', '==', true)
    .get();

  const batch = db.batch();

  ceoUsers.forEach(doc => {
    const notificationRef = db.collection('notifications').doc();
    batch.set(notificationRef, {
      id: notificationRef.id,
      type: 'order_created',
      title: 'طلب جديد يحتاج مراجعة',
      message: `طلب رقم ${order.orderNumber} من العميل ${order.customerName} يحتاج إلى مراجعتك`,
      recipientId: doc.id,
      recipientRole: 'ceo',
      orderId: orderId,
      orderNumber: order.orderNumber,
      isRead: false,
      isActionRequired: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      actionUrl: `/orders/${orderId}`,
    });
  });

  await batch.commit();
}

/**
 * إرسال إشعار لمدير المبيعات
 */
async function sendNotificationToSalesHead(orderId: string, order: any) {
  const salesHeads = await db.collection('users')
    .where('role', '==', 'sales_head')
    .where('isActive', '==', true)
    .get();

  const batch = db.batch();

  salesHeads.forEach(doc => {
    const notificationRef = db.collection('notifications').doc();
    batch.set(notificationRef, {
      id: notificationRef.id,
      type: 'order_created',
      title: 'طلب جديد تم إنشاؤه',
      message: `تم إنشاء طلب رقم ${order.orderNumber} من العميل ${order.customerName}`,
      recipientId: doc.id,
      recipientRole: 'sales_head',
      orderId: orderId,
      orderNumber: order.orderNumber,
      isRead: false,
      isActionRequired: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      actionUrl: `/orders/${orderId}`,
    });
  });

  await batch.commit();
}

/**
 * معالجة الإشعارات حسب تغيير الحالة
 */
async function handleStatusChangeNotifications(orderId: string, order: any, newStatus: string) {
  const targetRole = getTargetRoleForStatus(newStatus);
  
  if (!targetRole) {
    return;
  }

  const users = await db.collection('users')
    .where('role', '==', targetRole)
    .where('isActive', '==', true)
    .get();

  const batch = db.batch();

  users.forEach(doc => {
    const notificationRef = db.collection('notifications').doc();
    batch.set(notificationRef, {
      id: notificationRef.id,
      type: 'order_status_changed',
      title: getNotificationTitle(newStatus),
      message: `الطلب رقم ${order.orderNumber} - ${order.customerName}`,
      recipientId: doc.id,
      recipientRole: targetRole,
      orderId: orderId,
      orderNumber: order.orderNumber,
      isRead: false,
      isActionRequired: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      actionUrl: `/orders/${orderId}`,
    });
  });

  await batch.commit();
}

/**
 * تحديد الدور المستهدف حسب الحالة
 */
function getTargetRoleForStatus(status: string): string | null {
  const mapping: Record<string, string> = {
    'pending_ceo_review': 'ceo',
    'pending_design': 'design_head',
    'pending_materials': 'dispatch_head',
    'pending_printing': 'printing_head',
    'pending_payment': 'accounting_head',
    'ready_for_dispatch': 'dispatch_head',
  };

  return mapping[status] || null;
}

/**
 * الحصول على عنوان الإشعار
 */
function getNotificationTitle(status: string): string {
  const titles: Record<string, string> = {
    'pending_design': 'طلب جديد يحتاج تصميم',
    'pending_materials': 'طلب يحتاج تجهيز مواد',
    'pending_printing': 'طلب جاهز للطباعة',
    'pending_payment': 'طلب في انتظار تأكيد الدفع',
    'ready_for_dispatch': 'طلب جاهز للإرسال',
  };

  return titles[status] || 'تحديث على الطلب';
}

/**
 * الحصول على تسمية الحالة
 */
function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    'draft': 'مسودة',
    'pending_ceo_review': 'في انتظار مراجعة المدير',
    'rejected_by_ceo': 'مرفوض من المدير',
    'returned_to_sales': 'معاد للمبيعات',
    'pending_design': 'في انتظار التصميم',
    'in_design': 'جاري التصميم',
    'design_completed': 'التصميم مكتمل',
    'pending_materials': 'في انتظار المواد',
    'materials_ready': 'المواد جاهزة',
    'pending_printing': 'في انتظار الطباعة',
    'in_printing': 'جاري الطباعة',
    'printing_completed': 'الطباعة مكتملة',
    'pending_payment': 'في انتظار الدفع',
    'payment_confirmed': 'تم تأكيد الدفع',
    'ready_for_dispatch': 'جاهز للإرسال',
    'delivered': 'تم التسليم',
  };

  return labels[status] || status;
}

