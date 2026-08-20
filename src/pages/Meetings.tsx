import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Button, Card, CardContent, Badge, Modal, Input, Select, Textarea } from '@/components/ui';
import { generateId, MEETING_STATUS_CONFIG, toPersianNumber } from '@/lib/utils';
import { todayJalali, toGregorian } from '@/lib/date';
import * as storage from '@/lib/storage';
import type { Meeting, MeetingStatus, MinuteRow, Attendee, PartyType, AssigneeType, Attachment } from '@/types';
import {
  logMeetingCreated,
  logMeetingUpdated,
  logMinuteRowCreated,
  logMinuteRowStatusChanged,
  logMinuteRowDeadlineChanged,
  logMinuteRowDeleted,
} from '@/lib/audit';
import {
  Plus, Search, Calendar, Users, MapPin, Edit, Trash2, Eye, X,
  Building2, HardHat, CheckCircle, Upload, FileText, Download, User
} from 'lucide-react';

export function Meetings() {
  const { meetings, users, departments, meetingTypes, currentUser, refreshMeetings } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [showAttendees, setShowAttendees] = useState<Meeting | null>(null);

  const filtered = useMemo(() => {
    return meetings
      .filter(m => !m.isArchived)
      .filter(m => {
        if (statusFilter !== 'all' && m.status !== statusFilter) return false;
        if (search) {
          const q = search.toLowerCase();
          return m.title.toLowerCase().includes(q) || m.code.toLowerCase().includes(q);
        }
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [meetings, search, statusFilter]);

  const handleDelete = (id: string) => {
    if (!confirm('آیا از حذف این جلسه مطمئن هستید؟')) return;
    const meeting = meetings.find(m => m.id === id);
    if (meeting && currentUser) {
      logMeetingUpdated(id, meeting.title, currentUser.id, `${currentUser.firstName} ${currentUser.lastName}`, 'جلسه آرشیو شد');
    }
    const all = storage.getMeetings().map(m => m.id === id ? { ...m, isArchived: true } : m);
    storage.setMeetings(all);
    refreshMeetings();
    alert('جلسه با موفقیت آرشیو شد');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">جلسات</h1>
          <p className="text-sm text-slate-500 mt-1">مدیریت جلسات با ساختار حرفه‌ای</p>
        </div>
        <Button onClick={() => { setEditingMeeting(null); setShowForm(true); }}>
          <Plus className="w-4 h-4" />
          جلسه جدید
        </Button>
      </div>

      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="جستجو در جلسات..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pr-10 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-primary-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
            >
              <option value="all">همه وضعیت‌ها</option>
              {Object.entries(MEETING_STATUS_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(m => {
          const type = meetingTypes.find(t => t.id === m.typeId);
          const statusConfig = MEETING_STATUS_CONFIG[m.status];
          const totalRows = m.minuteRows?.length || 0;
          const completedRows = m.minuteRows?.filter(r => r.status === 'completed').length || 0;
          const delayedRows = m.minuteRows?.filter(r => r.status === 'delayed').length || 0;
          const employerCount = m.attendeeGroups?.find(g => g.partyType === 'employer')?.attendees.length || 0;
          const contractorCount = m.attendeeGroups?.find(g => g.partyType === 'contractor')?.attendees.length || 0;

          return (
            <Card key={m.id} className="hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate(`/meetings/${m.id}`)}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-slate-500">{m.code}</span>
                      <Badge variant={m.status === 'held' ? 'success' : m.status === 'cancelled' ? 'danger' : 'info'} size="sm">
                        {statusConfig.label}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-slate-900 truncate">{m.title}</h3>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>{m.date}</span>
                    {m.startTime && <span className="text-slate-400">• {m.startTime}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>{m.location}</span>
                  </div>
                  {type && (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }} />
                      <span>{type.name}</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-blue-50 rounded px-2 py-1.5 text-center">
                    <div className="text-blue-600 font-semibold">{toPersianNumber(totalRows)}</div>
                    <div className="text-blue-500 text-[10px]">مصوبه</div>
                  </div>
                  <div className="bg-green-50 rounded px-2 py-1.5 text-center">
                    <div className="text-green-600 font-semibold">{toPersianNumber(completedRows)}/{toPersianNumber(totalRows)}</div>
                    <div className="text-green-500 text-[10px]">تکمیل</div>
                  </div>
                  <div className="bg-red-50 rounded px-2 py-1.5 text-center">
                    <div className="text-red-600 font-semibold">{toPersianNumber(delayedRows)}</div>
                    <div className="text-red-500 text-[10px]">تأخیر</div>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 justify-center">
                  <Building2 className="w-3 h-3" />
                  <span>کارفرما: {toPersianNumber(employerCount)}</span>
                  <span className="mx-1">|</span>
                  <HardHat className="w-3 h-3" />
                  <span>پیمانکار: {toPersianNumber(contractorCount)}</span>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                  <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setShowAttendees(m); }}>
                    <Users className="w-4 h-4" /> حاضرین
                  </Button>
                  <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setEditingMeeting(m); setShowForm(true); }}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleDelete(m.id); }} className="text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">جلسه‌ای یافت نشد</p>
          </CardContent>
        </Card>
      )}

      {showForm && (
        <MeetingForm meeting={editingMeeting} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); refreshMeetings(); }} />
      )}
      {showAttendees && (
        <Modal open={true} onClose={() => setShowAttendees(null)} title={`حاضرین جلسه - ${showAttendees.title}`} size="lg">
          <AttendeesView meeting={showAttendees} />
        </Modal>
      )}
    </div>
  );
}

