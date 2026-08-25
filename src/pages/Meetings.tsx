import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@/components/ui';
import { toPersianNumber } from '@/lib/utils';
import { todayJalali } from '@/lib/date';
import { Calendar, Plus, Search, Filter, MapPin, Users } from 'lucide-react';

export function Meetings() {
  const { meetings, meetingTypes, departments, users } = useApp();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const today = todayJalali();

  const safeMeetings = meetings || [];
  const safeTypes = meetingTypes || [];
  const safeDepts = departments || [];
  const safeUsers = users || [];

  let filteredMeetings = safeMeetings.filter(m => !m.isArchived);

  if (filterType !== 'all') {
    filteredMeetings = filteredMeetings.filter(m => m.typeId === filterType);
  }

  if (searchQuery) {
    filteredMeetings = filteredMeetings.filter(m =>
      m.title.includes(searchQuery) ||
      m.code.includes(searchQuery) ||
      m.subject?.includes(searchQuery)
    );
  }

  const getTypeInfo = (typeId: string) => {
    return safeTypes.find(t => t.id === typeId) || { name: 'نامشخص', color: '#94a3b8' };
  };

  const getDeptName = (deptId: string) => {
    return safeDepts.find(d => d.id === deptId)?.name || 'نامشخص';
  };

  const getUserName = (userId: string) => {
    const user = safeUsers.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'نامشخص';
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      scheduled: { label: 'برنامه‌ریزی شده', color: 'bg-blue-100 text-blue-700' },
      held: { label: 'برگزار شده', color: 'bg-green-100 text-green-700' },
      cancelled: { label: 'لغو شده', color: 'bg-red-100 text-red-700' },
      postponed: { label: 'به تعویق افتاده', color: 'bg-orange-100 text-orange-700' },
      drafting: { label: 'در حال تنظیم', color: 'bg-yellow-100 text-yellow-700' },
      finalized: { label: 'نهایی شده', color: 'bg-purple-100 text-purple-700' },
    };
    const s = statusMap[status] || statusMap.scheduled;
    return <Badge className={s.color}>{s.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">جلسات</h1>
          <p className="text-sm text-slate-500 mt-1">مدیریت و پیگیری جلسات</p>
        </div>
        <Button onClick={() => navigate('/meetings/new')} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 ml-2" />
          ایجاد جلسه جدید
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="جستجو در جلسات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-slate-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-blue-500"
              >
                <option value="all">همه انواع</option>
                {safeTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredMeetings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">جلسه‌ای یافت نشد</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMeetings.map(meeting => {
                const typeInfo = getTypeInfo(meeting.typeId);
                return (
                  <div
                    key={meeting.id}
                    onClick={() => navigate(`/meetings/${meeting.id}`)}
                    className="border border-slate-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-slate-500 font-mono">{meeting.code}</span>
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: typeInfo.color }}
                          />
                          <span className="text-xs text-slate-600">{typeInfo.name}</span>
                        </div>
                        <h3 className="font-semibold text-slate-900">{meeting.title}</h3>
                      </div>
                      {getStatusBadge(meeting.status)}
                    </div>

                    {meeting.subject && (
                      <p className="text-sm text-slate-600 mb-3 line-clamp-2">{meeting.subject}</p>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{toPersianNumber(meeting.date)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>ساعت: {toPersianNumber(meeting.startTime)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{meeting.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{getDeptName(meeting.departmentId)}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-4 text-xs text-slate-500">
                      <span>رئیس: {getUserName(meeting.chairmanId)}</span>
                      <span>دبیر: {getUserName(meeting.secretaryId)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}