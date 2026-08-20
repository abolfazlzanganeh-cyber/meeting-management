import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Button, Card, CardContent, Badge, Modal, Input, Select, Textarea, Avatar, ProgressBar } from '@/components/ui';
import { generateId, RESOLUTION_STATUS_CONFIG, PRIORITY_CONFIG, getDaysRemainingInfo, computeResolutionStatus, toPersianNumber } from '@/lib/utils';
import { todayJalali, toGregorian } from '@/lib/date';
import * as storage from '@/lib/storage';
import type { Resolution, ResolutionStatus, Priority } from '@/types';
import { Plus, Search, Edit, Trash2, Eye, Play, CheckCircle } from 'lucide-react';

export function Resolutions() {
  const { filter } = useParams<{ filter?: string }>();
  return <ResolutionsList filter={filter} />;
}

function ResolutionsList({ filter }: { filter?: string }) {
  const { resolutions, meetings, users, departments, currentUser, refreshResolutions } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingRes, setEditingRes] = useState<Resolution | null>(null);

  const filtered = useMemo(() => {
    let list = resolutions.filter(r => !r.isArchived);
    
    if (filter === 'overdue') list = list.filter(r => r.status === 'overdue');
    if (filter === 'pending-approval') list = list.filter(r => r.status === 'needs_approval');

    list = list.filter(r => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && r.priority !== priorityFilter) return false;
      if (deptFilter !== 'all' && r.departmentId !== deptFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return r.title.toLowerCase().includes(q) || r.code.toLowerCase().includes(q) || r.description.toLowerCase().includes(q);
      }
      return true;
    });

    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [resolutions, filter, search, statusFilter, priorityFilter, deptFilter]);

  const handleQuickComplete = (r: Resolution) => {
    if (!confirm('آیا از تکمیل این اقدام مطمئن هستید؟')) return;
    const all = storage.getResolutions();
    const updated: Resolution = {
      ...r,
      progress: 100,
      status: 'needs_approval',
      completedDate: todayJalali(),
      updatedAt: new Date().toISOString(),
      progressHistory: [...r.progressHistory, {
        id: generateId(), oldProgress: r.progress, newProgress: 100,
        note: 'تکمیل اقدام', userId: currentUser!.id, createdAt: new Date().toISOString(),
      }],
      approvalHistory: [...r.approvalHistory, {
        id: generateId(), action: 'submitted', userId: currentUser!.id,
        note: 'آماده تأیید', createdAt: new Date().toISOString(),
      }],
      timeline: [...r.timeline, {
        id: generateId(), type: 'submitted', title: 'برای تأیید ارسال شد',
        userId: currentUser!.id, createdAt: new Date().toISOString(),
      }],
    };
    storage.setResolutions(all.map(x => x.id === r.id ? updated : x));
    refreshResolutions();
  };

  const handleQuickProgress = (r: Resolution, newProgress: number) => {
    const all = storage.getResolutions();
    const newStatus = computeResolutionStatus(newProgress, toGregorian(r.dueDate), false, false);
    const updated: Resolution = {
      ...r,
      progress: newProgress,
      status: newStatus,
      updatedAt: new Date().toISOString(),
      progressHistory: [...r.progressHistory, {
        id: generateId(), oldProgress: r.progress, newProgress,
        userId: currentUser!.id, createdAt: new Date().toISOString(),
      }],
      timeline: [...r.timeline, {
        id: generateId(), type: 'progress', title: `پیشرفت به ${newProgress}% رسید`,
        userId: currentUser!.id, createdAt: new Date().toISOString(),
      }],
    };
    storage.setResolutions(all.map(x => x.id === r.id ? updated : x));
    refreshResolutions();
  };

  const handleDelete = (id: string) => {
    if (!confirm('آیا از حذف این مصوبه مطمئن هستید؟')) return;
    const all = storage.getResolutions().map(r => r.id === id ? { ...r, isArchived: true } : r);
    storage.setResolutions(all);
    refreshResolutions();
  };

  const title = filter === 'overdue' ? 'مصوبات تأخیر دار' : filter === 'pending-approval' ? 'نیازمند تأیید' : 'همه مصوبات';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="text-sm text-slate-500 mt-1">مدیریت و پیگیری مصوبات جلسات</p>
        </div>
        <Button onClick={() => { setEditingRes(null); setShowForm(true); }}>
          <Plus className="w-4 h-4" />
          مصوبه جدید
        </Button>
      </div>

      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="جستجو در مصوبات..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pr-10 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-primary-500"
              />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm">
              <option value="all">همه وضعیت‌ها</option>
              {Object.entries(RESOLUTION_STATUS_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm">
              <option value="all">همه اولویت‌ها</option>
              {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm">
              <option value="all">همه واحدها</option>
              {departments.filter(d => d.isActive).map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">وضعیت</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">مصوبه</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">جلسه</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">مسئول</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">واحد</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">پیشرفت</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">سررسید</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">زمان باقی‌مانده</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(r => {
                const meeting = meetings.find(m => m.id === r.meetingId);
                const dept = departments.find(d => d.id === r.departmentId);
                const assignees = users.filter(u => r.assigneeIds.includes(u.id));
                const statusConfig = RESOLUTION_STATUS_CONFIG[r.status];
                const priorityConfig = PRIORITY_CONFIG[r.priority];
                const daysInfo = getDaysRemainingInfo(r.dueDate);

                return (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Badge variant={r.status === 'completed' ? 'success' : r.status === 'overdue' ? 'danger' : r.status === 'needs_approval' ? 'warning' : r.status === 'in_progress' ? 'info' : 'neutral'} dot>
                        {statusConfig.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-sm text-slate-900">{r.title}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-mono text-slate-500">{r.code}</span>
                        <Badge variant={r.priority === 'critical' ? 'danger' : r.priority === 'high' ? 'warning' : r.priority === 'medium' ? 'info' : 'neutral'} size="sm">
                          {priorityConfig.label}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-slate-700">{meeting?.title || '-'}</div>
                      <div className="text-xs text-slate-500">{meeting?.date}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {assignees.length > 0 && <Avatar name={`${assignees[0].firstName} ${assignees[0].lastName}`} size="sm" />}
                        <div className="text-sm">
                          {assignees.map(a => `${a.firstName} ${a.lastName}`).join('، ') || '-'}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">{dept?.name || '-'}</td>
                    <td className="px-4 py-3 min-w-[150px]">
                      <ProgressBar value={r.progress} status={r.status} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">{r.dueDate}</td>
                    <td className="px-4 py-3">
                      <div className={`text-sm font-medium ${daysInfo.color}`}>{daysInfo.text}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => navigate(`/resolutions/detail/${r.id}`)} className="p-1.5 hover:bg-slate-100 rounded" title="مشاهده">
                          <Eye className="w-4 h-4 text-slate-600" />
                        </button>
                        <button onClick={() => { setEditingRes(r); setShowForm(true); }} className="p-1.5 hover:bg-slate-100 rounded" title="ویرایش">
                          <Edit className="w-4 h-4 text-slate-600" />
                        </button>
                        {r.status !== 'completed' && r.status !== 'needs_approval' && (
                          <button onClick={() => handleQuickProgress(r, Math.min(100, r.progress + 25))} className="p-1.5 hover:bg-slate-100 rounded" title="افزایش پیشرفت">
                            <Play className="w-4 h-4 text-blue-600" />
                          </button>
                        )}
                        {r.status === 'in_progress' && (
                          <button onClick={() => handleQuickComplete(r)} className="p-1.5 hover:bg-slate-100 rounded" title="تکمیل">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </button>
                        )}
                        <button onClick={() => handleDelete(r.id)} className="p-1.5 hover:bg-slate-100 rounded text-red-600" title="حذف">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-slate-500">
            مصوبه‌ای یافت نشد
          </div>
        )}
      </Card>

      {showForm && (
        <ResolutionForm
          resolution={editingRes}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); refreshResolutions(); }}
        />
      )}
    </div>
  );
}

