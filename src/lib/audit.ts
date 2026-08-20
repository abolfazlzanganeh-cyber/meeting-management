import type { AuditEntry } from '@/types';
import { generateId } from './utils';

const AUDIT_KEY = 'mms_audit_log';

export function getAuditLog(): AuditEntry[] {
  try {
    const data = localStorage.getItem(AUDIT_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function setAuditLog(entries: AuditEntry[]): void {
  try {
    localStorage.setItem(AUDIT_KEY, JSON.stringify(entries));
  } catch (e) {
    console.error('Audit log error:', e);
  }
}

export function addAuditEntry(entry: Omit<AuditEntry, 'id' | 'timestamp'>): void {
  const log = getAuditLog();
  const newEntry: AuditEntry = {
    ...entry,
    id: generateId(),
    timestamp: new Date().toISOString(),
  };
  log.unshift(newEntry);
  
  if (log.length > 1000) {
    log.splice(1000);
  }
  
  setAuditLog(log);
}

export function getEntityAuditLog(entityType: string, entityId: string): AuditEntry[] {
  return getAuditLog().filter(e => e.entityType === entityType && e.entityId === entityId);
}

export function getUserAuditLog(userId: string): AuditEntry[] {
  return getAuditLog().filter(e => e.userId === userId);
}

export function clearAuditLog(): void {
  localStorage.removeItem(AUDIT_KEY);
}

// توابع کمکی
export function logMeetingCreated(meetingId: string, meetingTitle: string, userId: string, userName: string): void {
  addAuditEntry({
    userId,
    userName,
    action: 'created',
    entityType: 'meeting',
    entityId: meetingId,
    entityName: meetingTitle,
    description: `جلسه "${meetingTitle}" ایجاد شد`,
  });
}

export function logMeetingUpdated(meetingId: string, meetingTitle: string, userId: string, userName: string, changes: string): void {
  addAuditEntry({
    userId,
    userName,
    action: 'updated',
    entityType: 'meeting',
    entityId: meetingId,
    entityName: meetingTitle,
    description: `جلسه "${meetingTitle}" ویرایش شد: ${changes}`,
  });
}

export function logMinuteRowCreated(meetingId: string, meetingTitle: string, rowId: string, description: string, assigneeName: string, userId: string, userName: string): void {
  addAuditEntry({
    userId,
    userName,
    action: 'created',
    entityType: 'minute_row',
    entityId: rowId,
    entityName: description,
    description: `مصوبه "${description}" به ${assigneeName} واگذار شد (جلسه: ${meetingTitle})`,
    metadata: { meetingId, assigneeName },
  });
}

export function logMinuteRowStatusChanged(meetingId: string, meetingTitle: string, rowId: string, description: string, oldStatus: string, newStatus: string, userId: string, userName: string): void {
  addAuditEntry({
    userId,
    userName,
    action: 'status_changed',
    entityType: 'minute_row',
    entityId: rowId,
    entityName: description,
    field: 'status',
    oldValue: oldStatus,
    newValue: newStatus,
    description: `وضعیت مصوبه "${description}" از "${oldStatus}" به "${newStatus}" تغییر کرد (جلسه: ${meetingTitle})`,
    metadata: { meetingId },
  });
}

export function logMinuteRowDeadlineChanged(meetingId: string, meetingTitle: string, rowId: string, description: string, oldDeadline: string, newDeadline: string, userId: string, userName: string): void {
  addAuditEntry({
    userId,
    userName,
    action: 'deadline_changed',
    entityType: 'minute_row',
    entityId: rowId,
    entityName: description,
    field: 'dueDate',
    oldValue: oldDeadline,
    newValue: newDeadline,
    description: `مهلت مصوبه "${description}" از "${oldDeadline}" به "${newDeadline}" تغییر کرد (جلسه: ${meetingTitle})`,
    metadata: { meetingId },
  });
}

export function logMinuteRowDeleted(meetingId: string, meetingTitle: string, rowId: string, description: string, userId: string, userName: string): void {
  addAuditEntry({
    userId,
    userName,
    action: 'deleted',
    entityType: 'minute_row',
    entityId: rowId,
    entityName: description,
    description: `مصوبه "${description}" حذف شد (جلسه: ${meetingTitle})`,
    metadata: { meetingId },
  });
}