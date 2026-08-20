import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Search, Calendar, CheckSquare, Users, FileText, BarChart3, Settings, ArrowLeft } from 'lucide-react';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  keywords: string[];
  category: string;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const { meetings, resolutions, users, currentUser } = useApp();

  const commands: Command[] = useMemo(() => [
    // Navigation
    { id: 'nav-dashboard', label: 'داشبورد', icon: <BarChart3 className="w-4 h-4" />, action: () => navigate('/'), keywords: ['dashboard', 'داشبورد', 'خانه'], category: 'ناوبری' },
    { id: 'nav-meetings', label: 'جلسات', icon: <Calendar className="w-4 h-4" />, action: () => navigate('/meetings'), keywords: ['meetings', 'جلسات'], category: 'ناوبری' },
    { id: 'nav-resolutions', label: 'مصوبات', icon: <CheckSquare className="w-4 h-4" />, action: () => navigate('/resolutions'), keywords: ['resolutions', 'مصوبات', 'اقدامات'], category: 'ناوبری' },
    { id: 'nav-my-res', label: 'مصوبات من', icon: <CheckSquare className="w-4 h-4" />, action: () => navigate('/my-resolutions'), keywords: ['my', 'من'], category: 'ناوبری' },
    { id: 'nav-all-minutes', label: 'نمای تجمیعی', icon: <FileText className="w-4 h-4" />, action: () => navigate('/all-minutes'), keywords: ['تجمیعی', 'همه'], category: 'ناوبری' },
    { id: 'nav-reports', label: 'گزارش‌ها', icon: <BarChart3 className="w-4 h-4" />, action: () => navigate('/reports'), keywords: ['reports', 'گزارش'], category: 'ناوبری' },
    { id: 'nav-users', label: 'کاربران', icon: <Users className="w-4 h-4" />, action: () => navigate('/users'), keywords: ['users', 'کاربران'], category: 'ناوبری' },
    { id: 'nav-settings', label: 'تنظیمات', icon: <Settings className="w-4 h-4" />, action: () => navigate('/settings'), keywords: ['settings', 'تنظیمات'], category: 'ناوبری' },
    
    // Actions
    { id: 'act-new-meeting', label: 'ایجاد جلسه جدید', icon: <Calendar className="w-4 h-4" />, action: () => { navigate('/meetings'); setTimeout(() => document.querySelector('button')?.click(), 100); }, keywords: ['new', 'جدید', 'ایجاد', 'جلسه'], category: 'اقدامات' },
    { id: 'act-new-resolution', label: 'ایجاد مصوبه جدید', icon: <CheckSquare className="w-4 h-4" />, action: () => navigate('/resolutions'), keywords: ['new', 'جدید', 'مصوبه'], category: 'اقدامات' },
    { id: 'act-import', label: 'وارد کردن پرسنل', icon: <Users className="w-4 h-4" />, action: () => navigate('/users'), keywords: ['import', 'وارد', 'پرسنل'], category: 'اقدامات' },
    { id: 'act-export', label: 'خروجی Excel', icon: <FileText className="w-4 h-4" />, action: () => navigate('/reports'), keywords: ['export', 'خروجی', 'اکسل'], category: 'اقدامات' },
    
    // Quick Search - Meetings
    ...meetings.slice(0, 5).map(m => ({
      id: `meeting-${m.id}`,
      label: m.title,
      description: `${m.code} • ${m.date}`,
      icon: <Calendar className="w-4 h-4" />,
      action: () => navigate(`/meetings/${m.id}`),
      keywords: [m.title, m.code, 'جلسه'],
      category: 'جلسات اخیر',
    })),
    
    // Quick Search - Resolutions
    ...resolutions.filter(r => !r.isArchived).slice(0, 5).map(r => ({
      id: `res-${r.id}`,
      label: r.title,
      description: `${r.code} • ${r.status}`,
      icon: <CheckSquare className="w-4 h-4" />,
      action: () => navigate(`/resolutions/detail/${r.id}`),
      keywords: [r.title, r.code, 'مصوبه'],
      category: 'مصوبات اخیر',
    })),
    
    // Quick Search - Users
    ...users.filter(u => u.isActive).slice(0, 5).map(u => ({
      id: `user-${u.id}`,
      label: `${u.firstName} ${u.lastName}`,
      description: u.position,
      icon: <Users className="w-4 h-4" />,
      action: () => navigate('/users'),
      keywords: [u.firstName, u.lastName, u.personnelCode, 'کاربر', 'پرسنل'],
      category: 'کاربران',
    })),
  ], [meetings, resolutions, users, navigate]);

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(c => 
      c.label.toLowerCase().includes(q) || 
      c.keywords.some(k => k.toLowerCase().includes(q)) ||
      c.description?.toLowerCase().includes(q)
    );
  }, [commands, query]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [open]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && filtered[selectedIndex]) {
        e.preventDefault();
        filtered[selectedIndex].action();
        onClose();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, filtered, selectedIndex, onClose]);

  if (!open) return null;

  const categories = Array.from(new Set(filtered.map(c => c.category)));

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] p-4 animate-fade-in">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-slide-in">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            placeholder="جستجو در دستورات، جلسات، مصوبات، کاربران..."
            className="flex-1 bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-sm focus:outline-none"
            autoFocus
          />
          <kbd className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 rounded text-slate-500">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <p className="text-sm">نتیجه‌ای یافت نشد</p>
            </div>
          ) : (
            categories.map(cat => (
              <div key={cat} className="mb-2">
                <div className="px-4 py-1.5 text-xs font-semibold text-slate-400 uppercase">{cat}</div>
                {filtered.filter(c => c.category === cat).map((cmd) => {
                  const idx = filtered.indexOf(cmd);
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => { cmd.action(); onClose(); }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-right transition-colors ${
                        idx === selectedIndex 
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' 
                          : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        idx === selectedIndex ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                      }`}>
                        {cmd.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{cmd.label}</div>
                        {cmd.description && <div className="text-xs text-slate-500 truncate">{cmd.description}</div>}
                      </div>
                      <ArrowLeft className="w-4 h-4 text-slate-400" />
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex items-center gap-4 text-xs text-slate-500">
          <span><kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600">↑↓</kbd> پیمایش</span>
          <span><kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600">↵</kbd> انتخاب</span>
          <span><kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600">esc</kbd> بستن</span>
        </div>
      </div>
    </div>
  );
}