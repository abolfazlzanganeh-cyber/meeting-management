import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import { todayJalali, toGregorian } from '@/lib/date';
import * as storage from '@/lib/storage';

export function NewMeeting() {
  const navigate = useNavigate();
  const { meetingTypes, departments, users, currentUser } = useApp();

  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    date: todayJalali(),
    startTime: '09:00',
    endTime: '11:00',
    location: '',
    typeId: (meetingTypes || [])[0]?.id || '',
    departmentId: (departments || [])[0]?.id || '',
    chairmanId: (users || [])[0]?.id || '',
    secretaryId: currentUser?.id || (users || [])[0]?.id || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newMeeting = {
      id: `m${Date.now()}`,
      code: `MTG-${Date.now()}`,
      ...formData,
      gregorianDate: toGregorian(formData.date),
      status: 'scheduled' as const,
      minuteRows: [],
      attendeeGroups: [],
      generalNotes: '',
      attachments: [],
      createdBy: currentUser?.id || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isArchived: false,
    };

    const meetings = storage.getMeetings() || [];
    storage.setMeetings([...meetings, newMeeting]);
    
    navigate('/meetings');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button onClick={() => navigate('/meetings')} variant="outline">
          <ArrowLeft className="w-4 h-4 ml-2" />
          بازگشت
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">ایجاد جلسه جدید</h1>
          <p className="text-sm text-slate-500 mt-1">اطلاعات جلسه را وارد کنید</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>اطلاعات جلسه</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">عنوان جلسه *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">موضوع جلسه</label>
              <textarea
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">تاریخ *</label>
                <input
                  type="text"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  placeholder="1405/06/01"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">ساعت شروع *</label>
                <input
                  type="time"
                  required
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">ساعت پایان</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">مکان *</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">نوع جلسه *</label>
                <select
                  required
                  value={formData.typeId}
                  onChange={(e) => setFormData({ ...formData, typeId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  {(meetingTypes || []).map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">رئیس جلسه *</label>
                <select
                  required
                  value={formData.chairmanId}
                  onChange={(e) => setFormData({ ...formData, chairmanId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  {(users || []).map(user => (
                    <option key={user.id} value={user.id}>{user.firstName} {user.lastName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">دبیر جلسه *</label>
                <select
                  required
                  value={formData.secretaryId}
                  onChange={(e) => setFormData({ ...formData, secretaryId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  {(users || []).map(user => (
                    <option key={user.id} value={user.id}>{user.firstName} {user.lastName}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 ml-2" />
                ذخیره جلسه
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/meetings')}>
                انصراف
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}