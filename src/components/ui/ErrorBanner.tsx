import clsx from 'clsx';
import { Button } from './Button';

interface ErrorBannerProps {
  title: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorBanner = ({ title, description, onRetry, className }: ErrorBannerProps) => (
  <div className={clsx('rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-left text-sm text-red-200 shadow-lg shadow-red-500/10', className)}>
    <p className="font-semibold text-red-100">{title}</p>
    {description && <p className="mt-1 text-red-200/80">{description}</p>}
    {onRetry && (
      <Button className="mt-3" size="sm" variant="secondary" onClick={onRetry}>
        Try again
      </Button>
    )}
  </div>
);
