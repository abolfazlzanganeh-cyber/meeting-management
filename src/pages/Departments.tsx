import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button, Card, CardContent, Badge, Modal, Input, Textarea } from '@/components/ui';
import { generateId } from '@/lib/utils';
import * as storage from '@/lib/storage';
import type { Department } from '@/types';
import { Plus, Edit, Trash2, Building2 } from 'lucide-react';

export function DepartmentsPage() {
  const { departments, resolutions, refreshDepartments } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);

  const handleDelete = (id: string) => {
    const hasResolutions = resolutions.some(r => r.departmentId === id && !r.isArchived);
    if (hasResolutions) {
      alert('این واحد دارای مصوبات است و قابل حذف نیست');
      return;
    }
    if (!confirm('آیا از حذف این واحد مطمئن هستید؟')) return;
    const all = storage.getDepartments().filter(d => d.id !== id);
    storage.setDepartments(all);
    refreshDepartments();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">واحدهای سازمانی</h1>
          <p className="text-sm text-slate-500 mt-1">مدیریت ساختار سازمانی</p>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true); }}>
          <Plus className="w-4 h-4" />
          واحد جدید
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map(d => {
          const resCount = resolutions.filter(r => r.departmentId === d.id && !r.isArchived).length;
          const completedCount = resolutions.filter(r => r.departmentId === d.id && r.status === 'completed' && !r.isArchived).length;
          return (
            <Card key={d.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{d.name}</h3>
                      <p className="text-xs text-slate-500 font-mono">{d.code}</p>
                    </div>
                  </div>
                  <Badge variant={d.isActive ? 'success' : 'neutral'} size="sm">
                    {d.isActive ? 'فعال' : 'غیرفعال'}
                  </Badge>
                </div>
                {d.description && <p className="text-sm text-slate-600 mb-3">{d.description}</p>}
                <div className="flex items-center gap-4 text-sm text-slate-600 mb-3 pt-3 border-t border-slate-100">
                  <div>
                    <div className="text-xs text-slate-500">کل مصوبات</div>
                    <div className="font-semibold">{resCount}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">تکمیل شده</div>
                    <div className="font-semibold text-green-600">{completedCount}</div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => { setEditing(d); setShowForm(true); }}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(d.id)} className="text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {showForm && (
        <DepartmentForm department={editing} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); refreshDepartments(); }} />
      )}
    </div>
  );
}

function DepartmentForm({ department, onClose, onSaved }: { department: Department | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<Partial<Department>>(department || {
    name: '', code: '', description: '', isActive: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const all = storage.getDepartments();
    const data: Department = {
      id: department?.id || generateId(),
      name: form.name!,
      code: form.code!,
      description: form.description,
      isActive: form.isActive ?? true,
    };
    if (department) {
      storage.setDepartments(all.map(d => d.id === department.id ? data : d));
    } else {
      storage.setDepartments([...all, data]);
    }
    onSaved();
  };

  return (
    <Modal open={true} onClose={onClose} title={department ? 'ویرایش واحد' : 'واحد جدید'} size="sm" footer={
      <>
        <Button variant="outline" onClick={onClose}>انصراف</Button>
        <Button onClick={handleSubmit}>{department ? 'ذخیره' : 'ایجاد'}</Button>
      </>
    }>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="نام واحد *" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <Input label="کد واحد *" value={form.code || ''} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
        <Textarea label="توضیحات" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
      </form>
    </Modal>
  );
}