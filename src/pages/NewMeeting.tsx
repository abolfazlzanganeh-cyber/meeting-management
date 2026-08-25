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
    setMinuteRows([...minuteRows, {
      id: `mr${Date.now()}`,
      rowNumber: minuteRows.length + 1,
      description: newMinute.description,
      actionRequired: newMinute.actionRequired,
      assigneeType: newMinute.assigneeId ? 'user' : 'manual',
      assigneeId: newMinute.assigneeId || undefined,
      assigneeName: newMinute.assigneeName || (users || []).find(u => u.id === newMinute.assigneeId)?.firstName + ' ' + (users || []).find(u => u.id === newMinute.assigneeId)?.lastName || '',
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

    const meetingId = addMeeting({
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

    alert(`✅ جلسه با موفقیت ایجاد شد\n📧 اعلان برای ${attendees.length} نفر از حاضرین ارسال گردید`);
    navigate(`/meetings/${meetingId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button onClick={() => navigate('/meetings')} variant="outline">
          <ArrowLeft className="w-4 h-4 ml-2" />
          بازگشت
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">ثبت جلسه جدید</h1>
          <p className="text-sm text-slate-500 mt-1">پس از ثبت، اعلان برای حاضرین ارسال می‌شود</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>اطلاعات اصلی جلسه</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">عنوان جلسه *</label>
              <input required type="text" value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">دستور جلسه</label>
              <textarea value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">تاریخ *</label>
                <input required type="text" value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  placeholder="1405/06/01"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ساعت شروع *</label>
                <input required type="time" value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ساعت پایان</label>
                <input type="time" value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">مکان *</label>
              <input required type="text" value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">نوع جلسه *</label>
                <select required value={formData.typeId}
                  onChange={(e) => setFormData({ ...formData, typeId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500">
                  {(meetingTypes || []).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">واحد برگزارکننده *</label>
                <select required value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500">
                  {(departments || []).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">رئیس جلسه *</label>
                <select required value={formData.chairmanId}
                  onChange={(e) => setFormData({ ...formData, chairmanId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500">
                  {(users || []).map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">دبیر جلسه *</label>
                <select required value={formData.secretaryId}
                  onChange={(e) => setFormData({ ...formData, secretaryId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500">
                  {(users || []).map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
                </select>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>حاضرین جلسه ({toPersianNumber(attendees.length)} نفر)</CardTitle>
          <Button size="sm" onClick={() => setShowAttendeeForm(!showAttendeeForm)}>
            <Plus className="w-4 h-4 ml-1" />
            افزودن حاضر
          </Button>
        </CardHeader>
        <CardContent>
          {showAttendeeForm && (
            <div className="bg-slate-50 p-4 rounded-lg mb-4 space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">انتخاب از کاربران</label>
                <select value={newAttendee.userId}
                  onChange={(e) => setNewAttendee({ ...newAttendee, userId: e.target.value, name: '' })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg">
                  <option value="">-- انتخاب کاربر --</option>
                  {(users || []).map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName} - {u.position}</option>)}
                </select>
              </div>
              <div className="text-center text-xs text-slate-500">یا</div>
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="نام مهمان" value={newAttendee.name}
                  onChange={(e) => setNewAttendee({ ...newAttendee, name: e.target.value, userId: '' })}
                  className="px-3 py-2 border border-slate-200 rounded-lg" />
                <input type="text" placeholder="سمت" value={newAttendee.position}
                  onChange={(e) => setNewAttendee({ ...newAttendee, position: e.target.value })}
                  className="px-3 py-2 border border-slate-200 rounded-lg" />
              </div>
              <div className="flex gap-3">
                <select value={newAttendee.partyType}
                  onChange={(e) => setNewAttendee({ ...newAttendee, partyType: e.target.value as any })}
                  className="px-3 py-2 border border-slate-200 rounded-lg">
                  <option value="employer">کارفرما</option>
                  <option value="contractor">پیمانکار</option>
                </select>
                <Button size="sm" onClick={addAttendee}>افزودن</Button>
                <Button size="sm" variant="outline" onClick={() => setShowAttendeeForm(false)}>انصراف</Button>
              </div>
            </div>
          )}
          {attendees.length === 0 ? (
            <div className="text-center py-6 text-slate-500">
              <UsersIcon className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              هنوز حاضرین اضافه نشده است
            </div>
          ) : (
            <div className="space-y-2">
              {attendees.map((att, idx) => (
                <div key={att.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                  <div>
                    <p className="font-medium">{att.name}</p>
                    <p className="text-xs text-slate-500">{att.position}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={att.partyType === 'employer' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}>
                      {att.partyType === 'employer' ? 'کارفرما' : 'پیمانکار'}
                    </Badge>
                    <button onClick={() => setAttendees(attendees.filter((_, i) => i !== idx))}
                      className="p-1 hover:bg-red-50 rounded">
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>مصوبات جلسه ({toPersianNumber(minuteRows.length)} مورد)</CardTitle>
          <Button size="sm" onClick={() => setShowMinuteForm(!showMinuteForm)}>
            <Plus className="w-4 h-4 ml-1" />
            افزودن مصوبه
          </Button>
        </CardHeader>
        <CardContent>
          {showMinuteForm && (
            <div className="bg-slate-50 p-4 rounded-lg mb-4 space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">شرح مصوبه *</label>
                <textarea value={newMinute.description}
                  onChange={(e) => setNewMinute({ ...newMinute, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">اقدام مورد نیاز</label>
                <input type="text" value={newMinute.actionRequired}
                  onChange={(e) => setNewMinute({ ...newMinute, actionRequired: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">مسئول اجرا</label>
                  <select value={newMinute.assigneeId}
                    onChange={(e) => {
                      const u = (users || []).find(u => u.id === e.target.value);
                      setNewMinute({
                        ...newMinute,
                        assigneeId: e.target.value,
                        assigneeName: u ? `${u.firstName} ${u.lastName}` : ''
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg">
                    <option value="">-- انتخاب --</option>
                    {(users || []).map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">مهلت انجام</label>
                  <input type="text" value={newMinute.dueDate}
                    onChange={(e) => setNewMinute({ ...newMinute, dueDate: e.target.value })}
                    placeholder="1405/06/15"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={addMinuteRow}>افزودن مصوبه</Button>
                <Button size="sm" variant="outline" onClick={() => setShowMinuteForm(false)}>انصراف</Button>
              </div>
            </div>
          )}
          {minuteRows.length === 0 ? (
            <div className="text-center py-6 text-slate-500">هنوز مصوبه‌ای ثبت نشده</div>
          ) : (
            <div className="space-y-2">
              {minuteRows.map((row, idx) => (
                <div key={row.id} className="p-3 border border-slate-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-slate-100 text-slate-700">#{toPersianNumber(idx + 1)}</Badge>
                        <span className="text-xs text-slate-500">مسئول: {row.assigneeName}</span>
                        <span className="text-xs text-slate-500">مهلت: {toPersianNumber(row.dueDate)}</span>
                      </div>
                      <p className="text-sm">{row.description}</p>
                      {row.actionRequired && <p className="text-xs text-slate-600 mt-1">اقدام: {row.actionRequired}</p>}
                    </div>
                    <button onClick={() => setMinuteRows(minuteRows.filter((_, i) => i !== idx))}
                      className="p-1 hover:bg-red-50 rounded">
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-3 sticky bottom-4 bg-white p-4 rounded-lg shadow-lg border">
        <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 flex-1">
          <Save className="w-4 h-4 ml-2" />
          ثبت نهایی جلسه و ارسال اعلان به حاضرین
        </Button>
        <Button variant="outline" onClick={() => navigate('/meetings')}>انصراف</Button>
      </div>
    </div>
  );
}