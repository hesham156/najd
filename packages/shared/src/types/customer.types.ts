/**
 * أنواع بيانات العملاء
 */

import { Timestamp } from 'firebase/firestore';

/**
 * نوع بيانات العميل
 */
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  company?: string;
  taxNumber?: string;
  notes?: string;
  createdBy: string; // معرف مندوب المبيعات الذي أضاف العميل
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

/**
 * نوع بيانات إنشاء عميل جديد
 */
export interface CreateCustomerInput {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  company?: string;
  taxNumber?: string;
  notes?: string;
}

/**
 * نوع بيانات تحديث بيانات عميل
 */
export interface UpdateCustomerInput {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  company?: string;
  taxNumber?: string;
  notes?: string;
}

