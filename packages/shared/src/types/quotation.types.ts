/**
 * أنواع عروض الأسعار - Najd Company
 */

// حالات عرض السعر
export enum QuotationStatus {
  DRAFT = 'quotation_draft',                     // مسودة
  PENDING_APPROVAL = 'quotation_pending_approval', // في انتظار الموافقة الداخلية
  APPROVED = 'quotation_approved',                // تمت الموافقة (جاهز للإرسال)
  SENT_TO_CLIENT = 'quotation_sent',              // تم إرساله للعميل
  CLIENT_REVIEWING = 'quotation_client_reviewing', // العميل يراجع
  CLIENT_ACCEPTED = 'quotation_accepted',         // العميل وافق
  CLIENT_REJECTED = 'quotation_rejected',         // العميل رفض
  NEGOTIATING = 'quotation_negotiating',          // قيد التفاوض
  CONVERTED_TO_ORDER = 'quotation_converted',     // تم تحويله لطلب
  EXPIRED = 'quotation_expired',                  // منتهي الصلاحية
  CANCELLED = 'quotation_cancelled',              // ملغي
}

// نوع التسعير
export enum PricingType {
  FIXED = 'fixed',          // سعر ثابت
  PER_UNIT = 'per_unit',    // سعر للوحدة
  RANGE = 'range',          // نطاق سعري (حسب الكمية)
}

// بند في عرض السعر
export interface QuotationItem {
  id: string;
  description: string;        // وصف المنتج/الخدمة
  quantity: number;           // الكمية
  unitPrice: number;          // سعر الوحدة
  totalPrice: number;         // السعر الإجمالي
  specifications?: string;    // مواصفات إضافية
  notes?: string;             // ملاحظات
}

// شروط الدفع
export interface PaymentTerms {
  method: string;             // طريقة الدفع (نقدي، آجل، تقسيط)
  downPaymentPercentage?: number; // نسبة الدفعة المقدمة
  downPaymentAmount?: number;     // قيمة الدفعة المقدمة
  remainingPaymentTerms?: string; // شروط دفع المبلغ المتبقي
  dueDate?: string;           // تاريخ الاستحقاق
}

// عرض السعر
export interface Quotation {
  // معلومات أساسية
  id: string;
  quotationNumber: string;    // رقم عرض السعر التسلسلي (QT-2025-0001)
  status: QuotationStatus;
  
  // معلومات العميل
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string;
  companyName?: string;       // اسم الشركة (إن وجد)
  taxNumber?: string;         // الرقم الضريبي
  
  // معلومات الطلب المرتبط (إن وجد)
  relatedOrderId?: string;    // معرف الطلب المرتبط
  relatedOrderNumber?: string; // رقم الطلب المرتبط
  
  // بنود عرض السعر
  items: QuotationItem[];
  
  // المعلومات المالية
  subtotal: number;           // المجموع الفرعي
  taxRate: number;            // نسبة الضريبة (15% في السعودية)
  taxAmount: number;          // قيمة الضريبة
  discount?: number;          // الخصم
  discountPercentage?: number; // نسبة الخصم
  totalAmount: number;        // المبلغ الإجمالي النهائي
  
  // شروط الدفع والتسليم
  paymentTerms: PaymentTerms;
  deliveryTerms?: string;     // شروط التسليم
  deliveryDuration?: string;  // مدة التسليم (مثلاً: "7-10 أيام")
  
  // التواريخ
  issueDate: string;          // تاريخ الإصدار
  validUntil: string;         // صالح حتى
  expiryDate: string;         // تاريخ انتهاء الصلاحية
  
  // الموافقات
  preparedBy: string;         // أعده (معرف المستخدم)
  preparedByName: string;     // اسم المعد
  approvedBy?: string;        // وافق عليه (معرف المستخدم)
  approvedByName?: string;    // اسم الموافق
  approvalDate?: string;      // تاريخ الموافقة
  
  // ملاحظات وشروط
  notes?: string;             // ملاحظات عامة
  terms?: string;             // الشروط والأحكام
  internalNotes?: string;     // ملاحظات داخلية
  
  // تتبع الإرسال للعميل
  sentToClientAt?: string;    // تاريخ الإرسال للعميل
  sentBy?: string;            // أرسله (معرف المستخدم)
  clientResponseDate?: string; // تاريخ رد العميل
  clientFeedback?: string;    // ملاحظات العميل
  
  // التحويل لطلب
  convertedToOrderAt?: string; // تاريخ التحويل لطلب
  convertedToOrderId?: string; // معرف الطلب المحول
  
  // الحالة والتواريخ
  createdAt: string;
  updatedAt: string;
  
  // معلومات إضافية
  tags?: string[];
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
  }>;
}

// ملخص عرض السعر (للقوائم)
export interface QuotationSummary {
  id: string;
  quotationNumber: string;
  customerName: string;
  status: QuotationStatus;
  totalAmount: number;
  issueDate: string;
  validUntil: string;
  preparedByName: string;
}

// دالة لحساب المجموع الإجمالي
export function calculateQuotationTotal(items: QuotationItem[], taxRate: number, discount?: number): {
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
} {
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const afterDiscount = discount ? subtotal - discount : subtotal;
  const taxAmount = afterDiscount * (taxRate / 100);
  const totalAmount = afterDiscount + taxAmount;
  
  return {
    subtotal,
    taxAmount,
    totalAmount,
  };
}

// دالة للتحقق من انتهاء صلاحية عرض السعر
export function isQuotationExpired(quotation: Quotation): boolean {
  const now = new Date();
  const expiryDate = new Date(quotation.expiryDate);
  return now > expiryDate;
}

// دالة للحصول على الإجراء التالي المتاح
export function getNextQuotationActions(status: QuotationStatus): string[] {
  switch (status) {
    case QuotationStatus.DRAFT:
      return ['إرسال للموافقة', 'حفظ', 'إلغاء'];
    
    case QuotationStatus.PENDING_APPROVAL:
      return ['الموافقة', 'الرفض', 'إعادة للتعديل'];
    
    case QuotationStatus.APPROVED:
      return ['إرسال للعميل', 'تعديل'];
    
    case QuotationStatus.SENT_TO_CLIENT:
      return ['تسجيل رد العميل', 'إعادة الإرسال', 'إلغاء'];
    
    case QuotationStatus.CLIENT_REVIEWING:
      return ['تسجيل القبول', 'تسجيل الرفض', 'بدء التفاوض'];
    
    case QuotationStatus.CLIENT_ACCEPTED:
      return ['تحويل لطلب', 'عرض التفاصيل'];
    
    case QuotationStatus.NEGOTIATING:
      return ['تحديث السعر', 'إرسال العرض المعدل', 'إلغاء'];
    
    default:
      return ['عرض التفاصيل'];
  }
}


