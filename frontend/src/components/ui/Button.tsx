interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled,
  className = '',
  type = 'button',
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-700 cursor-pointer transition-all duration-200 border-none outline-none';

  const variants = {
    primary: 'text-white rounded-full',
    ghost: 'text-[var(--sub)] rounded-lg hover:bg-white/5 hover:text-white',
    outline: 'border border-[var(--pinkborder)] text-[var(--hotpink)] rounded-full hover:bg-[var(--pinkborder)]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-5 py-2 text-sm gap-2',
    lg: 'px-6 py-2.5 text-base gap-2',
  };

  const primaryStyle = variant === 'primary'
    ? { background: 'var(--pink)', boxShadow: '0 4px 20px rgba(255,20,147,0.35)' }
    : {};

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      style={primaryStyle}
    >
      {children}
    </button>
  );
}