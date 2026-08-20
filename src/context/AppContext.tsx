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
  refreshMeetings: () => void;
  refreshResolutions: () => void;
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
    const init = async () => {
      // بارگذاری از Supabase
      await storage.loadAllData();
      
      // اگر خالی بود، seed کن
      if (storage.getUsers().length === 0) {
        await seedDatabase();
        await storage.loadAllData();
      }

      setCurrentUser(storage.getCurrentUser());
      setUsers(storage.getUsers());
      setDepartments(storage.getDepartments());
      setMeetingTypes(storage.getMeetingTypes());
      setMeetings(storage.getMeetings());
      setAttendees(storage.getAttendees());
      setResolutions(storage.getResolutions());
      setNotifications(storage.getNotifications());
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

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">در حال اتصال به سرور...</p>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{
      currentUser, users, departments, meetingTypes, meetings, attendees, resolutions, notifications,
      login, logout,
      refreshMeetings: () => setMeetings([...storage.getMeetings()]),
      refreshResolutions: () => setResolutions([...storage.getResolutions()]),
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