function ResolutionForm({ resolution, onClose, onSaved }: { resolution: Resolution | null; onClose: () => void; onSaved: () => void }) {
  const { meetings, users, departments, currentUser } = useApp();
  const [form, setForm] = useState<Partial<Resolution>>(resolution || {
    title: '', description: '', expectedAction: '', priority: 'medium',
    assigneeIds: [], departmentId: currentUser?.departmentId || '',
    supervisorId: '', approverId: '',
    startDate: todayJalali(), dueDate: '',
    progress: 0, status: 'pending', tags: [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const all = storage.getResolutions();
    const code = resolution?.code || `RES-${form.startDate?.substring(0, 4)}-${String(all.length + 1).padStart(3, '0')}`;
    
    const data: Resolution = {
      id: resolution?.id || generateId(),
      code,
      meetingId: form.meetingId!,
      title: form.title!,
      description: form.description || '',
      expectedAction: form.expectedAction || '',
      priority: form.priority as Priority,
      assigneeIds: form.assigneeIds || [],
      departmentId: form.departmentId!,
      supervisorId: form.supervisorId,
      approverId: form.approverId,
      startDate: form.startDate!,
      dueDate: form.dueDate!,
      progress: form.progress || 0,
      status: form.status as ResolutionStatus,
      tags: form.tags || [],
      attachments: resolution?.attachments || [],
      comments: resolution?.comments || [],
      progressHistory: resolution?.progressHistory || [],
      approvalHistory: resolution?.approvalHistory || [],
      timeline: resolution?.timeline || [{
        id: generateId(), type: 'created', title: 'مصوبه ایجاد شد',
        userId: currentUser!.id, createdAt: new Date().toISOString(),
      }],
      createdBy: resolution?.createdBy || currentUser!.id,
      createdAt: resolution?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isArchived: false,
    };

    if (resolution) {
      storage.setResolutions(all.map(r => r.id === resolution.id ? data : r));
    } else {
      storage.setResolutions([data, ...all]);
    }
    onSaved();
  };

  return (
    <Modal open={true} onClose={onClose} title={resolution ? 'ویرایش مصوبه' : 'مصوبه جدید'} size="lg" footer={
      <>
        <Button variant="outline" onClick={onClose}>انصراف</Button>
        <Button onClick={handleSubmit}>{resolution ? 'ذخیره تغییرات' : 'ایجاد مصوبه'}</Button>
      </>
    }>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Input label="عنوان مصوبه *" value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <Select
            label="جلسه *"
            value={form.meetingId || ''}
            onChange={(e) => setForm({ ...form, meetingId: e.target.value })}
            options={[{ value: '', label: 'انتخاب کنید' }, ...meetings.map(m => ({ value: m.id, label: `${m.code} - ${m.title}` }))]}
          />
          <Select
            label="اولویت *"
            value={form.priority || 'medium'}
            onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}
            options={Object.entries(PRIORITY_CONFIG).map(([k, v]) => ({ value: k, label: v.label }))}
          />
          <Select
            label="واحد مسئول *"
            value={form.departmentId || ''}
            onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
            options={departments.filter(d => d.isActive).map(d => ({ value: d.id, label: d.name }))}
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">مسئولین اقدام *</label>
            <select
              multiple
              value={form.assigneeIds || []}
              onChange={(e) => setForm({ ...form, assigneeIds: Array.from(e.target.selectedOptions, o => o.value) })}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm min-h-[80px]"
            >
              {users.filter(u => u.isActive).map(u => (
                <option key={u.id} value={u.id}>{u.firstName} {u.lastName} - {u.position}</option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-1">برای انتخاب چند نفر Ctrl را نگه دارید</p>
          </div>
          <Select
            label="ناظر"
            value={form.supervisorId || ''}
            onChange={(e) => setForm({ ...form, supervisorId: e.target.value })}
            options={[{ value: '', label: 'ندارد' }, ...users.filter(u => u.isActive).map(u => ({ value: u.id, label: `${u.firstName} ${u.lastName}` }))]}
          />
          <Select
            label="تأییدکننده"
            value={form.approverId || ''}
            onChange={(e) => setForm({ ...form, approverId: e.target.value })}
            options={[{ value: '', label: 'ندارد' }, ...users.filter(u => u.isActive).map(u => ({ value: u.id, label: `${u.firstName} ${u.lastName}` }))]}
          />
          <Input label="تاریخ شروع *" type="text" value={form.startDate || ''} onChange={(e) => setForm({ ...form, startDate: e.target.value })} placeholder="1405/05/27" />
          <Input label="تاریخ سررسید *" type="text" value={form.dueDate || ''} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} placeholder="1405/06/15" />
        </div>
        <Textarea label="شرح مصوبه" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
        <Textarea label="اقدام مورد انتظار" value={form.expectedAction || ''} onChange={(e) => setForm({ ...form, expectedAction: e.target.value })} rows={2} />
      </form>
    </Modal>
  );
}