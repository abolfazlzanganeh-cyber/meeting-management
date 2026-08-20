import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, Department, MeetingType, Meeting, Attendee, Resolution, Notification } from '@/types';
import * as storage from '@/lib/storage';
import { supabase } from '@/lib/supabase';

// ... (تعریف AppContextType دقیقاً مثل قبل)
const AppContext = createContext<any>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loaded, setLoaded] = useState(false);
  // ... (سایر stateها)

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      await storage.loadAllData(); // فقط خواندن، بدون نوشتن/Seed
      
      if (session?.user?.email) {
        const allUsers = storage.getUsers();
        const user = allUsers.find((u: any) => u.email === session.user?.email);
        if (user) {
          setCurrentUser(user);
          storage.setCurrentUser(user);
        }
      }
      setLoaded(true);

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
          storage.clearCurrentUser();
        }
      });
      return () => subscription.unsubscribe();
    };
    init();
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return !error && !!data.user;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    storage.clearCurrentUser();
  };

  if (!loaded) return <div className="flex h-screen items-center justify-center">در حال بارگذاری امن...</div>;

  return (
    <AppContext.Provider value={{ currentUser, login, logout /* و سایر مقادیر */ }}>
      {children}
    </AppContext.Provider>
  );
}
export const useApp = () => useContext(AppContext);