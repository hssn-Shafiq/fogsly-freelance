import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Star, 
  StarOff,
  Save,
  X,
  Palette,
  Check
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import StableThemeForm from './StableThemeForm';
import { 
  getAllThemes, 
  createTheme, 
  updateTheme, 
  deleteTheme, 
  toggleThemeStatus,
  setDefaultTheme,
  applyThemeToDocument 
} from '../../firebase/services/themeService';
import { CustomTheme, ThemeCreationData, ThemeColors } from '../../firebase/types/admin';
import { toast } from 'react-toastify';

interface ThemeManagementProps {
  currentAdminId: string;
}

const defaultColors: ThemeColors = {
  bgPrimary: '#FFFFFF',
  bgSecondary: '#F1F5F9',
  bgTertiary: '#E2E8F0',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  primary: '#3B82F6',
  accent: '#06B6D4',
  border: '#E2E8F0',
  card: '#FFFFFF',
  successBg: '#F0FDF4',
  successFg: '#15803D',
  successIcon: '#16A34A'
};

export default function ThemeManagement({ currentAdminId }: ThemeManagementProps) {
  const [themes, setThemes] = useState<CustomTheme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTheme, setEditingTheme] = useState<CustomTheme | null>(null);
  const [previewTheme, setPreviewTheme] = useState<CustomTheme | null>(null);
  
  const [formData, setFormData] = useState<ThemeCreationData>({
    name: '',
    displayName: '',
    colors: { ...defaultColors }
  });

  useEffect(() => {
    loadThemes();
  }, []);

  const loadThemes = async () => {
    try {
      setIsLoading(true);
      const fetchedThemes = await getAllThemes();
      setThemes(fetchedThemes);
    } catch (error) {
      console.error('Error loading themes:', error);
      toast.error('Failed to load themes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTheme = async (data: ThemeCreationData) => {
    try {
      if (!data.name.trim() || !data.displayName.trim()) {
        toast.error('Please fill in all required fields');
        return;
      }

      await createTheme(data, currentAdminId);
      toast.success('Theme created successfully!');
      
      setShowCreateForm(false);
      setFormData({ name: '', displayName: '', colors: { ...defaultColors } });
      loadThemes();
    } catch (error: any) {
      console.error('Error creating theme:', error);
      toast.error(error.message || 'Failed to create theme');
    }
  };

  const handleUpdateTheme = async (data: ThemeCreationData) => {
    if (!editingTheme) return;

    try {
      await updateTheme(editingTheme.id, data);
      toast.success('Theme updated successfully!');
      
      setEditingTheme(null);
      setFormData({ name: '', displayName: '', colors: { ...defaultColors } });
      loadThemes();
    } catch (error: any) {
      console.error('Error updating theme:', error);
      toast.error(error.message || 'Failed to update theme');
    }
  };

  const handleDeleteTheme = async (themeId: string) => {
    if (!confirm('Are you sure you want to delete this theme?')) return;

    try {
      await deleteTheme(themeId);
      toast.success('Theme deleted successfully!');
      loadThemes();
    } catch (error: any) {
      console.error('Error deleting theme:', error);
      toast.error(error.message || 'Failed to delete theme');
    }
  };

  const handleToggleStatus = async (themeId: string) => {
    try {
      await toggleThemeStatus(themeId);
      toast.success('Theme status updated!');
      loadThemes();
    } catch (error: any) {
      console.error('Error toggling theme status:', error);
      toast.error(error.message || 'Failed to update theme status');
    }
  };

  const handleSetDefault = async (themeId: string) => {
    try {
      await setDefaultTheme(themeId);
      toast.success('Default theme updated!');
      loadThemes();
    } catch (error: any) {
      console.error('Error setting default theme:', error);
      toast.error(error.message || 'Failed to set default theme');
    }
  };

  const handlePreviewTheme = (theme: CustomTheme) => {
    setPreviewTheme(theme);
    applyThemeToDocument(theme);
    toast.info(`Previewing "${theme.displayName}" theme`);
  };

  const stopPreview = () => {
    setPreviewTheme(null);
    // Reset to default or current theme
    const defaultTheme = themes.find(t => t.isDefault);
    if (defaultTheme) {
      applyThemeToDocument(defaultTheme);
    }
    toast.info('Preview stopped');
  };

  const startEdit = (theme: CustomTheme) => {
    setEditingTheme(theme);
    setFormData({
      name: theme.name,
      displayName: theme.displayName,
      colors: { ...theme.colors }
    });
    setShowCreateForm(false);
  };

  const cancelEdit = () => {
    setEditingTheme(null);
    setShowCreateForm(false);
    setFormData({ name: '', displayName: '', colors: { ...defaultColors } });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[--color-primary]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[--color-text-primary]">Theme Management</h1>
          <p className="text-[--color-text-secondary]">Create and manage custom themes for FOGSLY</p>
        </div>
        <div className="flex gap-2">
          {previewTheme && (
            <Button variant="outline" onClick={stopPreview}>
              <X className="w-4 h-4 mr-2" />
              Stop Preview
            </Button>
          )}
          <Button onClick={() => setShowCreateForm(true)} disabled={showCreateForm || editingTheme}>
            <Plus className="w-4 h-4 mr-2" />
            Create Theme
          </Button>
        </div>
      </div>

      {/* Preview Alert */}
      {previewTheme && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-800 dark:text-blue-200">
                Previewing: {previewTheme.displayName}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={stopPreview}>
              Stop Preview
            </Button>
          </div>
        </div>
      )}

      {/* Create/Edit Form */}
      {(showCreateForm || editingTheme) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              {editingTheme ? 'Edit Theme' : 'Create New Theme'}
            </CardTitle>
            <CardDescription>
              {editingTheme ? 'Modify the existing theme settings' : 'Design a new custom theme for FOGSLY'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StableThemeForm
              initialData={formData}
              onSubmit={editingTheme ? handleUpdateTheme : handleCreateTheme}
              onCancel={cancelEdit}
              isEditing={!!editingTheme}
              submitLabel={editingTheme ? 'Update Theme' : 'Create Theme'}
            />
          </CardContent>
        </Card>
      )}

      {/* Themes List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {themes.map((theme) => (
          <motion.div
            key={theme.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group"
          >
            <Card className={`transition-all ${previewTheme?.id === theme.id ? 'ring-2 ring-blue-500' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{theme.displayName}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <span>{theme.name}</span>
                      {theme.isDefault && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          <Star className="w-3 h-3" fill="currentColor" />
                          Default
                        </span>
                      )}
                      {!theme.isActive && (
                        <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          Inactive
                        </span>
                      )}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Color Preview */}
                <div className="grid grid-cols-6 gap-1">
                  {Object.entries(theme.colors).slice(0, 6).map(([key, color]) => (
                    <div
                      key={key}
                      className="w-8 h-8 rounded border border-gray-200"
                      style={{ backgroundColor: color }}
                      title={`${key}: ${color}`}
                    />
                  ))}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePreviewTheme(theme)}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Preview
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => startEdit(theme)}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleStatus(theme.id)}
                  >
                    {theme.isActive ? (
                      <>
                        <EyeOff className="w-3 h-3 mr-1" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <Eye className="w-3 h-3 mr-1" />
                        Activate
                      </>
                    )}
                  </Button>
                  
                  {!theme.isDefault && theme.isActive && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSetDefault(theme.id)}
                    >
                      <Star className="w-3 h-3 mr-1" />
                      Set Default
                    </Button>
                  )}
                  
                  {!theme.isDefault && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteTheme(theme.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {themes.length === 0 && (
        <div className="text-center py-12">
          <Palette className="w-12 h-12 text-[--color-text-secondary] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[--color-text-primary] mb-2">No themes found</h3>
          <p className="text-[--color-text-secondary] mb-4">Create your first custom theme to get started.</p>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create First Theme
          </Button>
        </div>
      )}
    </div>
  );
}
