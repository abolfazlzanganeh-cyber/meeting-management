import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@/components/ui';
import { toPersianNumber } from '@/lib/utils';
import { Users as UsersIcon, Building2, Plus, Search, Edit, Trash2 } from 'lucide-react';

export function UsersPage() {
  const { users, departments } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const safeUsers = users || [];
  const safeDepts = departments || [];

  let filteredUsers = safeUsers;
  if (searchQuery) {
    filteredUsers = safeUsers.filter(u =>
      u.firstName.includes(searchQuery) ||
      u.lastName.includes(searchQuery) ||
      u.username.includes(searchQuery) ||
      u.position?.includes(searchQuery)
    );
  }

  const getDeptName = (deptId: string) => {
    return safeDepts.find(d => d.id === deptId)?.name || 'نامشخص';
  };

  const getRoleBadge = (role: string) => {
    const roleMap: Record<string, { label: string; color: string }> = {
      super_admin: { label: 'مدیر ارشد', color: 'bg-purple-100 text-purple-700' },
      admin: { label: 'مدیر', color: 'bg-blue-100 text-blue-700' },
      manager: { label: 'مدیر عامل', color: 'bg-indigo-100 text-indigo-700' },
      secretary: { label: 'دبیر', color: 'bg-green-100 text-green-700' },
      assignee: { label: 'مسئول', color: 'bg-orange-100 text-orange-700' },
      supervisor: { label: 'ناظر', color: 'bg-yellow-100 text-yellow-700' },
      approver: { label: 'تأیید کننده', color: 'bg-teal-100 text-teal-700' },
      viewer: { label: 'بیننده', color: 'bg-gray-100 text-gray-700' },
    };
    const r = roleMap[role] || roleMap.viewer;
    return <Badge className={r.color}>{r.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">کاربران</h1>
          <p className="text-sm text-slate-500 mt-1">مدیریت کاربران سیستم ({toPersianNumber(safeUsers.length)} کاربر)</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 ml-2" />
          افزودن کاربر جدید
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="جستجو در کاربران..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-slate-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <UsersIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">کاربری یافت نشد</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map(user => (
                <div key={user.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-900">{user.firstName} {user.lastName}</h3>
                      <p className="text-xs text-slate-500 mt-1">{user.position}</p>
                    </div>
                    {getRoleBadge(user.role)}
                  </div>

                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3 h-3" />
                      <span>{getDeptName(user.departmentId)}</span>
                    </div>
                    <div className="pt-2 border-t">
                      <span className="text-slate-500">نام کاربری: </span>
                      <span className="font-mono">{user.username}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <Badge className={user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                      {user.isActive ? 'فعال' : 'غیرفعال'}
                    </Badge>
                    <div className="flex gap-1">
                      <button className="p-1.5 hover:bg-slate-100 rounded" title="ویرایش">
                        <Edit className="w-4 h-4 text-slate-500" />
                      </button>
                      <button className="p-1.5 hover:bg-red-50 rounded" title="حذف">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
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