import React from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import { Login } from '@/pages/Login';

function AppContent() {
  const { currentUser, loaded } = useApp();

  console.log('📊 AppContent render - loaded:', loaded, 'currentUser:', currentUser?.username);

  if (!loaded) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f8fafc', fontFamily: 'Tahoma', fontSize: '18px', color: '#334155' }}>
        در حال بارگذاری داده‌ها...
      </div>
    );
  }

  if (!currentUser) {
    console.log('🟢 نمایش فرم لاگین');
    return <Login />;
  }

  console.log('🟢 کاربر لاگین کرده:', currentUser.username);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Tahoma' }}>
      <h1 style={{ color: '#16a34a' }}>✅ ورود موفقیت‌آمیز!</h1>
      <p>خوش آمدید، {currentUser.firstName} {currentUser.lastName}</p>
      <button 
        onClick={() => window.location.reload()}
        style={{ marginTop: '1rem', padding: '0.5rem 1rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Tahoma' }}
      >
        خروج از سیستم
      </button>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}