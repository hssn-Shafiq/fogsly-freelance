import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  Settings, 
  History, 
  Save, 
  AlertCircle, 
  TrendingUp,
  Wallet,
  Shield,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Label } from '../../ui/Label';
import { Textarea } from '../../ui/Textarea';
import { 
  FogCoinSettings, 
  FogCoinSettingsFormData, 
  FogCoinSettingsHistory,
  FOG_COIN_VALIDATION 
} from '../../../firebase/types/fogCoinSettings';
import { 
  getFogCoinSettings, 
  updateFogCoinSettings, 
  getFogCoinSettingsHistory,
  validateFogCoinSettings 
} from '../../../firebase/services/fogCoinSettingsService';
import { clearFogCoinSettingsCache, formatFog, formatUsd, fogToUsdSync } from '../../../utils/fogCoinUtils';
import { toast } from 'react-hot-toast';

interface FogCoinManagementProps {
  currentAdminId: string;
}

const FogCoinManagement: React.FC<FogCoinManagementProps> = ({ currentAdminId }) => {
  const [currentSettings, setCurrentSettings] = useState<FogCoinSettings | null>(null);
  const [history, setHistory] = useState<FogCoinSettingsHistory[]>([]);
  const [formData, setFormData] = useState<FogCoinSettingsFormData>({
    fogToUsdRate: 0.10,
    minimumWithdrawAmount: 50,
    maximumDailyEarnings: 100,
    isWithdrawalsEnabled: true,
    notes: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [changeReason, setChangeReason] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('Loading FOG coin settings and history...');
      
      const [settings, settingsHistory] = await Promise.all([
        getFogCoinSettings(),
        getFogCoinSettingsHistory(10)
      ]);
      
      console.log('Settings loaded:', settings);
      console.log('History loaded:', settingsHistory);
      
      setCurrentSettings(settings);
      setHistory(settingsHistory);
      
      setFormData({
        fogToUsdRate: settings.fogToUsdRate,
        minimumWithdrawAmount: settings.minimumWithdrawAmount,
        maximumDailyEarnings: settings.maximumDailyEarnings,
        isWithdrawalsEnabled: settings.isWithdrawalsEnabled,
        notes: settings.notes || ''
      });
    } catch (error) {
      console.error('Error loading FOG coin settings:', error);
      toast.error('Failed to load FOG coin settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FogCoinSettingsFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSave = async () => {
    // Validate change reason
    if (!changeReason.trim()) {
      toast.error('Please provide a reason for this change');
      return;
    }

    // Validate form data
    const validationErrors = validateFogCoinSettings(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please fix the validation errors');
      return;
    }

    try {
      setSaving(true);
      console.log('Updating FOG coin settings...', formData, changeReason);
      
      await updateFogCoinSettings(formData, currentAdminId, changeReason);
      
      // Clear cache and reload data
      clearFogCoinSettingsCache();
      await loadData();
      
      // Reset form
      setChangeReason('');
      setErrors({});
      
      toast.success('FOG coin settings updated successfully!');
    } catch (error) {
      console.error('Error updating FOG coin settings:', error);
      toast.error(`Failed to update FOG coin settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-[--color-bg-tertiary] rounded mb-4"></div>
              <div className="h-8 bg-[--color-bg-tertiary] rounded mb-2"></div>
              <div className="h-4 bg-[--color-bg-tertiary] rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[--color-text-primary] flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-yellow-500" />
            FOG Coin Management
          </h1>
          <p className="text-[--color-text-secondary] mt-2">
            Manage FOG coin conversion rates and withdrawal settings
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-2"
        >
          <History className="w-4 h-4" />
          {showHistory ? 'Hide History' : 'View History'}
        </Button>
      </div>

      {/* Current Settings Overview */}
      {currentSettings && (
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium">Current Rate</span>
              </div>
              <div className="text-2xl font-bold">
                {formatUsd(currentSettings.fogToUsdRate)}
              </div>
              <p className="text-xs text-[--color-text-secondary]">per FOG coin</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium">Min. Withdrawal</span>
              </div>
              <div className="text-2xl font-bold">
                {formatFog(currentSettings.minimumWithdrawAmount)}
              </div>
              <p className="text-xs text-[--color-text-secondary]">
                ≈ {formatUsd(fogToUsdSync(currentSettings.minimumWithdrawAmount, currentSettings.fogToUsdRate))}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-purple-500" />
                <span className="text-sm font-medium">Daily Limit</span>
              </div>
              <div className="text-2xl font-bold">
                {formatFog(currentSettings.maximumDailyEarnings)}
              </div>
              <p className="text-xs text-[--color-text-secondary]">
                ≈ {formatUsd(fogToUsdSync(currentSettings.maximumDailyEarnings, currentSettings.fogToUsdRate))}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="w-5 h-5 text-orange-500" />
                <span className="text-sm font-medium">Withdrawals</span>
              </div>
              <div className="text-2xl font-bold">
                {currentSettings.isWithdrawalsEnabled ? 'Enabled' : 'Disabled'}
              </div>
              <p className="text-xs text-[--color-text-secondary]">
                Last updated {formatDate(currentSettings.lastUpdatedAt)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Settings Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Update FOG Coin Settings
          </CardTitle>
          <CardDescription>
            Changes will take effect immediately. All values will be logged for audit purposes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Conversion Rate */}
            <div className="space-y-2">
              <Label htmlFor="fogToUsdRate">FOG to USD Rate</Label>
              <Input
                id="fogToUsdRate"
                type="number"
                step="0.01"
                min={FOG_COIN_VALIDATION.MIN_RATE}
                max={FOG_COIN_VALIDATION.MAX_RATE}
                value={formData.fogToUsdRate}
                onChange={(e) => handleInputChange('fogToUsdRate', parseFloat(e.target.value) || 0)}
                placeholder="0.10"
              />
              {errors.fogToUsdRate && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.fogToUsdRate}
                </p>
              )}
              <p className="text-xs text-[--color-text-secondary]">
                Current: 1 FOG = {formatUsd(formData.fogToUsdRate)}
              </p>
            </div>

            {/* Minimum Withdrawal */}
            <div className="space-y-2">
              <Label htmlFor="minimumWithdrawAmount">Minimum Withdrawal (FOG)</Label>
              <Input
                id="minimumWithdrawAmount"
                type="number"
                min={FOG_COIN_VALIDATION.MIN_WITHDRAW_AMOUNT}
                max={FOG_COIN_VALIDATION.MAX_WITHDRAW_AMOUNT}
                value={formData.minimumWithdrawAmount}
                onChange={(e) => handleInputChange('minimumWithdrawAmount', parseInt(e.target.value) || 0)}
                placeholder="50"
              />
              {errors.minimumWithdrawAmount && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.minimumWithdrawAmount}
                </p>
              )}
              <p className="text-xs text-[--color-text-secondary]">
                Equivalent: ≈ {formatUsd(fogToUsdSync(formData.minimumWithdrawAmount, formData.fogToUsdRate))}
              </p>
            </div>

            {/* Maximum Daily Earnings */}
            <div className="space-y-2">
              <Label htmlFor="maximumDailyEarnings">Daily Earnings Limit (FOG)</Label>
              <Input
                id="maximumDailyEarnings"
                type="number"
                min={FOG_COIN_VALIDATION.MIN_DAILY_EARNINGS}
                max={FOG_COIN_VALIDATION.MAX_DAILY_EARNINGS}
                value={formData.maximumDailyEarnings}
                onChange={(e) => handleInputChange('maximumDailyEarnings', parseInt(e.target.value) || 0)}
                placeholder="100"
              />
              {errors.maximumDailyEarnings && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.maximumDailyEarnings}
                </p>
              )}
              <p className="text-xs text-[--color-text-secondary]">
                Equivalent: ≈ {formatUsd(fogToUsdSync(formData.maximumDailyEarnings, formData.fogToUsdRate))}
              </p>
            </div>

            {/* Withdrawals Toggle */}
            <div className="space-y-2">
              <Label>Withdrawal Status</Label>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant={formData.isWithdrawalsEnabled ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleInputChange('isWithdrawalsEnabled', true)}
                >
                  Enabled
                </Button>
                <Button
                  type="button"
                  variant={!formData.isWithdrawalsEnabled ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleInputChange('isWithdrawalsEnabled', false)}
                >
                  Disabled
                </Button>
              </div>
              <p className="text-xs text-[--color-text-secondary]">
                {formData.isWithdrawalsEnabled 
                  ? 'Users can withdraw their FOG coins' 
                  : 'Withdrawals are temporarily disabled'
                }
              </p>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Add any notes about these settings..."
              rows={3}
            />
          </div>

          {/* Change Reason */}
          <div className="space-y-2">
            <Label htmlFor="changeReason">Reason for Change *</Label>
            <Input
              id="changeReason"
              value={changeReason}
              onChange={(e) => setChangeReason(e.target.value)}
              placeholder="e.g., Market adjustment, policy update, etc."
              required
            />
            <p className="text-xs text-[--color-text-secondary]">
              This reason will be logged for audit purposes
            </p>
          </div>

          {/* Form Status */}
          <div className="border border-[--color-border] rounded-lg p-4 bg-[--color-bg-secondary]">
            <h4 className="font-medium text-sm mb-2">Current Form Values:</h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-[--color-text-secondary]">
              <div>FOG Rate: {formData.fogToUsdRate}</div>
              <div>Min Withdrawal: {formData.minimumWithdrawAmount}</div>
              <div>Daily Limit: {formData.maximumDailyEarnings}</div>
              <div>Withdrawals: {formData.isWithdrawalsEnabled ? 'Enabled' : 'Disabled'}</div>
            </div>
            <div className="mt-2">
              <div className="text-xs">Change Reason: {changeReason || 'Not provided'}</div>
              <div className="text-xs">Ready to Save: {changeReason.trim() ? '✅ Yes' : '❌ No'}</div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={handleSave}
              disabled={saving || !changeReason.trim()}
              className="flex items-center gap-2 min-w-[120px]"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* History */}
      {showHistory && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Settings History
            </CardTitle>
            <CardDescription>
              Previous FOG coin setting changes for audit trail
            </CardDescription>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <p className="text-[--color-text-secondary] text-center py-8">
                No history available
              </p>
            ) : (
              <div className="space-y-4">
                {history.map((entry) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-[--color-border] rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-sm">{entry.changeReason}</h4>
                        <div className="flex items-center gap-2 text-xs text-[--color-text-secondary] mt-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(entry.changedAt)}
                          <span>•</span>
                          <span>Changed by Admin</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-[--color-text-secondary]">Rate:</span>
                        <span className="ml-2 font-medium">
                          {formatUsd(entry.settings.fogToUsdRate)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[--color-text-secondary]">Min Withdrawal:</span>
                        <span className="ml-2 font-medium">
                          {formatFog(entry.settings.minimumWithdrawAmount)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[--color-text-secondary]">Daily Limit:</span>
                        <span className="ml-2 font-medium">
                          {formatFog(entry.settings.maximumDailyEarnings)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[--color-text-secondary]">Withdrawals:</span>
                        <span className={`ml-2 font-medium ${
                          entry.settings.isWithdrawalsEnabled ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {entry.settings.isWithdrawalsEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                    
                    {entry.settings.notes && (
                      <p className="text-xs text-[--color-text-secondary] mt-2 italic">
                        "{entry.settings.notes}"
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FogCoinManagement;
