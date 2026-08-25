import React from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
import { toPersianNumber } from '@/lib/utils';
import { Building2 } from 'lucide-react';

export function DepartmentsPage() {
  const { departments, users } = useApp();

  const safeDepts = departments || [];
  const safeUsers = users || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">واحدها</h1>
        <p className="text-sm text-slate-500 mt-1">مدیریت واحدهای سازمانی</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>لیست واحدها ({toPersianNumber(safeDepts.length)})</CardTitle>
        </CardHeader>
        <CardContent>
          {safeDepts.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">واحدی ثبت نشده است</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {safeDepts.map(dept => {
                const userCount = safeUsers.filter(u => u.departmentId === dept.id).length;
                return (
                  <div key={dept.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-slate-900">{dept.name}</h3>
                        <p className="text-xs text-slate-500 mt-1 font-mono">{dept.code}</p>
                      </div>
                      <Badge className={dept.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                        {dept.isActive ? 'فعال' : 'غیرفعال'}
                      </Badge>
                    </div>

                    {dept.description && (
                      <p className="text-sm text-slate-600 mb-3">{dept.description}</p>
                    )}

                    <div className="pt-3 border-t">
                      <p className="text-xs text-slate-500">تعداد کاربران:</p>
                      <p className="text-lg font-bold text-slate-900">{toPersianNumber(userCount)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}