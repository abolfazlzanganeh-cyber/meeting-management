import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from '@/components/ui';
import * as storage from '@/lib/storage';
import { Save, RotateCcw } from 'lucide-react';

export function Settings() {
  const { meetingTypes, refreshMeetingTypes } = useApp();
  const [settings, setSettings] = useState(storage.getSettings());
  const [newType, setNewType] = useState({ name: '', color: '#3b82f6' });

  const handleSave = () => {
    storage.setSettings(settings);
    alert('تنظیمات ذخیره شد');
  };

  const handleAddMeetingType = () => {
    if (!newType.name) return;
    const all = storage.getMeetingTypes();
    const newT = {
      id: Date.now().toString(36),
      name: newType.name,
      color: newType.color,
      isActive: true,
    };
    storage.setMeetingTypes([...all, newT]);
    setNewType({ name: '', color: '#3b82f6' });
    refreshMeetingTypes();
  };

  const handleResetData = () => {
    if (!confirm('آیا از پاک کردن تمام داده‌ها مطمئن هستید؟ این عمل قابل بازگشت نیست!')) return;
    if (!confirm('آخرین تأیید: تمام اطلاعات پاک خواهد شد')) return;
    storage.clearAll();
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">تنظیمات</h1>
        <p className="text-sm text-slate-500 mt-1">پیکربندی سامانه</p>
      </div>

      <Card>
        <CardHeader><CardTitle>تنظیمات عمومی</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="پیشوند کد جلسه" value={settings.meetingCodePrefix} onChange={(e) => setSettings({ ...settings, meetingCodePrefix: e.target.value })} />
            <Input label="پیشوند کد مصوبه" value={settings.resolutionCodePrefix} onChange={(e) => setSettings({ ...settings, resolutionCodePrefix: e.target.value })} />
            <Input label="حداکثر حجم فایل (MB)" type="number" value={settings.maxFileSize} onChange={(e) => setSettings({ ...settings, maxFileSize: parseInt(e.target.value) })} />
            <Input label="روزهای هشدار سررسید" type="number" value={settings.overdueWarningDays} onChange={(e) => setSettings({ ...settings, overdueWarningDays: parseInt(e.target.value) })} />
          </div>
          <div className="mt-4">
            <Button onClick={handleSave}>
              <Save className="w-4 h-4" />
              ذخیره تنظیمات
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>انواع جلسه</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2 mb-4">
            {meetingTypes.map(t => (
              <div key={t.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: t.color }} />
                <span className="flex-1 text-sm">{t.name}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="نام نوع جدید"
              value={newType.name}
              onChange={(e) => setNewType({ ...newType, name: e.target.value })}
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
            <input
              type="color"
              value={newType.color}
              onChange={(e) => setNewType({ ...newType, color: e.target.value })}
              className="w-12 h-10 rounded-lg cursor-pointer"
            />
            <Button onClick={handleAddMeetingType}>افزودن</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>اطلاعات سیستم</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">نسخه:</span><span>1.0.0</span></div>
            <div className="flex justify-between"><span className="text-slate-500">ذخیره‌سازی:</span><span>localStorage</span></div>
            <div className="flex justify-between"><span className="text-slate-500">تعداد کاربران:</span><span>{storage.getUsers().length}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">تعداد جلسات:</span><span>{storage.getMeetings().length}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">تعداد مصوبات:</span><span>{storage.getResolutions().length}</span></div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200">
            <Button variant="danger" onClick={handleResetData}>
              <RotateCcw className="w-4 h-4" />
              پاک کردن تمام داده‌ها
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}