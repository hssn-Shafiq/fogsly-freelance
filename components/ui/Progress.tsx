import React from 'react';

const Progress = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value?: number | null }
>(({ className, value, ...props }, ref) => (
  <div
    ref={ref}
    className={`relative h-2 w-full overflow-hidden rounded-full bg-[--color-bg-tertiary] ${className}`}
    {...props}
  >
    <div
      className="h-full w-full flex-1 bg-[--color-primary] transition-all duration-500 ease-linear"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </div>
));
Progress.displayName = "Progress";

export { Progress };
