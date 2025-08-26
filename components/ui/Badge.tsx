import * as React from "react"

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline"
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className = "", variant = "default", ...props }, ref) => {
    const variantClasses = {
      default: "bg-blue-600 text-white",
      secondary: "bg-gray-600 text-white",
      destructive: "bg-red-600 text-white",
      outline: "border border-gray-300 text-gray-700 bg-transparent"
    };

    const combinedClassName = `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${variantClasses[variant]} ${className}`;

    return (
      <div
        ref={ref}
        className={combinedClassName}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"

export { Badge }