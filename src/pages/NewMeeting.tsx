import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';
import { ArrowLeft, Save, Plus } from 'lucide-react';
import { todayJalali, toGregorian } from '@/lib/date';

export function NewMeeting() {
  const navigate = useNavigate();
  const { meetingTypes, departments, users, currentUser, addMeeting } = useApp();
  const [formData, setFormData] = useState({
    title: '', subject: '', date: todayJalali(), startTime: '09:00', endTime: '11:00', location: '',
    typeId: (meetingTypes || [])[0]?.id || '', departmentId: (departments || [])[0]?.id || '',
    chairmanId: currentUser?.id || (users || [])[0]?.id || '', secretaryId: currentUser?.id || (users || [])[0]?.id || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMeeting({
      code: `MTG-${Date.now()}`, ...formData, gregorianDate: toGregorian(formData.date),
      status: 'scheduled', minuteRows: [], attendeeGroups: [], generalNotes: '', attachments: [],
      createdBy: currentUser?.id || '', isArchived: false,
    } as any);
    alert('✅ جلسه با موفقیت ثبت شد');
    navigate('/meetings');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button onClick={() => navigate('/meetings')} variant="outline"><ArrowLeft className="w-4 h-4 ml-2" />بازگشت</Button>
        <div><h1 className="text-2xl font-bold text-slate-900">ثبت جلسه جدید</h1></div>
      </div>
      <Card>
        <CardHeader><CardTitle>اطلاعات اصلی جلسه</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="block text-sm font-medium mb-1">عنوان جلسه *</label>
              <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
            <div><label className="block text-sm font-medium mb-1">دستور جلسه</label>
              <textarea value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} rows={3} className="w-full px-3 py-2 border rounded-lg" /></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><label className="block text-sm font-medium mb-1">تاریخ *</label>
                <input required type="text" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
              <div><label className="block text-sm font-medium mb-1">ساعت شروع *</label>
                <input required type="time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
              <div><label className="block text-sm font-medium mb-1">ساعت پایان</label>
                <input type="time" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
            </div>
            <div><label className="block text-sm font-medium mb-1">مکان *</label>
              <input required type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1">نوع جلسه *</label>
                <select required value={formData.typeId} onChange={e => setFormData({...formData, typeId: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                  {(meetingTypes || []).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select></div>
              <div><label className="block text-sm font-medium mb-1">واحد برگزارکننده *</label>
                <select required value={formData.departmentId} onChange={e => setFormData({...formData, departmentId: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                  {(departments || []).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select></div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700"><Save className="w-4 h-4 ml-2" />ثبت نهایی جلسه</Button>
              <Button type="button" variant="outline" onClick={() => navigate('/meetings')}>انصراف</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}