import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type, onClose, duration = 4000 }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const config = {
    success: { icon: CheckCircle, bg: 'bg-green-50 dark:bg-green-900/30', border: 'border-green-200 dark:border-green-800', text: 'text-green-800 dark:text-green-200', iconColor: 'text-green-600' },
    error: { icon: XCircle, bg: 'bg-red-50 dark:bg-red-900/30', border: 'border-red-200 dark:border-red-800', text: 'text-red-800 dark:text-red-200', iconColor: 'text-red-600' },
    warning: { icon: AlertCircle, bg: 'bg-yellow-50 dark:bg-yellow-900/30', border: 'border-yellow-200 dark:border-yellow-800', text: 'text-yellow-800 dark:text-yellow-200', iconColor: 'text-yellow-600' },
    info: { icon: Info, bg: 'bg-blue-50 dark:bg-blue-900/30', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-800 dark:text-blue-200', iconColor: 'text-blue-600' },
  };

  const c = config[type];
  const Icon = c.icon;

  return (
    <div className={`fixed bottom-6 left-6 z-[200] animate-slide-in ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} transition-all duration-300`}>
      <div className={`${c.bg} ${c.border} border rounded-xl shadow-2xl p-4 min-w-[300px] max-w-md flex items-start gap-3`}>
        <Icon className={`w-5 h-5 ${c.iconColor} flex-shrink-0 mt-0.5`} />
        <div className={`flex-1 text-sm ${c.text}`}>{message}</div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Toast Manager
interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

let toastListeners: Array<(toast: ToastItem) => void> = [];

export function showToast(message: string, type: ToastType = 'info') {
  const toast: ToastItem = {
    id: Date.now().toString() + Math.random(),
    message,
    type,
  };
  toastListeners.forEach(fn => fn(toast));
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const listener = (toast: ToastItem) => {
      setToasts(prev => [...prev, toast]);
    };
    toastListeners.push(listener);
    return () => {
      toastListeners = toastListeners.filter(l => l !== listener);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="fixed bottom-6 left-6 z-[200] space-y-2">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}