import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@/components/ui';
import { toPersianNumber } from '@/lib/utils';
import { Users as UsersIcon, Plus, X, Save } from 'lucide-react';

export function UsersPage() {
  const { users, departments, addUser, currentUser } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    username: '', password: '', firstName: '', lastName: '',
    personnelCode: '', departmentId: (departments || [])[0]?.id || '', position: '',
    role: 'assignee' as any, isActive: true,
  });

  const safeUsers = users || [];
  const safeDepts = departments || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (safeUsers.find(u => u.username === formData.username)) {
      alert('این نام کاربری قبلاً ثبت شده است');
      return;
    }
    addUser(formData as any);
    alert('✅ کاربر ایجاد شد و اعلان برای او ارسال گردید');
    setShowForm(false);
    setFormData({ username: '', password: '', firstName: '', lastName: '', personnelCode: '', departmentId: safeDepts[0]?.id || '', position: '', role: 'assignee', isActive: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900">مدیریت کاربران</h1><p className="text-sm text-slate-500 mt-1">{toPersianNumber(safeUsers.length)} کاربر ثبت شده</p></div>
        <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4 ml-2" />ایجاد کاربر جدید</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between"><CardTitle>ایجاد کاربر جدید</CardTitle><button onClick={() => setShowForm(false)}><X className="w-5 h-5" /></button></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required placeholder="نام *" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="px-3 py-2 border rounded-lg" />
              <input required placeholder="نام خانوادگی *" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="px-3 py-2 border rounded-lg" />
              <input required placeholder="نام کاربری *" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="px-3 py-2 border rounded-lg" />
              <input required placeholder="رمز عبور *" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="px-3 py-2 border rounded-lg" />
              <input placeholder="کد پرسنلی" value={formData.personnelCode} onChange={e => setFormData({...formData, personnelCode: e.target.value})} className="px-3 py-2 border rounded-lg" />
              <input placeholder="سمت" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} className="px-3 py-2 border rounded-lg" />
              <select required value={formData.departmentId} onChange={e => setFormData({...formData, departmentId: e.target.value})} className="px-3 py-2 border rounded-lg">
                {safeDepts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <select required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="px-3 py-2 border rounded-lg">
                <option value="assignee">مسئول اجرا</option>
                <option value="secretary">دبیر جلسات</option>
                <option value="supervisor">ناظر</option>
                <option value="manager">مدیر عامل</option>
                <option value="admin">مدیر سیستم</option>
              </select>
              <div className="md:col-span-2 flex gap-2 pt-2">
                <Button type="submit" className="bg-blue-600"><Save className="w-4 h-4 ml-2" />ذخیره کاربر</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>انصراف</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {safeUsers.map(user => (
              <div key={user.id} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold">{user.firstName} {user.lastName}</h3>
                  <Badge className={user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>{user.isActive ? 'فعال' : 'غیرفعال'}</Badge>
                </div>
                <p className="text-xs text-slate-500 mb-1">{user.position}</p>
                <p className="text-xs text-slate-500 mb-3">نام کاربری: {user.username}</p>
                <Badge className="bg-slate-100 text-slate-700 text-xs">{user.role}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}