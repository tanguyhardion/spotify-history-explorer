import clsx from 'clsx';

interface CardProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export const Card = ({ title, subtitle, actions, className, children }: CardProps) => (
  <section className={clsx('rounded-2xl bg-zinc-900/60 border border-zinc-800/80 p-6 shadow-lg shadow-black/40 backdrop-blur', className)}>
    {(title || subtitle || actions) && (
      <header className="mb-5 flex items-start justify-between gap-4">
        <div>
          {title && <h2 className="text-lg font-semibold text-white">{title}</h2>}
          {subtitle && <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2 text-sm text-zinc-400">{actions}</div>}
      </header>
    )}
    <div className="text-zinc-200">{children}</div>
  </section>
);
