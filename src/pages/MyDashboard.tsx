import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
import { toPersianNumber } from '@/lib/utils';
import { todayJalali } from '@/lib/date';
import { 
  Calendar, CheckSquare, Clock, AlertTriangle, CheckCircle2, 
  TrendingUp, Target, Bell 
} from 'lucide-react';

export function MyDashboard() {
  const { currentUser, resolutions, meetings, notifications } = useApp();
  const navigate = useNavigate();
  const today = todayJalali();

  // ✅ ایمن‌سازی آرایه‌ها
  const safeResolutions = resolutions || [];
  const safeMeetings = meetings || [];
  const safeNotifications = notifications || [];

  // کارهای محول شده به من
  const myTasks = safeResolutions.filter(r => 
    r.assigneeIds.includes(currentUser?.id || '') && 
    !r.isArchived &&
    r.status !== 'completed'
  );

  // کارهای تأخیر دار من
  const myOverdueTasks = myTasks.filter(r => 
    r.dueDate < today && r.status !== 'completed'
  );

  // جلسات آینده‌ای که دعوت هستم
  const myMeetings = safeMeetings.filter(m => 
    !m.isArchived &&
    m.date >= today &&
    m.attendeeGroups.some(g => 
      g.attendees.some(a => a.userId === currentUser?.id)
    )
  ).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);

  // اعلان‌های خوانده نشده من
  const myUnreadNotifications = safeNotifications.filter(n => 
    n.userId === currentUser?.id && !n.isRead
  ).slice(0, 5);

  // آمار عملکرد من
  const myCompletedTasks = safeResolutions.filter(r => 
    r.assigneeIds.includes(currentUser?.id || '') && 
    r.status === 'completed'
  ).length;
  
  const myTotalTasks = safeResolutions.filter(r => 
    r.assigneeIds.includes(currentUser?.id || '')
  ).length;

  const myAvgProgress = myTotalTasks > 0
    ? Math.round(
        safeResolutions
          .filter(r => r.assigneeIds.includes(currentUser?.id || ''))
          .reduce((sum, r) => sum + r.progress, 0) / myTotalTasks
      )
    : 0;

  return (
    <div className="space-y-6">
      {/* هدر */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          داشبورد من
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          خوش آمدید، {currentUser?.firstName} {currentUser?.lastName}
        </p>
      </div>

      {/* آمار کلی */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">کارهای فعال</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {toPersianNumber(myTasks.length)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-300" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">تأخیر دار</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {toPersianNumber(myOverdueTasks.length)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-300" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">تکمیل شده</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {toPersianNumber(myCompletedTasks)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-300" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">میانگین پیشرفت</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {toPersianNumber(myAvgProgress)}٪
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* کارهای محول شده به من */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-blue-500" />
              کارهای محول شده به من
            </CardTitle>
            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
              {toPersianNumber(myTasks.length)}
            </Badge>
          </CardHeader>
          <CardContent>
            {myTasks.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                کاری محول نشده است
              </div>
            ) : (
              <div className="space-y-3">
                {myTasks.slice(0, 5).map(task => (
                  <div
                    key={task.id}
                    onClick={() => navigate(`/resolutions/detail/${task.id}`)}
                    className="border border-slate-200 dark:border-slate-600 rounded-lg p-3 hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-slate-900 dark:text-white">
                          {task.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {task.code}
                        </p>
                      </div>
                      {task.dueDate < today && (
                        <Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 text-xs">
                          <AlertTriangle className="w-3 h-3 ml-1" />
                          تأخیر
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        مهلت: {toPersianNumber(task.dueDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {toPersianNumber(task.progress)}٪
                      </span>
                    </div>
                    {task.progress > 0 && (
                      <div className="mt-2">
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${
                              task.progress === 100 ? 'bg-green-500' :
                              task.progress >= 50 ? 'bg-blue-500' : 'bg-orange-500'
                            }`}
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {myTasks.length > 5 && (
                  <button
                    onClick={() => navigate('/my-resolutions')}
                    className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 py-2"
                  >
                    مشاهده همه ({toPersianNumber(myTasks.length)}) →
                  </button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* جلسات آینده من */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-500" />
              جلسات آینده من
            </CardTitle>
            <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
              {toPersianNumber(myMeetings.length)}
            </Badge>
          </CardHeader>
          <CardContent>
            {myMeetings.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                جلسه‌ای در پیش ندارید
              </div>
            ) : (
              <div className="space-y-3">
                {myMeetings.map(meeting => (
                  <div
                    key={meeting.id}
                    onClick={() => navigate(`/meetings/${meeting.id}`)}
                    className="border border-slate-200 dark:border-slate-600 rounded-lg p-3 hover:border-purple-500 dark:hover:border-purple-400 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-slate-900 dark:text-white">
                          {meeting.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {meeting.code}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {toPersianNumber(meeting.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {toPersianNumber(meeting.startTime)}
                      </span>
                      <span>{meeting.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* اعلان‌های من */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-orange-500" />
            اعلان‌های اخیر
          </CardTitle>
          <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
            {toPersianNumber(myUnreadNotifications.length)}
          </Badge>
        </CardHeader>
        <CardContent>
          {myUnreadNotifications.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              اعلانی وجود ندارد
            </div>
          ) : (
            <div className="space-y-2">
              {myUnreadNotifications.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => {
                    if (notif.link) navigate(notif.link);
                  }}
                  className="border border-slate-200 dark:border-slate-600 rounded-lg p-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-orange-500 mt-2" />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-slate-900 dark:text-white">
                        {notif.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {notif.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}