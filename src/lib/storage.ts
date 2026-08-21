import type { User, Department, MeetingType, Meeting, Attendee, Resolution, Notification, SystemSettings, AuditEntry } from '@/types';
import { getAllFromTable, upsertToTable } from './supabase';

let cache = {
  users: [] as User[], departments: [] as Department[], meetingTypes: [] as MeetingType[],
  meetings: [] as Meeting[], attendees: [] as Attendee[], resolutions: [] as Resolution[],
  notifications: [] as Notification[], auditLog: [] as AuditEntry[],
};

export async function loadAllData() {
  try {
    cache.users = (await getAllFromTable('users')) || [];
    cache.departments = (await getAllFromTable('departments')) || [];
    cache.meetingTypes = (await getAllFromTable('meeting_types')) || [];
    cache.meetings = (await getAllFromTable('meetings')) || [];
    cache.attendees = (await getAllFromTable('attendees')) || [];
    cache.resolutions = (await getAllFromTable('resolutions')) || [];
    cache.notifications = (await getAllFromTable('notifications')) || [];
    cache.auditLog = (await getAllFromTable('audit_log')) || [];
  } catch (error) {
    console.error('❌ Load error:', error);
  }
}

export const getUsers = (): User[] => cache.users || [];
export const setUsers = (users: User[]) => { cache.users = users || []; upsertToTable('users', users); };

export const getDepartments = (): Department[] => cache.departments || [];
export const setDepartments = (deps: Department[]) => { cache.departments = deps || []; upsertToTable('departments', deps); };

export const getMeetingTypes = (): MeetingType[] => cache.meetingTypes || [];
export const setMeetingTypes = (types: MeetingType[]) => { cache.meetingTypes = types || []; upsertToTable('meeting_types', types); };

export const getMeetings = (): Meeting[] => cache.meetings || [];
export const setMeetings = (meetings: Meeting[]) => { cache.meetings = meetings || []; upsertToTable('meetings', meetings); };

export const getAttendees = (): Attendee[] => cache.attendees || [];
export const setAttendees = (attendees: Attendee[]) => { cache.attendees = attendees || []; upsertToTable('attendees', attendees); };

export const getResolutions = (): Resolution[] => cache.resolutions || [];
export const setResolutions = (resolutions: Resolution[]) => { cache.resolutions = resolutions || []; upsertToTable('resolutions', resolutions); };

export const getNotifications = (): Notification[] => cache.notifications || [];
export const setNotifications = (notifications: Notification[]) => { cache.notifications = notifications || []; upsertToTable('notifications', notifications); };

export const getAuditLog = (): AuditEntry[] => cache.auditLog || [];
export const setAuditLog = (entries: AuditEntry[]) => { cache.auditLog = entries || []; upsertToTable('audit_log', entries); };

const SETTINGS_KEY = 'mms_settings';
const DEFAULT_SETTINGS: SystemSettings = { meetingCodePrefix: 'MTG', resolutionCodePrefix: 'RES', maxFileSize: 10, allowedFileTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'png', 'zip'], reminderDays: [7, 3, 1, 0], overdueWarningDays: 3, overdueCriticalDays: 7 };
export const getSettings = (): SystemSettings => { try { const data = localStorage.getItem(SETTINGS_KEY); return data ? JSON.parse(data) : DEFAULT_SETTINGS; } catch { return DEFAULT_SETTINGS; } };
export const setSettings = (s: SystemSettings) => localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));

const CU_KEY = 'mms_current_user';
export const getCurrentUser = (): User | null => { try { const data = localStorage.getItem(CU_KEY); return data ? JSON.parse(data) : null; } catch { return null; } };
export const setCurrentUser = (u: User | null) => { if (u) localStorage.setItem(CU_KEY, JSON.stringify(u)); else localStorage.removeItem(CU_KEY); };
export const clearCurrentUser = () => localStorage.removeItem(CU_KEY);
export const clearAll = () => { localStorage.removeItem(SETTINGS_KEY); localStorage.removeItem(CU_KEY); cache = { users: [], departments: [], meetingTypes: [], meetings: [], attendees: [], resolutions: [], notifications: [], auditLog: [] }; };