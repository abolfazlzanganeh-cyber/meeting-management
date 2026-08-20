import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, Badge, ProgressBar } from '@/components/ui';
import { RESOLUTION_STATUS_CONFIG, PRIORITY_CONFIG, getDaysRemainingInfo } from '@/lib/utils';
import { CheckSquare } from 'lucide-react';

export function MyResolutions() {
  const { resolutions, meetings, departments, currentUser } = useApp();
  const navigate = useNavigate();

  const myResolutions = resolutions.filter(r => 
    !r.isArchived && r.assigneeIds.includes(currentUser?.id || '')
  ).sort((a, b) => {
    const aDays = getDaysRemainingInfo(a.dueDate).days;
    const bDays = getDaysRemainingInfo(b.dueDate).days;
    return aDays - bDays;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">مصوبات من</h1>
        <p className="text-sm text-slate-500 mt-1">اقداماتی که به شما واگذار شده است</p>
      </div>

      {myResolutions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">اقدامی به شما واگذار نشده است</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myResolutions.map(r => {
            const meeting = meetings.find(m => m.id === r.meetingId);
            const dept = departments.find(d => d.id === r.departmentId);
            const statusConfig = RESOLUTION_STATUS_CONFIG[r.status];
            const priorityConfig = PRIORITY_CONFIG[r.priority];
            const daysInfo = getDaysRemainingInfo(r.dueDate);

            return (
              <Card key={r.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/resolutions/detail/${r.id}`)}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={r.status === 'completed' ? 'success' : r.status === 'overdue' ? 'danger' : r.status === 'needs_approval' ? 'warning' : 'info'} dot size="sm">
                          {statusConfig.label}
                        </Badge>
                        <Badge variant={r.priority === 'critical' ? 'danger' : r.priority === 'high' ? 'warning' : 'info'} size="sm">
                          {priorityConfig.label}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-slate-900 truncate">{r.title}</h3>
                      <p className="text-xs text-slate-500 mt-1">{meeting?.title}</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <ProgressBar value={r.progress} status={r.status} />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-slate-500">
                      <span>{dept?.name}</span>
                      <span>•</span>
                      <span>سررسید: {r.dueDate}</span>
                    </div>
                    <div className={`font-medium ${daysInfo.color}`}>{daysInfo.text}</div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}