import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, Department, MeetingType, Meeting, Attendee, Resolution, Notification } from '@/types';
import * as storage from '@/lib/storage';
import { seedDatabase } from '@/lib/seed';

interface AppContextType {
  currentUser: User | null;
  loaded: boolean;
  users: User[];
  departments: Department[];
  meetingTypes: MeetingType[];
  meetings: Meeting[];
  attendees: Attendee[];
  resolutions: Resolution[];
  notifications: Notification[];
  login: (username: string, password: string) => boolean;
  logout: () => void;
  // مدیریت کاربران
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
  // مدیریت جلسات
  addMeeting: (meeting: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateMeeting: (id: string, meeting: Partial<Meeting>) => void;
  deleteMeeting: (id: string) => void;
  // مدیریت مصوبات
  addResolution: (resolution: Omit<Resolution, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateResolution: (id: string, resolution: Partial<Resolution>) => void;
  deleteResolution: (id: string) => void;
  // اعلان‌ها
  addNotification: (notif: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  // تنظیمات
  getSettings: () => any;
  saveSettings: (settings: any) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [meetingTypes, setMeetingTypes] = useState<MeetingType[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [resolutions, setResolutions] = useState<Resolution[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const init = async () => {
      try {
        await storage.loadAllData();
        if (storage.getUsers().length === 0) {
          await seedDatabase();
          await storage.loadAllData();
        }
        const savedUser = storage.getCurrentUser();
        const allUsers = storage.getUsers() || [];
        const isValidUser = savedUser && allUsers.find(u => u.id === savedUser.id && u.isActive);
        if (isValidUser) setCurrentUser(isValidUser);
        else { storage.clearCurrentUser(); setCurrentUser(null); }

        setUsers(allUsers);
        setDepartments(storage.getDepartments() || []);
        setMeetingTypes(storage.getMeetingTypes() || []);
        setMeetings(storage.getMeetings() || []);
        setAttendees(storage.getAttendees() || []);
        setResolutions(storage.getResolutions() || []);
        setNotifications(storage.getNotifications() || []);
      } catch (error) {
        console.error('❌ Init error:', error);
      } finally {
        setLoaded(true);
      }
    };
    init();
  }, []);

  const login = (username: string, password: string): boolean => {
    const user = (users || []).find(u => u.username === username && u.password === password && u.isActive);
    if (user) { storage.setCurrentUser(user); setCurrentUser(user); return true; }
    return false;
  };

  const logout = () => { storage.clearCurrentUser(); setCurrentUser(null); };

  // ===== مدیریت کاربران =====
  const addUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = { ...userData, id: `u${Date.now()}`, createdAt: new Date().toISOString() } as User;
    const updated = [...(users || []), newUser];
    setUsers(updated);
    storage.setUsers(updated);
    addNotification({
      userId: newUser.id,
      title: 'ایجاد حساب کاربری',
      message: `حساب شما در سامانه مدیریت جلسات ایجاد شد. نام کاربری: ${newUser.username}`,
      type: 'success',
    });
  };

  const updateUser = (id: string, userData: Partial<User>) => {
    const updated = (users || []).map(u => u.id === id ? { ...u, ...userData } : u);
    setUsers(updated);
    storage.setUsers(updated);
  };

  const deleteUser = (id: string) => {
    const updated = (users || []).filter(u => u.id !== id);
    setUsers(updated);
    storage.setUsers(updated);
  };

  // ===== مدیریت جلسات =====
  const addMeeting = (meetingData: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>): string => {
    const newMeeting: Meeting = {
      ...meetingData,
      id: `m${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Meeting;
    const updated = [...(meetings || []), newMeeting];
    setMeetings(updated);
    storage.setMeetings(updated);

    // ارسال اعلان به حاضرین
    (meetingData.attendeeGroups || []).forEach(group => {
      group.attendees.forEach(att => {
        if (att.userId) {
          addNotification({
            userId: att.userId,
            title: 'جلسه جدید',
            message: `شما به جلسه "${meetingData.title}" در تاریخ ${meetingData.date} دعوت شده‌اید`,
            type: 'info',
            link: `/meetings/${newMeeting.id}`,
          });
        }
      });
    });
    return newMeeting.id;
  };

  const updateMeeting = (id: string, meetingData: Partial<Meeting>) => {
    const updated = (meetings || []).map(m => m.id === id ? { ...m, ...meetingData, updatedAt: new Date().toISOString() } : m);
    setMeetings(updated);
    storage.setMeetings(updated);
  };

  const deleteMeeting = (id: string) => {
    const updated = (meetings || []).filter(m => m.id !== id);
    setMeetings(updated);
    storage.setMeetings(updated);
  };

  // ===== مدیریت مصوبات =====
  const addResolution = (resData: Omit<Resolution, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newRes: Resolution = {
      ...resData,
      id: `r${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Resolution;
    const updated = [...(resolutions || []), newRes];
    setResolutions(updated);
    storage.setResolutions(updated);

    // ارسال اعلان به مسئولین
    (resData.assigneeIds || []).forEach(userId => {
      addNotification({
        userId,
        title: 'مصوبه جدید محول شد',
        message: `مصوبه "${resData.title}" به شما محول شد. مهلت: ${resData.dueDate}`,
        type: 'assignment',
        link: `/resolutions/detail/${newRes.id}`,
      });
    });
  };

  const updateResolution = (id: string, resData: Partial<Resolution>) => {
    const updated = (resolutions || []).map(r => r.id === id ? { ...r, ...resData, updatedAt: new Date().toISOString() } : r);
    setResolutions(updated);
    storage.setResolutions(updated);
  };

  const deleteResolution = (id: string) => {
    const updated = (resolutions || []).filter(r => r.id !== id);
    setResolutions(updated);
    storage.setResolutions(updated);
  };

  // ===== اعلان‌ها =====
  const addNotification = (notifData: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
    const newNotif: Notification = {
      ...notifData,
      id: `n${Date.now()}${Math.random()}`,
      createdAt: new Date().toISOString(),
      isRead: false,
    } as Notification;
    const updated = [...(notifications || []), newNotif];
    setNotifications(updated);
    storage.setNotifications(updated);
  };

  const markNotificationRead = (id: string) => {
    const updated = (notifications || []).map(n => n.id === id ? { ...n, isRead: true } : n);
    setNotifications(updated);
    storage.setNotifications(updated);
  };

  const markAllNotificationsRead = () => {
    const updated = (notifications || []).map(n => ({ ...n, isRead: true }));
    setNotifications(updated);
    storage.setNotifications(updated);
  };

  // ===== تنظیمات =====
  const getSettings = () => storage.getSettings();
  const saveSettings = (settings: any) => storage.setSettings(settings);

  if (!loaded) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f8fafc', fontFamily: 'Tahoma', fontSize: '18px' }}>
        در حال بارگذاری داده‌ها...
      </div>
    );
  }

  return (
    <AppContext.Provider value={{
      currentUser, loaded, users, departments, meetingTypes, meetings, attendees, resolutions, notifications,
      login, logout,
      addUser, updateUser, deleteUser,
      addMeeting, updateMeeting, deleteMeeting,
      addResolution, updateResolution, deleteResolution,
      addNotification, markNotificationRead, markAllNotificationsRead,
      getSettings, saveSettings,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}