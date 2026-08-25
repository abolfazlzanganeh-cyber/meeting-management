import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Bell, Search, Plus, Menu } from 'lucide-react';
import { toPersianNumber, formatRelative } from '@/lib/utils';

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const { notifications, currentUser, markNotificationRead, markAllNotificationsRead } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const notifRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // ✅ ایمن‌سازی
  const safeNotifications = notifications || [];
  const userNotifs = safeNotifications.filter(n => n.userId === currentUser?.id);
  const unreadCount = userNotifs.filter(n => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-slate-200 h-16 px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4 flex-1">
        <button onClick={onMenuClick} className="lg:hidden p-2 hover:bg-slate-100 rounded-lg">
          <Menu className="w-5 h-5" />
        </button>
        <div className="relative max-w-md flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="جستجو... (Ctrl+K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={() => navigate('/meetings/new')}
          className="p-2 hover:bg-slate-100 rounded-lg" 
          title="ایجاد جلسه جدید"
        >
          <Plus className="w-5 h-5 text-slate-600" />
        </button>
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 hover:bg-slate-100 rounded-lg"
          >
            <Bell className="w-5 h-5 text-slate-600" />
            {unreadCount > 0 && (
              <span className="absolute top-1 left-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                {toPersianNumber(unreadCount)}
              </span>
            )}
          </button>
          {showNotifications && (
            <div className="absolute left-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">اعلان‌ها</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllNotificationsRead} className="text-xs text-blue-600 hover:text-blue-700">
                    علامت‌گذاری همه به‌عنوان خوانده‌شده
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {userNotifs.length === 0 ? (
                  <div className="py-8 text-center text-sm text-slate-500">اعلانی وجود ندارد</div>
                ) : (
                  userNotifs.slice(0, 10).map(n => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationRead(n.id);
                        if (n.link) navigate(n.link);
                        setShowNotifications(false);
                      }}
                      className={`px-4 py-3 border-b border-slate-100 hover:bg-slate-50 cursor-pointer ${!n.isRead ? 'bg-blue-50/30' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-1.5 ${!n.isRead ? 'bg-blue-500' : 'bg-transparent'}`} />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-900">{n.title}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{n.message}</div>
                          <div className="text-xs text-slate-400 mt-1">{formatRelative(n.createdAt)}</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}