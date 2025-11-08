/**
 * أنواع الفواتير - Najd Company
 */

// حالات الفاتورة
export enum InvoiceStatus {
  DRAFT = 'invoice_draft',                    // مسودة
  PENDING_APPROVAL = 'invoice_pending_approval', // في انتظار الموافقة
  APPROVED = 'invoice_approved',              // تمت الموافقة
  SENT_TO_CLIENT = 'invoice_sent',            // تم إرسالها للعميل
  PARTIALLY_PAID = 'invoice_partially_paid',  // مدفوعة جزئياً
  FULLY_PAID = 'invoice_fully_paid',          // مدفوعة بالكامل
  OVERDUE = 'invoice_overdue',                // متأخرة
  CANCELLED = 'invoice_cancelled',            // ملغاة
  REFUNDED = 'invoice_refunded',              // مستردة
}

// نوع الفاتورة
export enum InvoiceType {
  SALES = 'sales',              // فاتورة مبيعات
  PROFORMA = 'proforma',        // فاتورة أولية
  CREDIT_NOTE = 'credit_note',  // إشعار دائن
  DEBIT_NOTE = 'debit_note',    // إشعار مدين
}

// بند في الفاتورة
export interface InvoiceItem {
  id: string;
  description: string;          // وصف المنتج/الخدمة
  quantity: number;             // الكمية
  unitPrice: number;            // سعر الوحدة
  totalPrice: number;           // السعر الإجمالي
  taxRate?: number;             // نسبة الضريبة (إذا كانت مختلفة)
  taxAmount?: number;           // قيمة الضريبة
  notes?: string;               // ملاحظات
}

// سجل دفعة
export interface PaymentRecord {
  id: string;
  amount: number;               // المبلغ المدفوع
  paymentMethod: string;        // طريقة الدفع (نقدي، بنكي، شيك، إلخ)
  paymentDate: string;          // تاريخ الدفع
  reference?: string;           // رقم مرجعي (رقم الشيك، رقم التحويل، إلخ)
  receivedBy: string;           // استلمه (معرف المستخدم)
  receivedByName: string;       // اسم المستلم
  notes?: string;               // ملاحظات
  receiptNumber?: string;       // رقم سند القبض
  createdAt: string;
}

// الفاتورة
export interface Invoice {
  // معلومات أساسية
  id: string;
  invoiceNumber: string;        // رقم الفاتورة التسلسلي (INV-2025-0001)
  invoiceType: InvoiceType;
  status: InvoiceStatus;
  
  // معلومات العميل
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string;
  companyName?: string;         // اسم الشركة
  taxNumber?: string;           // الرقم الضريبي
  commercialRegister?: string;  // السجل التجاري
  
  // معلومات الطلب وعرض السعر المرتبط
  relatedOrderId?: string;      // معرف الطلب المرتبط
  relatedOrderNumber?: string;  // رقم الطلب المرتبط
  relatedQuotationId?: string;  // معرف عرض السعر المرتبط
  relatedQuotationNumber?: string; // رقم عرض السعر المرتبط
  
  // بنود الفاتورة
  items: InvoiceItem[];
  
  // المعلومات المالية
  subtotal: number;             // المجموع الفرعي
  taxRate: number;              // نسبة الضريبة
  taxAmount: number;            // قيمة الضريبة
  discount?: number;            // الخصم
  discountPercentage?: number;  // نسبة الخصم
  shippingCost?: number;        // تكلفة الشحن
  otherCharges?: number;        // رسوم أخرى
  totalAmount: number;          // المبلغ الإجمالي
  
  // معلومات الدفع
  paidAmount: number;           // المبلغ المدفوع
  remainingAmount: number;      // المبلغ المتبقي
  paymentRecords: PaymentRecord[]; // سجلات الدفعات
  paymentDueDate?: string;      // تاريخ استحقاق الدفع
  
  // التواريخ
  issueDate: string;            // تاريخ الإصدار
  dueDate?: string;             // تاريخ الاستحقاق
  paidDate?: string;            // تاريخ الدفع الكامل
  
  // الموافقات
  preparedBy: string;           // أعدها (معرف المستخدم)
  preparedByName: string;       // اسم المعد
  approvedBy?: string;          // وافق عليها (معرف المستخدم)
  approvedByName?: string;      // اسم الموافق
  approvalDate?: string;        // تاريخ الموافقة
  
