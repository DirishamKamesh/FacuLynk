import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'teal' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'crimson';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs font-medium gap-1.5',
    md: 'px-4 py-2 text-sm font-medium gap-2',
    lg: 'px-5 py-2.5 text-base font-medium gap-2.5',
  };

  const variantClasses = {
    primary: 'bg-[#172554] text-white hover:bg-[#1E3A8A] focus:ring-2 focus:ring-[#172554]/20 shadow-2xs border border-[#172554]',
    teal: 'bg-[#0F766E] text-white hover:bg-[#0D655E] focus:ring-2 focus:ring-[#0F766E]/20 shadow-2xs border border-[#0F766E]',
    secondary: 'bg-slate-100 text-[#1E293B] hover:bg-slate-200 border border-slate-200 focus:ring-2 focus:ring-slate-400/20',
    outline: 'bg-white text-[#1E293B] hover:bg-slate-50 border border-[#E2E8F0] focus:ring-2 focus:ring-slate-400/20 shadow-2xs',
    danger: 'bg-[#B91C1C] text-white hover:bg-[#991B1B] focus:ring-2 focus:ring-red-400/20 border border-[#B91C1C]',
    ghost: 'bg-transparent text-[#64748B] hover:bg-slate-100 hover:text-[#1E293B]',
    crimson: 'bg-[#B91C1C] text-white hover:bg-[#991B1B] focus:ring-2 focus:ring-red-400/20 border border-[#B91C1C]',
  };

  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
