import React from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
import { toPersianNumber } from '@/lib/utils';
import { TrendingUp, Award, Target, Clock } from 'lucide-react';

export function KPIDashboard() {
  const { users, resolutions, meetings } = useApp();

  const safeUsers = users || [];
  const safeResolutions = resolutions || [];
  const safeMeetings = meetings || [];

  // محاسبه KPI برای هر کاربر
  const userKPIs = safeUsers.map(user => {
    const userRes = safeResolutions.filter(r => r.assigneeIds.includes(user.id));
    const completed = userRes.filter(r => r.status === 'completed').length;
    const overdue = userRes.filter(r => r.status === 'overdue').length;
    const avgProgress = userRes.length > 0
      ? Math.round(userRes.reduce((sum, r) => sum + r.progress, 0) / userRes.length)
      : 0;
    
    // امتیاز KPI
    const score = userRes.length > 0
      ? Math.round((completed / userRes.length) * 100 - (overdue / userRes.length) * 50 + avgProgress * 0.5)
      : 0;

    return {
      user,
      total: userRes.length,
      completed,
      overdue,
      avgProgress,
      score: Math.max(0, Math.min(100, score)),
    };
  }).filter(u => u.total > 0).sort((a, b) => b.score - a.score);

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-100 text-green-700">عالی</Badge>;
    if (score >= 60) return <Badge className="bg-blue-100 text-blue-700">خوب</Badge>;
    if (score >= 40) return <Badge className="bg-yellow-100 text-yellow-700">متوسط</Badge>;
    return <Badge className="bg-red-100 text-red-700">ضعیف</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">شاخص‌های کلیدی عملکرد (KPI)</h1>
        <p className="text-sm text-slate-500 mt-1">رتبه‌بندی و ارزیابی عملکرد کاربران</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {userKPIs.map((kpi, idx) => (
          <Card key={kpi.user.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold">{kpi.user.firstName} {kpi.user.lastName}</h3>
                      <p className="text-xs text-slate-500">{kpi.user.position}</p>
                    </div>
                  </div>
                </div>
                {getScoreBadge(kpi.score)}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    کل مصوبات
                  </span>
                  <span className="font-bold">{toPersianNumber(kpi.total)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 flex items-center gap-1">
                    <Award className="w-4 h-4 text-green-500" />
                    تکمیل شده
                  </span>
                  <span className="font-bold text-green-600">{toPersianNumber(kpi.completed)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 flex items-center gap-1">
                    <Clock className="w-4 h-4 text-red-500" />
                    تأخیر دار
                  </span>
                  <span className="font-bold text-red-600">{toPersianNumber(kpi.overdue)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                    میانگین پیشرفت
                  </span>
                  <span className="font-bold text-blue-600">{toPersianNumber(kpi.avgProgress)}٪</span>
                </div>
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">امتیاز KPI</span>
                    <span className="text-lg font-bold">{toPersianNumber(kpi.score)}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        kpi.score >= 80 ? 'bg-green-500' :
                        kpi.score >= 60 ? 'bg-blue-500' :
                        kpi.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${kpi.score}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}