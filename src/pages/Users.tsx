import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Button, Card, CardContent, Badge, Modal, Input, Select } from '@/components/ui';
import { generateId, toPersianNumber } from '@/lib/utils';
import * as storage from '@/lib/storage';
import type { User, UserRole } from '@/types';
import * as XLSX from 'xlsx';
import { 
  Plus, Edit, Trash2, Search, Download, Upload, 
  Users as UsersIcon, Filter, CheckCircle, AlertTriangle, Clock
} from 'lucide-react';

const ROLES: Record<UserRole, string> = {
  super_admin: 'مدیر ارشد سیستم',
  admin: 'مدیر',
  manager: 'مدیر واحد',
  secretary: 'دبیر جلسه',
  assignee: 'مسئول اقدام',
  supervisor: 'ناظر',
  approver: 'تأییدکننده',
  viewer: 'مشاهده‌کننده',
};

export function UsersPage() {
  const { users, departments, resolutions, refreshUsers } = useApp();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [showImport, setShowImport] = useState(false);

  // محاسبه آمار هر کاربر
  const getUserStats = (userId: string) => {
    const userResolutions = resolutions.filter(r => 
      !r.isArchived && r.assigneeIds.includes(userId)
    );
    return {
      total: userResolutions.length,
      completed: userResolutions.filter(r => r.status === 'completed').length,
      inProgress: userResolutions.filter(r => r.status === 'in_progress').length,
      overdue: userResolutions.filter(r => r.status === 'overdue').length,
      successRate: userResolutions.length > 0 
        ? Math.round((userResolutions.filter(r => r.status === 'completed').length / userResolutions.length) * 100)
        : 0,
    };
  };

  // فیلتر کاربران
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (deptFilter !== 'all' && u.departmentId !== deptFilter) return false;
      if (statusFilter !== 'all') {
        if (statusFilter === 'active' && !u.isActive) return false;
        if (statusFilter === 'inactive' && u.isActive) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        return (
          u.firstName.toLowerCase().includes(q) ||
          u.lastName.toLowerCase().includes(q) ||
          u.personnelCode.toLowerCase().includes(q) ||
          u.position.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [users, search, roleFilter, deptFilter, statusFilter]);

  const handleDelete = (id: string) => {
    if (!confirm('آیا از حذف این کاربر مطمئن هستید؟')) return;
    const all = storage.getUsers().filter(u => u.id !== id);
    storage.setUsers(all);
    refreshUsers();
  };

  const handleExport = () => {
    const data = filteredUsers.map(u => {
      const dept = departments.find(d => d.id === u.departmentId);
      const stats = getUserStats(u.id);
      return {
        'نام': u.firstName,
        'نام خانوادگی': u.lastName,
        'کد پرسنلی': u.personnelCode,
        'واحد': dept?.name || '-',
        'سمت': u.position,
        'نقش': ROLES[u.role],
        'وضعیت': u.isActive ? 'فعال' : 'غیرفعال',
        'تعداد مصوبات': stats.total,
        'تکمیل شده': stats.completed,
        'در حال انجام': stats.inProgress,
        'تأخیر دار': stats.overdue,
        'درصد موفقیت': `${stats.successRate}%`,
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'کاربران');
    XLSX.writeFile(wb, `کاربران-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // آمار کلی
  const totalStats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    inactive: users.filter(u => !u.isActive).length,
    totalResolutions: resolutions.filter(r => !r.isArchived).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">کاربران</h1>
          <p className="text-sm text-slate-500 mt-1">مدیریت کاربران و پرسنل سیستم</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowImport(true)}>
            <Upload className="w-4 h-4" />
            وارد کردن از اکسل
          </Button>
          <Button variant="outline" onClick={handleExport} disabled={filteredUsers.length === 0}>
            <Download className="w-4 h-4" />
            خروجی اکسل
          </Button>
          <Button onClick={() => { setEditing(null); setShowForm(true); }}>
            <Plus className="w-4 h-4" />
            کاربر جدید
          </Button>
        </div>
      </div>

      {/* آمار کلی */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-slate-500 mb-1">کل کاربران</div>
            <div className="text-2xl font-bold text-slate-900">{toPersianNumber(totalStats.total)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-slate-500 mb-1">کاربران فعال</div>
            <div className="text-2xl font-bold text-green-600">{toPersianNumber(totalStats.active)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-slate-500 mb-1">کاربران غیرفعال</div>
            <div className="text-2xl font-bold text-red-600">{toPersianNumber(totalStats.inactive)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-slate-500 mb-1">کل مصوبات</div>
            <div className="text-2xl font-bold text-blue-600">{toPersianNumber(totalStats.totalResolutions)}</div>
          </CardContent>
        </Card>
      </div>

      {/* فیلترها */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="جستجو در نام، کد پرسنلی، سمت..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pr-10 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-primary-500"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
            >
              <option value="all">همه نقش‌ها</option>
              {Object.entries(ROLES).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
            >
              <option value="all">همه واحدها</option>
              {departments.filter(d => d.isActive).map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
            >
              <option value="all">همه وضعیت‌ها</option>
              <option value="active">فعال</option>
              <option value="inactive">غیرفعال</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* جدول کاربران با آمار */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">کاربر</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">نام کاربری</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">واحد</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">سمت</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">نقش</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">مصوبات</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">تکمیل/تأخیر</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">موفقیت</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">وضعیت</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map(u => {
                const dept = departments.find(d => d.id === u.departmentId);
                const stats = getUserStats(u.id);
                return (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {u.firstName[0]}{u.lastName[0]}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{u.firstName} {u.lastName}</div>
                          <div className="text-xs text-slate-500">{u.personnelCode}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-slate-700">{u.username}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{dept?.name || '-'}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{u.position}</td>
                    <td className="px-4 py-3">
                      <Badge variant="info" size="sm">{ROLES[u.role]}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-semibold">{toPersianNumber(stats.total)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          {toPersianNumber(stats.completed)}
                        </span>
                        <span className="text-red-600 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {toPersianNumber(stats.overdue)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-200 rounded-full h-1.5">
                          <div
                            className="bg-green-500 h-1.5 rounded-full"
                            style={{ width: `${stats.successRate}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-slate-600">{toPersianNumber(stats.successRate)}٪</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={u.isActive ? 'success' : 'neutral'} size="sm">
                        {u.isActive ? 'فعال' : 'غیرفعال'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setEditing(u); setShowForm(true); }}
                          className="p-1.5 hover:bg-slate-100 rounded"
                          title="ویرایش"
                        >
                          <Edit className="w-4 h-4 text-slate-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="p-1.5 hover:bg-slate-100 rounded text-red-600"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredUsers.length === 0 && (
          <div className="py-12 text-center text-slate-500">
            <UsersIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            کاربری یافت نشد
          </div>
        )}
      </Card>

      {showForm && (
        <UserForm user={editing} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); refreshUsers(); }} />
      )}
      {showImport && (
        <PersonnelImport onClose={() => setShowImport(false)} onImported={() => { setShowImport(false); refreshUsers(); }} />
      )}
    </div>
  );
}

