/**
 * Shared Types - نسخة محلية بدون dependency
 */

// User Types
export enum UserRole {
  CEO = 'ceo',
  SALES = 'sales',
  SALES_HEAD = 'sales_head',
  DESIGN = 'design',
  DESIGN_HEAD = 'design_head',
  PRINTING = 'printing',
  PRINTING_HEAD = 'printing_head',
  ACCOUNTING = 'accounting',
  ACCOUNTING_HEAD = 'accounting_head',
  DISPATCH = 'dispatch',
  DISPATCH_HEAD = 'dispatch_head',
}

export enum Department {
  MANAGEMENT = 'management',
  SALES = 'sales',
  DESIGN = 'design',
  PRINTING = 'printing',
  ACCOUNTING = 'accounting',
  DISPATCH = 'dispatch',
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  role: UserRole;
  department: Department;
  isHead: boolean;
  createdAt: any;
  updatedAt: any;
  photoURL?: string;
  isActive: boolean;
}

// Order Types
export enum OrderStatus {
  DRAFT = 'draft',
  PENDING_CEO_REVIEW = 'pending_ceo_review',
  REJECTED_BY_CEO = 'rejected_by_ceo',
  RETURNED_TO_SALES = 'returned_to_sales',
  PENDING_DESIGN = 'pending_design',
  IN_DESIGN = 'in_design',
  DESIGN_REVIEW = 'design_review',
  DESIGN_COMPLETED = 'design_completed',
  PENDING_MATERIALS = 'pending_materials',
  MATERIALS_IN_PROGRESS = 'materials_in_progress',
  MATERIALS_READY = 'materials_ready',
  PENDING_PRINTING = 'pending_printing',
  IN_PRINTING = 'in_printing',
  PRINTING_COMPLETED = 'printing_completed',
  PENDING_PAYMENT = 'pending_payment',
  PAYMENT_CONFIRMED = 'payment_confirmed',
  READY_FOR_DISPATCH = 'ready_for_dispatch',
  IN_DISPATCH = 'in_dispatch',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  ON_HOLD = 'on_hold',
}

export enum PrintType {
  DIGITAL = 'digital',
  OFFSET = 'offset',
  INDOOR = 'indoor',
}

export enum MaterialType {
  PLATES = 'plates',
  MOLDS = 'molds',
  PAPER = 'paper',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PARTIAL = 'partial',
  COMPLETED = 'completed',
}

export enum OrderPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface Material {
  type: MaterialType;
  description: string;
  quantity?: number;
  notes?: string;
}

export interface AttachedFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface OrderComment {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  comment: string;
  createdAt: string;
  isInternal: boolean;
}

export interface OrderTimeline {
  id: string;
  status: OrderStatus;
  userId: string;
  userName: string;
  userRole: string;
  timestamp: any;
  notes?: string;
  action: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  priority: OrderPriority;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string;
  printType: PrintType;
  quantity: number;
  needsDesign: boolean;
  designDescription?: string;
  materials: Material[];
  files: AttachedFile[];
  notes: string;
  internalNotes?: string;
  estimatedCost?: number;
  finalCost?: number;
  paidAmount?: number;
  paymentStatus: PaymentStatus;
  requestedDeliveryDate?: any;
  estimatedDeliveryDate?: any;
  actualDeliveryDate?: any;
  createdBy: string;
  createdByName: string;
  assignedToDesign?: string;
  assignedToPrinting?: string;
  assignedToDispatch?: string;
  comments: OrderComment[];
  timeline: OrderTimeline[];
  createdAt: any;
  updatedAt: any;
  tags?: string[];
  isUrgent: boolean;
}

// Notification Types
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
  recipientId: string;
  recipientRole: string;
  orderId?: string;
  orderNumber?: string;
  isRead: boolean;
  isActionRequired: boolean;
  createdAt: any;
  readAt?: any;
  metadata?: Record<string, any>;
  actionUrl?: string;
}

// Constants
export const COLLECTIONS = {
  USERS: 'users',
  ORDERS: 'orders',
  NOTIFICATIONS: 'notifications',
  ORDER_COUNTER: 'counters',
  ACTIVITY_LOGS: 'activity_logs',
} as const;

export const STORAGE_PATHS = {
  ORDER_FILES: 'orders',
  USER_PHOTOS: 'users/photos',
  DESIGN_FILES: 'designs',
  DOCUMENTS: 'documents',
} as const;

