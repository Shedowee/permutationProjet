import { } from "react";
import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from "@heroicons/react/24/outline";

const typeStyles = {
  success: {
    container: "bg-green-500/20 border border-green-500/30 text-green-300",
    Icon: CheckCircleIcon,
  },
  error: {
    container: "bg-red-500/20 border border-red-500/30 text-red-300",
    Icon: ExclamationTriangleIcon,
  },
  info: {
    container: "bg-blue-500/20 border border-blue-500/30 text-blue-300",
    Icon: InformationCircleIcon,
  },
};

const Toast = ({ toasts = [], onDismiss }) => {
  if (!toasts.length) return null;
  return (
    <div className="fixed top-20 right-4 z-50 space-y-3">
      {toasts.map((t) => {
        const { container, Icon } = typeStyles[t.type] || typeStyles.info;
        return (
          <div
            key={t.id}
            className={`min-w-[280px] max-w-sm p-3 rounded-xl shadow-lg ${container} flex items-start justify-between`}
          >
            <div className="flex items-start">
              <Icon className="w-5 h-5 mr-2 flex-shrink-0" />
              <span className="text-sm">{t.message}</span>
            </div>
            <button
              onClick={() => onDismiss(t.id)}
              className="text-white/70 hover:text-white transition-colors"
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Toast;
