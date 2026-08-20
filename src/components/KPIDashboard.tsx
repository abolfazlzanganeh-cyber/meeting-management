import React, { useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
import { toPersianNumber } from '@/lib/utils';
import { TrendingUp, TrendingDown, Target, Award, AlertTriangle, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export function KPIDashboard() {
  const { resolutions, users, departments } = useApp();

  const activeRes = useMemo(() => resolutions.filter(r => !r.isArchived), [resolutions]);

  // KPIهای کلی
  const kpis = useMemo(() => {
    const total = activeRes.length;
    const completed = activeRes.filter(r => r.status === 'completed').length;
    const overdue = activeRes.filter(r => r.status === 'overdue').length;
    const inProgress = activeRes.filter(r => r.status === 'in_progress').length;
    const avgProgress = total > 0 ? Math.round(activeRes.reduce((s, r) => s + r.progress, 0) / total) : 0;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const onTimeRate = total > 0 ? Math.round(((completed - overdue) / total) * 100) : 0;

    return { total, completed, overdue, inProgress, avgProgress, completionRate, onTimeRate };
  }, [activeRes]);

  // امتیاز هر کاربر
  const userScores = useMemo(() => {
    return users.map(u => {
      const userRes = activeRes.filter(r => r.assigneeIds.includes(u.id));
      const total = userRes.length;
      if (total === 0) return null;
      
      const completed = userRes.filter(r => r.status === 'completed').length;
      const overdue = userRes.filter(r => r.status === 'overdue').length;
      const avgProgress = Math.round(userRes.reduce((s, r) => s + r.progress, 0) / total);
      
      // فرمول امتیاز: (تکمیل × ۰) + (پیشرفت × ۰.۵) - (تأخیر × ۵)
      const score = (completed * 10) + (avgProgress * 0.5) - (overdue * 5);
      
      return {
        user: u,
        total,
        completed,
        overdue,
        avgProgress,
        score: Math.max(0, Math.round(score)),
      };
    }).filter(Boolean).sort((a: any, b: any) => b.score - a.score);
  }, [users, activeRes]);

  // امتیاز هر واحد
  const deptScores = useMemo(() => {
    return departments.map(d => {
      const deptRes = activeRes.filter(r => r.departmentId === d.id);
      const total = deptRes.length;
      if (total === 0) return null;
      
      const completed = deptRes.filter(r => r.status === 'completed').length;
      const overdue = deptRes.filter(r => r.status === 'overdue').length;
      const avgProgress = Math.round(deptRes.reduce((s, r) => s + r.progress, 0) / total);
      const score = (completed * 10) + (avgProgress * 0.5) - (overdue * 5);
      
      return {
        dept: d,
        total,
        completed,
        overdue,
        avgProgress,
        score: Math.max(0, Math.round(score)),
      };
    }).filter(Boolean).sort((a: any, b: any) => b.score - a.score);
  }, [departments, activeRes]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { variant: 'success' as const, label: 'عالی' };
    if (score >= 60) return { variant: 'info' as const, label: 'خوب' };
    if (score >= 40) return { variant: 'warning' as const, label: 'متوسط' };
    return { variant: 'danger' as const, label: 'ضعیف' };
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-5 h-5 text-primary-600" />
              <span className="text-xs text-slate-500">نرخ تکمیل</span>
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{toPersianNumber(kpis.completionRate)}٪</div>
            <div className="text-xs text-slate-500 mt-1">از {toPersianNumber(kpis.total)} مصوبه</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-xs text-slate-500">به‌موقع</span>
            </div>
            <div className="text-3xl font-bold text-green-600">{toPersianNumber(kpis.onTimeRate)}٪</div>
            <div className="text-xs text-slate-500 mt-1">{toPersianNumber(kpis.completed - kpis.overdue)} مورد</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span className="text-xs text-slate-500">میانگین پیشرفت</span>
            </div>
            <div className="text-3xl font-bold text-blue-600">{toPersianNumber(kpis.avgProgress)}٪</div>
            <div className="text-xs text-slate-500 mt-1">{toPersianNumber(kpis.inProgress)} در حال انجام</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="text-xs text-slate-500">تأخیر</span>
            </div>
            <div className="text-3xl font-bold text-red-600">{toPersianNumber(kpis.overdue)}</div>
            <div className="text-xs text-slate-500 mt-1">نیاز به پیگیری</div>
          </CardContent>
        </Card>
      </div>

      {/* User Leaderboard */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            <CardTitle>جدول امتیاز مسئولین</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {userScores.length === 0 ? (
            <div className="text-center py-8 text-slate-500">داده‌ای وجود ندارد</div>
          ) : (
            <div className="space-y-2">
              {userScores.slice(0, 10).map((item: any, idx) => {
                const badge = getScoreBadge(item.score);
                return (
                  <div key={item.user.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      idx === 0 ? 'bg-yellow-400 text-yellow-900' :
                      idx === 1 ? 'bg-slate-300 text-slate-700' :
                      idx === 2 ? 'bg-orange-400 text-orange-900' :
                      'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">
                        {item.user.firstName} {item.user.lastName}
                      </div>
                      <div className="text-xs text-slate-500">{item.user.position}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-xs text-slate-500">تکمیل</div>
                        <div className="text-sm font-semibold text-green-600">{toPersianNumber(item.completed)}/{toPersianNumber(item.total)}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-slate-500">پیشرفت</div>
                        <div className="text-sm font-semibold text-blue-600">{toPersianNumber(item.avgProgress)}٪</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-slate-500">تأخیر</div>
                        <div className="text-sm font-semibold text-red-600">{toPersianNumber(item.overdue)}</div>
                      </div>
                      <div className={`text-center min-w-[60px]`}>
                        <div className="text-xs text-slate-500">امتیاز</div>
                        <div className={`text-lg font-bold ${getScoreColor(item.score)}`}>{toPersianNumber(item.score)}</div>
                        <Badge variant={badge.variant} size="sm">{badge.label}</Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Department Performance Chart */}
      <Card>
        <CardHeader><CardTitle>عملکرد واحدها بر اساس امتیاز</CardTitle></CardHeader>
        <CardContent>
          {deptScores.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={deptScores}>
                <XAxis dataKey={(d: any) => d.dept.name} tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip content={({ payload, label }: any) => {
                  if (!payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg px-3 py-2 text-sm">
                      <div className="font-medium mb-1">{label}</div>
                      <div>امتیاز: {toPersianNumber(d.score)}</div>
                      <div>تکمیل: {toPersianNumber(d.completed)}/{toPersianNumber(d.total)}</div>
                      <div>پیشرفت: {toPersianNumber(d.avgProgress)}٪</div>
                    </div>
                  );
                }} />
                <Bar dataKey="score" name="امتیاز" radius={[8, 8, 0, 0]}>
                  {deptScores.map((d: any, i: number) => (
                    <Cell key={i} fill={d.score >= 60 ? '#10b981' : d.score >= 40 ? '#f59e0b' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-slate-500">داده‌ای وجود ندارد</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}