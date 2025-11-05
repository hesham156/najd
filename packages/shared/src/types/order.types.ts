/**
 * أنواع الطلبات - Najd Company
 */

// حالات الطلب
export enum OrderStatus {
  // مرحلة الإنشاء والمراجعة الأولية
  DRAFT = 'draft',                    // مسودة
  PENDING_CEO_REVIEW = 'pending_ceo_review',  // في انتظار مراجعة المدير
  REJECTED_BY_CEO = 'rejected_by_ceo',       // مرفوض من المدير
  RETURNED_TO_SALES = 'returned_to_sales',   // معاد للمبيعات للتعديل
  
  // مرحلة التصميم
  PENDING_DESIGN = 'pending_design',         // في انتظار التصميم
  IN_DESIGN = 'in_design',                   // جاري التصميم
  DESIGN_REVIEW = 'design_review',           // مراجعة التصميم
  DESIGN_COMPLETED = 'design_completed',     // التصميم مكتمل
  
  // مرحلة المواد (البليتات والقوالب)
  PENDING_MATERIALS = 'pending_materials',   // في انتظار المواد
  MATERIALS_IN_PROGRESS = 'materials_in_progress',  // جاري تجهيز المواد
  MATERIALS_READY = 'materials_ready',       // المواد جاهزة
  
  // مرحلة الطباعة
  PENDING_PRINTING = 'pending_printing',     // في انتظار الطباعة
  IN_PRINTING = 'in_printing',               // جاري الطباعة
  PRINTING_COMPLETED = 'printing_completed', // الطباعة مكتملة
  
  // مرحلة الحسابات
  PENDING_PAYMENT = 'pending_payment',       // في انتظار الدفع
  PAYMENT_CONFIRMED = 'payment_confirmed',   // تم تأكيد الدفع
  
  // مرحلة التسليم
  READY_FOR_DISPATCH = 'ready_for_dispatch', // جاهز للإرسال
  IN_DISPATCH = 'in_dispatch',               // جاري الإرسال
  DELIVERED = 'delivered',                   // تم التسليم
  
  // حالات خاصة
  CANCELLED = 'cancelled',                   // ملغي
  ON_HOLD = 'on_hold',                       // معلق
}

// أنواع الطباعة
export enum PrintType {
  DIGITAL = 'digital',      // ديجيتال
  OFFSET = 'offset',        // أوفست
  INDOOR = 'indoor',        // إندور (طباعة داخلية)
}

// أنواع المواد المطلوبة
export enum MaterialType {
  PLATES = 'plates',        // البليتات
  MOLDS = 'molds',          // القوالب
  PAPER = 'paper',          // الورق
}

// حالات الدفع
export enum PaymentStatus {
  PENDING = 'pending',
  PARTIAL = 'partial',
  COMPLETED = 'completed',
}

// أولوية الطلب
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
  isInternal: boolean;  // تعليق داخلي (للفريق فقط) أم للعميل
}

export interface OrderTimeline {
  id: string;
  status: OrderStatus;
  userId: string;
  userName: string;
  userRole: string;
  timestamp: string;
  notes?: string;
  action: string;  // وصف الإجراء
}

export interface Order {
  // معلومات أساسية
  id: string;
  orderNumber: string;  // رقم الطلب التسلسلي
  status: OrderStatus;
  priority: OrderPriority;
  
  // معلومات العميل
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string;
  
  // تفاصيل الطلب
  printType: PrintType;
  quantity: number;
  needsDesign: boolean;
  designDescription?: string;
  
  // المواد المطلوبة
  materials: Material[];
  
  // الملفات المرفقة
  files: AttachedFile[];
  
  // الملاحظات
  notes: string;
  internalNotes?: string;  // ملاحظات داخلية للفريق
  
  // المعلومات المالية
  estimatedCost?: number;
  finalCost?: number;
  paidAmount?: number;
  paymentStatus: PaymentStatus;
  
