import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { useApp } from '@/context/AppContext';
import { Button, Modal } from '@/components/ui';
import { Upload, FileSpreadsheet, CheckCircle } from 'lucide-react';
import { generateId } from '@/lib/utils';
import * as storage from '@/lib/storage';
import type { User } from '@/types';

interface PersonnelImportProps {
  onClose: () => void;
  onImported: () => void;
}

export function PersonnelImport({ onClose, onImported }: PersonnelImportProps) {
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
      
      // فرض: ستون‌ها: نام، نام خانوادگی، کد پرسنلی، واحد، سمت، ایمیل، تلفن
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
    onImported();
  };

  return (
    <Modal open={true} onClose={onClose} title="وارد کردن لیست پرسنل از اکسل" size="lg" footer={
      <>
        <Button variant="outline" onClick={onClose}>انصراف</Button>
        {preview.length > 0 && (
          <Button onClick={handleImport}>
            <CheckCircle className="w-4 h-4" />
            وارد کردن {preview.length} نفر
          </Button>
        )}
      </>
    }>
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <p className="font-semibold mb-2"> فرمت فایل اکسل:</p>
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
            <h3 className="text-sm font-semibold text-slate-700 mb-2">پیش‌نمایش ({preview.length} نفر):</h3>
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
                  و {preview.length - 20} نفر دیگر...
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}