// Labels
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.DRAFT]: 'مسودة',
  [OrderStatus.PENDING_CEO_REVIEW]: 'في انتظار مراجعة المدير',
  [OrderStatus.REJECTED_BY_CEO]: 'مرفوض من المدير',
  [OrderStatus.RETURNED_TO_SALES]: 'معاد للمبيعات',
  [OrderStatus.PENDING_DESIGN]: 'في انتظار التصميم',
  [OrderStatus.IN_DESIGN]: 'جاري التصميم',
  [OrderStatus.DESIGN_REVIEW]: 'مراجعة التصميم',
  [OrderStatus.DESIGN_COMPLETED]: 'التصميم مكتمل',
  [OrderStatus.PENDING_MATERIALS]: 'في انتظار المواد',
  [OrderStatus.MATERIALS_IN_PROGRESS]: 'جاري تجهيز المواد',
  [OrderStatus.MATERIALS_READY]: 'المواد جاهزة',
  [OrderStatus.PENDING_PRINTING]: 'في انتظار الطباعة',
  [OrderStatus.IN_PRINTING]: 'جاري الطباعة',
  [OrderStatus.PRINTING_COMPLETED]: 'الطباعة مكتملة',
  [OrderStatus.PENDING_PAYMENT]: 'في انتظار الدفع',
  [OrderStatus.PAYMENT_CONFIRMED]: 'تم تأكيد الدفع',
  [OrderStatus.READY_FOR_DISPATCH]: 'جاهز للإرسال',
  [OrderStatus.IN_DISPATCH]: 'جاري الإرسال',
  [OrderStatus.DELIVERED]: 'تم التسليم',
  [OrderStatus.CANCELLED]: 'ملغي',
  [OrderStatus.ON_HOLD]: 'معلق',
};

export const PRINT_TYPE_LABELS: Record<PrintType, string> = {
  [PrintType.DIGITAL]: 'ديجيتال',
  [PrintType.OFFSET]: 'أوفست',
  [PrintType.INDOOR]: 'إندور',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: 'في انتظار الدفع',
  [PaymentStatus.PARTIAL]: 'دفع جزئي',
  [PaymentStatus.COMPLETED]: 'مكتمل',
};

export const PRIORITY_LABELS: Record<OrderPriority, string> = {
  [OrderPriority.LOW]: 'منخفضة',
  [OrderPriority.MEDIUM]: 'متوسطة',
  [OrderPriority.HIGH]: 'عالية',
  [OrderPriority.URGENT]: 'عاجل',
};

export const MATERIAL_TYPE_LABELS: Record<MaterialType, string> = {
  [MaterialType.PLATES]: 'بليتات',
  [MaterialType.MOLDS]: 'قوالب',
  [MaterialType.PAPER]: 'ورق',
};

export function getStatusColor(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.DRAFT:
    case OrderStatus.RETURNED_TO_SALES:
      return '#9E9E9E';
    case OrderStatus.PENDING_CEO_REVIEW:
    case OrderStatus.PENDING_DESIGN:
    case OrderStatus.PENDING_MATERIALS:
    case OrderStatus.PENDING_PRINTING:
    case OrderStatus.PENDING_PAYMENT:
      return '#FF9800';
    case OrderStatus.IN_DESIGN:
    case OrderStatus.MATERIALS_IN_PROGRESS:
    case OrderStatus.IN_PRINTING:
    case OrderStatus.IN_DISPATCH:
      return '#2196F3';
    case OrderStatus.DESIGN_COMPLETED:
    case OrderStatus.MATERIALS_READY:
    case OrderStatus.PRINTING_COMPLETED:
    case OrderStatus.PAYMENT_CONFIRMED:
    case OrderStatus.READY_FOR_DISPATCH:
      return '#4CAF50';
    case OrderStatus.DELIVERED:
      return '#00C853';
    case OrderStatus.REJECTED_BY_CEO:
    case OrderStatus.CANCELLED:
      return '#F44336';
    case OrderStatus.ON_HOLD:
      return '#FFC107';
    default:
      return '#9E9E9E';
  }
}

export function getPriorityColor(priority: OrderPriority): string {
  switch (priority) {
    case OrderPriority.LOW:
      return '#4CAF50';
    case OrderPriority.MEDIUM:
      return '#2196F3';
    case OrderPriority.HIGH:
      return '#FF9800';
    case OrderPriority.URGENT:
      return '#F44336';
    default:
      return '#9E9E9E';
  }
}

