import React, { useState, useCallback, useMemo } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { ThemeCreationData, ThemeColors } from '../../firebase/types/admin';

interface StableThemeFormProps {
  initialData: ThemeCreationData;
  onSubmit: (data: ThemeCreationData) => void;
  onCancel: () => void;
  isEditing: boolean;
  submitLabel: string;
}

// Completely isolated ColorInput component with stable references
const StableColorInput = React.memo(({ 
  label, 
  value, 
  onChange,
  colorKey 
}: { 
  label: string; 
  value: string; 
  onChange: (key: string, value: string) => void;
  colorKey: string;
}) => {
  const handleColorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(colorKey, e.target.value);
  }, [onChange, colorKey]);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(colorKey, e.target.value);
  }, [onChange, colorKey]);

  return (
    <div className="space-y-1">
      <Label className="text-xs font-medium">{label}</Label>
      <div className="flex gap-2 items-center">
        <input
          type="color"
          value={value}
          onChange={handleColorChange}
          className="w-10 h-8 rounded border border-[--color-border] cursor-pointer"
        />
        <Input
          value={value}
          onChange={handleTextChange}
          className="flex-1 text-xs"
          placeholder="#000000"
        />
      </div>
    </div>
  );
});

StableColorInput.displayName = 'StableColorInput';

export default function StableThemeForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isEditing, 
  submitLabel 
}: StableThemeFormProps) {
  const [formData, setFormData] = useState<ThemeCreationData>(initialData);

  // Stable handlers that won't change on re-renders
  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, name: e.target.value }));
  }, []);

  const handleDisplayNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, displayName: e.target.value }));
  }, []);

  const handleColorChange = useCallback((colorKey: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      colors: { ...prev.colors, [colorKey]: value }
    }));
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  }, [formData, onSubmit]);

  // Color fields configuration - this will never change
  const colorFields = useMemo(() => [
    { key: 'bgPrimary', label: 'Primary Background' },
    { key: 'bgSecondary', label: 'Secondary Background' },
    { key: 'bgTertiary', label: 'Tertiary Background' },
    { key: 'textPrimary', label: 'Primary Text' },
    { key: 'textSecondary', label: 'Secondary Text' },
    { key: 'primary', label: 'Primary Color' },
    { key: 'accent', label: 'Accent Color' },
    { key: 'border', label: 'Border Color' },
    { key: 'card', label: 'Card Background' },
  ], []);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Theme Name (ID)</Label>
          <Input
            value={formData.name}
            onChange={handleNameChange}
            placeholder="e.g., midnight-blue"
            disabled={isEditing}
          />
        </div>
        <div className="space-y-2">
          <Label>Display Name</Label>
          <Input
            value={formData.displayName}
            onChange={handleDisplayNameChange}
            placeholder="e.g., Midnight Blue"
          />
        </div>
      </div>

      {/* Color Settings */}
      <div>
        <h3 className="font-semibold mb-4">Color Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {colorFields.map(({ key, label }) => (
            <StableColorInput
              key={key}
              colorKey={key}
              label={label}
              value={formData.colors[key as keyof ThemeColors]}
              onChange={handleColorChange}
            />
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-[--color-border]">
        <Button type="submit" className="bg-[--color-primary] hover:bg-blue-600">
          {submitLabel}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
