/**
 * التسميات العربية لحالات الطلبات
 */

import { OrderStatus, PrintType, PaymentStatus, OrderPriority, MaterialType } from '../types';

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

// دالة للحصول على لون الحالة
export function getStatusColor(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.DRAFT:
    case OrderStatus.RETURNED_TO_SALES:
      return '#9E9E9E'; // رمادي
    
    case OrderStatus.PENDING_CEO_REVIEW:
    case OrderStatus.PENDING_DESIGN:
    case OrderStatus.PENDING_MATERIALS:
    case OrderStatus.PENDING_PRINTING:
    case OrderStatus.PENDING_PAYMENT:
      return '#FF9800'; // برتقالي
    
    case OrderStatus.IN_DESIGN:
    case OrderStatus.MATERIALS_IN_PROGRESS:
    case OrderStatus.IN_PRINTING:
    case OrderStatus.IN_DISPATCH:
      return '#2196F3'; // أزرق
    
    case OrderStatus.DESIGN_COMPLETED:
    case OrderStatus.MATERIALS_READY:
    case OrderStatus.PRINTING_COMPLETED:
    case OrderStatus.PAYMENT_CONFIRMED:
    case OrderStatus.READY_FOR_DISPATCH:
      return '#4CAF50'; // أخضر
    
    case OrderStatus.DELIVERED:
      return '#00C853'; // أخضر داكن
    
    case OrderStatus.REJECTED_BY_CEO:
    case OrderStatus.CANCELLED:
      return '#F44336'; // أحمر
    
    case OrderStatus.ON_HOLD:
      return '#FFC107'; // أصفر
    
    default:
      return '#9E9E9E';
  }
}

// دالة للحصول على لون الأولوية
export function getPriorityColor(priority: OrderPriority): string {
  switch (priority) {
    case OrderPriority.LOW:
      return '#4CAF50'; // أخضر
    case OrderPriority.MEDIUM:
      return '#2196F3'; // أزرق
    case OrderPriority.HIGH:
      return '#FF9800'; // برتقالي
    case OrderPriority.URGENT:
      return '#F44336'; // أحمر
    default:
      return '#9E9E9E';
  }
}

