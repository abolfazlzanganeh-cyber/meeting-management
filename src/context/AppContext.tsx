import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, Department, MeetingType, Meeting, Attendee, Resolution, Notification } from '@/types';
import * as storage from '@/lib/storage';
import { seedDatabase } from '@/lib/seed';

interface AppContextType {
  currentUser: User | null;
  loaded: boolean; // ✅ اضافه شد
  users: User[];
  departments: Department[];
  meetingTypes: MeetingType[];
  meetings: Meeting[];
  attendees: Attendee[];
  resolutions: Resolution[];
  notifications: Notification[];
  login: (username: string, password: string) => boolean;
  logout: () => void;
  refreshMeetings: () => void;
  refreshResolutions: () => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loaded, setLoaded] = useState(false); // ✅ اضافه شد
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

        if (isValidUser) {
          setCurrentUser(isValidUser);
        } else {
          storage.clearCurrentUser();
          setCurrentUser(null);
        }

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
    const allUsers = storage.getUsers() || [];
    const user = allUsers.find(u => u.username === username && u.password === password && u.isActive);
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

  if (!loaded) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f8fafc', fontFamily: 'Tahoma', fontSize: '18px', color: '#334155' }}>
        در حال بارگذاری داده‌ها...
      </div>
    );
  }

  return (
    <AppContext.Provider value={{
      currentUser, loaded, users, departments, meetingTypes, meetings, attendees, resolutions, notifications,
      login, logout, markNotificationRead, markAllNotificationsRead,
      refreshMeetings: () => setMeetings([...(storage.getMeetings() || [])]),
      refreshResolutions: () => setResolutions([...(storage.getResolutions() || [])]),
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