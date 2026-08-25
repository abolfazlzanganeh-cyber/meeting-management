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
  resolutions: Resolution[];
  notifications: Notification[];
  login: (username: string, password: string) => boolean;
  logout: () => void;
  // توابع عملیاتی
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  addMeeting: (meeting: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>) => void;
  addResolution: (res: Omit<Resolution, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateResolutionStatus: (id: string, status: string, progress: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [meetingTypes, setMeetingTypes] = useState<MeetingType[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
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

  // ===== توابع عملیاتی =====
  const addUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser = { ...userData, id: `u${Date.now()}`, createdAt: new Date().toISOString() } as User;
    const updated = [...(users || []), newUser];
    setUsers(updated);
    storage.setUsers(updated);
    // ارسال اعلان
    const newNotif = { id: `n${Date.now()}`, userId: newUser.id, title: 'حساب کاربری ایجاد شد', message: `نام کاربری شما: ${newUser.username}`, type: 'info' as const, isRead: false, createdAt: new Date().toISOString() };
    const updatedNotifs = [...(notifications || []), newNotif];
    setNotifications(updatedNotifs);
    storage.setNotifications(updatedNotifs);
  };

  const addMeeting = (meetingData: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newMeeting = { ...meetingData, id: `m${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Meeting;
    const updated = [...(meetings || []), newMeeting];
    setMeetings(updated);
    storage.setMeetings(updated);
  };

  const addResolution = (resData: Omit<Resolution, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newRes = { ...resData, id: `r${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Resolution;
    const updated = [...(resolutions || []), newRes];
    setResolutions(updated);
    storage.setResolutions(updated);
    
    // ارسال اعلان به مسئولین
    resData.assigneeIds.forEach(userId => {
      const notif = { id: `n${Date.now()}${Math.random()}`, userId, title: 'مصوبه جدید', message: `مصوبه "${resData.title}" به شما محول شد.`, type: 'assignment' as const, isRead: false, createdAt: new Date().toISOString(), link: `/resolutions/detail/${newRes.id}` };
      const currentNotifs = storage.getNotifications() || [];
      storage.setNotifications([...currentNotifs, notif]);
    });
    setNotifications(storage.getNotifications());
  };

  const updateResolutionStatus = (id: string, status: string, progress: number) => {
    const updated = (resolutions || []).map(r => r.id === id ? { ...r, status, progress, updatedAt: new Date().toISOString() } : r);
    setResolutions(updated);
    storage.setResolutions(updated);
  };

  if (!loaded) {
    return <div className="flex items-center justify-center h-screen bg-slate-50 text-slate-600">در حال بارگذاری سامانه...</div>;
  }

  return (
    <AppContext.Provider value={{
      currentUser, loaded, users, departments, meetingTypes, meetings, resolutions, notifications,
      login, logout, addUser, addMeeting, addResolution, updateResolutionStatus
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