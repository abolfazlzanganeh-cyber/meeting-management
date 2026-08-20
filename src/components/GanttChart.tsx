import React, { useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { toPersianNumber } from '@/lib/utils';
import { toGregorian } from '@/lib/date';

export function GanttChart() {
  const { resolutions, users } = useApp();

  const activeResolutions = useMemo(() => 
    resolutions.filter(r => !r.isArchived && r.status !== 'completed' && r.status !== 'cancelled'),
    [resolutions]
  );

  // محاسبه بازه زمانی
  const { startDate, endDate, totalDays } = useMemo(() => {
    if (activeResolutions.length === 0) {
      const today = new Date();
      return { startDate: today, endDate: new Date(today.getTime() + 30 * 86400000), totalDays: 30 };
    }
    
    const dates = activeResolutions.flatMap(r => [
      new Date(toGregorian(r.startDate)),
      new Date(toGregorian(r.dueDate)),
    ]);
    
    const min = new Date(Math.min(...dates.map(d => d.getTime())));
    const max = new Date(Math.max(...dates.map(d => d.getTime())));
    
    // اضافه کردن حاشیه
    min.setDate(min.getDate() - 3);
    max.setDate(max.getDate() + 3);
    
    const days = Math.ceil((max.getTime() - min.getTime()) / 86400000);
    return { startDate: min, endDate: max, totalDays: days };
  }, [activeResolutions]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress': return 'bg-blue-500';
      case 'overdue': return 'bg-red-500';
      case 'needs_approval': return 'bg-orange-500';
      case 'pending': return 'bg-slate-400';
      default: return 'bg-slate-400';
    }
  };

  const getProgressWidth = (r: any) => {
    const start = new Date(toGregorian(r.startDate)).getTime();
    const end = new Date(toGregorian(r.dueDate)).getTime();
    const total = end - start;
    const now = Date.now();
    const elapsed = now - start;
    const percent = Math.min(100, Math.max(0, (elapsed / total) * 100));
    return percent;
  };

  if (activeResolutions.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>نمودار گانت مصوبات</CardTitle></CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">مصوبه فعالی وجود ندارد</div>
        </CardContent>
      </Card>
    );
  }

  // نمایش ۱۵ روز اول
  const displayDays = Math.min(totalDays, 30);
  const dayWidth = 100 / displayDays;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>نمودار گانت مصوبات</CardTitle>
          <div className="flex gap-3 text-xs">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-500"></span>در حال انجام</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500"></span>تأخیر دار</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-500"></span>نیازمند تأیید</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header - Days */}
            <div className="flex border-b border-slate-200 dark:border-slate-700 pb-2 mb-2">
              <div className="w-48 flex-shrink-0 text-xs font-semibold text-slate-600 dark:text-slate-400">مصوبه</div>
              <div className="flex-1 flex">
                {Array.from({ length: displayDays }).map((_, i) => {
                  const date = new Date(startDate.getTime() + i * 86400000);
                  const isWeekend = date.getDay() === 5; // پنج‌شنبه
                  return (
                    <div
                      key={i}
                      className={`flex-shrink-0 text-center text-[10px] ${isWeekend ? 'text-red-400' : 'text-slate-400'}`}
                      style={{ width: `${dayWidth}%` }}
                    >
                      {date.getDate()}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rows */}
            <div className="space-y-2">
              {activeResolutions.slice(0, 15).map(r => {
                const start = new Date(toGregorian(r.startDate));
                const end = new Date(toGregorian(r.dueDate));
                const startOffset = Math.max(0, Math.ceil((start.getTime() - startDate.getTime()) / 86400000));
                const duration = Math.ceil((end.getTime() - start.getTime()) / 86400000);
                const left = (startOffset / displayDays) * 100;
                const width = (duration / displayDays) * 100;
                const assignee = users.find(u => r.assigneeIds.includes(u.id));

                return (
                  <div key={r.id} className="flex items-center group">
                    <div className="w-48 flex-shrink-0 pr-3">
                      <div className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate" title={r.title}>
                        {r.title}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {assignee ? `${assignee.firstName} ${assignee.lastName}` : '-'}
                      </div>
                    </div>
                    <div className="flex-1 relative h-8 bg-slate-50 dark:bg-slate-800/50 rounded">
                      {/* Grid lines */}
                      {Array.from({ length: displayDays }).map((_, i) => (
                        <div
                          key={i}
                          className="absolute top-0 bottom-0 border-l border-slate-200 dark:border-slate-700/50"
                          style={{ left: `${(i / displayDays) * 100}%` }}
                        />
                      ))}
                      {/* Bar */}
                      <div
                        className={`absolute top-1.5 h-5 rounded ${getStatusColor(r.status)} opacity-80 group-hover:opacity-100 transition-opacity cursor-pointer`}
                        style={{ left: `${left}%`, width: `${width}%` }}
                        title={`${r.title} - ${r.progress}٪`}
                      >
                        {/* Progress fill */}
                        <div
                          className="h-full bg-white/30 rounded-r"
                          style={{ width: `${r.progress}%` }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white font-bold">
                          {toPersianNumber(r.progress)}٪
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}