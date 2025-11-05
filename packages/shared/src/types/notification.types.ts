/**
 * أنواع الإشعارات - Najd Company
 */

export enum NotificationType {
  ORDER_CREATED = 'order_created',
  ORDER_ASSIGNED = 'order_assigned',
  ORDER_STATUS_CHANGED = 'order_status_changed',
  ORDER_APPROVED = 'order_approved',
  ORDER_REJECTED = 'order_rejected',
  ORDER_COMMENT = 'order_comment',
  PAYMENT_RECEIVED = 'payment_received',
  DELIVERY_SCHEDULED = 'delivery_scheduled',
  URGENT_ORDER = 'urgent_order',
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  
  // المستلم
  recipientId: string;
  recipientRole: string;
  
  // البيانات المتعلقة
  orderId?: string;
  orderNumber?: string;
  
  // الحالة
  isRead: boolean;
  isActionRequired: boolean;
  
  // التوقيت
  createdAt: string;
  readAt?: string;
  
  // بيانات إضافية
  metadata?: Record<string, any>;
  actionUrl?: string;
}

