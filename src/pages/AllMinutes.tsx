import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { toPersianNumber, getDaysRemainingInfo } from '@/lib/utils';
import { FileText, Search, Filter, Calendar, User, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

export function AllMinutes() {
  const { meetings, users, departments } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // تجمیع همه مصوبات از همه جلسات
  const allMinutes = useMemo(() => {
    const items: any[] = [];
    meetings.filter(m => !m.isArchived).forEach(m => {
      (m.minuteItems || []).forEach(mi => {
        const assignee = mi.assigneeId ? users.find(u => u.id === mi.assigneeId) : null;
        const dept = assignee ? departments.find(d => d.id === assignee.departmentId) : null;
        items.push({
          ...mi,
          meetingCode: m.code,
          meetingTitle: m.title,
          meetingDate: m.date,
          meetingId: m.id,
          assigneeName: assignee ? `${assignee.firstName} ${assignee.lastName}` : '-',
          assigneePosition: assignee?.position || '-',
          departmentName: dept?.name || '-',
        });
      });
    });
    return items;
  }, [meetings, users, departments]);

  const filtered = useMemo(() => {
    return allMinutes.filter(mi => {
      if (statusFilter !== 'all' && mi.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return mi.description.toLowerCase().includes(q) || mi.meetingTitle.toLowerCase().includes(q) || mi.assigneeName.toLowerCase().includes(q);
      }
      if (dateFrom && mi.meetingDate < dateFrom) return false;
      if (dateTo && mi.meetingDate > dateTo) return false;
      return true;
    });
  }, [allMinutes, search, statusFilter, dateFrom, dateTo]);

  const stats = {
    total: filtered.length,
    completed: filtered.filter(m => m.status === 'completed').length,
    inProgress: filtered.filter(m => m.status === 'in_progress').length,
    new: filtered.filter(m => m.status === 'new').length,
  };

  const statusColors: any = {
    new: 'info', in_progress: 'warning', completed: 'success', cancelled: 'neutral',
  };
  const statusLabels: any = {
    new: 'جدید', in_progress: 'در حال انجام', completed: 'تکمیل شده', cancelled: 'لغو شده',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">نمای تجمیعی همه صورت‌جلسات</h1>
        <p className="text-sm text-slate-500 mt-1">مشاهده همه مصوبات و اقدامات از تمام جلسات</p>
      </div>

      {/* آمار */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4">
          <div className="text-xs text-slate-500 mb-1">کل مصوبات</div>
          <div className="text-2xl font-bold">{toPersianNumber(stats.total)}</div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-xs text-slate-500 mb-1">تکمیل شده</div>
          <div className="text-2xl font-bold text-green-600">{toPersianNumber(stats.completed)}</div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-xs text-slate-500 mb-1">در حال انجام</div>
          <div className="text-2xl font-bold text-blue-600">{toPersianNumber(stats.inProgress)}</div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-xs text-slate-500 mb-1">جدید</div>
          <div className="text-2xl font-bold text-slate-600">{toPersianNumber(stats.new)}</div>
        </CardContent></Card>
      </div>

      {/* فیلترها */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="جستجو در مصوبات..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pr-10 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-primary-500" />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm">
              <option value="all">همه وضعیت‌ها</option>
              <option value="new">جدید</option>
              <option value="in_progress">در حال انجام</option>
              <option value="completed">تکمیل شده</option>
              <option value="cancelled">لغو شده</option>
            </select>
            <input type="text" placeholder="از تاریخ" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm w-32" />
            <input type="text" placeholder="تا تاریخ" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm w-32" />
          </div>
        </CardContent>
      </Card>

      {/* جدول تجمیعی */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-right text-xs font-semibold">وضعیت</th>
                <th className="px-4 py-3 text-right text-xs font-semibold">شرح مصوبه</th>
                <th className="px-4 py-3 text-right text-xs font-semibold">جلسه</th>
                <th className="px-4 py-3 text-right text-xs font-semibold">مسئول</th>
                <th className="px-4 py-3 text-right text-xs font-semibold">واحد</th>
                <th className="px-4 py-3 text-right text-xs font-semibold">مهلت</th>
                <th className="px-4 py-3 text-right text-xs font-semibold">زمان باقی‌مانده</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((mi, idx) => {
                const daysInfo = mi.dueDate ? getDaysRemainingInfo(mi.dueDate) : null;
                return (
                  <tr key={idx} className="hover:bg-slate-50 cursor-pointer" onClick={() => navigate(`/meetings/${mi.meetingId}`)}>
                    <td className="px-4 py-3">
                      <Badge variant={statusColors[mi.status]} size="sm">{statusLabels[mi.status]}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-sm text-slate-900">{mi.description}</div>
                      <div className="text-xs text-slate-500 mt-1">{mi.actionRequired}</div>
                      {mi.notes && <div className="text-xs text-slate-400 mt-1">📝 {mi.notes}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-slate-700">{mi.meetingTitle}</div>
                      <div className="text-xs text-slate-500">{mi.meetingCode} • {mi.meetingDate}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium">{mi.assigneeName}</div>
                      <div className="text-xs text-slate-500">{mi.assigneePosition}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">{mi.departmentName}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{mi.dueDate || '-'}</td>
                    <td className="px-4 py-3">
                      {daysInfo && <div className={`text-sm font-medium ${daysInfo.color}`}>{daysInfo.text}</div>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-slate-500">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            مصوبه‌ای یافت نشد
          </div>
        )}
      </Card>
    </div>
  );
}