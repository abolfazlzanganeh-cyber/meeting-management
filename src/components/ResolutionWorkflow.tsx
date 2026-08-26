import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@/components/ui';
import { toPersianNumber } from '@/lib/utils';
import { CheckCircle2, XCircle, Clock, Play, MessageSquare } from 'lucide-react';
import type { Resolution } from '@/types';

interface ResolutionWorkflowProps {
  resolution: Resolution;
}

export function ResolutionWorkflow({ resolution }: ResolutionWorkflowProps) {
  const { users, updateResolution, currentUser } = useApp();
  const [comment, setComment] = useState('');
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);

  const safeUsers = users || [];
  const workflow = resolution.workflow || [];
  const currentStep = resolution.currentWorkflowStep || 0;

  const getUserName = (userId: string) => {
    const user = safeUsers.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'نامشخص';
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string; icon: any }> = {
      pending: { label: 'در انتظار', color: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300', icon: Clock },
      in_progress: { label: 'در حال انجام', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300', icon: Play },
      completed: { label: 'تکمیل شده', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300', icon: CheckCircle2 },
      rejected: { label: 'رد شده', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300', icon: XCircle },
    };
    const s = statusMap[status] || statusMap.pending;
    return <Badge className={s.color}><s.icon className="w-3 h-3 ml-1" />{s.label}</Badge>;
  };

  const handleApprove = (stepIndex: number) => {
    const updatedWorkflow = workflow.map((step, idx) => {
      if (idx === stepIndex) {
        return {
          ...step,
          status: 'completed' as const,
          completedAt: new Date().toISOString(),
          completedBy: currentUser?.id,
          comments: comment || step.comments,
        };
      }
      return step;
    });

    updateResolution(resolution.id, {
      workflow: updatedWorkflow,
      currentWorkflowStep: currentStep + 1,
    });

    setComment('');
    setActiveStepIndex(null);
    alert('✅ مرحله تأیید شد');
  };

  const handleReject = (stepIndex: number) => {
    if (!comment.trim()) {
      alert('❌ لطفاً دلیل رد را وارد کنید');
      return;
    }

    const updatedWorkflow = workflow.map((step, idx) => {
      if (idx === stepIndex) {
        return {
          ...step,
          status: 'rejected' as const,
          completedAt: new Date().toISOString(),
          completedBy: currentUser?.id,
          comments: comment,
        };
      }
      return step;
    });

    updateResolution(resolution.id, {
      workflow: updatedWorkflow,
    });

    setComment('');
    setActiveStepIndex(null);
    alert('❌ مرحله رد شد');
  };

  const handleStartStep = (stepIndex: number) => {
    const updatedWorkflow = workflow.map((step, idx) => {
      if (idx === stepIndex) {
        return { ...step, status: 'in_progress' as const };
      }
      return step;
    });

    updateResolution(resolution.id, {
      workflow: updatedWorkflow,
    });

    alert('▶️ مرحله شروع شد');
  };

  if (workflow.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="dark:text-white">گردش کار</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            گردش کاری تعریف نشده است
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="dark:text-white">گردش کار مصوبه</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {workflow.map((step, idx) => {
            const isCurrentStep = idx === currentStep;
            const isCompleted = step.status === 'completed';
            const isRejected = step.status === 'rejected';
            const isPending = step.status === 'pending';
            const isAssignedToMe = step.assigneeId === currentUser?.id;

            return (
              <div
                key={step.id}
                className={`border-2 rounded-lg p-4 transition-all ${
                  isCurrentStep
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : isCompleted
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : isRejected
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                      isCompleted ? 'bg-green-500' :
                      isRejected ? 'bg-red-500' :
                      isCurrentStep ? 'bg-blue-500' :
                      'bg-slate-400'
                    }`}>
                      {toPersianNumber(idx + 1)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {step.title}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        مسئول: {getUserName(step.assigneeId)}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(step.status)}
                </div>

                {step.comments && (
                  <div className="mt-3 p-3 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      <MessageSquare className="w-4 h-4 inline ml-1" />
                      {step.comments}
                    </p>
                    {step.completedAt && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                        {getUserName(step.completedBy || '')} - {new Date(step.completedAt).toLocaleDateString('fa-IR')}
                      </p>
                    )}
                  </div>
                )}

                {isCurrentStep && isAssignedToMe && activeStepIndex !== idx && (
                  <div className="mt-4 flex gap-2">
                    {isPending && (
                      <Button
                        onClick={() => handleStartStep(idx)}
                        className="bg-blue-600 hover:bg-blue-700"
                        size="sm"
                      >
                        <Play className="w-4 h-4 ml-1" />
                        شروع مرحله
                      </Button>
                    )}
                    {(step.status === 'in_progress' || isPending) && (
                      <>
                        <Button
                          onClick={() => setActiveStepIndex(idx)}
                          className="bg-green-600 hover:bg-green-700"
                          size="sm"
                        >
                          <CheckCircle2 className="w-4 h-4 ml-1" />
                          تأیید
                        </Button>
                        <Button
                          onClick={() => setActiveStepIndex(idx)}
                          variant="outline"
                          className="border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          size="sm"
                        >
                          <XCircle className="w-4 h-4 ml-1" />
                          رد
                        </Button>
                      </>
                    )}
                  </div>
                )}

                {activeStepIndex === idx && (
                  <div className="mt-4 p-4 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                    <label className="block text-sm font-medium mb-2 dark:text-slate-300">
                      نظر/توضیحات
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="توضیحات خود را وارد کنید..."
                      rows={3}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:border-blue-500 mb-3"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleApprove(idx)}
                        className="bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        تأیید نهایی
                      </Button>
                      <Button
                        onClick={() => handleReject(idx)}
                        variant="outline"
                        className="border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        size="sm"
                      >
                        رد مرحله
                      </Button>
                      <Button
                        onClick={() => {
                          setActiveStepIndex(null);
                          setComment('');
                        }}
                        variant="outline"
                        size="sm"
                      >
                        انصراف
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}