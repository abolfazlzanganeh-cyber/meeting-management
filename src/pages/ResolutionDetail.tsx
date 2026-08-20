import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Avatar, ProgressBar, Modal, Textarea } from '@/components/ui';
import { RESOLUTION_STATUS_CONFIG, PRIORITY_CONFIG, getDaysRemainingInfo, generateId, formatRelative, toPersianNumber } from '@/lib/utils';
import { toJalaliWithTime } from '@/lib/date';
import * as storage from '@/lib/storage';
import type { Resolution } from '@/types';
import { ArrowRight, CheckCircle, TrendingUp, FileText, MessageSquare, History } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export function ResolutionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { resolutions, meetings, users, departments, currentUser, refreshResolutions, addNotification } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [newProgress, setNewProgress] = useState(0);
  const [progressNote, setProgressNote] = useState('');
  const [comment, setComment] = useState('');

  const resolution = resolutions.find(r => r.id === id);
  if (!resolution) {
    return <div className="text-center py-12">مصوبه یافت نشد</div>;
  }

  const meeting = meetings.find(m => m.id === resolution.meetingId);
  const dept = departments.find(d => d.id === resolution.departmentId);
  const assignees = users.filter(u => resolution.assigneeIds.includes(u.id));
  const supervisor = resolution.supervisorId ? users.find(u => u.id === resolution.supervisorId) : null;
  const approver = resolution.approverId ? users.find(u => u.id === resolution.approverId) : null;
  const statusConfig = RESOLUTION_STATUS_CONFIG[resolution.status];
  const priorityConfig = PRIORITY_CONFIG[resolution.priority];
  const daysInfo = getDaysRemainingInfo(resolution.dueDate);

  const handleUpdateProgress = () => {
    const all = storage.getResolutions();
    let newStatus = resolution.status;
    if (newProgress === 100) newStatus = 'needs_approval';
    else if (newProgress > 0) newStatus = 'in_progress';

    const updated: Resolution = {
      ...resolution,
      progress: newProgress,
      status: newStatus,
      updatedAt: new Date().toISOString(),
      progressHistory: [...resolution.progressHistory, {
        id: generateId(), oldProgress: resolution.progress, newProgress,
        note: progressNote, userId: currentUser!.id, createdAt: new Date().toISOString(),
      }],
      timeline: [...resolution.timeline, {
        id: generateId(), type: 'progress', title: `پیشرفت به ${newProgress}% رسید`,
        description: progressNote, userId: currentUser!.id, createdAt: new Date().toISOString(),
      }],
    };
    storage.setResolutions(all.map(r => r.id === resolution.id ? updated : r));
    
    if (newProgress === 100 && resolution.approverId) {
      addNotification({
        userId: resolution.approverId,
        title: 'مصوبه نیازمند تأیید',
        message: `مصوبه "${resolution.title}" برای تأیید ارسال شد`,
        type: 'info',
        link: `/resolutions/detail/${resolution.id}`,
      });
    }
    
    refreshResolutions();
    setShowProgressModal(false);
    setProgressNote('');
  };

  const handleApprove = () => {
    const all = storage.getResolutions();
    const updated: Resolution = {
      ...resolution,
      status: 'completed',
      updatedAt: new Date().toISOString(),
      approvalHistory: [...resolution.approvalHistory, {
        id: generateId(), action: 'approved', userId: currentUser!.id,
        note: 'تأیید شد', createdAt: new Date().toISOString(),
      }],
      timeline: [...resolution.timeline, {
        id: generateId(), type: 'approved', title: 'مصوبه تأیید و بسته شد',
        userId: currentUser!.id, createdAt: new Date().toISOString(),
      }],
    };
    storage.setResolutions(all.map(r => r.id === resolution.id ? updated : r));
    refreshResolutions();
  };

  const handleAddComment = () => {
    if (!comment.trim()) return;
    const all = storage.getResolutions();
    const updated: Resolution = {
      ...resolution,
      comments: [...resolution.comments, {
        id: generateId(), text: comment, userId: currentUser!.id,
        createdAt: new Date().toISOString(), mentions: [],
      }],
      timeline: [...resolution.timeline, {
        id: generateId(), type: 'comment', title: 'کامنت جدید ثبت شد',
        userId: currentUser!.id, createdAt: new Date().toISOString(),
      }],
      updatedAt: new Date().toISOString(),
    };
    storage.setResolutions(all.map(r => r.id === resolution.id ? updated : r));
    refreshResolutions();
    setComment('');
  };

  const progressChartData = resolution.progressHistory.map(p => ({
    date: toJalaliWithTime(p.createdAt).split(' ')[0],
    progress: p.newProgress,
  }));

  const tabs = [
    { id: 'overview', label: 'نمای کلی', icon: FileText },
    { id: 'progress', label: 'پیشرفت', icon: TrendingUp },
    { id: 'timeline', label: 'تاریخچه', icon: History },
    { id: 'comments', label: 'کامنت‌ها', icon: MessageSquare },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-lg">
            <ArrowRight className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-mono text-slate-500">{resolution.code}</span>
              <Badge variant={resolution.status === 'completed' ? 'success' : resolution.status === 'overdue' ? 'danger' : resolution.status === 'needs_approval' ? 'warning' : 'info'} dot>
                {statusConfig.label}
              </Badge>
              <Badge variant={resolution.priority === 'critical' ? 'danger' : resolution.priority === 'high' ? 'warning' : 'info'}>
                {priorityConfig.label}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{resolution.title}</h1>
          </div>
        </div>
        <div className="flex gap-2">
          {resolution.status === 'in_progress' && (
            <Button onClick={() => { setNewProgress(resolution.progress); setShowProgressModal(true); }}>
              <TrendingUp className="w-4 h-4" />
              بروزرسانی پیشرفت
            </Button>
          )}
          {resolution.status === 'needs_approval' && currentUser?.role === 'approver' && (
            <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="w-4 h-4" />
              تأیید مصوبه
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-slate-500 mb-1">پیشرفت</div>
            <div className="text-2xl font-bold text-slate-900">{toPersianNumber(resolution.progress)}٪</div>
            <ProgressBar value={resolution.progress} status={resolution.status} showLabel={false} size="sm" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-slate-500 mb-1">زمان باقی‌مانده</div>
            <div className={`text-2xl font-bold ${daysInfo.color}`}>{daysInfo.text}</div>
            <div className="text-xs text-slate-400 mt-1">سررسید: {resolution.dueDate}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-slate-500 mb-1">مسئولین</div>
            <div className="flex items-center gap-2 mt-1">
              {assignees.map(a => <Avatar key={a.id} name={`${a.firstName} ${a.lastName}`} size="sm" />)}
            </div>
            <div className="text-xs text-slate-600 mt-2">{assignees.map(a => `${a.firstName} ${a.lastName}`).join('، ')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-slate-500 mb-1">واحد</div>
            <div className="text-base font-semibold text-slate-900">{dept?.name || '-'}</div>
            {supervisor && <div className="text-xs text-slate-500 mt-1">ناظر: {supervisor.firstName} {supervisor.lastName}</div>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <div className="border-b border-slate-200">
          <div className="flex gap-1 px-4">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-700'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <CardContent className="pt-6">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">شرح مصوبه</h3>
                <p className="text-sm text-slate-600 whitespace-pre-wrap">{resolution.description || 'توضیحی ثبت نشده'}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">اقدام مورد انتظار</h3>
                <p className="text-sm text-slate-600 whitespace-pre-wrap">{resolution.expectedAction || '-'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div>
                  <div className="text-xs text-slate-500">جلسه مرتبط</div>
                  <div className="text-sm font-medium text-slate-900 mt-1">{meeting?.title || '-'}</div>
                  <div className="text-xs text-slate-500">{meeting?.code} • {meeting?.date}</div>
                </div>
                {approver && (
                  <div>
                    <div className="text-xs text-slate-500">تأییدکننده</div>
                    <div className="text-sm font-medium text-slate-900 mt-1">{approver.firstName} {approver.lastName}</div>
                    <div className="text-xs text-slate-500">{approver.position}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3">نمودار پیشرفت</h3>
                {progressChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={progressChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="progress" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-8 text-slate-500 text-sm">تاریخچه‌ای ثبت نشده</div>
                )}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3">تاریخچه تغییرات پیشرفت</h3>
                <div className="space-y-2">
                  {resolution.progressHistory.slice().reverse().map(p => {
                    const user = users.find(u => u.id === p.userId);
                    return (
                      <div key={p.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <Avatar name={user ? `${user.firstName} ${user.lastName}` : 'کاربر'} size="sm" />
                        <div className="flex-1">
                          <div className="text-sm">
                            <span className="font-medium">{user?.firstName} {user?.lastName}</span>
                            <span className="text-slate-500"> پیشرفت را از </span>
                            <span className="font-medium">{toPersianNumber(p.oldProgress)}%</span>
                            <span className="text-slate-500"> به </span>
                            <span className="font-medium text-primary-600">{toPersianNumber(p.newProgress)}%</span>
                            <span className="text-slate-500"> تغییر داد</span>
                          </div>
                          {p.note && <div className="text-xs text-slate-500 mt-1">{p.note}</div>}
                        </div>
                        <div className="text-xs text-slate-400">{formatRelative(p.createdAt)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="relative">
              <div className="absolute right-4 top-0 bottom-0 w-0.5 bg-slate-200" />
              <div className="space-y-6">
                {resolution.timeline.slice().reverse().map(t => {
                  const user = users.find(u => u.id === t.userId);
                  return (
                    <div key={t.id} className="relative flex gap-4 pr-10">
                      <div className="absolute right-2 top-1 w-5 h-5 rounded-full bg-white border-2 border-primary-500" />
                      <div className="flex-1 pb-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium text-sm text-slate-900">{t.title}</div>
                            {t.description && <div className="text-xs text-slate-500 mt-1">{t.description}</div>}
                            <div className="text-xs text-slate-400 mt-1">
                              {user?.firstName} {user?.lastName} • {formatRelative(t.createdAt)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="space-y-4">
              <div className="flex gap-3">
                <Avatar name={`${currentUser?.firstName} ${currentUser?.lastName}`} />
                <div className="flex-1">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="کامنت خود را بنویسید..."
                    className="w-full p-3 border border-slate-200 rounded-lg text-sm resize-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    rows={3}
                  />
                  <div className="flex justify-end mt-2">
                    <Button size="sm" onClick={handleAddComment} disabled={!comment.trim()}>ثبت کامنت</Button>
                  </div>
                </div>
              </div>
              <div className="space-y-3 pt-4 border-t border-slate-100">
                {resolution.comments.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-sm">کامنتی ثبت نشده</div>
                ) : (
                  resolution.comments.slice().reverse().map(c => {
                    const user = users.find(u => u.id === c.userId);
                    return (
                      <div key={c.id} className="flex gap-3">
                        <Avatar name={user ? `${user.firstName} ${user.lastName}` : 'کاربر'} />
                        <div className="flex-1 bg-slate-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-medium text-sm">{user?.firstName} {user?.lastName}</div>
                            <div className="text-xs text-slate-400">{formatRelative(c.createdAt)}</div>
                          </div>
                          <div className="text-sm text-slate-700 whitespace-pre-wrap">{c.text}</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {showProgressModal && (
        <Modal open={true} onClose={() => setShowProgressModal(false)} title="بروزرسانی پیشرفت" size="sm" footer={
          <>
            <Button variant="outline" onClick={() => setShowProgressModal(false)}>انصراف</Button>
            <Button onClick={handleUpdateProgress}>ذخیره</Button>
          </>
        }>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">درصد پیشرفت: {toPersianNumber(newProgress)}٪</label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={newProgress}
                onChange={(e) => setNewProgress(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>۰٪</span>
                <span>۲۵٪</span>
                <span>۵۰٪</span>
                <span>۷۵٪</span>
                <span>۱۰۰٪</span>
              </div>
            </div>
            <div className="flex gap-2">
              {[0, 25, 50, 75, 100].map(v => (
                <button
                  key={v}
                  onClick={() => setNewProgress(v)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    newProgress === v ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {toPersianNumber(v)}٪
                </button>
              ))}
            </div>
            <Textarea
              label="توضیح (اختیاری)"
              value={progressNote}
              onChange={(e) => setProgressNote(e.target.value)}
              rows={3}
              placeholder="مثلاً: قطعات تهیه شد..."
            />
          </div>
        </Modal>
      )}
    </div>
  );
}