import { cn } from './utils';

export default function ProgressBar({
  className,
  label,
  showValue = true,
  value = 0,
  ...props
}) {
  const safeValue = Math.min(100, Math.max(0, Number(value) || 0));

  return (
    <div className={cn('w-full', className)} {...props}>
      {(label || showValue) && (
        <div className="mb-2 flex items-center justify-between gap-3 text-xs font-semibold text-text-muted">
          {label && <span>{label}</span>}
          {showValue && <span className="tabular-nums text-text-dim">{safeValue}%</span>}
        </div>
      )}
      <div className="h-2 overflow-hidden rounded-full bg-surface-soft ring-1 ring-inset ring-line-soft">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-700 ease-out"
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}
