import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import { todayJalali } from '@/lib/date';
import { toPersianNumber } from '@/lib/utils';

export function NewResolution() {
  const navigate = useNavigate();
  const { meetings, departments, users, currentUser, addResolution } = useApp();

  const [formData, setFormData] = useState({
    title: '', description: '', expectedAction: '',
    priority: 'medium' as const,
    meetingId: '',
    departmentId: (departments || [])[0]?.id || '',
    assigneeIds: [] as string[],
    startDate: todayJalali(),
    dueDate: todayJalali(),
  });

  const toggleAssignee = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      assigneeIds: prev.assigneeIds.includes(userId)
        ? prev.assigneeIds.filter(id => id !== userId)
        : [...prev.assigneeIds, userId]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.assigneeIds.length === 0) {
      alert('❌ حداقل یک مسئول اجرا باید انتخاب شود');
      return;
    }
    addResolution({
      code: `RES-${Date.now()}`,
      ...formData,
      progress: 0,
      status: 'pending',
      tags: [],
      attachments: [],
      comments: [],
      progressHistory: [],
      approvalHistory: [],
      timeline: [],
      createdBy: currentUser?.id || '',
      isArchived: false,
    } as any);

    alert(`✅ مصوبه ایجاد شد و اعلان برای ${formData.assigneeIds.length} نفر از مسئولین ارسال گردید`);
    navigate('/resolutions');
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button onClick={() => navigate('/resolutions')} variant="outline">
          <ArrowLeft className="w-4 h-4 ml-2" />
          بازگشت
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">ایجاد مصوبه جدید</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">پس از ثبت، اعلان برای مسئولین ارسال می‌شود</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>اطلاعات مصوبه</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-slate-300">عنوان مصوبه *</label>
              <input required type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-slate-300">توضیحات</label>
              <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-slate-300">اقدام مورد انتظار</label>
              <textarea value={formData.expectedAction} onChange={(e) => setFormData({ ...formData, expectedAction: e.target.value })} rows={2} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:border-blue-500" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">اولویت *</label>
                <select required value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:border-blue-500">
                  <option value="low">کم</option>
                  <option value="medium">متوسط</option>
                  <option value="high">زیاد</option>
                  <option value="critical">بحرانی</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">تاریخ شروع *</label>
                <input required type="text" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} placeholder="1405/06/01" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">مهلت *</label>
                <input required type="text" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} placeholder="1405/06/15" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:border-blue-500" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">جلسه مرتبط (اختیاری)</label>
                <select value={formData.meetingId} onChange={(e) => setFormData({ ...formData, meetingId: e.target.value })} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:border-blue-500">
                  <option value="">-- بدون جلسه --</option>
                  {(meetings || []).map(m => <option key={m.id} value={m.id}>{m.title} - {m.date}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">واحد *</label>
                <select required value={formData.departmentId} onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:border-blue-500">
                  {(departments || []).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-slate-300">
                مسئولین اجرا * ({toPersianNumber(formData.assigneeIds.length)} نفر انتخاب شده)
              </label>
              <div className="border border-slate-200 dark:border-slate-600 dark:bg-slate-700 rounded-lg p-3 max-h-64 overflow-y-auto">
                {(users || []).map(user => (
                  <label key={user.id} className="flex items-center gap-2 py-2 px-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-600 rounded">
                    <input type="checkbox" checked={formData.assigneeIds.includes(user.id)} onChange={() => toggleAssignee(user.id)} className="rounded" />
                    <div className="flex-1">
                      <span className="text-sm font-medium dark:text-white">{user.firstName} {user.lastName}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 mr-2">({user.position})</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 ml-2" />
                ایجاد مصوبه و ارسال اعلان
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/resolutions')}>انصراف</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}