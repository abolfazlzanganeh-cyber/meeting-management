import React from 'react';
import type { AuditEntry } from '@/types';
import { toPersianNumber } from '@/lib/utils';
import { formatRelative } from '@/lib/date';
import { History, User, Calendar, Edit, Trash2, CheckCircle, AlertTriangle, Clock, Plus } from 'lucide-react';

interface AuditTimelineProps {
  entries: AuditEntry[];
  title?: string;
}

export function AuditTimeline({ entries, title = 'تاریخچه تغییرات' }: AuditTimelineProps) {
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created': return <Plus className="w-4 h-4 text-green-600" />;
      case 'updated': return <Edit className="w-4 h-4 text-blue-600" />;
      case 'deleted': return <Trash2 className="w-4 h-4 text-red-600" />;
      case 'status_changed': return <CheckCircle className="w-4 h-4 text-purple-600" />;
      case 'deadline_changed': return <Clock className="w-4 h-4 text-orange-600" />;
      case 'assigned': return <User className="w-4 h-4 text-indigo-600" />;
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <History className="w-4 h-4 text-slate-600" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created': return 'bg-green-100 border-green-300';
      case 'updated': return 'bg-blue-100 border-blue-300';
      case 'deleted': return 'bg-red-100 border-red-300';
      case 'status_changed': return 'bg-purple-100 border-purple-300';
      case 'deadline_changed': return 'bg-orange-100 border-orange-300';
      case 'assigned': return 'bg-indigo-100 border-indigo-300';
      case 'approved': return 'bg-green-100 border-green-300';
      case 'rejected': return 'bg-red-100 border-red-300';
      default: return 'bg-slate-100 border-slate-300';
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'created': return 'ایجاد';
      case 'updated': return 'ویرایش';
      case 'deleted': return 'حذف';
      case 'status_changed': return 'تغییر وضعیت';
      case 'deadline_changed': return 'تغییر مهلت';
      case 'assigned': return 'واگذاری';
      case 'approved': return 'تأیید';
      case 'rejected': return 'رد';
      default: return 'تغییر';
    }
  };

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p>تاریخچه‌ای ثبت نشده است</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {title && (
        <div className="flex items-center gap-2 mb-4">
          <History className="w-5 h-5 text-slate-600" />
          <h3 className="font-semibold text-slate-900">{title}</h3>
          <span className="text-xs text-slate-500">({toPersianNumber(entries.length)} مورد)</span>
        </div>
      )}

      <div className="relative">
        <div className="absolute right-5 top-0 bottom-0 w-0.5 bg-slate-200"></div>

        <div className="space-y-4">
          {entries.map((entry) => (
            <div key={entry.id} className="relative flex gap-4">
              <div className={`relative z-10 w-10 h-10 rounded-full border-2 ${getActionColor(entry.action)} flex items-center justify-center flex-shrink-0`}>
                {getActionIcon(entry.action)}
              </div>

              <div className="flex-1 bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded ${getActionColor(entry.action)}`}>
                        {getActionLabel(entry.action)}
                      </span>
                      <span className="text-xs text-slate-500">
                        {entry.entityType === 'meeting' ? 'جلسه' : entry.entityType === 'minute_row' ? 'مصوبه' : entry.entityType === 'resolution' ? 'مصوبه مستقل' : 'حاضر'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-900 font-medium">{entry.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{entry.userName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatRelative(entry.timestamp)}</span>
                  </div>
                </div>

                {entry.oldValue && entry.newValue && (
                  <div className="mt-2 p-2 bg-slate-50 rounded text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-red-600 line-through">{entry.oldValue}</span>
                      <span className="text-slate-400">→</span>
                      <span className="text-green-600 font-medium">{entry.newValue}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}