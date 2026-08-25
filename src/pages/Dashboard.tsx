import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { toPersianNumber } from '@/lib/utils';
import { todayJalali } from '@/lib/date';
import { Calendar, CheckSquare, Clock, AlertTriangle, CheckCircle2, TrendingUp, BarChart3, Target } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export function Dashboard() {
  const { meetings, resolutions, departments } = useApp();
  const navigate = useNavigate();
  const today = todayJalali();

  // ✅ ایمن‌سازی حیاتی: جلوگیری از کرش در صورت undefined بودن داده‌ها
  const safeMeetings = meetings || [];
  const safeResolutions = resolutions || [];
  const safeDepartments = departments || [];

  const totalMeetings = safeMeetings.filter(m => !m.isArchived).length;
  const currentMonthMeetings = safeMeetings.filter(m => m.date.substring(0, 7) === today.substring(0, 7)).length;
  const futureMeetings = safeMeetings.filter(m => m.date >= today && m.status === 'scheduled').length;
  
  const activeResolutions = safeResolutions.filter(r => !r.isArchived);
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
    { label: 'کل مصوبات', value: activeResolutions.length, icon: CheckSquare, color: 'bg-slate-600', link: '/resolutions' },
    { label: 'در حال انجام', value: inProgressResolutions, icon: TrendingUp, color: 'bg-blue-500', link: '/resolutions' },
    { label: 'تأخیر دار', value: overdueResolutions, icon: AlertTriangle, color: 'bg-red-500', link: '/resolutions/overdue' },
    { label: 'تکمیل شده', value: completedResolutions, icon: CheckCircle2, color: 'bg-green-500', link: '/resolutions' },
    { label: 'میانگین پیشرفت', value: `${toPersianNumber(avgProgress)}٪`, icon: BarChart3, color: 'bg-teal-500', link: '/reports' },
  ];

  const statusData = [
    { name: 'در انتظار', value: pendingResolutions, color: '#94a3b8' },
    { name: 'در حال انجام', value: inProgressResolutions, color: '#3b82f6' },
    { name: 'تکمیل شده', value: completedResolutions, color: '#10b981' },
    { name: 'تأخیر دار', value: overdueResolutions, color: '#ef4444' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900">داشبورد</h1><p className="text-sm text-slate-500 mt-1">نمای کلی وضعیت</p></div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} onClick={() => navigate(stat.link)} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center mb-3`}><stat.icon className="w-5 h-5 text-white" /></div>
            <div className="text-2xl font-bold text-slate-900">{toPersianNumber(stat.value)}</div>
            <div className="text-xs text-slate-500">{stat.label}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>وضعیت مصوبات</CardTitle></CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                    {statusData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Pie>
                  <Tooltip /><Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="text-center py-12 text-slate-500">داده‌ای نیست</div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}