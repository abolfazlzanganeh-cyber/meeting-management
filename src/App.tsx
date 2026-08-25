import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from '@/context/AppContext';
import { Layout } from '@/components/layout/Layout';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { Meetings } from '@/pages/Meetings';
import { MeetingDetail } from '@/pages/MeetingDetail';
import { AllMinutes } from '@/pages/AllMinutes';
import { Resolutions } from '@/pages/Resolutions';
import { ResolutionDetail } from '@/pages/ResolutionDetail';
import { MyResolutions } from '@/pages/MyResolutions';
import { UsersPage } from '@/pages/Users';
import { DepartmentsPage } from '@/pages/Departments';
import { Reports } from '@/pages/Reports';
import { Settings } from '@/pages/Settings';
import { GlobalSearch } from '@/components/GlobalSearch';

function AppContent() {
  const { currentUser, loaded } = useApp();

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">در حال بارگذاری سامانه...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) return <Login />;

  return (
    <>
      <GlobalSearch />
      <Routes>
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="meetings" element={<Meetings />} />
          <Route path="meetings/new" element={<div className="p-6 dark:text-white">فرم ایجاد جلسه (در حال توسعه)</div>} />
          <Route path="meetings/:id" element={<MeetingDetail />} />
          <Route path="all-minutes" element={<AllMinutes />} />
          <Route path="resolutions" element={<Resolutions />} />
          <Route path="resolutions/new" element={<div className="p-6 dark:text-white">فرم ایجاد مصوبه (در حال توسعه)</div>} />
          <Route path="resolutions/:filter" element={<Resolutions />} />
          <Route path="resolutions/detail/:id" element={<ResolutionDetail />} />
          <Route path="my-resolutions" element={<MyResolutions />} />
          <Route path="reports" element={<Reports />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="departments" element={<DepartmentsPage />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}