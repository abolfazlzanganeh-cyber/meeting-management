import { supabase } from './supabase';
import type { User, Department, MeetingType, Meeting, Attendee, Resolution, Notification } from './types';

// فقط نشست کاربر محلی می‌ماند
const LS_CURRENT_USER_KEY = 'current_user';

// نگاشت کلیدهای قدیمی localStorage به جدول‌های Supabase (برای مهاجرت)
const LS_TO_TABLE: Record<string, string> = {
  app_users: 'users',
  app_departments: 'departments',
  app_meeting_types: 'meeting_types',
  app_meetings: 'meetings',
  app_attendees: 'attendees',
  app_resolutions: 'resolutions',
  app_notifications: 'notifications',
};

interface AppData {
  users: User[];
  departments: Department[];
  meetingTypes: MeetingType[];
  meetings: Meeting[];
  attendees: Attendee[];
  resolutions: Resolution[];
  notifications: Notification[];
}

let appData: AppData = {
  users: [], departments: [], meetingTypes: [],
  meetings: [], attendees: [], resolutions: [], notifications: [],
};

// ---------- توابع پایه Supabase ----------
async function fetchTable<T>(table: string): Promise<T[]> {
  const { data, error } = await supabase.from(table).select('data');
  if (error) { console.error(`fetchTable(${table}):`, error.message); return []; }
  return (data ?? []).map((row: { data: T }) => row.data);
}

async function upsertRow<T extends { id: string }>(table: string, item: T): Promise<void> {
  const { error } = await supabase.from(table).upsert({ id: item.id, data: item });
  if (error) console.error(`upsertRow(${table}):`, error.message);
}

async function deleteRow(table: string, id: string): Promise<void> {
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) console.error(`deleteRow(${table}):`, error.message);
}

// ---------- بارگذاری اولیه ----------
export async function loadAllData(): Promise<void> {
  const [users, departments, meetingTypes, meetings, attendees, resolutions, notifications] =
    await Promise.all([
      fetchTable<User>('users'),
      fetchTable<Department>('departments'),
      fetchTable<MeetingType>('meeting_types'),
      fetchTable<Meeting>('meetings'),
      fetchTable<Attendee>('attendees'),
      fetchTable<Resolution>('resolutions'),
      fetchTable<Notification>('notifications'),
    ]);
  appData = { users, departments, meetingTypes, meetings, attendees, resolutions, notifications };
}

// ---------- مهاجرت یک‌باره از localStorage ----------
export async function migrateFromLocalStorage(): Promise<void> {
  if (localStorage.getItem('supabase_migrated') === 'yes') return;
  for (const [lsKey, table] of Object.entries(LS_TO_TABLE)) {
    const raw = localStorage.getItem(lsKey);
    if (!raw) continue;
    try {
      const items: { id: string }[] = JSON.parse(raw);
      if (items.length) {
        const rows = items.map(it => ({ id: it.id, data: it }));
        const { error } = await supabase.from(table).upsert(rows);
        if (error) { console.error(`migrate(${table}):`, error.message); return; }
      }
    } catch (e) { console.error(`migrate parse(${lsKey}):`, e); }
  }
  localStorage.setItem('supabase_migrated', 'yes');
}

// ---------- نشست کاربر (محلی می‌ماند) ----------
export function getCurrentUser(): User | null {
  const raw = localStorage.getItem(LS_CURRENT_USER_KEY);
  return raw ? JSON.parse(raw) : null;
}
export function setCurrentUser(user: User) { localStorage.setItem(LS_CURRENT_USER_KEY, JSON.stringify(user)); }
export function clearCurrentUser() { localStorage.removeItem(LS_CURRENT_USER_KEY); }

// ---------- Getters (همگام، از کش حافظه) ----------
export function getUsers(): User[] { return appData.users; }
export function getDepartments(): Department[] { return appData.departments; }
export function getMeetingTypes(): MeetingType[] { return appData.meetingTypes; }
export function getMeetings(): Meeting[] { return appData.meetings; }
export function getAttendees(): Attendee[] { return appData.attendees; }
export function getResolutions(): Resolution[] { return appData.resolutions; }
export function getNotifications(): Notification[] { return appData.notifications; }

// ---------- کمکی‌های داخلی ----------
function upsertLocal<T extends { id: string }>(items: T[], item: T): T[] {
  const i = items.findIndex(x => x.id === item.id);
  if (i !== -1) items[i] = item; else items.push(item);
  return [...items];
}

// ---------- Mutators (async) ----------
export async function addMeeting(m: Meeting) { appData.meetings = upsertLocal(appData.meetings, m); await upsertRow('meetings', m); }
export async function updateMeeting(m: Meeting) { appData.meetings = upsertLocal(appData.meetings, m); await upsertRow('meetings', m); }
export async function deleteMeeting(id: string) { appData.meetings = appData.meetings.filter(x => x.id !== id); await deleteRow('meetings', id); }

export async function addResolution(r: Resolution) { appData.resolutions = upsertLocal(appData.resolutions, r); await upsertRow('resolutions', r); }
export async function updateResolution(r: Resolution) { appData.resolutions = upsertLocal(appData.resolutions, r); await upsertRow('resolutions', r); }
export async function deleteResolution(id: string) { appData.resolutions = appData.resolutions.filter(x => x.id !== id); await deleteRow('resolutions', id); }

export async function addNotification(n: Notification) { appData.notifications = upsertLocal(appData.notifications, n); await upsertRow('notifications', n); }
export async function markNotificationRead(id: string) {
  const n = appData.notifications.find(x => x.id === id);
  if (n) { n.isRead = true; appData.notifications = upsertLocal(appData.notifications, n); await upsertRow('notifications', n); }
}

export async function addUser(u: User) { appData.users = upsertLocal(appData.users, u); await upsertRow('users', u); }
export async function updateUser(u: User) { appData.users = upsertLocal(appData.users, u); await upsertRow('users', u); }
export async function deleteUser(id: string) { appData.users = appData.users.filter(x => x.id !== id); await deleteRow('users', id); }

export async function addDepartment(d: Department) { appData.departments = upsertLocal(appData.departments, d); await upsertRow('departments', d); }
export async function updateDepartment(d: Department) { appData.departments = upsertLocal(appData.departments, d); await upsertRow('departments', d); }
export async function deleteDepartment(id: string) { appData.departments = appData.departments.filter(x => x.id !== id); await deleteRow('departments', id); }

export async function addMeetingType(mt: MeetingType) { appData.meetingTypes = upsertLocal(appData.meetingTypes, mt); await upsertRow('meeting_types', mt); }
export async function updateMeetingType(mt: MeetingType) { appData.meetingTypes = upsertLocal(appData.meetingTypes, mt); await upsertRow('meeting_types', mt); }
export async function deleteMeetingType(id: string) { appData.meetingTypes = appData.meetingTypes.filter(x => x.id !== id); await deleteRow('meeting_types', id); }

export async function addAttendee(a: Attendee) { appData.attendees = upsertLocal(appData.attendees, a); await upsertRow('attendees', a); }
export async function updateAttendee(a: Attendee) { appData.attendees = upsertLocal(appData.attendees, a); await upsertRow('attendees', a); }
export async function deleteAttendee(id: string) { appData.attendees = appData.attendees.filter(x => x.id !== id); await deleteRow('attendees', id); }
