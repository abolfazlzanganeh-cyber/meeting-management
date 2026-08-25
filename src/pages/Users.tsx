import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@/components/ui';
import { toPersianNumber } from '@/lib/utils';
import { Users as UsersIcon, Building2, Plus, Search, Edit, Trash2, X, Save, UserCheck, UserX } from 'lucide-react';

export function UsersPage() {
  const { users, departments, addUser, updateUser, deleteUser, currentUser } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    username: '', password: '', firstName: '', lastName: '',
    personnelCode: '', departmentId: '', position: '',
    role: 'assignee' as const, partyType: 'employer' as const,
    isActive: true, email: '', phone: '',
  });

  const safeUsers = users || [];
  const safeDepts = departments || [];

  const filteredUsers = safeUsers.filter(u =>
    !searchQuery ||
    u.firstName.includes(searchQuery) ||
    u.lastName.includes(searchQuery) ||
    u.username.includes(searchQuery) ||
    u.position?.includes(searchQuery)
  );

  const getDeptName = (deptId: string) => safeDepts.find(d => d.id === deptId)?.name || 'نامشخص';

  const getRoleBadge = (role: string) => {
    const roleMap: Record<string, { label: string; color: string }> = {
      super_admin: { label: 'مدیر ارشد', color: 'bg-purple-100 text-purple-700' },
      admin: { label: 'مدیر', color: 'bg-blue-100 text-blue-700' },
      manager: { label: 'مدیر عامل', color: 'bg-indigo-100 text-indigo-700' },
      secretary: { label: 'دبیر', color: 'bg-green-100 text-green-700' },
      assignee: { label: 'مسئول اجرا', color: 'bg-orange-100 text-orange-700' },
      supervisor: { label: 'ناظر', color: 'bg-yellow-100 text-yellow-700' },
      approver: { label: 'تأیید کننده', color: 'bg-teal-100 text-teal-700' },
      viewer: { label: 'بیننده', color: 'bg-gray-100 text-gray-700' },
    };
    const r = roleMap[role] || roleMap.viewer;
    return <Badge className={r.color}>{r.label}</Badge>;
  };

  const resetForm = () => {
    setFormData({
      username: '', password: '', firstName: '', lastName: '',
      personnelCode: '', departmentId: safeDepts[0]?.id || '', position: '',
      role: 'assignee', partyType: 'employer', isActive: true, email: '', phone: '',
    });
    setEditingUser(null);
    setShowForm(false);
  };

  const handleEdit = (user: any) => {
    setFormData({
      username: user.username, password: user.password, firstName: user.firstName,
      lastName: user.lastName, personnelCode: user.personnelCode,
      departmentId: user.departmentId, position: user.position,
      role: user.role, partyType: user.partyType || 'employer',
      isActive: user.isActive, email: user.email || '', phone: user.phone || '',
    });
    setEditingUser(user);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateUser(editingUser.id, formData);
      alert('✅ کاربر با موفقیت ویرایش شد');
    } else {
      if (safeUsers.find(u => u.username === formData.username)) {
        alert('❌ این نام کاربری قبلاً ثبت شده است');
        return;
      }
      addUser(formData as any);
      alert('✅ کاربر جدید ایجاد شد و اعلان برای او ارسال گردید');
    }
    resetForm();
  };

  const handleDelete = (user: any) => {
    if (user.id === currentUser?.id) {
      alert('❌ نمی‌توانید حساب خود را حذف کنید');
      return;
    }
    if (confirm(`آیا از حذف "${user.firstName} ${user.lastName}" مطمئن هستید؟`)) {
      deleteUser(user.id);
      alert('✅ کاربر حذف شد');
    }
  };

  const toggleActive = (user: any) => {
    updateUser(user.id, { isActive: !user.isActive });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">مدیریت کاربران</h1>
          <p className="text-sm text-slate-500 mt-1">
            {toPersianNumber(safeUsers.length)} کاربر ثبت شده ({toPersianNumber(safeUsers.filter(u => u.isActive).length)} فعال)
          </p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 ml-2" />
          ایجاد کاربر جدید
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{editingUser ? 'ویرایش کاربر' : 'ایجاد کاربر جدید'}</CardTitle>
            <button onClick={resetForm} className="p-1 hover:bg-slate-100 rounded"><X className="w-5 h-5" /></button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">نام *</label>
                <input required type="text" value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">نام خانوادگی *</label>
                <input required type="text" value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">نام کاربری *</label>
                <input required type="text" value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">رمز عبور *</label>
                <input required type="text" value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">کد پرسنلی</label>
                <input type="text" value={formData.personnelCode}
                  onChange={(e) => setFormData({ ...formData, personnelCode: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">سمت</label>
                <input type="text" value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">واحد سازمانی *</label>
                <select required value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500">
                  {safeDepts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">نقش *</label>
                <select required value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500">
                  <option value="assignee">مسئول اجرا</option>
                  <option value="secretary">دبیر جلسات</option>
                  <option value="supervisor">ناظر</option>
                  <option value="manager">مدیر عامل</option>
                  <option value="admin">مدیر سیستم</option>
                  <option value="super_admin">مدیر ارشد</option>
                  <option value="approver">تأیید کننده</option>
                  <option value="viewer">بیننده</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">نوع عضویت</label>
                <select value={formData.partyType}
                  onChange={(e) => setFormData({ ...formData, partyType: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500">
                  <option value="employer">کارفرما</option>
                  <option value="contractor">پیمانکار</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ایمیل</label>
                <input type="email" value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">شماره تماس</label>
                <input type="text" value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isActive" checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4" />
                <label htmlFor="isActive" className="text-sm">کاربر فعال</label>
              </div>
              <div className="md:col-span-2 flex gap-2 pt-2">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  <Save className="w-4 h-4 ml-2" />
                  {editingUser ? 'ذخیره تغییرات' : 'ایجاد کاربر'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>انصراف</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="relative max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="جستجو در کاربران..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-slate-200 rounded-lg focus:border-blue-500" />
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
                  <div className="space-y-2 text-xs text-slate-600 mb-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3 h-3" />
                      <span>{getDeptName(user.departmentId)}</span>
                    </div>
                    <div className="pt-2 border-t">
                      <span className="text-slate-500">نام کاربری: </span>
                      <span className="font-mono">{user.username}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex gap-1">
                      <Badge className={user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                        {user.isActive ? 'فعال' : 'غیرفعال'}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => toggleActive(user)}
                        className="p-1.5 hover:bg-slate-100 rounded"
                        title={user.isActive ? 'غیرفعال کردن' : 'فعال کردن'}>
                        {user.isActive ? <UserX className="w-4 h-4 text-orange-500" /> : <UserCheck className="w-4 h-4 text-green-500" />}
                      </button>
                      <button onClick={() => handleEdit(user)} className="p-1.5 hover:bg-slate-100 rounded" title="ویرایش">
                        <Edit className="w-4 h-4 text-blue-500" />
                      </button>
                      <button onClick={() => handleDelete(user)} className="p-1.5 hover:bg-red-50 rounded" title="حذف">
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