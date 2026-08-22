import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from '@/context/AppContext';
import { Layout } from '@/components/layout/Layout';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
// سایر ایمپورت‌های صفحات را در صورت نیاز اضافه کنید

function AppContent() {
  const { currentUser, loaded } = useApp();

  // ۱. اگر هنوز در حال لود است، اسپینر را نشان بده (با متن برای اطمینان)
  if (!loaded) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f8fafc', fontFamily: 'Tahoma' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '4px solid #e2e8f0', borderTopColor: '#2563eb', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ marginRight: '1rem', color: '#64748b' }}>در حال بارگذاری داده‌ها...</p>
      </div>
    );
  }

  // ۲. اگر لود شده ولی کاربری لاگین نکرده، مستقیماً Login را نشان بده (بدون ریدایرکت روتر)
  if (!currentUser) {
    return <Login />;
  }

  // ۳. اگر لود شده و کاربر لاگین کرده، برنامه اصلی را نشان بده
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        {/* سایر مسیرها را می‌توانید اینجا اضافه کنید */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}