import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', children, ...props }, ref) => {
    const getVariantClasses = () => {
      switch (variant) {
        case 'outline':
          return 'border border-[--color-border] bg-transparent hover:bg-[--color-bg-secondary] text-[--color-text-primary]';
        case 'ghost':
          return 'hover:bg-[--color-bg-secondary] text-[--color-text-primary]';
        case 'link':
          return 'text-[--color-primary] underline-offset-4 hover:underline';
        default:
          return 'bg-[--color-primary] text-white hover:bg-[--color-primary]/90';
      }
    };

    const getSizeClasses = () => {
      switch (size) {
        case 'sm':
          return 'h-9 rounded-md px-3';
        case 'lg':
          return 'h-11 rounded-md px-8';
        case 'icon':
            return 'h-10 w-10';
        default:
          return 'h-10 px-4 py-2';
      }
    };
    
    const baseClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-[--color-bg-primary] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

    return (
      <button
        className={`${baseClasses} ${getVariantClasses()} ${getSizeClasses()} ${className}`}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };