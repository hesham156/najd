/**
 * إشعارات فورية للـ CEO عن جميع الأحداث المهمة
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

/**
 * إرسال إشعار لجميع مستخدمي CEO
 */
async function notifyCEO(notification: {
  type: string;
  title: string;
  message: string;
  orderId?: string;
  actionUrl?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}) {
  try {
    // الحصول على جميع مستخدمي CEO النشطين
    const ceoSnapshot = await db
      .collection('users')
      .where('role', '==', 'ceo')
      .where('isActive', '==', true)
      .get();

    const batch = db.batch();

    ceoSnapshot.forEach((ceoDoc) => {
      const notificationRef = db.collection('notifications').doc();
      batch.set(notificationRef, {
        id: notificationRef.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        recipientId: ceoDoc.id,
        recipientRole: 'ceo',
        orderId: notification.orderId || null,
        isRead: false,
        isActionRequired: notification.priority === 'urgent' || notification.priority === 'high',
        priority: notification.priority || 'medium',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        actionUrl: notification.actionUrl || '/',
      });
    });

    await batch.commit();
    console.log(`✅ CEO notification sent: ${notification.title}`);
  } catch (error) {
    console.error('❌ Error sending CEO notification:', error);
  }
}

/**
 * عند إنشاء طلب جديد
 */
export const onOrderCreatedNotifyCEO = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snapshot, context) => {
    const order = snapshot.data();
    const orderId = context.params.orderId;

    await notifyCEO({
      type: 'order_created',
      title: '📋 طلب جديد تم إنشاؤه',
      message: `طلب جديد رقم ${order.orderNumber} من ${order.createdByName} - العميل: ${order.customerName}`,
      orderId,
      actionUrl: `/orders/${orderId}`,
      priority: order.priority === 'urgent' ? 'urgent' : 'medium',
    });
  });

/**
 * عند تحديث حالة طلب
 */
export const onOrderStatusChangeNotifyCEO = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const orderId = context.params.orderId;

    // فقط عند تغيير الحالة
    if (before.status === after.status) return;

    // إشعارات للأحداث المهمة
    const importantStatuses = [
      'printing_completed',
      'design_completed',
      'delivered',
      'cancelled',
      'payment_confirmed',
    ];

    if (importantStatuses.includes(after.status)) {
      const statusLabels: Record<string, string> = {
        printing_completed: 'اكتملت الطباعة',
        design_completed: 'اكتمل التصميم',
        delivered: 'تم التسليم',
        cancelled: 'تم الإلغاء',
        payment_confirmed: 'تم تأكيد الدفع',
      };

      await notifyCEO({
        type: 'order_status_changed',
        title: `🔔 ${statusLabels[after.status]}`,
        message: `الطلب ${after.orderNumber} - ${after.customerName}: ${statusLabels[after.status]}`,
        orderId,
        actionUrl: `/orders/${orderId}`,
        priority: 'medium',
      });
    }
  });

/**
 * عند إنشاء طلب خامات
 */
export const onMaterialRequestNotifyCEO = functions.firestore
  .document('material_requests/{requestId}')
  .onCreate(async (snapshot, context) => {
    const request = snapshot.data();
    const requestId = context.params.requestId;

    const totalCost = request.items.reduce(
      (sum: number, item: any) => sum + (item.estimatedCost || 0),
      0
    );

    await notifyCEO({
      type: 'material_request_created',
      title: '📦 طلب خامات جديد',
      message: `طلب ${request.requestNumber} من ${request.requestedByName} (${getDepartmentLabel(request.department)}) - ${totalCost} ر.س`,
      actionUrl: '/ceo-dashboard/material-requests',
      priority: request.priority,
    });
  });

/**
 * عند نفاد مادة من المخزون
 */
