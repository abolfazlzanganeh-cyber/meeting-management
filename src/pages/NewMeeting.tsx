import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import { todayJalali, toGregorian } from '@/lib/date';

export function NewMeeting() {
  const navigate = useNavigate();
  const { meetingTypes, departments, users, currentUser, addMeeting } = useApp();

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
    
    // ساختار داده‌ای که به AppContext فرستاده می‌شود
    const meetingData = {
      code: `MTG-${Date.now()}`,
      title: formData.title,
      date: formData.date,
      gregorianDate: toGregorian(formData.date),
      startTime: formData.startTime,
      endTime: formData.endTime,
      location: formData.location,
      typeId: formData.typeId,
      departmentId: formData.departmentId,
      chairmanId: formData.chairmanId,
      secretaryId: formData.secretaryId,
      status: 'scheduled',
      subject: formData.subject,
      minuteRows: [], // در این نسخه ساده، مصوبات بعداً اضافه می‌شوند
      attendeeGroups: [],
      generalNotes: '',
      attachments: [],
      createdBy: currentUser?.id || '',
      isArchived: false,
    };

    // ✅ دریافت ID جلسه جدید از تابع addMeeting
    const newMeetingId = addMeeting(meetingData);
    
    alert('✅ جلسه با موفقیت ثبت شد');
    
    // ✅ هدایت مستقیم به صفحه جزئیات همین جلسه
    navigate(`/meetings/${newMeetingId}`);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button onClick={() => navigate('/meetings')} variant="outline">
          <ArrowLeft className="w-4 h-4 ml-2" />
          بازگشت
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">ثبت جلسه جدید</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">اطلاعات اصلی جلسه را وارد کنید</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="dark:text-white">اطلاعات اصلی جلسه</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-slate-300">عنوان جلسه *</label>
              <input required type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-slate-300">دستور جلسه</label>
              <textarea value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} rows={3} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:border-blue-500" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">تاریخ *</label>
                <input required type="text" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} placeholder="1403/01/01" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">ساعت شروع *</label>
                <input required type="time" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} className="w-full px-3 py-2 border border-slate-