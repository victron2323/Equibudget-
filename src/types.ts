/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'admin' | 'collaborator';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  status: 'active' | 'inactive';
  password?: string;
}

export type ProjectStatus = 'Activo' | 'Finalizado' | 'Suspendido';

export interface Project {
  id: string;
  name: string;
  client: string;
  startDate: string;
  endDate: string;
  budget: number;
  status: ProjectStatus;
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string; // Tailwind hex color code or class name
  icon: string; // Lucide icon name
}

export interface ExpenseAttachment {
  id: string;
  name: string;
  type: 'image' | 'pdf';
  url: string; // Base64 or mock placeholder URL
}

export interface Expense {
  id: string;
  projectId: string;
  date: string;
  person: string;
  category: string; // Matches Category name
  description: string;
  value: number;
  paymentMethod: string; // e.g. "Efectivo", "Tarjeta", "Transferencia", etc.
  invoiceNumber?: string;
  attachments: ExpenseAttachment[];
  observations?: string;
}

export type NotificationType = 'budget_low' | 'project_end' | 'missing_invoice' | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  date: string;
  read: boolean;
  projectId?: string;
  expenseId?: string;
  severity?: 'high' | 'medium' | 'low';
}

export interface BackupHistory {
  id: string;
  date: string;
  size: string;
  recordsCount: number;
  status: 'Completado' | 'Fallido';
}
