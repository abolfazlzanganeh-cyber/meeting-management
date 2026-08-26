import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@/components/ui';
import { toPersianNumber } from '@/lib/utils';
import { todayJalali } from '@/lib/date';
import {
  CheckSquare, Calendar, User, Building2, TrendingUp,
  AlertTriangle, Clock, CheckCircle2, Filter, Plus, Search
} from 'lucide-react';

export function Resolutions() {
  const { filter } = useParams();
  const navigate = useNavigate();
  const { resolutions, users, departments } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const today = todayJalali();

  // ✅ ایمن‌سازی آرایه‌ها
  const safeResolutions = resolutions || [];
  const safeUsers = users || [];
  const safeDepartments = departments || [];

  // فیلتر بر اساس پارامتر URL
  let filteredResolutions = safeResolutions.filter(r => !r.isArchived);
  
  if (filter === 'overdue') {
    filteredResolutions = filteredResolutions.filter(r => 
      r.status === 'overdue' || (r.dueDate < today && r.status !== 'completed')
    );
  } else if (filter === 'pending-approval') {
    filteredResolutions = filteredResolutions.filter(r => r.status === 'needs_approval');
  } else if (filter === 'in-progress') {
    filteredResolutions = filteredResolutions.filter(r => r.status === 'in_progress');
  } else if (filter === 'completed') {
    filteredResolutions = filteredResolutions.filter(r => r.status === 'completed');
  }

  // فیلتر جستجو
  if (searchQuery) {
    filteredResolutions = filteredResolutions.filter(r =>
      r.title.includes(searchQuery) ||
      r.code.includes(searchQuery) ||
      r.description?.includes(searchQuery)
    );
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string; icon: any }> = {
      pending: { label: 'در انتظار شروع', color: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300', icon: Clock },
      in_progress: { label: 'در حال انجام', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300', icon: TrendingUp },
      completed: { label: 'تکمیل شده', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300', icon: CheckCircle2 },
      overdue: { label: 'تأخیر دار', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300', icon: AlertTriangle },
      needs_approval: { label: 'نیازمند تأیید', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300', icon: Clock },
      cancelled: { label: 'لغو شده', color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300', icon: CheckSquare },
    };
    const s = statusMap[status] || statusMap.pending;
    return <Badge className={s.color}><s.icon className="w-3 h-3 ml-1" />{s.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityMap: Record<string, string> = {
      critical: 'bg-red-500 text-white',
      high: 'bg-orange-500 text-white',
      medium: 'bg-yellow-500 text-white',
      low: 'bg-slate-500 text-white',
    };
    const priorityLabels: Record<string, string> = {
      critical: 'بحرانی',
      high: 'زیاد',
      medium: 'متوسط',
      low: 'کم',
    };
    return <Badge className={priorityMap[priority] || priorityMap.medium}>
      {priorityLabels[priority] || priority}
    </Badge>;
  };

  const getUserName = (userId: string) => {
    const user = safeUsers.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'نامشخص';
  };

  const getDeptName = (deptId: string) => {
    const dept = safeDepartments.find(d => d.id === deptId);
    return dept ? dept.name : 'نامشخص';
  };

  const getPageTitle = () => {
    switch (filter) {
      case 'overdue': return 'مصوبات تأخیر دار';
      case 'pending-approval': return 'مصوبات نیازمند تأیید';
      case 'in-progress': return 'مصوبات در حال انجام';
      case 'completed': return 'مصوبات تکمیل شده';
      default: return 'همه مصوبات';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{getPageTitle()}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {toPersianNumber(filteredResolutions.length)} مصوبه یافت شد
          </p>
        </div>
        <Button 
          onClick={() => navigate('/resolutions/new')} 
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 ml-2" />
          ایجاد مصوبه جدید
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="relative flex-1 w-full md:max-w-md">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="جستجو در مصوبات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={!filter ? 'default' : 'outline'}
                onClick={() => navigate('/resolutions')}
                size="sm"
              >
                همه
              </Button>
              <Button
                variant={filter === 'overdue' ? 'default' : 'outline'}
                onClick={() => navigate('/resolutions/overdue')}
                size="sm"
                className={filter === 'overdue' ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                <AlertTriangle className="w-3 h-3 ml-1" />
                تأخیر دار
              </Button>
              <Button
                variant={filter === 'pending-approval' ? 'default' : 'outline'}
                onClick={() => navigate('/resolutions/pending-approval')}
                size="sm"
                className={filter === 'pending-approval' ? 'bg-orange-600 hover:bg-orange-700' : ''}
              >
                <Clock className="w-3 h-3 ml-1" />
                نیازمند تأیید
              </Button>
              <Button
                variant={filter === 'in-progress' ? 'default' : 'outline'}
                onClick={() => navigate('/resolutions/in-progress')}
                size="sm"
                className={filter === 'in-progress' ? 'bg-blue-600 hover:bg-blue-700' : ''}
              >
                <TrendingUp className="w-3 h-3 ml-1" />
                در حال انجام
              </Button>
              <Button
                variant={filter === 'completed' ? 'default' : 'outline'}
                onClick={() => navigate('/resolutions/completed')}
                size="sm"
                className={filter === 'completed' ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                <CheckCircle2 className="w-3 h-3 ml-1" />
                تکمیل شده
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredResolutions.length === 0 ? (
            <div className="text-center py-12">
              <CheckSquare className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400">مصوبه‌ای یافت نشد</p>
              {searchQuery && (
                <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">
                  عبارت جستجو: "{searchQuery}"
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredResolutions.map(resolution => (
                <div
                  key={resolution.id}
                  onClick={() => navigate(`/resolutions/detail/${resolution.id}`)}
                  className="border border-slate-200 dark:border-slate-600 rounded-lg p-4 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all cursor-pointer bg-white dark:bg-slate-800"
                >
                  <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                          {resolution.code}
                        </span>
                        {getPriorityBadge(resolution.priority)}
                      </div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {resolution.title}
                      </h3>
                    </div>
                    {getStatusBadge(resolution.status)}
                  </div>

                  {resolution.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 line-clamp-2">
                      {resolution.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                      <Building2 className="w-3 h-3" />
                      <span>{getDeptName(resolution.departmentId)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                      <User className="w-3 h-3" />
                      <span className="truncate">
                        {(resolution.assigneeIds || []).map(id => getUserName(id)).join('، ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                      <Calendar className="w-3 h-3" />
                      <span>مهلت: {toPersianNumber(resolution.dueDate)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                      <TrendingUp className="w-3 h-3" />
                      <span>پیشرفت: {toPersianNumber(resolution.progress)}٪</span>
                    </div>
                  </div>

                  {resolution.progress > 0 && (
                    <div className="mt-3">
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            resolution.progress === 100 ? 'bg-green-500' :
                            resolution.progress >= 50 ? 'bg-blue-500' : 'bg-orange-500'
                          }`}
                          style={{ width: `${resolution.progress}%` }}
                        />
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