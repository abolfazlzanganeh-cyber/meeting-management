import React, { useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { Button, Modal } from '@/components/ui';
import { Download, Upload, Database, CheckCircle } from 'lucide-react';
import * as storage from '@/lib/storage';

interface BackupManagerProps {
  open: boolean;
  onClose: () => void;
}

export function BackupManager({ open, onClose }: BackupManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { refreshUsers, refreshMeetings, refreshResolutions, refreshDepartments, refreshMeetingTypes, refreshNotifications } = useApp();

  const handleExport = () => {
    const backup = {
      version: '3.0',
      exportDate: new Date().toISOString(),
      data: {
        users: storage.getUsers(),
        departments: storage.getDepartments(),
        meetingTypes: storage.getMeetingTypes(),
        meetings: storage.getMeetings(),
        attendees: storage.getAttendees(),
        resolutions: storage.getResolutions(),
        notifications: storage.getNotifications(),
        settings: storage.getSettings(),
      },
      stats: {
        users: storage.getUsers().length,
        meetings: storage.getMeetings().length,
        resolutions: storage.getResolutions().length,
      },
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const backup = JSON.parse(evt.target?.result as string);
        if (!backup.data) throw new Error('فایل نامعتبر است');

        if (!confirm(`آیا از بازگردانی این پشتیبان مطمئن هستید؟\n\nآمار:\n- ${backup.stats?.users || 0} کاربر\n- ${backup.stats?.meetings || 0} جلسه\n- ${backup.stats?.resolutions || 0} مصوبه\n\nتمام داده‌های فعلی جایگزین خواهند شد.`)) {
          return;
        }

        const d = backup.data;
        if (d.users) storage.setUsers(d.users);
        if (d.departments) storage.setDepartments(d.departments);
        if (d.meetingTypes) storage.setMeetingTypes(d.meetingTypes);
        if (d.meetings) storage.setMeetings(d.meetings);
        if (d.attendees) storage.setAttendees(d.attendees);
        if (d.resolutions) storage.setResolutions(d.resolutions);
        if (d.notifications) storage.setNotifications(d.notifications);
        if (d.settings) storage.setSettings(d.settings);

        refreshUsers();
        refreshDepartments();
        refreshMeetingTypes();
        refreshMeetings();
        refreshNotifications();

        alert('✅ پشتیبان با موفقیت بازگردانی شد!');
        onClose();
      } catch (err) {
        alert('❌ خطا در خواندن فایل: ' + (err as Error).message);
      }
    };
    reader.readAsText(file);
  };

  const handleClearAll = () => {
    if (!confirm('⚠️ آیا از پاک کردن تمام داده‌ها مطمئن هستید؟ این عمل قابل بازگشت نیست!')) return;
    if (!confirm('⚠️ آخرین تأیید: تمام اطلاعات حذف خواهد شد!')) return;
    storage.clearAll();
    window.location.reload();
  };

  return (
    <Modal open={open} onClose={onClose} title="مدیریت پشتیبان‌گیری" size="md" footer={
      <Button variant="outline" onClick={onClose}>بستن</Button>
    }>
      <div className="space-y-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Database className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900 dark:text-blue-200">پشتیبان‌گیری و بازگردانی</h3>
          </div>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            از تمام داده‌های سیستم (کاربران، جلسات، مصوبات) پشتیبان بگیرید یا پشتیبان قبلی را بازگردانید.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleExport}
            className="flex flex-col items-center gap-2 p-6 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
          >
            <Download className="w-8 h-8 text-green-600" />
            <span className="font-semibold text-green-700 dark:text-green-300">خروجی پشتیبان</span>
            <span className="text-xs text-green-600 dark:text-green-400">دانلود فایل JSON</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-2 p-6 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            <Upload className="w-8 h-8 text-blue-600" />
            <span className="font-semibold text-blue-700 dark:text-blue-300">بازگردانی پشتیبان</span>
            <span className="text-xs text-blue-600 dark:text-blue-400">بارگذاری فایل JSON</span>
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />

        <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">آمار فعلی:</h4>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{storage.getUsers().length}</div>
              <div className="text-xs text-slate-500">کاربر</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{storage.getMeetings().length}</div>
              <div className="text-xs text-slate-500">جلسه</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{storage.getResolutions().length}</div>
              <div className="text-xs text-slate-500">مصوبه</div>
            </div>
          </div>
        </div>

        <div className="border-t border-red-200 dark:border-red-900 pt-4">
          <button
            onClick={handleClearAll}
            className="w-full flex items-center justify-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            <span className="text-sm font-medium">🗑️ پاک کردن تمام داده‌ها</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}