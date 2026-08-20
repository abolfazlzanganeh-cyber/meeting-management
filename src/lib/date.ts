import dayjs from 'dayjs';
import * as jalaali from 'jalaali-js';

export function toJalali(date: string | Date): string {
  const d = new Date(date);
  const j = jalaali.toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate());
  return `${j.jy}/${String(j.jm).padStart(2, '0')}/${String(j.jd).padStart(2, '0')}`;
}

export function toJalaliFull(date: string | Date): string {
  const d = new Date(date);
  const j = jalaali.toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate());
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return `${j.jy}/${String(j.jm).padStart(2, '0')}/${String(j.jd).padStart(2, '0')} ${time}`;
}

// تابعی که خطا می‌گرفت و الان اضافه شد:
export function toJalaliWithTime(date: string | Date): string {
  return toJalaliFull(date);
}

export function toGregorian(jalaliDate: string): string {
  const [jy, jm, jd] = jalaliDate.split('/').map(Number);
  const g = jalaali.toGregorian(jy, jm, jd);
  return new Date(g.gy, g.gm - 1, g.gd).toISOString();
}

export function todayJalali(): string { return toJalali(new Date()); }
export function todayISO(): string { return new Date().toISOString().split('T')[0]; }

export function daysBetween(from: string, to: string): number {
  const fromG = new Date(toGregorian(from));
  const toG = new Date(toGregorian(to));
  return Math.ceil(Math.abs(toG.getTime() - fromG.getTime()) / (1000 * 60 * 60 * 24)); 
}

export function daysRemaining(dueDate: string): number {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const due = new Date(toGregorian(dueDate)); due.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatRelative(date: string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - d.getTime()) / (1000 * 60));
  if (diffMinutes < 1) return 'لحظاتی پیش';
  if (diffMinutes < 60) return `${diffMinutes} دقیقه پیش`;
  const diffHours = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60));
  if (diffHours < 24) return `${diffHours} ساعت پیش`;
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 7) return `${diffDays} روز پیش`;
  return toJalali(date);
}

export function currentJalaliYear(): number {
  const d = new Date();
  return jalaali.toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate()).jy;
}

export const JALALI_MONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
export const JALALI_WEEKDAYS = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'];
export { dayjs };