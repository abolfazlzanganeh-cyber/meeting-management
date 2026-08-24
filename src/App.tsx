import React from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import { Login } from '@/pages/Login';

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

function AppContent() {
  const { currentUser, loaded } = useApp();

  console.log('🔍 بررسی AppContent -> loaded:', loaded, 'currentUser:', currentUser);

  // ۱. اگر هنوز لود نشده، فقط این متن ساده را نشان بده
  if (!loaded) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Tahoma', fontSize: '18px', color: '#334155' }}>
        در حال بارگذاری داده‌ها...
      </div>
    );
  }

  // ۲. اگر لود شده ولی کاربری نیست، مستقیماً فرم لاگین را نشان بده
  if (!currentUser) {
    console.log('✅ نمایش فرم لاگین');
    return <Login />;
  }

  // ۳. اگر کاربر لاگین کرده، یک پیام ساده خوش‌آمدگویی نشان بده
  console.log('🎉 کاربر لاگین کرده:', currentUser.username);
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