import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '@/types';
import * as storage from '@/lib/storage';
import { seedDatabase } from '@/lib/seed';

interface AppContextType {
  currentUser: User | null;
  loaded: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await storage.loadAllData();
        
        if (storage.getUsers().length === 0) {
          await seedDatabase();
          await storage.loadAllData();
        }

        // بررسی کاربر ذخیره شده
        const savedUser = storage.getCurrentUser();
        if (savedUser) {
          setCurrentUser(savedUser);
        }
      } catch (error) {
        console.error('❌ Init error:', error);
      } finally {
        setLoaded(true);
      }
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

  return (
    <AppContext.Provider value={{ currentUser, loaded, login, logout }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}