const variantStyles = {
  info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-200',
  error: 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-800 dark:text-red-200',
  success: 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200',
};

const AlertBanner = ({
  message,
  variant = 'info',
  actionLabel,
  onAction,
  onDismiss,
  live = 'polite',
}) => {
  if (!message) return null;

  return (
    <div
      className={`mb-6 rounded-md border px-4 py-3 ${variantStyles[variant] || variantStyles.info}`}
      role="alert"
      aria-live={live}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium">{message}</p>
        <div className="flex items-center gap-2">
          {actionLabel && onAction && (
            <button
              type="button"
              onClick={onAction}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
            >
              {actionLabel}
            </button>
          )}
          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="text-xs font-semibold underline"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertBanner;
