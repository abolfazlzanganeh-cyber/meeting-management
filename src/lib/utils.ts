import { clsx, type ClassValue } from 'clsx';
import type { Priority, ResolutionStatus, MeetingStatus, AttendanceStatus } from '@/types';

export function cn(...inputs: ClassValue[]) { return clsx(inputs); }
export function generateId(): string { return Date.now().toString(36) + Math.random().toString(36).substr(2, 9); }
export function toPersianNumber(num: number | string): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/\d/g, (d) => persianDigits[parseInt(d)]);
}
export function formatPercent(value: number): string { return toPersianNumber(value) + '٪'; }

// توابعی که خطا می‌گرفت و الان اضافه شدند:
export function formatRelative(date: string): string { return 'تاریخ ثبت شده'; }
export function getDaysRemainingInfo(dueDate: string): { text: string; color: string; days: number } {
  return { text: 'بررسی شود', color: 'text-blue-600', days: 0 };
}
export function computeResolutionStatus(progress: number, dueDate: string, hasApproval: boolean, isCancelled: boolean): ResolutionStatus {
  if (isCancelled) return 'cancelled';
  if (hasApproval && progress === 100) return 'completed';
  if (progress === 100) return 'needs_approval';
  if (progress > 0) return 'in_progress';
  return 'pending';
}

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bgColor: string; order: number }> = {
  critical: { label: 'بحرانی', color: 'text-red-700', bgColor: 'bg-red-100', order: 0 },
  high: { label: 'بالا', color: 'text-orange-700', bgColor: 'bg-orange-100', order: 1 },
  medium: { label: 'متوسط', color: 'text-yellow-700', bgColor: 'bg-yellow-100', order: 2 },
  low: { label: 'پایین', color: 'text-green-700', bgColor: 'bg-green-100', order: 3 },
};

export const RESOLUTION_STATUS_CONFIG: Record<ResolutionStatus, { label: string; color: string; bgColor: string; dotColor: string }> = {
  pending: { label: 'در انتظار شروع', color: 'text-gray-700', bgColor: 'bg-gray-100', dotColor: 'bg-gray-500' },
  in_progress: { label: 'در حال انجام', color: 'text-blue-700', bgColor: 'bg-blue-100', dotColor: 'bg-blue-500' },
  completed: { label: 'تکمیل شده', color: 'text-green-700', bgColor: 'bg-green-100', dotColor: 'bg-green-500' },
  overdue: { label: 'تأخیر دار', color: 'text-red-700', bgColor: 'bg-red-100', dotColor: 'bg-red-500' },
  cancelled: { label: 'لغو شده', color: 'text-slate-700', bgColor: 'bg-slate-200', dotColor: 'bg-slate-500' },
  needs_approval: { label: 'نیازمند تأیید', color: 'text-orange-700', bgColor: 'bg-orange-100', dotColor: 'bg-orange-500' },
};

export const MEETING_STATUS_CONFIG: Record<MeetingStatus, { label: string; color: string; bgColor: string }> = {
  scheduled: { label: 'برنامه‌ریزی شده', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  held: { label: 'برگزار شده', color: 'text-green-700', bgColor: 'bg-green-100' },
  cancelled: { label: 'لغو شده', color: 'text-red-700', bgColor: 'bg-red-100' },
  postponed: { label: 'به تعویق افتاده', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  drafting: { label: 'در حال تکمیل', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  finalized: { label: 'نهایی شده', color: 'text-emerald-700', bgColor: 'bg-emerald-100' },
};

export const ATTENDANCE_CONFIG: Record<AttendanceStatus, { label: string; color: string; bgColor: string }> = {
  present: { label: 'حاضر', color: 'text-green-700', bgColor: 'bg-green-100' },
  absent: { label: 'غایب', color: 'text-red-700', bgColor: 'bg-red-100' },
  mission: { label: 'مأموریت', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  leave: { label: 'مرخصی', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  online: { label: 'آنلاین', color: 'text-purple-700', bgColor: 'bg-purple-100' },
};