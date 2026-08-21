import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Button, Input, Card, CardContent } from '@/components/ui';
import { ClipboardList, AlertCircle } from 'lucide-react';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useApp();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const success = login(username.trim(), password);
    
    if (success) {
      navigate('/');
    } else {
      setError('نام کاربری یا رمز عبور اشتباه است.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <ClipboardList className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">سامانه مدیریت جلسات</h1>
            <p className="text-slate-500 mt-2">لطفاً برای ورود اطلاعات خود را وارد کنید</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <Input
              label="نام کاربری"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="مثال: admin"
              required
            />

            <Input
              label="رمز عبور"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Button type="submit" className="w-full py-6 text-lg font-semibold">
              ورود به سامانه
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg text-xs text-blue-800 space-y-1">
            <p className="font-semibold">🔑 اطلاعات ورود مدیر سیستم:</p>
            <p>نام کاربری: <code className="bg-white px-1 rounded font-mono">admin</code></p>
            <p>رمز عبور: <code className="bg-white px-1 rounded font-mono">admin123</code></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}