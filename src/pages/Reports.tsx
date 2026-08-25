import React from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { toPersianNumber } from '@/lib/utils';
import { BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export function Reports() {
  const { meetings, resolutions, departments } = useApp();

  const safeMeetings = meetings || [];
  const safeResolutions = resolutions || [];
  const safeDepts = departments || [];

  const statusData = [
    { name: 'در انتظار', value: safeResolutions.filter(r => r.status === 'pending').length, color: '#94a3b8' },
    { name: 'در حال انجام', value: safeResolutions.filter(r => r.status === 'in_progress').length, color: '#3b82f6' },
    { name: 'تکمیل شده', value: safeResolutions.filter(r => r.status === 'completed').length, color: '#10b981' },
    { name: 'تأخیر دار', value: safeResolutions.filter(r => r.status === 'overdue').length, color: '#ef4444' },
  ].filter(d => d.value > 0);

  const deptData = safeDepts.map(d => {
    const deptRes = safeResolutions.filter(r => r.departmentId === d.id);
    return {
      name: d.name,
      total: deptRes.length,
      completed: deptRes.filter(r => r.status === 'completed').length,
    };
  }).filter(d => d.total > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">گزارش‌ها</h1>
        <p className="text-sm text-slate-500 mt-1">گزارش‌های آماری سیستم</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-500">کل جلسات</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{toPersianNumber(safeMeetings.length)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-500">کل مصوبات</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{toPersianNumber(safeResolutions.length)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-500">تکمیل شده</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {toPersianNumber(safeResolutions.filter(r => r.status === 'completed').length)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>توزیع وضعیت مصوبات</CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
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
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={deptData} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" tickFormatter={(v) => toPersianNumber(v)} />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" name="کل" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="completed" name="تکمیل شده" fill="#10b981" radius={[0, 4, 4, 0]} />
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