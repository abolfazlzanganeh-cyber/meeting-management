import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import {
  LayoutDashboard, Calendar, CheckSquare, Users, Building2,
  BarChart3, Settings, LogOut, ClipboardList, AlertTriangle, Clock, FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { path: '/', label: 'داشبورد', icon: LayoutDashboard },
  {
    label: 'جلسات', icon: Calendar,
    children: [
      { path: '/meetings', label: 'همه جلسات' },
      { path: '/all-minutes', label: 'نمای تجمیعی مصوبات', icon: FileText },
    ]
  },
  {
    label: 'مصوبات', icon: CheckSquare,
    children: [
      { path: '/resolutions', label: 'همه مصوبات' },
      { path: '/my-resolutions', label: 'مصوبات من' },
      { path: '/resolutions/overdue', label: 'تأخیر دار', icon: AlertTriangle },
      { path: '/resolutions/pending-approval', label: 'نیازمند تأیید', icon: Clock },
    ]
  },
  { path: '/reports', label: 'گزارش‌ها', icon: BarChart3 },
  { path: '/users', label: 'کاربران', icon: Users, roles: ['super_admin', 'admin'] },
  { path: '/departments', label: 'واحدها', icon: Building2, roles: ['super_admin', 'admin'] },
  { path: '/settings', label: 'تنظیمات', icon: Settings, roles: ['super_admin', 'admin'] },
];

export function Sidebar() {
  const { currentUser, logout, notifications } = useApp();
  
  // ✅ اصلاح: اضافه کردن || []
  const unreadCount = (notifications || []).filter(n => !n.isRead && n.userId === currentUser?.id).length;

  const hasAccess = (roles?: string[]) => {
    if (!roles) return true;
    return currentUser && roles.includes(currentUser.role);
  };

  return (
    <aside className="w-64 bg-white border-l border-slate-200 h-screen sticky top-0 flex flex-col">
      <div className="px-6 py-5 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-sm">سامانه جلسات v4</h1>
            <p className="text-xs text-slate-500">مدیریت مصوبات</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {menuItems.filter(item => hasAccess((item as any).roles)).map((item, idx) => {
          if (item.children) {
            return (
              <div key={idx} className="mb-3">
                <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {item.label}
                </div>
                {item.children.map((child, cidx) => (
                  <NavLink
                    key={cidx}
                    to={child.path}
                    className={({ isActive }) => cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors mb-0.5',
                      isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    {child.icon && <child.icon className="w-4 h-4" />}
                    <span>{child.label}</span>
                  </NavLink>
                ))}
              </div>
            );
          }

          return (
            <NavLink
              key={idx}
              to={item.path!}
              end={item.path === '/'}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors mb-0.5',
                isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
              {item.path === '/' && unreadCount > 0 && (
                <span className="mr-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {unreadCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-200">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {currentUser?.firstName[0]}{currentUser?.lastName[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-slate-900 truncate">{currentUser?.firstName} {currentUser?.lastName}</div>
            <div className="text-xs text-slate-500 truncate">{currentUser?.position}</div>
          </div>
          <button onClick={logout} className="p-1.5 hover:bg-slate-100 rounded-lg" title="خروج">
            <LogOut className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>
    </aside>
  );
}