// ============ فرم جلسه با مسئول منعطف و Audit Log ============
function MeetingForm({ meeting, onClose, onSaved }: { meeting: Meeting | null; onClose: () => void; onSaved: () => void }) {
  const { users, departments, meetingTypes, currentUser } = useApp();
  const [form, setForm] = useState<Partial<Meeting>>(meeting || {
    title: '', date: todayJalali(), startTime: '09:00', endTime: '11:00',
    location: '', typeId: meetingTypes[0]?.id || '', departmentId: currentUser?.departmentId || '',
    chairmanId: currentUser?.id || '', secretaryId: currentUser?.id || '',
    status: 'scheduled', subject: '', minuteRows: [], attendeeGroups: [
      { partyType: 'employer' as PartyType, attendees: [] },
      { partyType: 'contractor' as PartyType, attendees: [] },
    ], generalNotes: '',
  });

  const addMinuteRow = () => {
    const newRow: MinuteRow = {
      id: generateId(),
      rowNumber: (form.minuteRows?.length || 0) + 1,
      description: '',
      actionRequired: '',
      assigneeType: 'user' as AssigneeType,
      assigneeId: '',
      assigneeName: '',
      assigneeDepartment: '',
      assigneePhone: '',
      dueDate: '',
      notes: '',
      attachments: [],
      status: 'new',
      progress: 0,
    };
    setForm({ ...form, minuteRows: [...(form.minuteRows || []), newRow] });
  };

  const updateMinuteRow = (id: string, field: keyof MinuteRow, value: any) => {
    setForm({
      ...form,
      minuteRows: form.minuteRows?.map(row => {
        if (row.id !== id) return row;
        const updated = { ...row, [field]: value };
        if (field === 'assigneeId') {
          const user = users.find(u => u.id === value);
          updated.assigneeName = user ? `${user.firstName} ${user.lastName}` : '';
        }
        return updated;
      }),
    });
  };

  const removeMinuteRow = (id: string) => {
    const row = form.minuteRows?.find(r => r.id === id);
    if (row && meeting && currentUser) {
      logMinuteRowDeleted(
        meeting.id,
        meeting.title,
        row.id,
        row.description || 'بدون عنوان',
        currentUser.id,
        `${currentUser.firstName} ${currentUser.lastName}`
      );
    }
    const updated = form.minuteRows?.filter(row => row.id !== id).map((row, idx) => ({ ...row, rowNumber: idx + 1 }));
    setForm({ ...form, minuteRows: updated });
  };

  const addAttendee = (partyType: PartyType) => {
    const newAttendee: Attendee = {
      id: generateId(), userId: '', name: '', departmentId: '', position: '',
      partyType, status: 'present', isGuest: false,
    };
    const groups = form.attendeeGroups?.map(g =>
      g.partyType === partyType ? { ...g, attendees: [...g.attendees, newAttendee] } : g
    ) || [{ partyType: 'employer', attendees: [] }, { partyType: 'contractor', attendees: [] }];
    setForm({ ...form, attendeeGroups: groups });
  };

  const updateAttendee = (partyType: PartyType, attendeeId: string, field: keyof Attendee, value: any) => {
    const groups = form.attendeeGroups?.map(g => {
      if (g.partyType !== partyType) return g;
      return {
        ...g,
        attendees: g.attendees.map(a => {
          if (a.id !== attendeeId) return a;
          const updated = { ...a, [field]: value };
          if (field === 'userId') {
            const user = users.find(u => u.id === value);
            if (user) {
              updated.name = `${user.firstName} ${user.lastName}`;
              updated.departmentId = user.departmentId;
              updated.position = user.position;
              updated.partyType = user.partyType || partyType;
            }
          }
          return updated;
        }),
      };
    }) || [];
    setForm({ ...form, attendeeGroups: groups });
  };

  const removeAttendee = (partyType: PartyType, attendeeId: string) => {
    const groups = form.attendeeGroups?.map(g =>
      g.partyType === partyType ? { ...g, attendees: g.attendees.filter(a => a.id !== attendeeId) } : g
    ) || [];
    setForm({ ...form, attendeeGroups: groups });
  };

  const handleFileUpload = (rowId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const attachment: Attachment = {
        id: generateId(),
        name: file.name,
        size: file.size,
        type: file.type,
        url: evt.target?.result as string,
        uploadedBy: currentUser!.id,
        uploadedAt: new Date().toISOString(),
      };
      const updated = form.minuteRows?.map(row =>
        row.id === rowId ? { ...row, attachments: [...row.attachments, attachment] } : row
      );
      setForm({ ...form, minuteRows: updated });
    };
    reader.readAsDataURL(file);
  };

  const removeAttachment = (rowId: string, attachmentId: string) => {
    const updated = form.minuteRows?.map(row =>
      row.id === rowId ? { ...row, attachments: row.attachments.filter(a => a.id !== attachmentId) } : row
    );
    setForm({ ...form, minuteRows: updated });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const all = storage.getMeetings();
    const code = meeting?.code || `MTG-${form.date?.substring(0, 4)}-${String(all.length + 1).padStart(3, '0')}`;
    const userName = currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'نامشخص';
    const userId = currentUser?.id || 'unknown';

    const data: Meeting = {
      id: meeting?.id || generateId(),
      code,
      title: form.title!,
      date: form.date!,
      gregorianDate: toGregorian(form.date!),
      startTime: form.startTime!,
      endTime: form.endTime,
      location: form.location!,
      typeId: form.typeId!,
      departmentId: form.departmentId!,
      chairmanId: form.chairmanId!,
      secretaryId: form.secretaryId!,
      status: form.status as MeetingStatus,
      subject: form.subject || '',
      minuteRows: form.minuteRows || [],
      attendeeGroups: form.attendeeGroups || [],
      generalNotes: form.generalNotes || '',
      attachments: meeting?.attachments || [],
      createdBy: meeting?.createdBy || userId,
      createdAt: meeting?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isArchived: false,
    };

    if (meeting) {
      // ویرایش جلسه - ثبت تغییرات در Audit Log
      storage.setMeetings(all.map(m => m.id === meeting.id ? data : m));
      logMeetingUpdated(data.id, data.title, userId, userName, 'ویرایش اطلاعات جلسه');

      // بررسی تغییرات مصوبات
      const oldMinuteRows = meeting.minuteRows || [];
      const newMinuteRows = data.minuteRows || [];

      // مصوبات جدید
      newMinuteRows.forEach(newRow => {
        const oldRow = oldMinuteRows.find(r => r.id === newRow.id);
        if (!oldRow) {
          // مصوبه جدید اضافه شده
          const assigneeName = newRow.assigneeName || 'نامشخص';
          logMinuteRowCreated(
            data.id,
            data.title,
            newRow.id,
            newRow.description || 'بدون عنوان',
            assigneeName,
            userId,
            userName
          );
        } else {
          // بررسی تغییر وضعیت
          if (oldRow.status !== newRow.status) {
            logMinuteRowStatusChanged(
              data.id,
              data.title,
              newRow.id,
              newRow.description || 'بدون عنوان',
              oldRow.status,
              newRow.status,
              userId,
              userName
            );
          }
          // بررسی تغییر مهلت
          if (oldRow.dueDate !== newRow.dueDate) {
            logMinuteRowDeadlineChanged(
              data.id,
              data.title,
              newRow.id,
              newRow.description || 'بدون عنوان',
              oldRow.dueDate || 'بدون مهلت',
              newRow.dueDate || 'بدون مهلت',
              userId,
              userName
            );
          }
        }
      });

      // مصوبات حذف شده
      oldMinuteRows.forEach(oldRow => {
        const newRow = newMinuteRows.find(r => r.id === oldRow.id);
        if (!newRow) {
          logMinuteRowDeleted(
            data.id,
            data.title,
            oldRow.id,
            oldRow.description || 'بدون عنوان',
            userId,
            userName
          );
        }
      });

      alert('جلسه با موفقیت به‌روزرسانی شد');
    } else {
      // ایجاد جلسه جدید
      storage.setMeetings([data, ...all]);
      logMeetingCreated(data.id, data.title, userId, userName);

      // ثبت مصوبات جدید
      form.minuteRows?.forEach(row => {
        const assigneeName = row.assigneeName || 'نامشخص';
        logMinuteRowCreated(
          data.id,
          data.title,
          row.id,
          row.description || 'بدون عنوان',
          assigneeName,
          userId,
          userName
        );
      });

      // ارسال اعلان به مسئولین
      form.minuteRows?.forEach(row => {
        if (row.assigneeId) {
          const notifs = storage.getNotifications();
          notifs.push({
            id: generateId(),
            userId: row.assigneeId,
            title: 'مصوبه جدید به شما واگذار شد',
            message: `${row.description} - مهلت: ${row.dueDate}`,
            type: 'assignment',
            link: '/meetings',
            isRead: false,
            createdAt: new Date().toISOString(),
          });
          storage.setNotifications(notifs);
        }
      });

      alert('جلسه جدید با موفقیت ایجاد شد');
    }
    onSaved();
  };

  return (
    <Modal open={true} onClose={onClose} title={meeting ? 'ویرایش جلسه' : 'جلسه جدید'} size="full" footer={
      <>
        <Button variant="outline" onClick={onClose}>انصراف</Button>
        <Button onClick={handleSubmit}>{meeting ? 'ذخیره تغییرات' : 'ایجاد جلسه'}</Button>
      </>
    }>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* اطلاعات اصلی */}
        <div className="bg-slate-50 rounded-lg p-4">
          <h3 className="font-semibold text-slate-900 mb-3">📋 اطلاعات اصلی جلسه</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input label="عنوان جلسه *" value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <Input label="تاریخ *" value={form.date || ''} onChange={(e) => setForm({ ...form, date: e.target.value })} placeholder="1405/05/27" required />
            <Input label="موضوع" value={form.subject || ''} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            <Input label="ساعت شروع" type="time" value={form.startTime || ''} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
            <Input label="ساعت پایان" type="time" value={form.endTime || ''} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
            <Input label="محل برگزاری *" value={form.location || ''} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
            <Select label="نوع جلسه *" value={form.typeId || ''} onChange={(e) => setForm({ ...form, typeId: e.target.value })}
              options={meetingTypes.filter(t => t.isActive).map(t => ({ value: t.id, label: t.name }))} />
            <Select label="واحد برگزارکننده *" value={form.departmentId || ''} onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
              options={departments.filter(d => d.isActive).map(d => ({ value: d.id, label: d.name }))} />
            <Select label="وضعیت *" value={form.status || 'scheduled'} onChange={(e) => setForm({ ...form, status: e.target.value as MeetingStatus })}
              options={Object.entries(MEETING_STATUS_CONFIG).map(([k, v]) => ({ value: k, label: v.label }))} />
            <Select label="رئیس جلسه *" value={form.chairmanId || ''} onChange={(e) => setForm({ ...form, chairmanId: e.target.value })}
              options={users.filter(u => u.isActive).map(u => ({ value: u.id, label: `${u.firstName} ${u.lastName}` }))} />
            <Select label="دبیر جلسه *" value={form.secretaryId || ''} onChange={(e) => setForm({ ...form, secretaryId: e.target.value })}
              options={users.filter(u => u.isActive).map(u => ({ value: u.id, label: `${u.firstName} ${u.lastName}` }))} />
          </div>
        </div>

        {/* حاضرین با تفکیک کارفرما/پیمانکار */}
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-900">👥 حاضرین جلسه</h3>
          {(['employer', 'contractor'] as PartyType[]).map(partyType => {
            const group = form.attendeeGroups?.find(g => g.partyType === partyType);
            const label = partyType === 'employer' ? 'کارفرما' : 'پیمانکار';
            const Icon = partyType === 'employer' ? Building2 : HardHat;
            const color = partyType === 'employer' ? 'blue' : 'orange';

            return (
              <div key={partyType} className={`bg-${color}-50 rounded-lg p-4`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 text-${color}-600`} />
                    <h4 className="font-semibold text-slate-900">حاضرین {label}</h4>
                    <Badge variant="info" size="sm">{toPersianNumber(group?.attendees.length || 0)} نفر</Badge>
                  </div>
                  <Button type="button" size="sm" onClick={() => addAttendee(partyType)}>
                    <Plus className="w-4 h-4" /> افزودن نفر
                  </Button>
                </div>

                {group?.attendees.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">نفری اضافه نشده است</p>
                ) : (
                  <div className="space-y-2">
                    {group.attendees.map((attendee, idx) => (
                      <div key={attendee.id} className="bg-white rounded-lg p-3 border border-slate-200">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">نفر {idx + 1}</span>
                          <button type="button" onClick={() => removeAttendee(partyType, attendee.id)} className="text-red-500 hover:text-red-700 mr-auto">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                          <div className="md:col-span-2">
                            <label className="block text-xs text-slate-600 mb-1">انتخاب از لیست پرسنل</label>
                            <select
                              value={attendee.userId || ''}
                              onChange={(e) => updateAttendee(partyType, attendee.id, 'userId', e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                            >
                              <option value="">-- انتخاب کنید --</option>
                              {users.filter(u => u.isActive && (u.partyType === partyType || !u.partyType)).map(u => (
                                <option key={u.id} value={u.id}>
                                  {u.firstName} {u.lastName} - {u.position}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs text-slate-600 mb-1">وضعیت حضور</label>
                            <select
                              value={attendee.status}
                              onChange={(e) => updateAttendee(partyType, attendee.id, 'status', e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                            >
                              <option value="present">حاضر</option>
                              <option value="absent">غایب</option>
                              <option value="mission">مأموریت</option>
                              <option value="leave">مرخصی</option>
                              <option value="online">آنلاین</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs text-slate-600 mb-1">نام (دستی)</label>
                            <input
                              type="text"
                              value={attendee.name}
                              onChange={(e) => updateAttendee(partyType, attendee.id, 'name', e.target.value)}
                              placeholder="در صورت عدم انتخاب از لیست"
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-xs text-slate-600 mb-1">سمت</label>
                            <input
                              type="text"
                              value={attendee.position}
                              onChange={(e) => updateAttendee(partyType, attendee.id, 'position', e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* مصوبات ردیف‌دار با مسئول منعطف */}
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-slate-900">مصوبات و اقدامات</h3>
              <Badge variant="success" size="sm">{toPersianNumber(form.minuteRows?.length || 0)} مصوبه</Badge>
            </div>
            <Button type="button" size="sm" variant="primary" onClick={addMinuteRow}>
              <Plus className="w-4 h-4" /> افزودن مصوبه
            </Button>
          </div>

          {form.minuteRows?.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">مصوبه‌ای اضافه نشده است</p>
          ) : (
            <div className="space-y-3">
              {form.minuteRows?.map((row) => (
                <div key={row.id} className="bg-white rounded-lg p-4 border-2 border-green-200">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                      ردیف {toPersianNumber(row.rowNumber)}
                    </span>
                    <select
                      value={row.status}
                      onChange={(e) => updateMinuteRow(row.id, 'status', e.target.value)}
                      className="text-xs px-3 py-1 border border-slate-300 rounded-lg"
                    >
                      <option value="new">جدید</option>
                      <option value="in_progress">در حال انجام</option>
                      <option value="completed">تکمیل شده</option>
                      <option value="delayed">تأخیر دارد</option>
                      <option value="cancelled">لغو شده</option>
                    </select>
                    <button type="button" onClick={() => removeMinuteRow(row.id)} className="text-red-500 hover:text-red-700 mr-auto">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-700 mb-1">شرح مصوبه *</label>
                      <textarea
                        value={row.description}
                        onChange={(e) => updateMinuteRow(row.id, 'description', e.target.value)}
                        placeholder="شرح کامل مصوبه..."
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        rows={2}
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-700 mb-1">اقدام مورد انتظار</label>
                      <input
                        type="text"
                        value={row.actionRequired}
                        onChange={(e) => updateMinuteRow(row.id, 'actionRequired', e.target.value)}
                        placeholder="اقدام خاصی که باید انجام شود..."
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-700 mb-1">نوع مسئول *</label>
                      <div className="flex gap-4 mb-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`assigneeType-${row.id}`}
                            value="user"
                            checked={row.assigneeType === 'user'}
                            onChange={(e) => updateMinuteRow(row.id, 'assigneeType', e.target.value)}
                            className="w-4 h-4"
                          />
                          <User className="w-4 h-4 text-slate-600" />
                          <span className="text-sm">انتخاب از کاربران سیستم</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`assigneeType-${row.id}`}
                            value="manual"
                            checked={row.assigneeType === 'manual'}
                            onChange={(e) => updateMinuteRow(row.id, 'assigneeType', e.target.value)}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">وارد کردن نام دستی (پیمانکار/خارجی)</span>
                        </label>
                      </div>

                      {row.assigneeType === 'user' ? (
                        <select
                          value={row.assigneeId || ''}
                          onChange={(e) => {
                            updateMinuteRow(row.id, 'assigneeId', e.target.value);
                            const user = users.find(u => u.id === e.target.value);
                            if (user) {
                              updateMinuteRow(row.id, 'assigneeName', `${user.firstName} ${user.lastName}`);
                            }
                          }}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                          required
                        >
                          <option value="">-- انتخاب مسئول از لیست --</option>
                          {users.filter(u => u.isActive).map(u => (
                            <option key={u.id} value={u.id}>
                              {u.firstName} {u.lastName} - {u.position}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <input
                            type="text"
                            value={row.assigneeName || ''}
                            onChange={(e) => updateMinuteRow(row.id, 'assigneeName', e.target.value)}
                            placeholder="نام و نام خانوادگی *"
                            className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                            required
                          />
                          <input
                            type="text"
                            value={row.assigneeDepartment || ''}
                            onChange={(e) => updateMinuteRow(row.id, 'assigneeDepartment', e.target.value)}
                            placeholder="واحد/سازمان"
                            className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                          />
                          <input
                            type="text"
                            value={row.assigneePhone || ''}
                            onChange={(e) => updateMinuteRow(row.id, 'assigneePhone', e.target.value)}
                            placeholder="شماره تماس"
                            className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">مهلت انجام (تاریخ سررسید) *</label>
                      <input
                        type="text"
                        value={row.dueDate}
                        onChange={(e) => updateMinuteRow(row.id, 'dueDate', e.target.value)}
                        placeholder="1405/06/15"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">توضیحات</label>
                      <textarea
                        value={row.notes}
                        onChange={(e) => updateMinuteRow(row.id, 'notes', e.target.value)}
                        placeholder="توضیحات تکمیلی..."
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        rows={1}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-700 mb-1">فایل‌ها و تصاویر ضمیمه</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                          onChange={(e) => handleFileUpload(row.id, e)}
                          className="hidden"
                          id={`file-${row.id}`}
                        />
                        <label htmlFor={`file-${row.id}`} className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                          <Upload className="w-4 h-4" />
                          <span className="text-sm">آپلود فایل</span>
                        </label>
                        {row.attachments.length > 0 && (
                          <span className="text-xs text-slate-500">{toPersianNumber(row.attachments.length)} فایل</span>
                        )}
                      </div>
                      {row.attachments.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {row.attachments.map(att => (
                            <div key={att.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded">
                              <FileText className="w-4 h-4 text-slate-500" />
                              <span className="text-xs flex-1 truncate">{att.name}</span>
                              <a href={att.url} download={att.name} className="text-blue-600 hover:text-blue-700">
                                <Download className="w-4 h-4" />
                              </a>
                              <button type="button" onClick={() => removeAttachment(row.id, att.id)} className="text-red-500 hover:text-red-700">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="font-semibold text-slate-900 mb-2"> توضیحات کلی صورت‌جلسه</h3>
          <Textarea label="متن کلی" value={form.generalNotes || ''} onChange={(e) => setForm({ ...form, generalNotes: e.target.value })} rows={4} />
        </div>
      </form>
    </Modal>
  );
}

// ============ نمایش حاضرین ============
function AttendeesView({ meeting }: { meeting: Meeting }) {
  return (
    <div className="space-y-4">
      {meeting.attendeeGroups?.map(group => {
        const label = group.partyType === 'employer' ? 'کارفرما' : 'پیمانکار';
        const Icon = group.partyType === 'employer' ? Building2 : HardHat;
        const color = group.partyType === 'employer' ? 'blue' : 'orange';
        const presentCount = group.attendees.filter(a => a.status === 'present').length;

        return (
          <div key={group.partyType} className={`bg-${color}-50 rounded-lg p-4`}>
            <div className="flex items-center gap-2 mb-3">
              <Icon className={`w-5 h-5 text-${color}-600`} />
              <h3 className="font-semibold text-slate-900">حاضرین {label}</h3>
              <Badge variant="info" size="sm">{toPersianNumber(presentCount)}/{toPersianNumber(group.attendees.length)} حاضر</Badge>
            </div>

            {group.attendees.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">نفری ثبت نشده است</p>
            ) : (
              <div className="space-y-2">
                {group.attendees.map(a => (
                  <div key={a.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                    <div className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-medium">
                      {a.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm text-slate-900">{a.name}</div>
                      <div className="text-xs text-slate-500">{a.position}</div>
                    </div>
                    <Badge
                      variant={a.status === 'present' ? 'success' : a.status === 'absent' ? 'danger' : 'info'}
                      size="sm"
                    >
                      {a.status === 'present' ? 'حاضر' : a.status === 'absent' ? 'غایب' : a.status === 'online' ? 'آنلاین' : a.status === 'mission' ? 'مأموریت' : 'مرخصی'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}