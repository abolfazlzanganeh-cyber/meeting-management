import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Search, X, Calendar, CheckSquare, Users } from 'lucide-react';
import { toPersianNumber } from '@/lib/utils';

export function GlobalSearch() {
  const { meetings, resolutions, users } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const safeMeetings = meetings || [];
  const safeResolutions = resolutions || [];
  const safeUsers = users || [];

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  const results = query.trim() ? {
    meetings: safeMeetings.filter(m => 
      m.title.includes(query) || m.code.includes(query) || m.subject?.includes(query)
    ).slice(0, 5),
    resolutions: safeResolutions.filter(r => 
      r.title.includes(query) || r.code.includes(query) || r.description?.includes(query)
    ).slice(0, 5),
    users: safeUsers.filter(u => 
      u.firstName.includes(query) || u.lastName.includes(query) || u.username.includes(query)
    ).slice(0, 5),
  } : { meetings: [], resolutions: [], users: [] };

  const totalResults = results.meetings.length + results.resolutions.length + results.users.length;

  const handleSelect = (type: string, id: string) => {
    setIsOpen(false);
    setQuery('');
    if (type === 'meeting') navigate(`/meetings/${id}`);
    else if (type === 'resolution') navigate(`/resolutions/detail/${id}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-start justify-center pt-20 px-4" onClick={() => setIsOpen(false)}>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 p-4 border-b dark:border-slate-700">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجو در جلسات، مصوبات و کاربران..."
            className="flex-1 outline-none text-sm bg-transparent dark:text-white"
          />
          <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {!query.trim() ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
              برای جستجو تایپ کنید...
            </div>
          ) : totalResults === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
              نتیجه‌ای یافت نشد
            </div>
          ) : (
            <div className="p-2">
              {results.meetings.length > 0 && (
                <div className="mb-3">
                  <div className="px-3 py-1 text-xs font-semibold text-slate-400 uppercase">جلسات</div>
                  {results.meetings.map(m => (
                    <div key={m.id} onClick={() => handleSelect('meeting', m.id)}
                      className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg cursor-pointer">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <div className="flex-1">
                        <div className="text-sm font-medium dark:text-white">{m.title}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{m.code} - {m.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {results.resolutions.length > 0 && (
                <div className="mb-3">
                  <div className="px-3 py-1 text-xs font-semibold text-slate-400 uppercase">مصوبات</div>
                  {results.resolutions.map(r => (
                    <div key={r.id} onClick={() => handleSelect('resolution', r.id)}
                      className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg cursor-pointer">
                      <CheckSquare className="w-4 h-4 text-green-500" />
                      <div className="flex-1">
                        <div className="text-sm font-medium dark:text-white">{r.title}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{r.code} - پیشرفت {toPersianNumber(r.progress)}٪</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {results.users.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-xs font-semibold text-slate-400 uppercase">کاربران</div>
                  {results.users.map(u => (
                    <div key={u.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg">
                      <Users className="w-4 h-4 text-purple-500" />
                      <div className="flex-1">
                        <div className="text-sm font-medium dark:text-white">{u.firstName} {u.lastName}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{u.position}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-3 border-t bg-slate-50 dark:bg-slate-900 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>ESC برای بستن | Ctrl+K برای باز کردن</span>
          <span>{toPersianNumber(totalResults)} نتیجه</span>
        </div>
      </div>
    </div>
  );
}