export const onInventoryOutOfStockNotifyCEO = functions.firestore
  .document('inventory/{itemId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    // إشعار عند تغيير الحالة إلى نفذ
    if (before.status !== 'out_of_stock' && after.status === 'out_of_stock') {
      await notifyCEO({
        type: 'inventory_out_of_stock',
        title: '❌ مادة نفذت من المخزون!',
        message: `${after.name} نفذت من مخزون ${getDepartmentLabel(after.department)}`,
        actionUrl: '/ceo-dashboard/inventory',
        priority: 'high',
      });
    }

    // إشعار عند نقص الكمية (low_stock)
    if (before.status !== 'low_stock' && after.status === 'low_stock') {
      await notifyCEO({
        type: 'inventory_low_stock',
        title: '⚠️ مادة قاربت على النفاد',
        message: `${after.name} قليلة في مخزون ${getDepartmentLabel(after.department)} (${after.quantity} ${after.unit})`,
        actionUrl: '/ceo-dashboard/inventory',
        priority: 'medium',
      });
    }
  });

/**
 * عند إنشاء عرض سعر
 */
export const onQuotationCreatedNotifyCEO = functions.firestore
  .document('quotations/{quotationId}')
  .onCreate(async (snapshot, context) => {
    const quotation = snapshot.data();
    const quotationId = context.params.quotationId;

    if (quotation.status === 'quotation_pending_approval') {
      await notifyCEO({
        type: 'quotation_created',
        title: '💰 عرض سعر جديد يحتاج موافقة',
        message: `عرض سعر ${quotation.quotationNumber} بقيمة ${quotation.totalAmount} ر.س`,
        actionUrl: `/accounting/quotations/${quotationId}`,
        priority: 'high',
      });
    }
  });

/**
 * عند إنشاء فاتورة
 */
export const onInvoiceCreatedNotifyCEO = functions.firestore
  .document('invoices/{invoiceId}')
  .onCreate(async (snapshot, context) => {
    const invoice = snapshot.data();
    const invoiceId = context.params.invoiceId;

    await notifyCEO({
      type: 'invoice_created',
      title: '🧾 فاتورة جديدة صادرة',
      message: `فاتورة ${invoice.invoiceNumber} بقيمة ${invoice.totalAmount} ر.س`,
      actionUrl: `/accounting/invoices/${invoiceId}`,
      priority: 'low',
    });
  });

/**
 * عند تأكيد دفعة
 */
export const onPaymentConfirmedNotifyCEO = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const orderId = context.params.orderId;

    // عند تأكيد الدفع
    if (before.paymentStatus !== 'confirmed' && after.paymentStatus === 'confirmed') {
      await notifyCEO({
        type: 'payment_confirmed',
        title: '💰 تم تأكيد دفعة',
        message: `تم تأكيد دفع ${after.paidAmount} ر.س للطلب ${after.orderNumber}`,
        orderId,
        actionUrl: `/orders/${orderId}`,
        priority: 'low',
      });
    }
  });

/**
 * عند إكمال مهمة
 */
export const onTaskCompletedNotifyCEO = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const orderId = context.params.orderId;

    // تحقق من إكمال مهمة تصميم
    if (
      before.designAssignment?.completedAt === null &&
      after.designAssignment?.completedAt !== null
    ) {
      await notifyCEO({
        type: 'task_completed',
        title: '✅ مهمة تصميم مكتملة',
        message: `أكمل ${after.designAssignment.userName} تصميم الطلب ${after.orderNumber}`,
        orderId,
        actionUrl: `/orders/${orderId}`,
        priority: 'low',
      });
    }

    // تحقق من إكمال مهمة طباعة
    if (
      before.printingAssignment?.completedAt === null &&
      after.printingAssignment?.completedAt !== null
    ) {
      await notifyCEO({
        type: 'task_completed',
        title: '✅ مهمة طباعة مكتملة',
        message: `أكمل ${after.printingAssignment.userName} طباعة الطلب ${after.orderNumber}`,
        orderId,
        actionUrl: `/orders/${orderId}`,
        priority: 'low',
      });
    }
  });

// Helper function
function getDepartmentLabel(department: string): string {
  const labels: Record<string, string> = {
    printing: 'الطباعة',
    design: 'التصميم',
    dispatch: 'الإرسال',
    accounting: 'الحسابات',
    sales: 'المبيعات',
    management: 'الإدارة',
  };
  return labels[department] || department;
}


