import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { toPersianNumber } from '@/lib/utils';
import { todayJalali } from '@/lib/date';
import {
  Calendar, CheckSquare, Clock, AlertTriangle, CheckCircle2,
  TrendingUp, BarChart3, Target
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export function Dashboard() {
  const { meetings, resolutions, departments } = useApp();
  const navigate = useNavigate();
  const today = todayJalali();

  // ✅ اصلاح: اضافه کردن || [] برای تمام آرایه‌ها
  const safeMeetings = meetings || [];
  const safeResolutions = resolutions || [];
  const safeDepartments = departments || [];

  const totalMeetings = safeMeetings.filter(m => !m.isArchived).length;
  const currentMonthMeetings = safeMeetings.filter(m => {
    const mMonth = m.date.substring(0, 7);
    const tMonth = today.substring(0, 7);
    return mMonth === tMonth;
  }).length;
  const futureMeetings = safeMeetings.filter(m => m.date >= today && m.status === 'scheduled').length;
  
  const activeResolutions = safeResolutions.filter(r => !r.isArchived);
  const totalResolutions = activeResolutions.length;
  const pendingResolutions = activeResolutions.filter(r => r.status === 'pending').length;
  const inProgressResolutions = activeResolutions.filter(r => r.status === 'in_progress').length;
  const overdueResolutions = activeResolutions.filter(r => r.status === 'overdue').length;
  const completedResolutions = activeResolutions.filter(r => r.status === 'completed').length;
  const needsApprovalResolutions = activeResolutions.filter(r => r.status === 'needs_approval').length;
  
  const avgProgress = activeResolutions.length > 0
    ? Math.round(activeResolutions.reduce((sum, r) => sum + r.progress, 0) / activeResolutions.length)
    : 0;

  const stats = [
    { label: 'کل جلسات', value: totalMeetings, icon: Calendar, color: 'bg-blue-500', link: '/meetings' },
    { label: 'جلسات ماه جاری', value: currentMonthMeetings, icon: Calendar, color: 'bg-indigo-500', link: '/meetings' },
    { label: 'جلسات آینده', value: futureMeetings, icon: Clock, color: 'bg-purple-500', link: '/meetings' },
    { label: 'کل مصوبات', value: totalResolutions, icon: CheckSquare, color: 'bg-slate-600', link: '/resolutions' },
    { label: 'مصوبات باز', value: pendingResolutions, icon: Target, color: 'bg-gray-500', link: '/resolutions' },
    { label: 'در حال انجام', value: inProgressResolutions, icon: TrendingUp, color: 'bg-blue-500', link: '/resolutions' },
    { label: 'تأخیر دار', value: overdueResolutions, icon: AlertTriangle, color: 'bg-red-500', link: '/resolutions/overdue' },
    { label: 'تکمیل شده', value: completedResolutions, icon: CheckCircle2, color: 'bg-green-500', link: '/resolutions' },
    { label: 'نیازمند تأیید', value: needsApprovalResolutions, icon: Clock, color: 'bg-orange-500', link: '/resolutions/pending-approval' },
    { label: 'میانگین پیشرفت', value: `${toPersianNumber(avgProgress)}٪`, icon: BarChart3, color: 'bg-teal-500', link: '/reports' },
  ];

  const statusData = [
    { name: 'در انتظار شروع', value: pendingResolutions, color: '#94a3b8' },
    { name: 'در حال انجام', value: inProgressResolutions, color: '#3b82f6' },
    { name: 'تکمیل شده', value: completedResolutions, color: '#10b981' },
    { name: 'تأخیر دار', value: overdueResolutions, color: '#ef4444' },
    { name: 'نیازمند تأیید', value: needsApprovalResolutions, color: '#f59e0b' },
  ].filter(d => d.value > 0);

  const deptData = safeDepartments.map(d => {
    const deptRes = activeResolutions.filter(r => r.departmentId === d.id);
    return {
      name: d.name,
      total: deptRes.length,
      completed: deptRes.filter(r => r.status === 'completed').length,
      overdue: deptRes.filter(r => r.status === 'overdue').length,
    };
  }).filter(d => d.total > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">داشبورد</h1>
        <p className="text-sm text-slate-500 mt-1">نمای کلی وضعیت جلسات و مصوبات</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            onClick={() => navigate(stat.link)}
            className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">{toPersianNumber(stat.value)}</div>
            <div className="text-xs text-slate-500">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>توزیع وضعیت مصوبات</CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                    {statusData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-slate-500">داده‌ای برای نمایش وجود ندارد</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>مصوبات بر اساس واحد</CardTitle>
          </CardHeader>
          <CardContent>
            {deptData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={deptData} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" tickFormatter={(v) => toPersianNumber(v)} />
                  <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" name="کل" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="completed" name="تکمیل شده" fill="#10b981" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="overdue" name="تأخیر دار" fill="#ef4444" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-slate-500">داده‌ای برای نمایش وجود ندارد</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}