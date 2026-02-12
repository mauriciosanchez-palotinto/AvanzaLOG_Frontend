import React from 'react';
import { useToastStore } from '../stores/toastStore';

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2 max-w-md">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`p-4 rounded-lg shadow-lg flex justify-between items-center animate-slide-in ${
            toast.type === 'success'
              ? 'bg-green-500 text-white'
              : toast.type === 'error'
                ? 'bg-red-500 text-white'
                : toast.type === 'warning'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-blue-500 text-white'
          }`}
        >
          <span>{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-4 font-bold hover:opacity-80"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
