import type { User, Department, MeetingType, Meeting, Resolution } from '@/types';
import { todayJalali, toGregorian } from './date';
import * as storage from './storage';

export async function seedDatabase() {
  console.log('🌱 Seeding database...');
  
  storage.setDepartments([
    { id: 'd1', name: 'مدیریت پروژه', code: 'PM', description: '', isActive: true },
    { id: 'd2', name: 'تولید', code: 'PROD', description: '', isActive: true },
    { id: 'd3', name: 'تعمیرات', code: 'MNT', description: '', isActive: true },
    { id: 'd4', name: 'فنی و مهندسی', code: 'ENG', description: '', isActive: true },
    { id: 'd5', name: 'HSE', code: 'HSE', description: '', isActive: true },
    { id: 'd6', name: 'منابع انسانی', code: 'HR', description: '', isActive: true },
    { id: 'd7', name: 'پیمانکار مکانیک', code: 'CON-M', description: '', isActive: true },
    { id: 'd8', name: 'پیمانکار برق', code: 'CON-E', description: '', isActive: true },
  ]);

  storage.setMeetingTypes([
    { id: 'mt1', name: 'جلسه کارگاهی', color: '#3b82f6', isActive: true },
    { id: 'mt2', name: 'جلسه HSE', color: '#ef4444', isActive: true },
    { id: 'mt3', name: 'جلسه تولید', color: '#10b981', isActive: true },
    { id: 'mt4', name: 'جلسه فنی', color: '#8b5cf6', isActive: true },
    { id: 'mt5', name: 'جلسه هماهنگی پیمانکاران', color: '#f59e0b', isActive: true },
  ]);

  storage.setUsers([
    { id: 'u1', username: 'admin', password: 'admin123', firstName: 'مدیر', lastName: 'سیستم', personnelCode: '1001', departmentId: 'd1', position: 'مدیر پروژه', role: 'super_admin', partyType: 'employer', isActive: true, createdAt: new Date().toISOString() },
    { id: 'u2', username: 'manager', password: '123456', firstName: 'علی', lastName: 'محمدی', personnelCode: '1002', departmentId: 'd1', position: 'مدیر عامل', role: 'manager', partyType: 'employer', isActive: true, createdAt: new Date().toISOString() },
    { id: 'u3', username: 'secretary', password: '123456', firstName: 'فاطمه', lastName: 'احمدی', personnelCode: '1003', departmentId: 'd1', position: 'دبیر جلسات', role: 'secretary', partyType: 'employer', isActive: true, createdAt: new Date().toISOString() },
    { id: 'u4', username: 'rezaei', password: '123456', firstName: 'محمد', lastName: 'رضایی', personnelCode: '2001', departmentId: 'd2', position: 'سرپرست تولید', role: 'assignee', partyType: 'employer', isActive: true, createdAt: new Date().toISOString() },
    { id: 'u5', username: 'hosseini', password: '123456', firstName: 'حسین', lastName: 'حسینی', personnelCode: '3001', departmentId: 'd3', position: 'مدیر تعمیرات', role: 'assignee', partyType: 'employer', isActive: true, createdAt: new Date().toISOString() },
    { id: 'u6', username: 'karimi', password: '123456', firstName: 'زهرا', lastName: 'کریمی', personnelCode: '5001', departmentId: 'd5', position: 'کارشناس HSE', role: 'assignee', partyType: 'employer', isActive: true, createdAt: new Date().toISOString() },
    { id: 'u7', username: 'norouzi', password: '123456', firstName: 'امیر', lastName: 'نوروزی', personnelCode: '4001', departmentId: 'd4', position: 'مهندس فنی', role: 'supervisor', partyType: 'employer', isActive: true, createdAt: new Date().toISOString() },
    { id: 'u8', username: 'contractor1', password: '123456', firstName: 'رضا', lastName: 'پیمانکار', personnelCode: '7001', departmentId: 'd7', position: 'سرپرست پیمانکار مکانیک', role: 'assignee', partyType: 'contractor', isActive: true, createdAt: new Date().toISOString() },
    { id: 'u9', username: 'contractor2', password: '123456', firstName: 'سعید', lastName: 'برقکار', personnelCode: '8001', departmentId: 'd8', position: 'سرپرست پیمانکار برق', role: 'assignee', partyType: 'contractor', isActive: true, createdAt: new Date().toISOString() },
  ]);

  const today = todayJalali();
  storage.setMeetings([
    {
      id: 'm1', code: 'MTG-1405-001', title: 'جلسه هماهنگی کارگاهی',
      date: today, gregorianDate: toGregorian(today),
      startTime: '09:00', endTime: '11:00', location: 'اتاق جلسات',
      typeId: 'mt1', departmentId: 'd1', chairmanId: 'u2', secretaryId: 'u3',
      status: 'held', subject: 'بررسی پیشرفت',
      minuteRows: [
        { id: 'mr1', rowNumber: 1, description: 'تعمیر دستگاه CNC', actionRequired: 'تعویض بلبرینگ', assigneeType: 'user', assigneeId: 'u5', assigneeName: 'حسین حسینی', dueDate: '1405/06/05', notes: '', attachments: [], status: 'in_progress', progress: 65 },
      ],
      attendeeGroups: [
        { partyType: 'employer', attendees: [{ id: 'a1', userId: 'u2', name: 'علی محمدی', departmentId: 'd1', position: 'مدیر عامل', partyType: 'employer', status: 'present', isGuest: false }] },
      ],
      generalNotes: '', attachments: [], createdBy: 'u3', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), isArchived: false,
    },
  ]);

  storage.setResolutions([
    { id: 'r1', code: 'RES-1405-001', meetingId: 'm1', title: 'تعمیر دستگاه CNC', description: '', expectedAction: '', priority: 'high', assigneeIds: ['u5'], departmentId: 'd3', startDate: today, dueDate: '1405/06/05', progress: 65, status: 'in_progress', tags: [], attachments: [], comments: [], progressHistory: [], approvalHistory: [], timeline: [], createdBy: 'u3', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), isArchived: false },
  ]);

  console.log('✅ Seeding complete');
}