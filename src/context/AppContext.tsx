import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, Department, MeetingType, Meeting, Attendee, Resolution, Notification } from '@/types';
import * as storage from '@/lib/storage';
import { seedDatabase } from '@/lib/seed';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  departments: Department[];
  meetingTypes: MeetingType[];
  meetings: Meeting[];
  attendees: Attendee[];
  resolutions: Resolution[];
  notifications: Notification[];
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [meetingTypes, setMeetingTypes] = useState<MeetingType[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [resolutions, setResolutions] = useState<Resolution[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    console.log('🔵 شروع useEffect');
    
    const init = async () => {
      console.log('🔵 شروع init');
      
      try {
        console.log('🔵 قبل از loadAllData');
        await storage.loadAllData();
        console.log('🔵 بعد از loadAllData');
        
        if (storage.getUsers().length === 0) {
          console.log('🔵 دیتابیس خالی، شروع seed');
          await seedDatabase();
          await storage.loadAllData();
          console.log('🔵 بعد از seed');
        }

        // تنظیم currentUser - بسیار ساده
        console.log('🔵 تنظیم currentUser');
        const savedUser = storage.getCurrentUser();
        if (savedUser) {
          setCurrentUser(savedUser);
        }

        // تنظیم بقیه state ها - یکی یکی
        console.log('🔵 تنظیم users');
        setUsers(storage.getUsers());
        
        console.log('🔵 تنظیم departments');
        setDepartments(storage.getDepartments());
        
        console.log('🔵 تنظیم meetingTypes');
        setMeetingTypes(storage.getMeetingTypes());
        
        console.log('🔵 تنظیم meetings');
        setMeetings(storage.getMeetings());
        
        console.log('🔵 تنظیم attendees');
        setAttendees(storage.getAttendees());
        
        console.log('🔵 تنظیم resolutions');
        setResolutions(storage.getResolutions());
        
        console.log('🔵 تنظیم notifications');
        setNotifications(storage.getNotifications());
        
        console.log('🟢 همه state ها تنظیم شدند');
        
      } catch (error) {
        console.error('❌ خطای بحرانی در init:', error);
      }
      
      console.log('🚀 تنظیم loaded به true');
      setLoaded(true);
    };
    
    init();
  }, []);

  const login = (username: string, password: string): boolean => {
    const user = storage.getUsers().find(u => u.username === username && u.password === password && u.isActive);
    if (user) {
      storage.setCurrentUser(user);
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    storage.clearCurrentUser();
    setCurrentUser(null);
  };

  console.log('📊 render AppProvider - loaded:', loaded, 'currentUser:', currentUser?.username);

  if (!loaded) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f8fafc', fontFamily: 'Tahoma', fontSize: '18px', color: '#334155' }}>
        در حال اتصال به سرور و بارگذاری داده‌ها...
      </div>
    );
  }

  return (
    <AppContext.Provider value={{
      currentUser, users, departments, meetingTypes, meetings, attendees, resolutions, notifications,
      login, logout
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