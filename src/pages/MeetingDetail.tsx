import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { toPersianNumber } from '@/lib/utils';
import { getEntityAuditLog } from '@/lib/audit';
import { AuditTimeline } from '@/components/AuditTimeline';
import { ArrowRight, Calendar, MapPin, Users, Building2, HardHat } from 'lucide-react';

export function MeetingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { meetings, users, departments, meetingTypes } = useApp();
  const [activeTab, setActiveTab] = useState<'details' | 'audit'>('details');

  const meeting = meetings.find(m => m.id === id);

  if (!meeting) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">جلسه یافت نشد</p>
        <Button onClick={() => navigate('/meetings')} className="mt-4">بازگشت به لیست جلسات</Button>
      </div>
    );
  }

  const type = meetingTypes.find(t => t.id === meeting.typeId);
  const dept = departments.find(d => d.id === meeting.departmentId);
  const chairman = users.find(u => u.id === meeting.chairmanId);
  const secretary = users.find(u => u.id === meeting.secretaryId);
  const auditLog = getEntityAuditLog('meeting', meeting.id);

  const getStatusColor = (status: string): 'success' | 'info' | 'danger' | 'neutral' | 'warning' => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'info';
      case 'delayed': return 'danger';
      case 'cancelled': return 'neutral';
      default: return 'info';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new': return 'جدید';
      case 'in_progress': return 'در حال انجام';
      case 'completed': return 'تکمیل شده';
      case 'delayed': return 'تأخیر دارد';
      case 'cancelled': return 'لغو شده';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/meetings')}>
          <ArrowRight className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-mono text-slate-500">{meeting.code}</span>
            <Badge variant={meeting.status === 'held' ? 'success' : 'info'} size="sm">
              {meeting.status === 'held' ? 'برگزار شده' : meeting.status}
            </Badge>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{meeting.title}</h1>
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('details')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === 'details'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          جزئیات جلسه
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === 'audit'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          تاریخچه تغییرات ({toPersianNumber(auditLog.length)})
        </button>
      </div>

      {activeTab === 'details' && (
        <>
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">اطلاعات جلسه</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">تاریخ:</span>
                      <span className="font-medium">{meeting.date}</span>
                      {meeting.startTime && <span className="text-slate-500">({meeting.startTime})</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">محل:</span>
                      <span className="font-medium">{meeting.location}</span>
                    </div>
                    {type && (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }} />
                        <span className="text-slate-600">نوع:</span>
                        <span className="font-medium">{type.name}</span>
                      </div>
                    )}
                    {dept && (
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600">واحد:</span>
                        <span className="font-medium">{dept.name}</span>
                      </div>
                    )}
                    {chairman && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600">رئیس جلسه:</span>
                        <span className="font-medium">{chairman.firstName} {chairman.lastName}</span>
                      </div>
                    )}
                    {secretary && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600">دبیر:</span>
                        <span className="font-medium">{secretary.firstName} {secretary.lastName}</span>
                      </div>
                    )}
                  </div>
                </div>

                {meeting.subject && (
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3">موضوع جلسه</h3>
                    <p className="text-sm text-slate-700">{meeting.subject}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-slate-900 mb-4">حاضرین جلسه</h3>
              <div className="space-y-4">
                {meeting.attendeeGroups?.map(group => {
                  const label = group.partyType === 'employer' ? 'کارفرما' : 'پیمانکار';
                  const Icon = group.partyType === 'employer' ? Building2 : HardHat;
                  const color = group.partyType === 'employer' ? 'blue' : 'orange';

                  return (
                    <div key={group.partyType}>
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className={`w-4 h-4 text-${color}-600`} />
                        <h4 className="font-medium text-slate-900">{label}</h4>
                        <Badge variant="info" size="sm">{toPersianNumber(group.attendees.length)} نفر</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {group.attendees.map(a => (
                          <div key={a.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 text-sm font-medium">
                              {a.name.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium">{a.name}</div>
                              <div className="text-xs text-slate-500">{a.position}</div>
                            </div>
                            <Badge
                              variant={a.status === 'present' ? 'success' : a.status === 'absent' ? 'danger' : 'info'}
                              size="sm"
                            >
                              {a.status === 'present' ? 'حاضر' : a.status === 'absent' ? 'غایب' : a.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-slate-900 mb-4">مصوبات و اقدامات</h3>
              {meeting.minuteRows?.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">مصوبه‌ای ثبت نشده است</p>
              ) : (
                <div className="space-y-3">
                  {meeting.minuteRows?.map(row => {
                    const assigneeName = row.assigneeName || '-';

                    return (
                      <div key={row.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3 mb-3">
                          <span className="text-lg font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                            {toPersianNumber(row.rowNumber)}
                          </span>
                          <div className="flex-1">
                            <p className="font-medium text-slate-900 mb-1">{row.description}</p>
                            {row.actionRequired && (
                              <p className="text-sm text-slate-600">اقدام: {row.actionRequired}</p>
                            )}
                          </div>
                          <Badge variant={getStatusColor(row.status)} size="sm">
                            {getStatusLabel(row.status)}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <div className="text-xs text-slate-500 mb-1">مسئول</div>
                            <div className="font-medium">{assigneeName}</div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-500 mb-1">مهلت</div>
                            <div className="font-medium">{row.dueDate || '-'}</div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-500 mb-1">پیشرفت</div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-slate-200 rounded-full h-1.5">
                                <div
                                  className="bg-green-500 h-1.5 rounded-full"
                                  style={{ width: `${row.progress}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium">{toPersianNumber(row.progress)}٪</span>
                            </div>
                          </div>
                          {row.notes && (
                            <div className="col-span-2">
                              <div className="text-xs text-slate-500 mb-1">توضیحات</div>
                              <div className="text-sm">{row.notes}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {meeting.generalNotes && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-900 mb-3">توضیحات کلی</h3>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{meeting.generalNotes}</p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {activeTab === 'audit' && (
        <Card>
          <CardContent className="p-6">
            <AuditTimeline entries={auditLog} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}