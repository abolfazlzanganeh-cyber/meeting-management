import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from '@/context/AppContext';
import { Layout } from '@/components/layout/Layout';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { Meetings } from '@/pages/Meetings';
import { MeetingDetail } from '@/pages/MeetingDetail';
import { NewMeeting } from '@/pages/NewMeeting';
import { AllMinutes } from '@/pages/AllMinutes';
import { Resolutions } from '@/pages/Resolutions';
import { ResolutionDetail } from '@/pages/ResolutionDetail';
import { NewResolution } from '@/pages/NewResolution';
import { MyResolutions } from '@/pages/MyResolutions';
import { UsersPage } from '@/pages/Users';
import { DepartmentsPage } from '@/pages/Departments';
import { Reports } from '@/pages/Reports';
import { Settings } from '@/pages/Settings';

function AppContent() {
  const { currentUser } = useApp();

  if (!currentUser) return <Login />;

  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="meetings" element={<Meetings />} />
        <Route path="meetings/new" element={<NewMeeting />} />
        <Route path="meetings/:id" element={<MeetingDetail />} />
        <Route path="all-minutes" element={<AllMinutes />} />
        <Route path="resolutions" element={<Resolutions />} />
        <Route path="resolutions/new" element={<NewResolution />} />
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
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}