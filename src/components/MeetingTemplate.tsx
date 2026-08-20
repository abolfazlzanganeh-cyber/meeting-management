import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button, Modal, Input, Select } from '@/components/ui';
import { generateId } from '@/lib/utils';
import * as storage from '@/lib/storage';
import type { Meeting, AgendaItem, MinuteItem } from '@/types';
import { Copy, Plus, Trash2, Zap } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  typeId: string;
  departmentId: string;
  defaultAgenda: AgendaItem[];
  defaultAttendees: string[]; // userIds
  description?: string;
}

const TEMPLATES_KEY = 'mms_templates';

function getTemplates(): Template[] {
  try {
    return JSON.parse(localStorage.getItem(TEMPLATES_KEY) || '[]');
  } catch { return []; }
}

function setTemplates(templates: Template[]) {
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
}

interface MeetingTemplateProps {
  open: boolean;
  onClose: () => void;
  onApply: (template: Template) => void;
}

export function MeetingTemplate({ open, onClose, onApply }: MeetingTemplateProps) {
  const { meetingTypes, departments, users } = useApp();
  const [templates, setTemplatesState] = useState<Template[]>(getTemplates());
  const [showCreate, setShowCreate] = useState(false);
  const [newTemplate, setNewTemplate] = useState<Partial<Template>>({
    name: '', typeId: '', departmentId: '', defaultAgenda: [], defaultAttendees: [], description: '',
  });

  const handleCreate = () => {
    if (!newTemplate.name) return;
    const template: Template = {
      id: generateId(),
      name: newTemplate.name!,
      typeId: newTemplate.typeId || '',
      departmentId: newTemplate.departmentId || '',
      defaultAgenda: newTemplate.defaultAgenda || [],
      defaultAttendees: newTemplate.defaultAttendees || [],
      description: newTemplate.description,
    };
    const updated = [...templates, template];
    setTemplatesState(updated);
    setTemplates(updated);
    setNewTemplate({ name: '', typeId: '', departmentId: '', defaultAgenda: [], defaultAttendees: [], description: '' });
    setShowCreate(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm('حذف این قالب؟')) return;
    const updated = templates.filter(t => t.id !== id);
    setTemplatesState(updated);
    setTemplates(updated);
  };

  const handleApply = (template: Template) => {
    onApply(template);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="قالب‌های جلسه" size="lg" footer={
      <>
        <Button variant="outline" onClick={onClose}>بستن</Button>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4" />
          قالب جدید
        </Button>
      </>
    }>
      {templates.length === 0 ? (
        <div className="text-center py-12">
          <Copy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">قالبی وجود ندارد</p>
          <p className="text-xs text-slate-400 mt-1">اولین قالب خود را بسازید</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {templates.map(t => {
            const type = meetingTypes.find(mt => mt.id === t.typeId);
            const dept = departments.find(d => d.id === t.departmentId);
            return (
              <div key={t.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">{t.name}</h3>
                  </div>
                  <button onClick={() => handleDelete(t.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {t.description && <p className="text-xs text-slate-500 mb-2">{t.description}</p>}
                <div className="flex flex-wrap gap-2 text-xs mb-3">
                  {type && <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">{type.name}</span>}
                  {dept && <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">{dept.name}</span>}
                  <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded">
                    {t.defaultAgenda.length} دستور
                  </span>
                  <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded">
                    {t.defaultAttendees.length} حاضر
                  </span>
                </div>
                <Button size="sm" onClick={() => handleApply(t)} className="w-full">
                  <Zap className="w-4 h-4" />
                  استفاده از این قالب
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-lg font-semibold mb-4">ایجاد قالب جدید</h3>
            <div className="space-y-4">
              <Input label="نام قالب *" value={newTemplate.name || ''} onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <Select label="نوع جلسه" value={newTemplate.typeId || ''} onChange={(e) => setNewTemplate({ ...newTemplate, typeId: e.target.value })}
                  options={meetingTypes.map(t => ({ value: t.id, label: t.name }))} />
                <Select label="واحد" value={newTemplate.departmentId || ''} onChange={(e) => setNewTemplate({ ...newTemplate, departmentId: e.target.value })}
                  options={departments.map(d => ({ value: d.id, label: d.name }))} />
              </div>
              <Input label="توضیحات" value={newTemplate.description || ''} onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })} />
              
              <div>
                <label className="block text-sm font-medium mb-2">حاضران پیش‌فرض (چند انتخابی با Ctrl)</label>
                <select
                  multiple
                  value={newTemplate.defaultAttendees || []}
                  onChange={(e) => setNewTemplate({ ...newTemplate, defaultAttendees: Array.from(e.target.selectedOptions, o => o.value) })}
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2 min-h-[100px]"
                >
                  {users.filter(u => u.isActive).map(u => (
                    <option key={u.id} value={u.id}>{u.firstName} {u.lastName} - {u.position}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowCreate(false)}>انصراف</Button>
                <Button onClick={handleCreate}>ذخیره قالب</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}