/**
 * أنواع بيانات المخزون - Inventory Types
 */

// أنواع المواد
export enum MaterialCategory {
  PAPER = 'paper',           // ورق
  INK = 'ink',               // أحبار
  PLATES = 'plates',         // بليتات
  MOLDS = 'molds',           // قوالب
  CHEMICALS = 'chemicals',   // كيماويات
  OTHER = 'other',           // أخرى
}

// حالة المادة في المخزون
export enum StockStatus {
  IN_STOCK = 'in_stock',         // متوفر
  LOW_STOCK = 'low_stock',       // قليل
  OUT_OF_STOCK = 'out_of_stock', // نفذ
  ORDERED = 'ordered',           // تم الطلب
}

// حالة طلب الخامات
export enum MaterialRequestStatus {
  PENDING = 'pending',           // قيد الانتظار
  APPROVED = 'approved',         // موافق عليه
  REJECTED = 'rejected',         // مرفوض
  ORDERED = 'ordered',           // تم الطلب من المورد
  RECEIVED = 'received',         // تم الاستلام
}

// عنصر في المخزون
export interface InventoryItem {
  id: string;
  category: MaterialCategory;
  name: string;                  // اسم المادة
  description?: string;          // وصف تفصيلي
  quantity: number;              // الكمية الحالية
  unit: string;                  // وحدة القياس (كجم، لتر، ورقة، ...)
  minQuantity: number;           // الحد الأدنى (تنبيه عند النقص)
  maxQuantity?: number;          // الحد الأقصى
  status: StockStatus;           // حالة التوفر
  location?: string;             // موقع التخزين
  supplier?: string;             // المورد الرئيسي
  lastRestocked?: string;        // آخر تعبئة (ISO date)
  createdBy: string;             // من أضافها
  createdByName: string;
  department: string;            // القسم (printing, design, ...)
  createdAt: any;
  updatedAt: any;
}

// طلب خامات
export interface MaterialRequest {
  id: string;
  requestNumber: string;         // رقم الطلب (MATREQ-YYYY-XXXX)
  status: MaterialRequestStatus;
  items: MaterialRequestItem[];  // المواد المطلوبة
  requestedBy: string;           // من طلبها
  requestedByName: string;
  department: string;            // القسم الطالب
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reason?: string;               // سبب الطلب
  notes?: string;                // ملاحظات
  approvedBy?: string;           // من وافق
  approvedByName?: string;
  approvedAt?: any;
  rejectedReason?: string;
  orderedFrom?: string;          // تم الطلب من أي مورد
  orderedAt?: any;
  receivedAt?: any;
  totalCost?: number;            // التكلفة الإجمالية
  createdAt: any;
  updatedAt: any;
}

// عنصر في طلب الخامات
export interface MaterialRequestItem {
  id: string;
  inventoryItemId?: string;      // ربط بعنصر في المخزون (إذا موجود)
  category: MaterialCategory;
  name: string;
  description?: string;
  requestedQuantity: number;     // الكمية المطلوبة
  unit: string;                  // وحدة القياس
  estimatedCost?: number;        // التكلفة المقدرة
  receivedQuantity?: number;     // الكمية المستلمة فعلياً
  notes?: string;
}

// سجل حركة المخزون
export interface InventoryTransaction {
  id: string;
  inventoryItemId: string;       // المادة
  type: 'in' | 'out' | 'adjustment';  // إضافة / استخدام / تعديل
  quantity: number;              // الكمية
  previousQuantity: number;      // الكمية قبل العملية
  newQuantity: number;           // الكمية بعد العملية
  reason: string;                // السبب
  relatedOrderId?: string;       // ربط بطلب طباعة
  relatedRequestId?: string;     // ربط بطلب خامات
  performedBy: string;           // من قام بالعملية
  performedByName: string;
  notes?: string;
  createdAt: any;
}

// طلب شراء من المبيعات (للخامات الناقصة)
export enum PurchaseRequestStatus {
  PENDING = 'pending',           // قيد الانتظار
  APPROVED = 'approved',         // موافق عليه من CEO
  REJECTED = 'rejected',         // مرفوض
  ORDERED = 'ordered',           // تم الطلب من المورد
  RECEIVED = 'received',         // تم الاستلام
  COMPLETED = 'completed',       // مكتمل ومضاف للمخزون
}

export interface PurchaseRequest {
  id: string;
  requestNumber: string;         // رقم الطلب (PURCHREQ-YYYY-XXXX)
  status: PurchaseRequestStatus;
  items: PurchaseRequestItem[];  // المواد المطلوبة
  requestedBy: string;           // من طلبها
  requestedByName: string;
  department: string;            // القسم الطالب
  relatedOrderId?: string;       // ربط بطلب طباعة (إذا كان السبب طلب معين)
  relatedOrderNumber?: string;   // رقم الطلب
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reason: string;                // سبب الطلب
  notes?: string;                // ملاحظات
  approvedBy?: string;           // من وافق (CEO)
  approvedByName?: string;
  approvedAt?: any;
  rejectedReason?: string;
  totalEstimatedCost?: number;   // التكلفة الإجمالية المقدرة
  actualCost?: number;           // التكلفة الفعلية
  supplier?: string;             // المورد
  orderedAt?: any;
  expectedDeliveryDate?: string;
  receivedAt?: any;
  createdAt: any;
  updatedAt: any;
}

export interface PurchaseRequestItem {
  id: string;
  inventoryItemId?: string;      // ربط بعنصر في المخزون (إذا موجود)
  category: MaterialCategory;
  name: string;
  description?: string;
  requestedQuantity: number;     // الكمية المطلوبة
  unit: string;                  // وحدة القياس
  estimatedCost?: number;        // التكلفة المقدرة للوحدة
  totalEstimatedCost?: number;   // التكلفة الإجمالية
  receivedQuantity?: number;     // الكمية المستلمة فعلياً
  actualCost?: number;           // التكلفة الفعلية
  notes?: string;
}

