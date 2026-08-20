import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Button, Input } from '@/components/ui';
import { ClipboardList, Lock, User } from 'lucide-react';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useApp();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (login(username, password)) {
      navigate('/');
    } else {
      setError('نام کاربری یا رمز عبور اشتباه است');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mb-4">
              <ClipboardList className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">سامانه مدیریت جلسات</h1>
            <p className="text-sm text-slate-500 mt-1">برای ورود اطلاعات خود را وارد کنید</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="نام کاربری"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="نام کاربری"
              icon={<User className="w-4 h-4" />}
              required
            />
            <Input
              label="رمز عبور"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="رمز عبور"
              icon={<Lock className="w-4 h-4" />}
              required
            />

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg">
              ورود به سامانه
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-xs text-slate-500 text-center mb-3">حساب‌های آزمایشی:</p>
            <div className="space-y-1 text-xs text-slate-600">
              <div className="flex justify-between"><span>مدیر سیستم:</span><code className="bg-slate-100 px-2 py-0.5 rounded">admin / admin123</code></div>
              <div className="flex justify-between"><span>مدیر عامل:</span><code className="bg-slate-100 px-2 py-0.5 rounded">manager / 123456</code></div>
              <div className="flex justify-between"><span>مسئول اقدام:</span><code className="bg-slate-100 px-2 py-0.5 rounded">rezaei / 123456</code></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}