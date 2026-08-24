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
        // این خط حیاتی است: تحت هر شرایطی لودینگ را تمام کن
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