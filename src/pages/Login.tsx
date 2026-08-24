import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useApp();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const success = login(username.trim(), password);
    if (success) {
      window.location.href = '/';
    } else {
      setError('نام کاربری یا رمز عبور اشتباه است.');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f8fafc', fontFamily: 'Tahoma, Arial, sans-serif', direction: 'rtl' }}>
      <form onSubmit={handleSubmit} style={{ padding: '2rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#1e293b', fontSize: '1.5rem', fontWeight: 'bold' }}>سامانه مدیریت جلسات</h2>
        
        {error && (
          <div style={{ padding: '0.75rem', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontSize: '0.875rem' }}>نام کاربری</label>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            placeholder="admin"
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box' }} 
            required 
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontSize: '0.875rem' }}>رمز عبور</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="admin123"
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box' }} 
            required 
          />
        </div>

        <button 
          type="submit" 
          style={{ width: '100%', padding: '0.75rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}
        >
          ورود به سامانه
        </button>

        <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#eff6ff', borderRadius: '8px', fontSize: '0.875rem', color: '#1e40af' }}>
          <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>🔑 اطلاعات ورود تست:</p>
          <p style={{ margin: 0 }}>نام کاربری: <code style={{ backgroundColor: 'white', padding: '2px 4px', borderRadius: '4px' }}>admin</code></p>
          <p style={{ margin: '0.5rem 0 0 0' }}>رمز عبور: <code style={{ backgroundColor: 'white', padding: '2px 4px', borderRadius: '4px' }}>admin123</code></p>
        </div>
      </form>
    </div>
  );
}