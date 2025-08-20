import React, { useState, createContext, useContext, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface SelectContextProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedValue: string;
  setSelectedValue: React.Dispatch<React.SetStateAction<string>>;
  selectedLabel: React.ReactNode;
  setSelectedLabel: React.Dispatch<React.SetStateAction<React.ReactNode>>;
  onValueChange?: (value: string) => void;
}
const SelectContext = createContext<SelectContextProps | null>(null);

const useSelect = () => {
  const context = useContext(SelectContext);
  if (!context) throw new Error("useSelect must be used within a Select provider");
  return context;
};

const Select = ({ children, onValueChange, value: controlledValue }: { children: React.ReactNode; onValueChange?: (value: string) => void; value?: string; }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(controlledValue || "");
  const [selectedLabel, setSelectedLabel] = useState<React.ReactNode>(null);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (controlledValue !== undefined) {
      setSelectedValue(controlledValue);
      if (!controlledValue) {
        setSelectedLabel(null);
        return;
      }
      
      let initialLabel: React.ReactNode = null;
      // Find the label for the controlled value by looking through children
      React.Children.forEach(children, (childNode: React.ReactNode) => {
        if (React.isValidElement<{ children?: React.ReactNode }>(childNode) && childNode.type === SelectContent) {
          React.Children.forEach(childNode.props.children, (itemNode: React.ReactNode) => {
            if (React.isValidElement<{ value: string; children: React.ReactNode }>(itemNode) && itemNode.type === SelectItem && itemNode.props.value === controlledValue) {
              initialLabel = itemNode.props.children;
            }
          });
        }
      });
      setSelectedLabel(initialLabel);
    }
  }, [controlledValue, children]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const contextValue = { isOpen, setIsOpen, selectedValue, setSelectedValue, selectedLabel, setSelectedLabel, onValueChange };

  return (
    <SelectContext.Provider value={contextValue}>
      <div ref={selectRef} className="relative w-full">{children}</div>
    </SelectContext.Provider>
  );
};

const SelectTrigger = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const { setIsOpen, isOpen } = useSelect();
  return (
    <button
      onClick={() => setIsOpen(prev => !prev)}
      className={`flex h-10 w-full items-center justify-between rounded-md border border-[--color-border] bg-[--color-bg-secondary] px-3 py-2 text-sm ring-offset-[--color-bg-primary] placeholder:text-[--color-text-secondary] focus:outline-none focus:ring-2 focus:ring-[--color-primary] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
      <ChevronDown className={`h-4 w-4 opacity-50 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
    </button>
  );
};

const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  const { selectedLabel } = useSelect();
  
  return (
     <span className={`${selectedLabel ? 'text-[--color-text-primary]' : 'text-[--color-text-secondary]'} mr-2 truncate`}>
      {selectedLabel || placeholder}
    </span>
  );
};


const SelectContent = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const { isOpen } = useSelect();
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          {...{
            initial: { opacity: 0, y: -5 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -5 },
            transition: { duration: 0.1 },
          }}
          className={`absolute z-50 mt-1 w-full rounded-md border border-[--color-border] bg-[--color-card] text-[--color-text-primary] shadow-md p-1 ${className}`}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const SelectItem = ({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) => {
  const { setSelectedValue, setIsOpen, onValueChange, setSelectedLabel } = useSelect();
  return (
    <div
      onClick={() => {
        setSelectedValue(value);
        setSelectedLabel(children);
        if (onValueChange) onValueChange(value);
        setIsOpen(false);
      }}
      className={`relative flex w-full cursor-pointer select-none items-center rounded-sm p-2 text-sm outline-none hover:bg-[--color-bg-secondary] focus:bg-[--color-bg-secondary] data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${className}`}
    >
      {children}
    </div>
  );
};

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };