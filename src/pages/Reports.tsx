import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';
import { toPersianNumber, RESOLUTION_STATUS_CONFIG } from '@/lib/utils';
import * as XLSX from 'xlsx';
import { FileSpreadsheet, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';

export function Reports() {
  const { resolutions, meetings, users, departments } = useApp();
  const [activeReport, setActiveReport] = useState('overview');

  const activeRes = resolutions.filter(r => !r.isArchived);

  const stats = {
    total: activeRes.length,
    completed: activeRes.filter(r => r.status === 'completed').length,
    overdue: activeRes.filter(r => r.status === 'overdue').length,
    inProgress: activeRes.filter(r => r.status === 'in_progress').length,
    pending: activeRes.filter(r => r.status === 'pending').length,
    needsApproval: activeRes.filter(r => r.status === 'needs_approval').length,
    avgProgress: activeRes.length > 0 ? Math.round(activeRes.reduce((s, r) => s + r.progress, 0) / activeRes.length) : 0,
  };

  const byDept = departments.map(d => {
    const deptRes = activeRes.filter(r => r.departmentId === d.id);
    const completed = deptRes.filter(r => r.status === 'completed').length;
    const overdue = deptRes.filter(r => r.status === 'overdue').length;
    const avgProg = deptRes.length > 0 ? Math.round(deptRes.reduce((s, r) => s + r.progress, 0) / deptRes.length) : 0;
    return { name: d.name, total: deptRes.length, completed, overdue, avgProgress: avgProg };
  }).filter(d => d.total > 0);

  const byUser = users.map(u => {
    const userRes = activeRes.filter(r => r.assigneeIds.includes(u.id));
    const completed = userRes.filter(r => r.status === 'completed').length;
    const overdue = userRes.filter(r => r.status === 'overdue').length;
    const avgProg = userRes.length > 0 ? Math.round(userRes.reduce((s, r) => s + r.progress, 0) / userRes.length) : 0;
    return {
      name: `${u.firstName} ${u.lastName}`,
      total: userRes.length, completed, overdue, avgProgress: avgProg,
    };
  }).filter(u => u.total > 0);

  const statusData = Object.entries(RESOLUTION_STATUS_CONFIG).map(([k, v]) => ({
    name: v.label,
    value: activeRes.filter(r => r.status === k).length,
    color: k === 'completed' ? '#10b981' : k === 'overdue' ? '#ef4444' : k === 'in_progress' ? '#3b82f6' : k === 'needs_approval' ? '#f59e0b' : k === 'pending' ? '#94a3b8' : '#64748b',
  })).filter(d => d.value > 0);

  const exportToExcel = () => {
    const data = activeRes.map(r => {
      const meeting = meetings.find(m => m.id === r.meetingId);
      const dept = departments.find(d => d.id === r.departmentId);
      const assignees = users.filter(u => r.assigneeIds.includes(u.id));
      return {
        'کد مصوبه': r.code,
        'عنوان': r.title,
        'جلسه': meeting?.title || '',
        'تاریخ جلسه': meeting?.date || '',
        'واحد': dept?.name || '',
        'مسئولین': assignees.map(a => `${a.firstName} ${a.lastName}`).join('، '),
        'اولویت': r.priority,
        'وضعیت': RESOLUTION_STATUS_CONFIG[r.status].label,
        'پیشرفت': `${r.progress}%`,
        'تاریخ شروع': r.startDate,
        'سررسید': r.dueDate,
      };
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'مصوبات');
    XLSX.writeFile(wb, `گزارش-مصوبات-${Date.now()}.xlsx`);
  };

  const reports = [
    { id: 'overview', label: 'نمای کلی', icon: BarChart3 },
    { id: 'departments', label: 'عملکرد واحدها', icon: BarChart3 },
    { id: 'users', label: 'عملکرد افراد', icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">گزارش‌ها</h1>
          <p className="text-sm text-slate-500 mt-1">تحلیل و گزارش‌گیری از وضعیت مصوبات</p>
        </div>
        <Button onClick={exportToExcel}>
          <FileSpreadsheet className="w-4 h-4" />
          خروجی Excel
        </Button>
      </div>

      <div className="flex gap-2">
        {reports.map(r => (
          <button
            key={r.id}
            onClick={() => setActiveReport(r.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeReport === r.id ? 'bg-primary-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <r.icon className="w-4 h-4" />
            {r.label}
          </button>
        ))}
      </div>

      {activeReport === 'overview' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-slate-500 mb-1">کل مصوبات</div>
                <div className="text-2xl font-bold">{toPersianNumber(stats.total)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-slate-500 mb-1">تکمیل شده</div>
                <div className="text-2xl font-bold text-green-600">{toPersianNumber(stats.completed)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-slate-500 mb-1">تأخیر دار</div>
                <div className="text-2xl font-bold text-red-600">{toPersianNumber(stats.overdue)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-slate-500 mb-1">میانگین پیشرفت</div>
                <div className="text-2xl font-bold text-primary-600">{toPersianNumber(stats.avgProgress)}٪</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>توزیع وضعیت</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label>
                      {statusData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>مصوبات بر اساس واحد</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={byDept}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total" name="کل" fill="#3b82f6" />
                    <Bar dataKey="completed" name="تکمیل" fill="#10b981" />
                    <Bar dataKey="overdue" name="تأخیر" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {activeReport === 'departments' && (
        <Card>
          <CardHeader><CardTitle>عملکرد واحدها</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-right text-xs font-semibold">واحد</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold">کل مصوبات</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold">تکمیل شده</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold">تأخیر دار</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold">میانگین پیشرفت</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold">درصد تحقق</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {byDept.map(d => (
                    <tr key={d.name} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-sm">{d.name}</td>
                      <td className="px-4 py-3 text-sm">{toPersianNumber(d.total)}</td>
                      <td className="px-4 py-3 text-sm text-green-600">{toPersianNumber(d.completed)}</td>
                      <td className="px-4 py-3 text-sm text-red-600">{toPersianNumber(d.overdue)}</td>
                      <td className="px-4 py-3 text-sm">{toPersianNumber(d.avgProgress)}٪</td>
                      <td className="px-4 py-3 text-sm">
                        {d.total > 0 ? toPersianNumber(Math.round((d.completed / d.total) * 100)) + '٪' : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeReport === 'users' && (
        <Card>
          <CardHeader><CardTitle>عملکرد افراد</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-right text-xs font-semibold">کاربر</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold">کل مصوبات</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold">تکمیل شده</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold">تأخیر دار</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold">میانگین پیشرفت</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold">درصد تحقق</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {byUser.map(u => (
                    <tr key={u.name} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-sm">{u.name}</td>
                      <td className="px-4 py-3 text-sm">{toPersianNumber(u.total)}</td>
                      <td className="px-4 py-3 text-sm text-green-600">{toPersianNumber(u.completed)}</td>
                      <td className="px-4 py-3 text-sm text-red-600">{toPersianNumber(u.overdue)}</td>
                      <td className="px-4 py-3 text-sm">{toPersianNumber(u.avgProgress)}٪</td>
                      <td className="px-4 py-3 text-sm">
                        {u.total > 0 ? toPersianNumber(Math.round((u.completed / u.total) * 100)) + '٪' : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}