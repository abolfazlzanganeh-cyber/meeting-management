import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@/components/ui';
import { toPersianNumber } from '@/lib/utils';
import { ArrowLeft, Calendar, User, Building2, TrendingUp } from 'lucide-react';

export function ResolutionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { resolutions, users, departments } = useApp();

  const resolution = (resolutions || []).find(r => r.id === id);

  if (!resolution) {
    return (
      <div className="p-6 text-center">
        <p className="text-slate-500">مصوبه یافت نشد</p>
        <Button onClick={() => navigate('/resolutions')} className="mt-4">
          بازگشت به لیست مصوبات
        </Button>
      </div>
    );
  }

  const safeUsers = users || [];
  const safeDepts = departments || [];

  const getUserName = (userId: string) => {
    const user = safeUsers.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'نامشخص';
  };

  const getDeptName = (deptId: string) => {
    return safeDepts.find(d => d.id === deptId)?.name || 'نامشخص';
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      pending: { label: 'در انتظار شروع', color: 'bg-slate-100 text-slate-700' },
      in_progress: { label: 'در حال انجام', color: 'bg-blue-100 text-blue-700' },
      completed: { label: 'تکمیل شده', color: 'bg-green-100 text-green-700' },
      overdue: { label: 'تأخیر دار', color: 'bg-red-100 text-red-700' },
      needs_approval: { label: 'نیازمند تأیید', color: 'bg-orange-100 text-orange-700' },
      cancelled: { label: 'لغو شده', color: 'bg-gray-100 text-gray-700' },
    };
    const s = statusMap[status] || statusMap.pending;
    return <Badge className={s.color}>{s.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityMap: Record<string, string> = {
      critical: 'bg-red-500 text-white',
      high: 'bg-orange-500 text-white',
      medium: 'bg-yellow-500 text-white',
      low: 'bg-slate-500 text-white',
    };
    return <Badge className={priorityMap[priority] || priorityMap.medium}>{priority}</Badge>;
  };

  return (
    <div className="space-y-6">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>وضعیت</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>{getStatusBadge(resolution.status)}</div>
            <div>{getPriorityBadge(resolution.priority)}</div>
            <div className="pt-3 border-t">
              <p className="text-xs text-slate-500 mb-1">پیشرفت</p>
              <p className="text-2xl font-bold text-slate-900">{toPersianNumber(resolution.progress)}٪</p>
              <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                <div
                  className={`h-2 rounded-full ${
                    resolution.progress === 100 ? 'bg-green-500' :
                    resolution.progress >= 50 ? 'bg-blue-500' : 'bg-orange-500'
                  }`}
                  style={{ width: `${resolution.progress}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>اطلاعات</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">تاریخ شروع</p>
                <p className="text-sm">{toPersianNumber(resolution.startDate)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">مهلت</p>
                <p className="text-sm">{toPersianNumber(resolution.dueDate)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">واحد</p>
                <p className="text-sm">{getDeptName(resolution.departmentId)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>مسئولین</CardTitle>
          </CardHeader>
          <CardContent>
            {resolution.assigneeIds.length === 0 ? (
              <p className="text-sm text-slate-500">مسئولی تعیین نشده</p>
            ) : (
              <div className="space-y-2">
                {resolution.assigneeIds.map(id => (
                  <div key={id} className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-sm">{getUserName(id)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>توضیحات</CardTitle>
        </CardHeader>
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