// ============ فرم کاربر ============
function UserForm({ user, onClose, onSaved }: { user: User | null; onClose: () => void; onSaved: () => void }) {
  const { departments } = useApp();
  const [form, setForm] = useState<Partial<User>>(user || {
    firstName: '', lastName: '', username: '', password: '',
    personnelCode: '', email: '', phone: '',
    departmentId: '', position: '', role: 'assignee', isActive: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const all = storage.getUsers();
    const data: User = {
      id: user?.id || generateId(),
      username: form.username!,
      password: form.password || user?.password || '123456',
      firstName: form.firstName!,
      lastName: form.lastName!,
      personnelCode: form.personnelCode || '',
      email: form.email,
      phone: form.phone,
      departmentId: form.departmentId!,
      position: form.position || '',
      role: form.role as UserRole,
      isActive: form.isActive ?? true,
      createdAt: user?.createdAt || new Date().toISOString(),
    };
    if (user) {
      storage.setUsers(all.map(u => u.id === user.id ? data : u));
    } else {
      storage.setUsers([...all, data]);
    }
    onSaved();
  };

  return (
    <Modal open={true} onClose={onClose} title={user ? 'ویرایش کاربر' : 'کاربر جدید'} size="md" footer={
      <>
        <Button variant="outline" onClick={onClose}>انصراف</Button>
        <Button onClick={handleSubmit}>{user ? 'ذخیره' : 'ایجاد'}</Button>
      </>
    }>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="نام *" value={form.firstName || ''} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
          <Input label="نام خانوادگی *" value={form.lastName || ''} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
          <Input label="نام کاربری *" value={form.username || ''} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
          <Input label="رمز عبور" type="password" value={form.password || ''} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={user ? 'برای تغییر وارد کنید' : ''} />
          <Input label="شماره پرسنلی" value={form.personnelCode || ''} onChange={(e) => setForm({ ...form, personnelCode: e.target.value })} />
          <Input label="شماره تماس" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="ایمیل" type="email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Select
            label="واحد *"
            value={form.departmentId || ''}
            onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
            options={[{ value: '', label: 'انتخاب کنید' }, ...departments.filter(d => d.isActive).map(d => ({ value: d.id, label: d.name }))]}
          />
          <Input label="سمت" value={form.position || ''} onChange={(e) => setForm({ ...form, position: e.target.value })} />
          <Select
            label="نقش *"
            value={form.role || 'assignee'}
            onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
            options={Object.entries(ROLES).map(([k, v]) => ({ value: k, label: v }))}
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            checked={form.isActive ?? true}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            className="w-4 h-4"
          />
          <label htmlFor="isActive" className="text-sm text-slate-700">کاربر فعال باشد</label>
        </div>
      </form>
    </Modal>
  );
}

// ============ Import پرسنل ============
function PersonnelImport({ onClose, onImported }: { onClose: () => void; onImported: () => void }) {
  const { departments } = useApp();
  const [preview, setPreview] = useState<any[]>([]);
  const [fileName, setFileName] = useState('');

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
      
      const rows = jsonData.slice(1).filter((row: any) => row[0]);
      setPreview(rows);
    };
    reader.readAsBinaryString(file);
  };

  const handleImport = () => {
    const existingUsers = storage.getUsers();
    const newUsers: User[] = preview.map((row: any) => {
      const dept = departments.find(d => d.name.includes(row[3] || '')) || departments[0];
      return {
        id: generateId(),
        username: `user_${generateId().substr(0, 6)}`,
        password: '123456',
        firstName: row[0] || '',
        lastName: row[1] || '',
        personnelCode: String(row[2] || ''),
        email: row[5] || '',
        phone: row[6] || '',
        departmentId: dept.id,
        position: row[4] || 'کارمند',
        role: 'assignee',
        isActive: true,
        createdAt: new Date().toISOString(),
      };
    });

    storage.setUsers([...existingUsers, ...newUsers]);
    alert(`${newUsers.length} کاربر با موفقیت وارد شد!`);
    onImported();
  };

  return (
    <Modal open={true} onClose={onClose} title="وارد کردن لیست پرسنل از اکسل" size="lg" footer={
      <>
        <Button variant="outline" onClick={onClose}>انصراف</Button>
        {preview.length > 0 && (
          <Button onClick={handleImport}>
            <CheckCircle className="w-4 h-4" />
            وارد کردن {toPersianNumber(preview.length)} نفر
          </Button>
        )}
      </>
    }>
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <p className="font-semibold mb-2">📋 فرمت فایل اکسل:</p>
          <p>ستون‌ها باید به این ترتیب باشند:</p>
          <ol className="list-decimal list-inside mt-1 space-y-1">
            <li>نام</li>
            <li>نام خانوادگی</li>
            <li>کد پرسنلی</li>
            <li>نام واحد (مثلاً: تولید، تعمیرات)</li>
            <li>سمت</li>
            <li>ایمیل (اختیاری)</li>
            <li>شماره تماس (اختیاری)</li>
          </ol>
          <p className="mt-2 text-xs">رمز عبور پیش‌فرض برای همه: <code className="bg-white px-2 py-0.5 rounded">123456</code></p>
        </div>

        <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors">
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFile}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-sm text-slate-600 mb-1">
              {fileName || 'فایل اکسل را اینجا رها کنید یا کلیک کنید'}
            </p>
            <p className="text-xs text-slate-400">فرمت‌های مجاز: xlsx, xls, csv</p>
          </label>
        </div>

        {preview.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-2">پیش‌نمایش ({toPersianNumber(preview.length)} نفر):</h3>
            <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-lg">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th className="px-2 py-2 text-right">نام</th>
                    <th className="px-2 py-2 text-right">نام خانوادگی</th>
                    <th className="px-2 py-2 text-right">کد پرسنلی</th>
                    <th className="px-2 py-2 text-right">واحد</th>
                    <th className="px-2 py-2 text-right">سمت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {preview.slice(0, 20).map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-2 py-1.5">{row[0]}</td>
                      <td className="px-2 py-1.5">{row[1]}</td>
                      <td className="px-2 py-1.5">{row[2]}</td>
                      <td className="px-2 py-1.5">{row[3]}</td>
                      <td className="px-2 py-1.5">{row[4]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {preview.length > 20 && (
                <div className="text-center py-2 text-xs text-slate-500 bg-slate-50">
                  و {toPersianNumber(preview.length - 20)} نفر دیگر...
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}