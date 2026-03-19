'use client';
import { Toaster, toast as hotToast } from 'react-hot-toast';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

// Custom toast renderer
const CustomToast = ({ t, type, title, message }) => {
  const styles = {
    success: {
      bg: 'bg-white dark:bg-gray-900',
      border: 'border-green-200 dark:border-green-800',
      icon: <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />,
      bar: 'bg-green-500',
      title: 'text-green-700 dark:text-green-400'
    },
    error: {
      bg: 'bg-white dark:bg-gray-900',
      border: 'border-red-200 dark:border-red-800',
      icon: <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />,
      bar: 'bg-red-500',
      title: 'text-red-700 dark:text-red-400'
    },
    warning: {
      bg: 'bg-white dark:bg-gray-900',
      border: 'border-yellow-200 dark:border-yellow-800',
      icon: <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />,
      bar: 'bg-yellow-500',
      title: 'text-yellow-700 dark:text-yellow-400'
    },
    info: {
      bg: 'bg-white dark:bg-gray-900',
      border: 'border-brand-200 dark:border-brand-800',
      icon: <Info className="w-5 h-5 text-brand-500 flex-shrink-0" />,
      bar: 'bg-gradient-to-r from-brand-500 to-accent-500',
      title: 'text-brand-700 dark:text-brand-400'
    }
  };

  const s = styles[type] || styles.info;

  return (
    <div
      className={`
        ${t.visible ? 'animate-fade-down' : 'animate-fade-up opacity-0'}
        flex items-start gap-3 p-4 rounded-2xl shadow-elevated border
        ${s.bg} ${s.border}
        min-w-[320px] max-w-[420px] w-full
        relative overflow-hidden
      `}
    >
      {/* Colored top bar */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${s.bar}`} />

      {/* Icon */}
      <div className="mt-0.5">{s.icon}</div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <p className={`font-semibold text-sm ${s.title}`}>{title}</p>
        )}
        {message && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5 leading-relaxed">
            {message}
          </p>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={() => hotToast.dismiss(t.id)}
        className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0 mt-0.5"
      >
        <X className="w-3.5 h-3.5 text-gray-400" />
      </button>
    </div>
  );
};

// Global Toaster component — add this once in layout
export const ToastProvider = () => (
  <Toaster
    position="top-center"
    containerStyle={{ top: 20 }}
    toastOptions={{
      duration: Infinity, // We control duration per type
      style: {
        background: 'transparent',
        boxShadow: 'none',
        padding: 0,
        maxWidth: '420px'
      }
    }}
  />
);

// Unified toast API — use these everywhere in the app
export const toast = {
  success: (message, title = 'Success') => {
    hotToast.custom(
      (t) => <CustomToast t={t} type="success" title={title} message={message} />,
      { duration: 3000, id: message } // Auto dismiss after 3s
    );
  },

  error: (message, title = 'Error') => {
    hotToast.custom(
      (t) => <CustomToast t={t} type="error" title={title} message={message} />,
      { duration: Infinity, id: message } // Stay until closed
    );
  },

  warning: (message, title = 'Warning') => {
    hotToast.custom(
      (t) => <CustomToast t={t} type="warning" title={title} message={message} />,
      { duration: Infinity, id: message } // Stay until closed
    );
  },

  info: (message, title = 'Info') => {
    hotToast.custom(
      (t) => <CustomToast t={t} type="info" title={title} message={message} />,
      { duration: 3000, id: message } // Auto dismiss after 3s
    );
  },

  dismiss: (id) => hotToast.dismiss(id),
  dismissAll: () => hotToast.dismiss()
};

export default toast;
