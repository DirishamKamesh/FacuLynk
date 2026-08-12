import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  headerBorder?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  action,
  className = '',
  bodyClassName = 'p-5',
  headerBorder = true,
}) => {
  return (
    <div className={`bg-white rounded-xl border border-[#E2E8F0] shadow-2xs overflow-hidden ${className}`}>
      {(title || action) && (
        <div
          className={`px-5 py-4 flex items-center justify-between ${
            headerBorder ? 'border-b border-[#E2E8F0] bg-slate-50/60' : ''
          }`}
        >
          <div>
            {typeof title === 'string' ? (
              <h3 className="text-sm font-bold text-[#1E293B] tracking-tight">{title}</h3>
            ) : (
              title
            )}
            {subtitle && <p className="text-xs text-[#64748B] mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </div>
  );
};
