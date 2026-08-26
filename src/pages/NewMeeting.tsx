import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/ui';
import { ArrowLeft, Save, Plus, X, Users as UsersIcon } from 'lucide-react';
import { todayJalali, toGregorian } from '@/lib/date';
import { toPersianNumber } from '@/lib/utils';

export function NewMeeting() {
  const navigate = useNavigate();
  const { meetingTypes, departments, users, currentUser, addMeeting } = useApp();

  const [formData, setFormData] = useState({
    title: '', subject: '', date: todayJalali(),
    startTime: '09:00', endTime: '11:00', location: '',
    typeId: (meetingTypes || [])[0]?.id || '',
    departmentId: (departments || [])[0]?.id || '',
    chairmanId: (users || [])[0]?.id || '',
    secretaryId: currentUser?.id || (users || [])[0]?.id || '',
  });

  const [attendees, setAttendees] = useState<any[]>([]);
  const [minuteRows, setMinuteRows] = useState<any[]>([]);
  const [showAttendeeForm, setShowAttendeeForm] = useState(false);
  const [showMinuteForm, setShowMinuteForm] = useState(false);
  const [newAttendee, setNewAttendee] = useState({ userId: '', name: '', position: '', partyType: 'employer' as const, isGuest: false });
  const [newMinute, setNewMinute] = useState({
    description: '', actionRequired: '', assigneeId: '', assigneeName: '',
    dueDate: todayJalali(), notes: '',
  });

  const addAttendee = () => {
    if (!newAttendee.userId && !newAttendee.name) {
      alert('لطفاً یک کاربر انتخاب کنید یا نام مهمان را وارد کنید');
      return;
    }
    const user = (users || []).find(u => u.id === newAttendee.userId);
    setAttendees([...attendees, {
      id: `a${Date.now()}`,
      userId: newAttendee.userId || undefined,
      name: user ? `${user.firstName} ${user.lastName}` : newAttendee.name,
      departmentId: user?.departmentId,
      position: user?.position || newAttendee.position,
      partyType: newAttendee.partyType,
      status: 'present',
      isGuest: newAttendee.isGuest,
    }]);
    setNewAttendee({ userId: '', name: '', position: '', partyType: 'employer', isGuest: false });
    setShowAttendeeForm(false);
  };

  const addMinuteRow = () => {
    if (!newMinute.description) {
      alert('شرح مصوبه الزامی است');
      return;
    }
    const assignedUser = (users || []).find(u => u.id === newMinute.assigneeId);
    setMinuteRows([...minuteRows, {
      id: `mr${Date.now()}`,
      rowNumber: minuteRows.length + 1,
      description: newMinute.description,
      actionRequired: newMinute.actionRequired,
      assigneeType: newMinute.assigneeId ? 'user' : 'manual',
      assigneeId: newMinute.assigneeId || undefined,
      assigneeName: assignedUser ? `${assignedUser.firstName} ${assignedUser.lastName}` : newMinute.assigneeName,
      dueDate: newMinute.dueDate,
      notes: newMinute.notes,
      attachments: [],
      status: 'new',
      progress: 0,
    }]);
    setNewMinute({ description: '', actionRequired: '', assigneeId: '', assigneeName: '', dueDate: todayJalali(), notes: '' });
    setShowMinuteForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const employerAttendees = attendees.filter(a => a.partyType === 'employer');
    const contractorAttendees = attendees.filter(a => a.partyType === 'contractor');

    addMeeting({
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
      status: 'held',
      subject: formData.subject,
      minuteRows,
      attendeeGroups: [
        { partyType: 'employer', attendees: employerAttendees },
        { partyType: 'contractor', attendees: contractorAttendees },
      ],
      generalNotes: '',
      attachments: [],
      createdBy: currentUser?.id || '',
      isArchived: false,
    } as any);

    alert('✅ جلسه با موفقیت ثبت و اعلان برای حاضرین ارسال گردید');
    navigate('/meetings');
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
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">پس از ثبت، اعلان برای حاضرین ارسال می‌شود</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>اطلاعات اصلی جلسه</CardTitle></CardHeader>
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
                <input required type="text" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} placeholder="1405/06/01" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">ساعت شروع *</label>
                <input required type="time" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">ساعت پایان</label>
                <input type="time" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:border-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-slate-300">مکان *</label>
              <input required type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:border-blue-500" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">نوع جلسه *</label>
                <select required value={formData.typeId} onChange={(e) => setFormData({ ...formData, typeId: e.target.value })} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:border-blue-500">
                  {(meetingTypes || []).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">واحد برگزارکننده *</label>
                <select required value={formData.departmentId} onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:border-blue-500">
                  {(departments || []).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 ml-2" />
                ثبت نهایی جلسه
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/meetings')}>انصراف</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}