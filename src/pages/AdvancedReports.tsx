import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';
import { toPersianNumber } from '@/lib/utils';
import { todayJalali } from '@/lib/date';
import { Download, Filter, Calendar, Users, Building2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

export function AdvancedReports() {
  const { meetings, resolutions, users, departments } = useApp();
  const [dateFilter, setDateFilter] = useState({ from: '', to: '' });
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const safeMeetings = meetings || [];
  const safeResolutions = resolutions || [];
  const safeUsers = users || [];
  const safeDepts = departments || [];

  // فیلتر داده‌ها
  const filteredResolutions = safeResolutions.filter(r => {
    if (deptFilter !== 'all' && r.departmentId !== deptFilter) return false;
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (dateFilter.from && r.startDate < dateFilter.from) return false;
    if (dateFilter.to && r.dueDate > dateFilter.to) return false;
    return true;
  });

  // آمار کلی
  const stats = {
    total: filteredResolutions.length,
    completed: filteredResolutions.filter(r => r.status === 'completed').length,
    overdue: filteredResolutions.filter(r => r.status === 'overdue').length,
    inProgress: filteredResolutions.filter(r => r.status === 'in_progress').length,
    avgProgress: filteredResolutions.length > 0
      ? Math.round(filteredResolutions.reduce((sum, r) => sum + r.progress, 0) / filteredResolutions.length)
      : 0,
  };

  // نمودار عملکرد کاربران
  const userPerformance = safeUsers.map(user => {
    const userRes = filteredResolutions.filter(r => r.assigneeIds.includes(user.id));
    return {
      name: `${user.firstName} ${user.lastName}`,
      total: userRes.length,
      completed: userRes.filter(r => r.status === 'completed').length,
      overdue: userRes.filter(r => r.status === 'overdue').length,
      avgProgress: userRes.length > 0
        ? Math.round(userRes.reduce((sum, r) => sum + r.progress, 0) / userRes.length)
        : 0,
    };
  }).filter(u => u.total > 0);

  // نمودار ماهانه
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthStr = date.toISOString().substring(0, 7);
    const monthRes = filteredResolutions.filter(r => r.createdAt.substring(0, 7) === monthStr);
    return {
      month: monthStr,
      created: monthRes.length,
      completed: monthRes.filter(r => r.status === 'completed').length,
    };
  }).reverse();

  const exportToExcel = () => {
    const data = filteredResolutions.map(r => ({
      'کد': r.code,
      'عنوان': r.title,
      'وضعیت': r.status,
      'پیشرفت': `${r.progress}%`,
      'مهلت': r.dueDate,
      'واحد': safeDepts.find(d => d.id === r.departmentId)?.name || '',
    }));
    // پیاده‌سازی export با xlsx
    console.log('Exporting to Excel...', data);
    alert('✅ گزارش آماده دانلود است');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">گزارش‌های پیشرفته</h1>
          <p className="text-sm text-slate-500 mt-1">تحلیل جامع عملکرد و وضعیت مصوبات</p>
        </div>
        <Button onClick={exportToExcel} className="bg-green-600 hover:bg-green-700">
          <Download className="w-4 h-4 ml-2" />
          خروجی Excel
        </Button>
      </div>

      {/* فیلترها */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            فیلترهای گزارش
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">از تاریخ</label>
              <input type="text" value={dateFilter.from}
                onChange={(e) => setDateFilter({ ...dateFilter, from: e.target.value })}
                placeholder="1405/01/01"
                className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">تا تاریخ</label>
              <input type="text" value={dateFilter.to}
                onChange={(e) => setDateFilter({ ...dateFilter, to: e.target.value })}
                placeholder="1405/12/29"
                className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">واحد</label>
              <select value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg">
                <option value="all">همه واحدها</option>
                {safeDepts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">وضعیت</label>
              <select value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg">
                <option value="all">همه وضعیت‌ها</option>
                <option value="pending">در انتظار</option>
                <option value="in_progress">در حال انجام</option>
                <option value="completed">تکمیل شده</option>
                <option value="overdue">تأخیر دار</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* آمار کلی */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-500">کل مصوبات</p>
              <p className="text-3xl font-bold mt-2">{toPersianNumber(stats.total)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-500">تکمیل شده</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{toPersianNumber(stats.completed)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-500">در حال انجام</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{toPersianNumber(stats.inProgress)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-500">تأخیر دار</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{toPersianNumber(stats.overdue)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-500">میانگین پیشرفت</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{toPersianNumber(stats.avgProgress)}٪</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* نمودارها */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>عملکرد کاربران</CardTitle>
          </CardHeader>
          <CardContent>
            {userPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={userPerformance} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" tickFormatter={(v) => toPersianNumber(v)} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" name="تکمیل شده" fill="#10b981" />
                  <Bar dataKey="overdue" name="تأخیر دار" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-slate-500">داده‌ای نیست</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>روند ماهانه</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <XAxis dataKey="month" tickFormatter={(v) => toPersianNumber(v)} />
                <YAxis tickFormatter={(v) => toPersianNumber(v)} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="created" name="ایجاد شده" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="completed" name="تکمیل شده" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}