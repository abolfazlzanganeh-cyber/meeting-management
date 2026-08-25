import React, { useState } from 'react';
import * as storage from '@/lib/storage';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';
import { Save, Settings as SettingsIcon } from 'lucide-react';

export function Settings() {
  // خواندن مستقیم و ایمن از storage (بدون وابستگی به AppContext)
  const [settings, setSettings] = useState(storage.getSettings());
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    storage.setSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">تنظیمات سامانه</h1>
        <p className="text-sm text-slate-500 mt-1">تنظیمات عمومی سیستم مدیریت جلسات و مصوبات</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5" />
            تنظیمات کدها
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">پیشوند کد جلسات</label>
            <input type="text" value={settings.meetingCodePrefix}
              onChange={(e) => setSettings({ ...settings, meetingCodePrefix: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">پیشوند کد مصوبات</label>
            <input type="text" value={settings.resolutionCodePrefix}
              onChange={(e) => setSettings({ ...settings, resolutionCodePrefix: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>تنظیمات فایل‌ها</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">حداکثر حجم فایل (مگابایت)</label>
            <input type="number" value={settings.maxFileSize}
              onChange={(e) => setSettings({ ...settings, maxFileSize: parseInt(e.target.value) || 10 })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">انواع فایل مجاز (با کاما جدا کنید)</label>
            <input type="text" value={settings.allowedFileTypes.join(', ')}
              onChange={(e) => setSettings({ ...settings, allowedFileTypes: e.target.value.split(',').map(s => s.trim()) })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>تنظیمات یادآوری و مهلت</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">روزهای یادآوری (با کاما جدا کنید)</label>
            <input type="text" value={settings.reminderDays.join(', ')}
              onChange={(e) => setSettings({ ...settings, reminderDays: e.target.value.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n)) })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500" />
            <p className="text-xs text-slate-500 mt-1">مثال: 7, 3, 1, 0</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">هشدار تأخیر (روز)</label>
              <input type="number" value={settings.overdueWarningDays}
                onChange={(e) => setSettings({ ...settings, overdueWarningDays: parseInt(e.target.value) || 3 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">تأخیر بحرانی (روز)</label>
              <input type="number" value={settings.overdueCriticalDays}
                onChange={(e) => setSettings({ ...settings, overdueCriticalDays: parseInt(e.target.value) || 7 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="sticky bottom-4 bg-white p-4 rounded-lg shadow-lg border flex items-center justify-between z-30">
        {saved && <span className="text-green-600 font-medium text-sm">✅ تنظیمات با موفقیت ذخیره شد</span>}
        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 mr-auto">
          <Save className="w-4 h-4 ml-2" />
          ذخیره تنظیمات
        </Button>
      </div>
    </div>
  );
}