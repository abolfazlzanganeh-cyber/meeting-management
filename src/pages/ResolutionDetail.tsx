import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@/components/ui';
import { toPersianNumber } from '@/lib/utils';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';

export function ResolutionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { resolutions, users, departments, updateResolution, deleteResolution } = useApp();

  const resolution = (resolutions || []).find(r => r.id === id);
  const [editing, setEditing] = useState(false);
  const [progress, setProgress] = useState(resolution?.progress || 0);
  const [status, setStatus] = useState(resolution?.status || 'pending');

  if (!resolution) {
    return (
      <div className="p-6 text-center">
        <p className="text-slate-500">مصوبه یافت نشد</p>
        <Button onClick={() => navigate('/resolutions')} className="mt-4">بازگشت</Button>
      </div>
    );
  }

  const safeUsers = users || [];
  const safeDepts = departments || [];
  const getUserName = (userId: string) => {
    const user = safeUsers.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'نامشخص';
  };
  const getDeptName = (deptId: string) => safeDepts.find(d => d.id === deptId)?.name || 'نامشخص';

  const getStatusBadge = (s: string) => {
    const map: Record<string, { label: string; color: string }> = {
      pending: { label: 'در انتظار شروع', color: 'bg-slate-100 text-slate-700' },
      in_progress: { label: 'در حال انجام', color: 'bg-blue-100 text-blue-700' },
      completed: { label: 'تکمیل شده', color: 'bg-green-100 text-green-700' },
      overdue: { label: 'تأخیر دار', color: 'bg-red-100 text-red-700' },
      needs_approval: { label: 'نیازمند تأیید', color: 'bg-orange-100 text-orange-700' },
      cancelled: { label: 'لغو شده', color: 'bg-gray-100 text-gray-700' },
    };
    const item = map[s] || map.pending;
    return <Badge className={item.color}>{item.label}</Badge>;
  };

  const handleSave = () => {
    updateResolution(resolution.id, { progress, status });
    setEditing(false);
    alert('✅ وضعیت مصوبه به‌روزرسانی شد');
  };

  const handleDelete = () => {
    if (confirm('آیا از حذف این مصوبه مطمئن هستید؟')) {
      deleteResolution(resolution.id);
      navigate('/resolutions');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <Button onClick={() => navigate('/resolutions')} variant="outline">
            <ArrowLeft className="w-4 h-4 ml-2" />
            بازگشت
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{resolution.title}</h1>
            <p className="text-sm text-slate-500 mt-1">{resolution.code}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {!editing ? (
            <Button onClick={() => setEditing(true)} className="bg-blue-600">ویرایش وضعیت</Button>
          ) : (
            <>
              <Button onClick={handleSave} className="bg-green-600"><Save className="w-4 h-4 ml-1" />ذخیره</Button>
              <Button variant="outline" onClick={() => setEditing(false)}>انصراف</Button>
            </>
          )}
          <Button onClick={handleDelete} variant="outline" className="text-red-600 border-red-300">
            <Trash2 className="w-4 h-4 ml-1" />حذف
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle>وضعیت</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {editing ? (
              <select value={status} onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg">
                <option value="pending">در انتظار شروع</option>
                <option value="in_progress">در حال انجام</option>
                <option value="completed">تکمیل شده</option>
                <option value="overdue">تأخیر دار</option>
                <option value="needs_approval">نیازمند تأیید</option>
                <option value="cancelled">لغو شده</option>
              </select>
            ) : getStatusBadge(resolution.status)}
            <div className="pt-3 border-t">
              <p className="text-xs text-slate-500 mb-2">درصد پیشرفت</p>
              {editing ? (
                <input type="range" min="0" max="100" value={progress}
                  onChange={(e) => setProgress(parseInt(e.target.value))}
                  className="w-full" />
              ) : null}
              <p className="text-2xl font-bold text-slate-900 mt-2">{toPersianNumber(editing ? progress : resolution.progress)}٪</p>
              <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                <div className={`h-2 rounded-full ${
                  (editing ? progress : resolution.progress) === 100 ? 'bg-green-500' :
                  (editing ? progress : resolution.progress) >= 50 ? 'bg-blue-500' : 'bg-orange-500'
                }`} style={{ width: `${editing ? progress : resolution.progress}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>اطلاعات</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-slate-500">تاریخ شروع</p>
              <p className="text-sm font-medium">{toPersianNumber(resolution.startDate)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">مهلت</p>
              <p className="text-sm font-medium">{toPersianNumber(resolution.dueDate)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">واحد</p>
              <p className="text-sm font-medium">{getDeptName(resolution.departmentId)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">اولویت</p>
              <Badge className="bg-orange-100 text-orange-700">{resolution.priority}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>مسئولین اجرا</CardTitle></CardHeader>
          <CardContent>
            {(resolution.assigneeIds || []).length === 0 ? (
              <p className="text-sm text-slate-500">مسئولی تعیین نشده</p>
            ) : (
              <div className="space-y-2">
                {resolution.assigneeIds.map(userId => (
                  <div key={userId} className="flex items-center gap-2 p-2 bg-slate-50 rounded">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                      {getUserName(userId).charAt(0)}
                    </div>
                    <span className="text-sm">{getUserName(userId)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>توضیحات</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-slate-700">{resolution.description || 'بدون توضیحات'}</p>
          {resolution.expectedAction && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-slate-500 mb-2">اقدام مورد انتظار:</p>
              <p className="text-sm text-slate-600">{resolution.expectedAction}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}