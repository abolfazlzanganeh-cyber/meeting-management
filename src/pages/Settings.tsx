import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Settings as SettingsIcon } from 'lucide-react';

export function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">تنظیمات</h1>
        <p className="text-sm text-slate-500 mt-1">تنظیمات سیستم</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>تنظیمات عمومی</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <SettingsIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">تنظیمات در حال توسعه است...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}