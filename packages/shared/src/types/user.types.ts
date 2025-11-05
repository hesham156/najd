/**
 * أنواع المستخدمين والصلاحيات - Najd Company
 */

export enum UserRole {
  // الإدارة التنفيذية
  CEO = 'ceo',
  
  // فريق المبيعات
  SALES = 'sales',
  SALES_HEAD = 'sales_head',
  
  // فريق التصميم
  DESIGN = 'design',
  DESIGN_HEAD = 'design_head',
  
  // فريق الطباعة
  PRINTING = 'printing',
  PRINTING_HEAD = 'printing_head',
  
  // فريق الحسابات
  ACCOUNTING = 'accounting',
  ACCOUNTING_HEAD = 'accounting_head',
  
  // فريق الإرسال
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
  createdAt: string;
  updatedAt: string;
  photoURL?: string;
  isActive: boolean;
}

export interface UserPermissions {
  canCreateOrder: boolean;
  canReviewOrder: boolean;
  canApproveOrder: boolean;
  canRejectOrder: boolean;
  canEditOrder: boolean;
  canDeleteOrder: boolean;
  canAssignOrder: boolean;
  canViewAllOrders: boolean;
  canViewDepartmentOrders: boolean;
  canManageUsers: boolean;
  canGenerateReports: boolean;
  // صلاحيات عروض الأسعار والفواتير
  canCreateQuotation: boolean;
  canEditQuotation: boolean;
  canApproveQuotation: boolean;
  canCreateInvoice: boolean;
  canEditInvoice: boolean;
  canManagePayments: boolean;
}

// دالة لتحديد الصلاحيات حسب الدور
export function getPermissionsForRole(role: UserRole): UserPermissions {
  const basePermissions: UserPermissions = {
    canCreateOrder: false,
    canReviewOrder: false,
    canApproveOrder: false,
    canRejectOrder: false,
    canEditOrder: false,
    canDeleteOrder: false,
    canAssignOrder: false,
    canViewAllOrders: false,
    canViewDepartmentOrders: false,
    canManageUsers: false,
    canGenerateReports: false,
    canCreateQuotation: false,
    canEditQuotation: false,
    canApproveQuotation: false,
    canCreateInvoice: false,
    canEditInvoice: false,
    canManagePayments: false,
  };

  switch (role) {
    case UserRole.CEO:
      return {
        ...basePermissions,
        canApproveOrder: true,
        canRejectOrder: true,
        canViewAllOrders: true,
        canManageUsers: true,
        canGenerateReports: true,
        canAssignOrder: true,
      };

    case UserRole.SALES:
    case UserRole.SALES_HEAD:
      return {
        ...basePermissions,
        canCreateOrder: true,
        canEditOrder: true,
        canViewDepartmentOrders: true,
        ...(role === UserRole.SALES_HEAD && {
          canViewAllOrders: true,
          canGenerateReports: true,
        }),
      };

    case UserRole.DESIGN:
    case UserRole.DESIGN_HEAD:
      return {
        ...basePermissions,
        canReviewOrder: true,
        canViewDepartmentOrders: true,
        ...(role === UserRole.DESIGN_HEAD && {
          canAssignOrder: true,
          canGenerateReports: true,
        }),
      };

    case UserRole.PRINTING:
    case UserRole.PRINTING_HEAD:
      return {
        ...basePermissions,
        canReviewOrder: true,
        canViewDepartmentOrders: true,
        ...(role === UserRole.PRINTING_HEAD && {
          canAssignOrder: true,
          canGenerateReports: true,
        }),
      };

    case UserRole.ACCOUNTING:
    case UserRole.ACCOUNTING_HEAD:
      return {
        ...basePermissions,
        canReviewOrder: true,
        canApproveOrder: true,
        canViewDepartmentOrders: true,
        // صلاحيات خاصة بقسم الحسابات - إنشاء عروض الأسعار والفواتير
        canCreateQuotation: true,
        canEditQuotation: true,
        canApproveQuotation: true,
        canCreateInvoice: true,
        canEditInvoice: true,
        canManagePayments: true,
        ...(role === UserRole.ACCOUNTING_HEAD && {
          canViewAllOrders: true,
          canGenerateReports: true,
        }),
      };

    case UserRole.DISPATCH:
    case UserRole.DISPATCH_HEAD:
      return {
        ...basePermissions,
        canReviewOrder: true,
        canViewDepartmentOrders: true,
        ...(role === UserRole.DISPATCH_HEAD && {
          canGenerateReports: true,
        }),
      };

    default:
      return basePermissions;
  }
}

