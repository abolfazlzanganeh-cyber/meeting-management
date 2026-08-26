export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type MeetingStatus = 'scheduled' | 'held' | 'cancelled' | 'postponed' | 'drafting' | 'finalized';
export type ResolutionStatus = 'pending' | 'in_progress' | 'completed' | 'overdue' | 'cancelled' | 'needs_approval';
export type AttendanceStatus = 'present' | 'absent' | 'mission' | 'leave' | 'online';
export type UserRole = 'super_admin' | 'admin' | 'manager' | 'secretary' | 'assignee' | 'supervisor' | 'approver' | 'viewer';
export type PartyType = 'employer' | 'contractor';
export type AssigneeType = 'user' | 'manual';

// ✅ اضافه شدن WorkflowStep
export interface WorkflowStep {
  id: string;
  order: number;
  title: string;
  assigneeId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  completedAt?: string;
  completedBy?: string;
  comments?: string;
}

export interface User {
  id: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  personnelCode: string;
  email?: string;
  phone?: string;
  departmentId: string;
  position: string;
  role: UserRole;
  partyType?: PartyType;
  isActive: boolean;
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
}

export interface MeetingType {
  id: string;
  name: string;
  color: string;
  isActive: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface MinuteRow {
  id: string;
  rowNumber: number;
  description: string;
  actionRequired: string;
  assigneeType: AssigneeType;
  assigneeId?: string;
  assigneeName: string;
  assigneeDepartment?: string;
  assigneePhone?: string;
  dueDate: string;
  notes: string;
  attachments: Attachment[];
  status: 'new' | 'in_progress' | 'completed' | 'cancelled' | 'delayed';
  progress: number;
}

export interface Attendee {
  id: string;
  userId?: string;
  name: string;
  departmentId?: string;
  position: string;
  partyType: PartyType;
  status: AttendanceStatus;
  isGuest: boolean;
}

export interface AttendeeGroup {
  partyType: PartyType;
  attendees: Attendee[];
}

export interface Meeting {
  id: string;
  code: string;
  title: string;
  date: string;
  gregorianDate: string;
  startTime: string;
  endTime?: string;
  location: string;
  typeId: string;
  departmentId: string;
  chairmanId: string;
  secretaryId: string;
  status: MeetingStatus;
  subject: string;
  minuteRows: MinuteRow[];
  attendeeGroups: AttendeeGroup[];
  generalNotes: string;
  attachments: Attachment[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
}

export interface Resolution {
  id: string;
  code: string;
  meetingId: string;
  title: string;
  description: string;
  expectedAction: string;
  priority: Priority;
  assigneeIds: string[];
  departmentId: string;
  startDate: string;
  dueDate: string;
  progress: number;
  status: ResolutionStatus;
  tags: string[];
  attachments: Attachment[];
  comments: any[];
  progressHistory: any[];
  approvalHistory: any[];
  timeline: any[];
  // ✅ اضافه شدن فیلدهای workflow
  workflow?: WorkflowStep[];
  currentWorkflowStep?: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'assignment';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface SystemSettings {
  meetingCodePrefix: string;
  resolutionCodePrefix: string;
  maxFileSize: number;
  allowedFileTypes: string[];
  reminderDays: number[];
  overdueWarningDays: number;
  overdueCriticalDays: number;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: 'created' | 'updated' | 'deleted' | 'status_changed' | 'assigned' | 'deadline_changed' | 'approved' | 'rejected';
  entityType: 'meeting' | 'minute_row' | 'attendee' | 'resolution';
  entityId: string;
  entityName: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  description: string;
  metadata?: Record<string, any>;
}