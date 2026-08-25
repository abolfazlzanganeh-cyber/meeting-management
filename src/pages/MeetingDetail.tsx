import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@/components/ui';
import { toPersianNumber } from '@/lib/utils';
import { ArrowLeft, Calendar, MapPin, Users, CheckSquare, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export function MeetingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { meetings, users, departments, meetingTypes } = useApp();

  const meeting = (meetings || []).find(m => m.id === id);
  if (!meeting) return <div className="p-6 text-center"><p>جلسه یافت نشد</p><Button onClick={() => navigate('/meetings')} className="mt-4">بازگشت</Button></div>;

  const safeUsers = users || [];
  const safeDepts = departments || [];
  const safeTypes = meetingTypes || [];

  const getUserName = (userId: string) => {
    const user = safeUsers.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'نامشخص';
  };

  const getDeptName = (deptId: string) => safeDepts.find(d => d.id === deptId)?.name || 'نامشخص';

  // ✅ تابع تولید PDF
  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    
    // عنوان
    doc.setFontSize(16);
    doc.text(`صورت‌جلسه: ${meeting.title}`, 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text(`کد: ${meeting.code} | تاریخ: ${toPersianNumber(meeting.date)} | مکان: ${meeting.location}`, 105, 30, { align: 'center' });

    // جدول مصوبات
    const tableData = (meeting.minuteRows || []).map((row, idx) => [
      toPersianNumber(idx + 1),
      row.description,
      row.assigneeName,
      toPersianNumber(row.dueDate),
      `${toPersianNumber(row.progress)}%`,
      row.status
    ]);

    (doc as any).autoTable({
      startY: 40,
      head: [['ردیف', 'شرح مصوبه', 'مسئول', 'مهلت', 'پیشرفت', 'وضعیت']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], textColor: 255, halign: 'center' },
      styles: { font: 'helvetica', halign: 'right', fontSize: 9 },
      margin: { top: 40 }
    });

    doc.save(`Meeting_${meeting.code}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button onClick={() => navigate('/meetings')} variant="outline"><ArrowLeft className="w-4 h-4 ml-2" />بازگشت</Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{meeting.title}</h1>
            <p className="text-sm text-slate-500 mt-1">{meeting.code}</p>
          </div>
        </div>
        <Button onClick={exportToPDF} className="bg-red-600 hover:bg-red-700">
          <Download className="w-4 h-4 ml-2" />
          دانلود PDF صورت‌جلسه
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>اطلاعات جلسه</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-slate-400" /><span className="text-sm">تاریخ: {toPersianNumber(meeting.date)}</span></div>
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" /><span className="text-sm">مکان: {meeting.location}</span></div>
            <div className="flex items-center gap-2"><Users className="w-4 h-4 text-slate-400" /><span className="text-sm">واحد: {getDeptName(meeting.departmentId)}</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>دستور جلسه</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-slate-700">{meeting.subject || 'بدون موضوع'}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>مصوبات جلسه ({toPersianNumber(meeting.minuteRows?.length || 0)})</CardTitle></CardHeader>
        <CardContent>
          {!meeting.minuteRows || meeting.minuteRows.length === 0 ? (
            <div className="text-center py-8"><CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" /><p className="text-slate-500">مصوبه‌ای ثبت نشده است</p></div>
          ) : (
            <div className="space-y-3">
              {meeting.minuteRows.map((row, idx) => (
                <div key={row.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-mono">#{toPersianNumber(idx + 1)}</span>
                      <Badge className="bg-blue-100 text-blue-700">{row.status}</Badge>
                    </div>
                    <span className="text-xs text-slate-500">پیشرفت: {toPersianNumber(row.progress)}٪</span>
                  </div>
                  <p className="text-sm font-medium text-slate-900 mb-2">{row.description}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                    <span>مسئول: {row.assigneeName}</span>
                    <span>مهلت: {toPersianNumber(row.dueDate)}</span>
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