import React from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import { Login } from '@/pages/Login';

function AppContent() {
  const { loaded } = useApp();
  
  if (!loaded) {
    return <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'Tahoma' }}>در حال بارگذاری داده‌ها...</div>;
  }
  
  // حذف کامل روتر برای تست: فقط لاگین را نشان بده
  return <Login />;
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}