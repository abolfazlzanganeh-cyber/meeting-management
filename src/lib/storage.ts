import type { User, Department, MeetingType, Meeting, Attendee, Resolution, Notification, SystemSettings, AuditEntry } from '@/types';

// کش محلی
let cache = {
  users: [] as User[],
  departments: [] as Department[],
  meetingTypes: [] as MeetingType[],
  meetings: [] as Meeting[],
  attendees: [] as Attendee[],
  resolutions: [] as Resolution[],
  notifications: [] as Notification[],
  auditLog: [] as AuditEntry[],
};

// بارگذاری از localStorage
export async function loadAllData() {
  try {
    cache.users = JSON.parse(localStorage.getItem('mms_users') || '[]');
    cache.departments = JSON.parse(localStorage.getItem('mms_departments') || '[]');
    cache.meetingTypes = JSON.parse(localStorage.getItem('mms_meeting_types') || '[]');
    cache.meetings = JSON.parse(localStorage.getItem('mms_meetings') || '[]');
    cache.attendees = JSON.parse(localStorage.getItem('mms_attendees') || '[]');
    cache.resolutions = JSON.parse(localStorage.getItem('mms_resolutions') || '[]');
    cache.notifications = JSON.parse(localStorage.getItem('mms_notifications') || '[]');
    cache.auditLog = JSON.parse(localStorage.getItem('mms_audit_log') || '[]');
    console.log('✅ Data loaded from localStorage:', cache.users.length, 'users,', cache.meetings.length, 'meetings');
  } catch (error) {
    console.error('❌ Load error:', error);
  }
}

// ذخیره در localStorage
function saveToStorage(key: string, data: any[]) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Save error:', e);
  }
}

export const getUsers = (): User[] => cache.users || [];
export const setUsers = (users: User[]) => { cache.users = users || []; saveToStorage('mms_users', users); };

export const getDepartments = (): Department[] => cache.departments || [];
export const setDepartments = (deps: Department[]) => { cache.departments = deps || []; saveToStorage('mms_departments', deps); };

export const getMeetingTypes = (): MeetingType[] => cache.meetingTypes || [];
export const setMeetingTypes = (types: MeetingType[]) => { cache.meetingTypes = types || []; saveToStorage('mms_meeting_types', types); };

export const getMeetings = (): Meeting[] => cache.meetings || [];
export const setMeetings = (meetings: Meeting[]) => { cache.meetings = meetings || []; saveToStorage('mms_meetings', meetings); };

export const getAttendees = (): Attendee[] => cache.attendees || [];
export const setAttendees = (attendees: Attendee[]) => { cache.attendees = attendees || []; saveToStorage('mms_attendees', attendees); };

export const getResolutions = (): Resolution[] => cache.resolutions || [];
export const setResolutions = (resolutions: Resolution[]) => { cache.resolutions = resolutions || []; saveToStorage('mms_resolutions', resolutions); };

export const getNotifications = (): Notification[] => cache.notifications || [];
export const setNotifications = (notifications: Notification[]) => { cache.notifications = notifications || []; saveToStorage('mms_notifications', notifications); };

export const getAuditLog = (): AuditEntry[] => cache.auditLog || [];
export const setAuditLog = (entries: AuditEntry[]) => { cache.auditLog = entries || []; saveToStorage('mms_audit_log', entries); };

const SETTINGS_KEY = 'mms_settings';
const DEFAULT_SETTINGS: SystemSettings = { meetingCodePrefix: 'MTG', resolutionCodePrefix: 'RES', maxFileSize: 10, allowedFileTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'png', 'zip'], reminderDays: [7, 3, 1, 0], overdueWarningDays: 3, overdueCriticalDays: 7 };
export const getSettings = (): SystemSettings => { try { const data = localStorage.getItem(SETTINGS_KEY); return data ? JSON.parse(data) : DEFAULT_SETTINGS; } catch { return DEFAULT_SETTINGS; } };
export const setSettings = (s: SystemSettings) => localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));

const CU_KEY = 'mms_current_user';
export const getCurrentUser = (): User | null => { try { const data = localStorage.getItem(CU_KEY); return data ? JSON.parse(data) : null; } catch { return null; } };
export const setCurrentUser = (u: User | null) => { if (u) localStorage.setItem(CU_KEY, JSON.stringify(u)); else localStorage.removeItem(CU_KEY); };
export const clearCurrentUser = () => localStorage.removeItem(CU_KEY);
export const clearAll = () => { 
  localStorage.removeItem(SETTINGS_KEY); 
  localStorage.removeItem(CU_KEY);
  localStorage.removeItem('mms_users');
  localStorage.removeItem('mms_departments');
  localStorage.removeItem('mms_meeting_types');
  localStorage.removeItem('mms_meetings');
  localStorage.removeItem('mms_attendees');
  localStorage.removeItem('mms_resolutions');
  localStorage.removeItem('mms_notifications');
  localStorage.removeItem('mms_audit_log');
  cache = { users: [], departments: [], meetingTypes: [], meetings: [], attendees: [], resolutions: [], notifications: [], auditLog: [] }; 
};