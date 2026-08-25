import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import { todayJalali } from '@/lib/date';
import * as storage from '@/lib/storage';

export function NewResolution() {
  const navigate = useNavigate();
  const { meetings, departments, users, currentUser } = useApp();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    expectedAction: '',
    priority: 'medium' as const,
    meetingId: (meetings || [])[0]?.id || '',
    departmentId: (departments || [])[0]?.id || '',
    assigneeIds: [] as string[],
    startDate: todayJalali(),
    dueDate: todayJalali(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newResolution = {
      id: `r${Date.now()}`,
      code: `RES-${Date.now()}`,
      ...formData,
      progress: 0,
      status: 'pending' as const,
      tags: [],
      attachments: [],
      comments: [],
      progressHistory: [],
      approvalHistory: [],
      timeline: [],
      createdBy: currentUser?.id || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isArchived: false,
    };

    const resolutions = storage.getResolutions() || [];
    storage.setResolutions([...resolutions, newResolution]);
    
    navigate('/resolutions');
  };

  const toggleAssignee = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      assigneeIds: prev.assigneeIds.includes(userId)
        ? prev.assigneeIds.filter(id => id !== userId)
        : [...prev.assigneeIds, userId]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button onClick={() => navigate('/resolutions')} variant="outline">
          <ArrowLeft className="w-4 h-4 ml-2" />
          بازگشت
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">ایجاد مصوبه جدید</h1>
          <p className="text-sm text-slate-500 mt-1">اطلاعات مصوبه را وارد کنید</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>اطلاعات مصوبه</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">عنوان مصوبه *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">توضیحات</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">اقدام مورد انتظار</label>
              <textarea
                value={formData.expectedAction}
                onChange={(e) => setFormData({ ...formData, expectedAction: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">اولویت *</label>
                <select
                  required
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="low">کم</option>
                  <option value="medium">متوسط</option>
                  <option value="high">زیاد</option>
                  <option value="critical">بحرانی</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">تاریخ شروع *</label>
                <input
                  type="text"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  placeholder="1405/06/01"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">مهلت *</label>
                <input
                  type="text"
                  required
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  placeholder="1405/06/15"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">جلسه مرتبط</label>
                <select
                  value={formData.meetingId}
                  onChange={(e) => setFormData({ ...formData, meetingId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">بدون جلسه</option>
                  {(meetings || []).map(m => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">واحد *</label>
                <select
                  required
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  {(departments || []).map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">مسئولین اجرا</label>
              <div className="border border-slate-200 rounded-lg p-3 max-h-48 overflow-y-auto">
                {(users || []).map(user => (
                  <label key={user.id} className="flex items-center gap-2 py-1 cursor-pointer hover:bg-slate-50 px-2 rounded">
                    <input
                      type="checkbox"
                      checked={formData.assigneeIds.includes(user.id)}
                      onChange={() => toggleAssignee(user.id)}
                      className="rounded"
                    />
                    <span className="text-sm">{user.firstName} {user.lastName}</span>
                    <span className="text-xs text-slate-500">({user.position})</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 ml-2" />
                ذخیره مصوبه
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/resolutions')}>
                انصراف
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}