import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, Button, Input } from '@/components/ui';
import { Lock, Mail, AlertCircle } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      if (authData.user) navigate('/');
    } catch (err: any) {
      setError('ایمیل یا رمز عبور اشتباه است');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-slate-900">سامانه مدیریت جلسات</h1>
            <p className="text-slate-500 mt-2">ورود امن به سیستم</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input label="ایمیل سازمانی" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@company.com" required icon={<Mail className="w-4 h-4" />} />
            <Input label="رمز عبور" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required icon={<Lock className="w-4 h-4" />} />
            {error && <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm"><AlertCircle className="w-4 h-4" />{error}</div>}
            <Button type="submit" className="w-full" disabled={loading}>{loading ? 'در حال بررسی...' : 'ورود به سامانه'}</Button>
          </form>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg text-xs text-blue-800 text-center">
            <p className="font-semibold mb-1">فقط با ایمیل سازمانی وارد شوید:</p>
            <p>admin@company.com / admin123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}