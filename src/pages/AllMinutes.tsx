import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
import { toPersianNumber } from '@/lib/utils';
import { FileText, Calendar, User } from 'lucide-react';

export function AllMinutes() {
  const { meetings, users } = useApp();
  const navigate = useNavigate();

  const safeMeetings = meetings || [];
  const safeUsers = users || [];

  const allMinutes = safeMeetings
    .filter(m => !m.isArchived && m.minuteRows && m.minuteRows.length > 0)
    .flatMap(m => 
      m.minuteRows.map(row => ({
        ...row,
        meetingCode: m.code,
        meetingTitle: m.title,
        meetingDate: m.date,
      }))
    );

  const getUserName = (userId?: string) => {
    if (!userId) return 'نامشخص';
    const user = safeUsers.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'نامشخص';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">نمای تجمیعی مصوبات</h1>
        <p className="text-sm text-slate-500 mt-1">تمام مصوبات از تمام جلسات</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>کل مصوبات ({toPersianNumber(allMinutes.length)})</CardTitle>
        </CardHeader>
        <CardContent>
          {allMinutes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">مصوبه‌ای ثبت نشده است</p>
            </div>
          ) : (
            <div className="space-y-3">
              {allMinutes.map((minute, idx) => (
                <div key={minute.id || idx} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-slate-500 font-mono">{minute.meetingCode}</span>
                        <Badge className="bg-blue-100 text-blue-700">{minute.status}</Badge>
                      </div>
                      <h3 className="font-semibold text-slate-900">{minute.description}</h3>
                      <p className="text-xs text-slate-500 mt-1">{minute.meetingTitle}</p>
                    </div>
                  </div>

                  {minute.actionRequired && (
                    <p className="text-sm text-slate-600 mb-2">اقدام لازم: {minute.actionRequired}</p>
                  )}

                  <div className="grid grid-cols-3 gap-3 text-xs text-slate-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{toPersianNumber(minute.meetingDate)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{minute.assigneeName}</span>
                    </div>
                    <div>
                      <span>مهلت: {toPersianNumber(minute.dueDate)}</span>
                    </div>
                  </div>

                  {minute.progress > 0 && (
                    <div className="mt-3">
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-blue-500"
                          style={{ width: `${minute.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">پیشرفت: {toPersianNumber(minute.progress)}٪</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}