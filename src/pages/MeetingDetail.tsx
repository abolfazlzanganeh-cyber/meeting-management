import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@/components/ui';
import { toPersianNumber } from '@/lib/utils';
import { ArrowLeft, Calendar, MapPin, Users, CheckSquare } from 'lucide-react';

export function MeetingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { meetings, users, departments, meetingTypes } = useApp();

  // ✅ یافتن ایمن جلسه بر اساس ID
  const meeting = (meetings || []).find(m => m.id === id);

  if (!meeting) {
    return (
      <div className="p-6 text-center">
        <p className="text-slate-500 dark:text-slate-400">جلسه یافت نشد</p>
        <Button onClick={() => navigate('/meetings')} className="mt-4">بازگشت به لیست جلسات</Button>
      </div>
    );
  }

  const safeUsers = users || [];
  const safeDepts = departments || [];

  const getUserName = (userId: string) => {
    const user = safeUsers.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'نامشخص';
  };

  const getDeptName = (deptId: string) => safeDepts.find(d => d.id === deptId)?.name || 'نامشخص';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button onClick={() => navigate('/meetings')} variant="outline">
          <ArrowLeft className="w-4 h-4 ml-2" />
          بازگشت
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{meeting.title}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{meeting.code}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="dark:text-white">اطلاعات جلسه</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-slate-400" /><span className="text-sm dark:text-slate-300">تاریخ: {toPersianNumber(meeting.date)}</span></div>
            <div className="flex items-center gap-2"><span className="text-sm dark:text-slate-300">ساعت: {toPersianNumber(meeting.startTime)} {meeting.endTime ? `تا ${toPersianNumber(meeting.endTime)}` : ''}</span></div>
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" /><span className="text-sm dark:text-slate-300">مکان: {meeting.location}</span></div>
            <div className="flex items-center gap-2"><Users className="w-4 h-4 text-slate-400" /><span className="text-sm dark:text-slate-300">واحد: {getDeptName(meeting.departmentId)}</span></div>
            <div className="pt-3 border-t dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">رئیس جلسه:</p>
              <p className="text-sm font-medium dark:text-white">{getUserName(meeting.chairmanId)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">دبیر جلسه:</p>
              <p className="text-sm font-medium dark:text-white">{getUserName(meeting.secretaryId)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="dark:text-white">دستور جلسه</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-slate-700 dark:text-slate-300">{meeting.subject || 'بدون موضوع'}</p>
            {meeting.generalNotes && (
              <div className="mt-4 pt-4 border-t dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">یادداشت‌های کلی:</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">{meeting.generalNotes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="dark:text-white">مصوبات جلسه ({toPersianNumber(meeting.minuteRows?.length || 0)})</CardTitle></CardHeader>
        <CardContent>
          {!meeting.minuteRows || meeting.minuteRows.length === 0 ? (
            <div className="text-center py-8">
              <CheckSquare className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400">مصوبه‌ای ثبت نشده است</p>
            </div>
          ) : (
            <div className="space-y-3">
              {meeting.minuteRows.map((row, idx) => (
                <div key={row.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">#{toPersianNumber(idx + 1)}</span>
                      <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">{row.status}</Badge>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">پیشرفت: {toPersianNumber(row.progress)}٪</span>
                  </div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white mb-2">{row.description}</p>
                  {row.actionRequired && <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">اقدام لازم: {row.actionRequired}</p>}
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>مسئول: {row.assigneeName}</span>
                    <span>مهلت: {toPersianNumber(row.dueDate)}</span>
                  </div>
                  {row.progress > 0 && (
                    <div className="mt-2">
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div className="h-2 rounded-full bg-blue-500" style={{ width: `${row.progress}%` }} />
                      </div>
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