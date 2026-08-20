import React from 'react';
import { KPIDashboard } from '@/components/KPIDashboard';
import { GanttChart } from '@/components/GanttChart';

export function KPIPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">داشبورد KPI و عملکرد</h1>
        <p className="text-sm text-slate-500 mt-1">تحلیل جامع عملکرد واحدها و مسئولین</p>
      </div>
      <KPIDashboard />
      <GanttChart />
    </div>
  );
}