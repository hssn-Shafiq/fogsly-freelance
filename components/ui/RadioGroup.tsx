import React from 'react';

interface RadioGroupContextProps {
  selectedValue: string | number;
  onValueChange: (value: string) => void;
}

const RadioGroupContext = React.createContext<RadioGroupContextProps | null>(null);

const RadioGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value: string | number;
    onValueChange: (value: string) => void;
  }
>(({ children, value, onValueChange, ...props }, ref) => {
  return (
    <RadioGroupContext.Provider value={{ selectedValue: value, onValueChange }}>
      <div ref={ref} role="radiogroup" {...props}>
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
});
RadioGroup.displayName = "RadioGroup";

const RadioGroupItem = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ value, ...props }, ref) => {
  const context = React.useContext(RadioGroupContext);
  if (!context) {
    throw new Error("RadioGroupItem must be used within a RadioGroup");
  }
  const isChecked = context.selectedValue == value;

  return (
    <input
      ref={ref}
      type="radio"
      value={value}
      checked={isChecked}
      onChange={(e) => context.onValueChange(e.target.value)}
      className="h-4 w-4 shrink-0 border-[--color-primary] text-[--color-primary] ring-offset-[--color-bg-primary] focus:ring-[--color-primary] focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      {...props}
    />
  );
});
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