  // ملاحظات
  notes?: string;               // ملاحظات عامة
  terms?: string;               // شروط الدفع
  internalNotes?: string;       // ملاحظات داخلية
  
  // تتبع الإرسال
  sentToClientAt?: string;      // تاريخ الإرسال للعميل
  sentBy?: string;              // أرسلها (معرف المستخدم)
  
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

// ملخص الفاتورة (للقوائم)
export interface InvoiceSummary {
  id: string;
  invoiceNumber: string;
  customerName: string;
  status: InvoiceStatus;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  issueDate: string;
  dueDate?: string;
  preparedByName: string;
}

// دالة لحساب المجموع الإجمالي للفاتورة
export function calculateInvoiceTotal(
  items: InvoiceItem[], 
  taxRate: number, 
  discount?: number,
  shippingCost?: number,
  otherCharges?: number
): {
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
} {
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  let afterDiscount = subtotal;
  
  if (discount) {
    afterDiscount -= discount;
  }
  
  if (shippingCost) {
    afterDiscount += shippingCost;
  }
  
  if (otherCharges) {
    afterDiscount += otherCharges;
  }
  
  const taxAmount = afterDiscount * (taxRate / 100);
  const totalAmount = afterDiscount + taxAmount;
  
  return {
    subtotal,
    taxAmount,
    totalAmount,
  };
}

// دالة لحساب المبلغ المتبقي في الفواتير
export function calculateInvoiceRemainingAmount(totalAmount: number, paidAmount: number): number {
  return Math.max(0, totalAmount - paidAmount);
}

// دالة للتحقق من تأخر الفاتورة
export function isInvoiceOverdue(invoice: Invoice): boolean {
  if (!invoice.dueDate || invoice.status === InvoiceStatus.FULLY_PAID) {
    return false;
  }
  
  const now = new Date();
  const dueDate = new Date(invoice.dueDate);
  return now > dueDate && invoice.remainingAmount > 0;
}

// دالة للحصول على نسبة الدفع
export function getPaymentPercentage(invoice: Invoice): number {
  if (invoice.totalAmount === 0) return 0;
  return (invoice.paidAmount / invoice.totalAmount) * 100;
}

// دالة للحصول على الإجراء التالي المتاح
export function getNextInvoiceActions(status: InvoiceStatus): string[] {
  switch (status) {
    case InvoiceStatus.DRAFT:
      return ['إرسال للموافقة', 'حفظ', 'إلغاء'];
    
    case InvoiceStatus.PENDING_APPROVAL:
      return ['الموافقة', 'الرفض', 'إعادة للتعديل'];
    
    case InvoiceStatus.APPROVED:
      return ['إرسال للعميل', 'تسجيل دفعة', 'تعديل'];
    
    case InvoiceStatus.SENT_TO_CLIENT:
      return ['تسجيل دفعة', 'إعادة الإرسال', 'إلغاء'];
    
    case InvoiceStatus.PARTIALLY_PAID:
      return ['تسجيل دفعة', 'عرض سجل الدفعات'];
    
    case InvoiceStatus.OVERDUE:
      return ['تسجيل دفعة', 'إرسال تذكير', 'إلغاء'];
    
    case InvoiceStatus.FULLY_PAID:
      return ['طباعة', 'تصدير PDF', 'استرداد'];
    
    default:
      return ['عرض التفاصيل'];
  }
}

// دالة لتحديث حالة الفاتورة بناءً على الدفعات
export function updateInvoiceStatus(invoice: Invoice): InvoiceStatus {
  // إذا كانت ملغاة أو مستردة، لا تغير الحالة
  if (invoice.status === InvoiceStatus.CANCELLED || invoice.status === InvoiceStatus.REFUNDED) {
    return invoice.status;
  }
  
  // إذا تم الدفع بالكامل
  if (invoice.remainingAmount === 0 && invoice.paidAmount > 0) {
    return InvoiceStatus.FULLY_PAID;
  }
  
  // إذا تم الدفع جزئياً
  if (invoice.paidAmount > 0 && invoice.remainingAmount > 0) {
    // تحقق من التأخير
    if (isInvoiceOverdue(invoice)) {
      return InvoiceStatus.OVERDUE;
    }
    return InvoiceStatus.PARTIALLY_PAID;
  }
  
  // إذا لم يتم الدفع وتأخرت
  if (isInvoiceOverdue(invoice)) {
    return InvoiceStatus.OVERDUE;
  }
  
  // الحالة الحالية
  return invoice.status;
}


