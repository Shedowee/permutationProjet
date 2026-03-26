import { } from "react";
import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from "@heroicons/react/24/outline";

const typeStyles = {
  success: {
    container: "bg-white border-l-4 border-primary-500 text-surface-800 shadow-[0_8px_30px_rgba(0,0,0,0.08)]",
    iconContainer: "bg-primary-50 text-primary-600",
    Icon: CheckCircleIcon,
  },
  error: {
    container: "bg-white border-l-4 border-red-500 text-surface-800 shadow-[0_8px_30px_rgba(0,0,0,0.08)]",
    iconContainer: "bg-red-50 text-red-600",
    Icon: ExclamationTriangleIcon,
  },
  info: {
    container: "bg-white border-l-4 border-secondary-500 text-surface-800 shadow-[0_8px_30px_rgba(0,0,0,0.08)]",
    iconContainer: "bg-secondary-50 text-secondary-600",
    Icon: InformationCircleIcon,
  },
};

const Toast = ({ toasts = [], onDismiss }) => {
  if (!toasts.length) return null;
  return (
    <div className="fixed top-24 right-6 z-[100] space-y-4 max-w-md w-full sm:w-auto">
      {toasts.map((t) => {
        const { container, iconContainer, Icon } = typeStyles[t.type] || typeStyles.info;
        return (
          <div
            key={t.id}
            className={`flex items-center p-4 rounded-xl animate-slideUp overflow-hidden ${container}`}
          >
            <div className={`p-2 rounded-lg mr-4 shrink-0 ${iconContainer}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0 mr-4">
              <p className="text-sm font-bold tracking-tight line-clamp-2">{t.message}</p>
            </div>
            <button
              onClick={() => onDismiss(t.id)}
              className="p-1 rounded-lg text-surface-400 hover:bg-surface-50 hover:text-surface-600 transition-all shrink-0"
              aria-label="Dismiss notification"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Toast;
