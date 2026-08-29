import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, Department, MeetingType, Meeting, Resolution, Notification } from '@/types';
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
  addMeeting: (meetingData: any) => string;
  addResolution: (resData: any) => void;
  updateResolution: (id: string, data: any) => void;
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

  // ✅ تابع ثبت جلسه با دیباگ کامل
  const addMeeting = (meetingData: any): string => {
    console.log('🔵 شروع addMeeting');
    console.log('🔵 داده ورودی:', meetingData);
    
    const newId = `m${Date.now()}`;
    console.log('🔵 ID تولید شده:', newId);
    
    const newMeeting = {
      ...meetingData,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    console.log('🔵 جلسه جدید:', newMeeting);
    
    const updatedMeetings = [...(meetings || []), newMeeting];
    console.log('🔵 تعداد جلسات قبل:', meetings?.length || 0);
    console.log('🔵 تعداد جلسات بعد:', updatedMeetings.length);
    
    setMeetings(updatedMeetings);
    storage.setMeetings(updatedMeetings);
    
    console.log('✅ جلسه با موفقیت اضافه شد. ID:', newId);
    
    return newId;
  };

  // ✅ تابع ثبت مصوبه با دیباگ کامل
  const addResolution = (resData: any) => {
    console.log('🔵 شروع addResolution');
    console.log('🔵 داده ورودی:', resData);
    
    const newRes = {
      ...resData,
      id: `r${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    console.log('🔵 مصوبه جدید:', newRes);
    
    const updatedRes = [...(resolutions || []), newRes];
    console.log('🔵 تعداد مصوبات قبل:', resolutions?.length || 0);
    console.log('🔵 تعداد مصوبات بعد:', updatedRes.length);
    
    setResolutions(updatedRes);
    storage.setResolutions(updatedRes);
    
    console.log('✅ مصوبه با موفقیت اضافه شد. ID:', newRes.id);
  };

  const updateResolution = (id: string, data: any) => {
    const updated = (resolutions || []).map(r => r.id === id ? { ...r, ...data, updatedAt: new Date().toISOString() } : r);
    setResolutions(updated);
    storage.setResolutions(updated);
  };

  if (!loaded) {
    return <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300">در حال بارگذاری سامانه...</div>;
  }

  return (
    <AppContext.Provider value={{
      currentUser, loaded, users, departments, meetingTypes, meetings, resolutions, notifications,
      login, logout, addMeeting, addResolution, updateResolution
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