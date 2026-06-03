import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { cn } from './utils';

export default function ResourceLink({
  children,
  className,
  description,
  icon: Icon,
  meta,
  title,
  to,
  ...props
}) {
  return (
    <Link
      to={to}
      className={cn(
        'group flex items-center justify-between gap-4 rounded-xl border border-line-soft bg-surface-raised p-5 text-left shadow-minimal transition-all duration-200',
        'hover:-translate-y-0.5 hover:border-text-dim hover:bg-surface-soft hover:shadow-minimal-lg',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-body',
        className,
      )}
      {...props}
    >
      <span className="flex min-w-0 items-center gap-4">
        {Icon && (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
        )}
        <span className="min-w-0">
          <span className="block truncate text-sm font-bold tracking-tight text-text-primary transition-colors group-hover:text-accent">
            {title}
          </span>
          {description && <span className="mt-1 block text-sm leading-5 text-text-muted">{description}</span>}
          {meta && (
            <span className="mt-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-text-dim">
              {meta}
            </span>
          )}
          {children}
        </span>
      </span>
      <ArrowRightIcon className="h-4 w-4 shrink-0 text-text-dim transition-all group-hover:translate-x-1 group-hover:text-accent" />
    </Link>
  );
}
