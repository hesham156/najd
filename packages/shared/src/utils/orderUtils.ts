/**
 * دوال مساعدة للطلبات - Order Utilities
 */

import type { Order, MaterialStatus, MaterialType } from '../types/order.types';

// ==========================
// إدارة المواد (Materials)
// ==========================

/**
 * تهيئة حالة المواد عند إنشاء الطلب
 */
export function initializeMaterialsStatus(order: Order): MaterialStatus[] {
  if (!order.materials || order.materials.length === 0) {
    return [];
  }

  return order.materials.map(material => ({
    type: material.type,
    status: 'pending' as const,
  }));
}

/**
 * التحقق من اكتمال جميع المواد
 */
export function areAllMaterialsReady(materialsStatus?: MaterialStatus[]): boolean {
  if (!materialsStatus || materialsStatus.length === 0) {
    return true; // لا توجد مواد مطلوبة
  }

  return materialsStatus.every(material => material.status === 'ready');
}

/**
 * الحصول على المواد المعلقة
 */
export function getPendingMaterials(materialsStatus?: MaterialStatus[]): MaterialStatus[] {
  if (!materialsStatus) return [];
  return materialsStatus.filter(material => material.status === 'pending');
}

/**
 * الحصول على المواد قيد التنفيذ
 */
export function getInProgressMaterials(materialsStatus?: MaterialStatus[]): MaterialStatus[] {
  if (!materialsStatus) return [];
  return materialsStatus.filter(material => material.status === 'in_progress');
}

/**
 * الحصول على المواد الجاهزة
 */
export function getReadyMaterials(materialsStatus?: MaterialStatus[]): MaterialStatus[] {
  if (!materialsStatus) return [];
  return materialsStatus.filter(material => material.status === 'ready');
}

/**
 * تحديث حالة مادة معينة
 */
export function updateMaterialStatus(
  materialsStatus: MaterialStatus[],
  materialType: MaterialType,
  newStatus: 'pending' | 'in_progress' | 'ready',
  assignedTo?: string,
  assignedToName?: string,
  notes?: string
): MaterialStatus[] {
  const now = new Date().toISOString();

  return materialsStatus.map(material => {
    if (material.type !== materialType) {
      return material;
    }

    const updated: MaterialStatus = {
      ...material,
      status: newStatus,
      notes,
    };

    if (assignedTo) {
      updated.assignedTo = assignedTo;
      updated.assignedToName = assignedToName;
    }

    if (newStatus === 'in_progress' && !material.startedAt) {
      updated.startedAt = now;
    }

    if (newStatus === 'ready') {
      updated.completedAt = now;
    }

    return updated;
  });
}

/**
 * الحصول على تسميات المواد بالعربية
 */
export const MATERIAL_LABELS: Record<MaterialType, string> = {
  plates: 'البليتات',
  molds: 'القوالب',
  paper: 'الورق',
};

/**
 * الحصول على ألوان حالة المواد
 */
export function getMaterialStatusColor(status: 'pending' | 'in_progress' | 'ready'): string {
  switch (status) {
    case 'pending':
      return '#f59e0b'; // amber
    case 'in_progress':
      return '#3b82f6'; // blue
    case 'ready':
      return '#10b981'; // green
    default:
      return '#6b7280'; // gray
  }
}

/**
 * الحصول على تسمية حالة المواد بالعربية
 */
export function getMaterialStatusLabel(status: 'pending' | 'in_progress' | 'ready'): string {
  switch (status) {
    case 'pending':
      return 'في الانتظار';
    case 'in_progress':
      return 'جاري التجهيز';
    case 'ready':
      return 'جاهز';
    default:
      return 'غير معروف';
  }
}

// ==========================
// إدارة التسعيرة (Pricing)
// ==========================

/**
 * الحد الأقصى لنسبة الفرق المسموح به (%)
 */
export const MAX_COST_VARIANCE_PERCENTAGE = 10;

/**
 * حساب نسبة الفرق بين تسعيرتين
 */
export function calculateCostVariance(
  estimatedCost: number,
  finalCost: number
): number {
  if (estimatedCost === 0) return 0;
  return ((finalCost - estimatedCost) / estimatedCost) * 100;
}

/**
 * التحقق من أن فرق التسعيرة مقبول
 */
export interface CostVarianceCheck {
  isValid: boolean;
  variance: number;
  varianceAmount: number;
  message: string;
}

export function checkCostVariance(
  estimatedCost: number,
  finalCost: number,
  maxVariancePercentage: number = MAX_COST_VARIANCE_PERCENTAGE
): CostVarianceCheck {
  const variance = calculateCostVariance(estimatedCost, finalCost);
  const varianceAmount = finalCost - estimatedCost;
  const isValid = Math.abs(variance) <= maxVariancePercentage;

  let message = '';
  if (!isValid) {
    if (variance > 0) {
      message = `التسعيرة النهائية أعلى من الأولية بنسبة ${variance.toFixed(1)}% (${varianceAmount.toFixed(2)} ر.س). يتطلب موافقة المدير.`;
    } else {
      message = `التسعيرة النهائية أقل من الأولية بنسبة ${Math.abs(variance).toFixed(1)}% (${Math.abs(varianceAmount).toFixed(2)} ر.س).`;
    }
  } else {
    message = `الفرق مقبول (${variance.toFixed(1)}%)`;
  }

  return {
    isValid,
    variance,
    varianceAmount,
    message,
  };
}

/**
 * حساب المبلغ المتبقي
 */
export function calculateRemainingAmount(totalCost: number, paidAmount: number): number {
  return Math.max(0, totalCost - paidAmount);
}

/**
 * حساب نسبة الدفع
 */
export function calculatePaymentPercentage(totalCost: number, paidAmount: number): number {
  if (totalCost === 0) return 0;
  return (paidAmount / totalCost) * 100;
}

/**
 * تحديد حالة الدفع بناءً على المبالغ
 */
export function determinePaymentStatus(
  totalCost: number,
  paidAmount: number
): 'pending' | 'partial' | 'completed' {
  if (paidAmount === 0) return 'pending';
  if (paidAmount >= totalCost) return 'completed';
  return 'partial';
}

// ==========================
// دوال تصدير (Exports)
// ==========================

export default {
  // Materials
  initializeMaterialsStatus,
  areAllMaterialsReady,
  getPendingMaterials,
  getInProgressMaterials,
  getReadyMaterials,
  updateMaterialStatus,
  MATERIAL_LABELS,
  getMaterialStatusColor,
  getMaterialStatusLabel,
  
  // Pricing
  MAX_COST_VARIANCE_PERCENTAGE,
  calculateCostVariance,
  checkCostVariance,
  calculateRemainingAmount,
  calculatePaymentPercentage,
  determinePaymentStatus,
};



