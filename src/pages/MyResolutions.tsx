import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
import { toPersianNumber } from '@/lib/utils';
import { CheckSquare, Calendar, TrendingUp } from 'lucide-react';

export function MyResolutions() {
  const { resolutions, currentUser } = useApp();
  const navigate = useNavigate();

  const safeResolutions = resolutions || [];
  const myResolutions = safeResolutions.filter(r => 
    !r.isArchived && r.assigneeIds.includes(currentUser?.id || '')
  );

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      pending: { label: 'در انتظار شروع', color: 'bg-slate-100 text-slate-700' },
      in_progress: { label: 'در حال انجام', color: 'bg-blue-100 text-blue-700' },
      completed: { label: 'تکمیل شده', color: 'bg-green-100 text-green-700' },
      overdue: { label: 'تأخیر دار', color: 'bg-red-100 text-red-700' },
      needs_approval: { label: 'نیازمند تأیید', color: 'bg-orange-100 text-orange-700' },
    };
    const s = statusMap[status] || statusMap.pending;
    return <Badge className={s.color}>{s.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">مصوبات من</h1>
        <p className="text-sm text-slate-500 mt-1">مصوباتی که به شما محول شده است</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>لیست مصوبات ({toPersianNumber(myResolutions.length)})</CardTitle>
        </CardHeader>
        <CardContent>
          {myResolutions.length === 0 ? (
            <div className="text-center py-12">
              <CheckSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">مصوبه‌ای به شما محول نشده است</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myResolutions.map(resolution => (
                <div
                  key={resolution.id}
                  onClick={() => navigate(`/resolutions/detail/${resolution.id}`)}
                  className="border border-slate-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <span className="text-xs text-slate-500 font-mono">{resolution.code}</span>
                      <h3 className="font-semibold text-slate-900 mt-1">{resolution.title}</h3>
                    </div>
                    {getStatusBadge(resolution.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>مهلت: {toPersianNumber(resolution.dueDate)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>پیشرفت: {toPersianNumber(resolution.progress)}٪</span>
                    </div>
                  </div>

                  {resolution.progress > 0 && (
                    <div className="mt-3">
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            resolution.progress === 100 ? 'bg-green-500' :
                            resolution.progress >= 50 ? 'bg-blue-500' : 'bg-orange-500'
                          }`}
                          style={{ width: `${resolution.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}