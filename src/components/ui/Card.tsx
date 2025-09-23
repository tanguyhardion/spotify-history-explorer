import type { BaseComponentProps } from "../../types";

interface CardProps extends BaseComponentProps {
  children: React.ReactNode;
}

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      className={`
        p-3 rounded-md border border-gray-700 bg-gray-800
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

interface StatCardProps extends BaseComponentProps {
  label: string;
  value: string;
  tooltip?: string;
}

export function StatCard({ label, value, tooltip, className = "", ...props }: StatCardProps) {
  return (
    <Card className={className} {...props}>
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div
        className="text-lg font-semibold text-gray-100 truncate"
        title={tooltip || value}
      >
        {value}
      </div>
    </Card>
  );
}