  // عروض الأسعار والفواتير المرتبطة
  isQuotation?: boolean;              // هل هو طلب عرض سعر
  quotationId?: string;               // معرف عرض السعر المرتبط
  quotationNumber?: string;           // رقم عرض السعر المرتبط
  quotationApprovedAt?: string;       // تاريخ موافقة العميل على عرض السعر
  invoiceId?: string;                 // معرف الفاتورة المرتبطة
  invoiceNumber?: string;             // رقم الفاتورة المرتبطة
  invoiceIssuedAt?: string;           // تاريخ إصدار الفاتورة
  
  // التواريخ المهمة
  requestedDeliveryDate?: string;
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
  
  // الإسنادات
  createdBy: string;        // معرف المستخدم الذي أنشأ الطلب
  createdByName: string;    // اسم المستخدم
  assignedToDesign?: string;    // معرف المصمم المكلف
  assignedToPrinting?: string;  // معرف عامل الطباعة المكلف
  assignedToDispatch?: string;  // معرف عامل الإرسال المكلف
  
  // التعليقات والمتابعة
  comments: OrderComment[];
  timeline: OrderTimeline[];
  
  // التواريخ
  createdAt: string;
  updatedAt: string;
  
  // معلومات إضافية
  tags?: string[];
  isUrgent: boolean;
}

export interface OrderSummary {
  id: string;
  orderNumber: string;
  customerName: string;
  status: OrderStatus;
  priority: OrderPriority;
  printType: PrintType;
  quantity: number;
  estimatedCost?: number;
  requestedDeliveryDate?: string;
  createdAt: string;
  createdByName: string;
}

// دالة لتحديد الحالة التالية بناءً على الحالة الحالية
export function getNextStatus(currentStatus: OrderStatus, needsDesign: boolean, needsMaterials: boolean): OrderStatus | null {
  switch (currentStatus) {
    case OrderStatus.DRAFT:
      return OrderStatus.PENDING_CEO_REVIEW;
    
    case OrderStatus.PENDING_CEO_REVIEW:
      // إذا تمت الموافقة
      if (needsDesign) {
        return OrderStatus.PENDING_DESIGN;
      } else if (needsMaterials) {
        return OrderStatus.PENDING_MATERIALS;
      } else {
        return OrderStatus.PENDING_PRINTING;
      }
    
    case OrderStatus.DESIGN_COMPLETED:
      if (needsMaterials) {
        return OrderStatus.PENDING_MATERIALS;
      }
      return OrderStatus.PENDING_PRINTING;
    
    case OrderStatus.MATERIALS_READY:
      return OrderStatus.PENDING_PRINTING;
    
    case OrderStatus.PRINTING_COMPLETED:
      return OrderStatus.PENDING_PAYMENT;
    
    case OrderStatus.PAYMENT_CONFIRMED:
      return OrderStatus.READY_FOR_DISPATCH;
    
    case OrderStatus.IN_DISPATCH:
      return OrderStatus.DELIVERED;
    
    default:
      return null;
  }
}

// دالة لتحديد القسم المسؤول عن الحالة الحالية
export function getDepartmentForStatus(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.DRAFT:
    case OrderStatus.RETURNED_TO_SALES:
      return 'sales';
    
    case OrderStatus.PENDING_CEO_REVIEW:
    case OrderStatus.REJECTED_BY_CEO:
      return 'management';
    
    case OrderStatus.PENDING_DESIGN:
    case OrderStatus.IN_DESIGN:
    case OrderStatus.DESIGN_REVIEW:
    case OrderStatus.DESIGN_COMPLETED:
      return 'design';
    
    case OrderStatus.PENDING_MATERIALS:
    case OrderStatus.MATERIALS_IN_PROGRESS:
    case OrderStatus.MATERIALS_READY:
      return 'dispatch';  // البليتات والقوالب تحت مسؤولية الـ Dispatch
    
    case OrderStatus.PENDING_PRINTING:
    case OrderStatus.IN_PRINTING:
    case OrderStatus.PRINTING_COMPLETED:
      return 'printing';
    
    case OrderStatus.PENDING_PAYMENT:
    case OrderStatus.PAYMENT_CONFIRMED:
      return 'accounting';
    
    case OrderStatus.READY_FOR_DISPATCH:
    case OrderStatus.IN_DISPATCH:
    case OrderStatus.DELIVERED:
      return 'dispatch';
    
    default:
      return 'unknown';
  }
}

