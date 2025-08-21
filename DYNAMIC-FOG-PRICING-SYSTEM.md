# Dynamic FOG Coin Pricing System

## Overview
This system allows administrators to dynamically manage FOG coin conversion rates and withdrawal settings without needing code changes. All earnings and balances are stored in FOG coins, with USD conversion happening at display time using the current rate.

## Key Features

### 1. Dynamic Pricing Management
- **Admin Control**: Admins can change FOG to USD conversion rates through the admin panel
- **Real-time Updates**: Changes take effect immediately across the platform
- **Audit Trail**: All price changes are logged with timestamps and reasons
- **Fallback Safety**: If settings fail to load, system uses default rate of 1 FOG = $0.10

### 2. Comprehensive Settings
- **Conversion Rate**: FOG to USD conversion (e.g., 1 FOG = $0.10)
- **Minimum Withdrawal**: Minimum FOG coins required to withdraw
- **Daily Earnings Limit**: Maximum FOG coins a user can earn per day
- **Withdrawal Toggle**: Global enable/disable for withdrawals
- **Admin Notes**: Optional notes explaining changes

### 3. User Experience
- **Consistent Display**: Users see FOG coins as primary currency with USD equivalent
- **Real-time Conversion**: All displays use current conversion rate
- **Transparent Pricing**: Users always see both FOG and USD values

## Implementation Details

### Files Created/Modified

#### New Files:
1. **`firebase/types/fogCoinSettings.ts`** - Type definitions for FOG coin settings
2. **`firebase/services/fogCoinSettingsService.ts`** - Service for managing FOG coin settings
3. **`components/admin/fogcoin/FogCoinManagement.tsx`** - Admin interface for managing settings
4. **`firestore-fogcoin-rules.txt`** - Security rules for new collections

#### Modified Files:
1. **`utils/fogCoinUtils.ts`** - Updated to use dynamic rates with caching
2. **`components/profile/ProfileBalanceCards.tsx`** - Uses dynamic conversion rates
3. **`components/admin/ads/CreateEditAdModal.tsx`** - Shows dynamic USD values
4. **`pages/AdminPage.tsx`** - Added FOG coin management route
5. **`components/admin/AdminPanelLayout.tsx`** - Added menu item for FOG coin management
6. **`firebase/types/admin.ts`** - Added new admin route type

### Database Structure

#### Collections:
1. **`fogCoinSettings`** - Stores current settings (single document with ID "current")
2. **`fogCoinSettingsHistory`** - Audit trail of all changes

#### Security:
- Only admins can modify settings
- All authenticated users can read current settings
- History is read-only after creation

### Caching Strategy
- Settings cached for 5 minutes to reduce database calls
- Cache automatically cleared when settings are updated
- Fallback to default values if service fails

## Usage Guide

### For Admins:
1. Navigate to "FOG Coin Management" in admin panel
2. View current settings overview
3. Update conversion rate, withdrawal limits, or other settings
4. Provide a reason for the change (required for audit)
5. Changes take effect immediately

### For Developers:
1. Use `getFogCoinSettingsWithCache()` to get current settings
2. Use `formatFogWithUsdSync()` for synchronous formatting when you have settings
3. Use `clearFogCoinSettingsCache()` after updating settings
4. All FOG coin values in database remain unchanged - only display conversion changes

## Example Usage

```typescript
// Get current settings
const settings = await getFogCoinSettingsWithCache();

// Convert FOG to USD
const usdValue = fogAmount * settings.fogToUsdRate;

// Format for display
const displayText = formatFogWithUsdSync(fogAmount, settings.fogToUsdRate);
// Result: "50 FOG (≈ $5.00)"
```

## Benefits

1. **Flexibility**: Admins can adjust rates based on market conditions
2. **No Downtime**: Changes happen without code deployments
3. **Audit Trail**: Complete history of all pricing changes
4. **User Transparency**: Users always see current conversion rates
5. **Scalability**: System handles rate changes gracefully
6. **Security**: Only authorized admins can modify settings

## Default Settings
- **Conversion Rate**: 1 FOG = $0.10
- **Minimum Withdrawal**: 50 FOG coins
- **Daily Earnings Limit**: 100 FOG coins
- **Withdrawals**: Enabled

## Future Enhancements
- Scheduled rate changes
- Multiple currency support
- Rate change notifications
- Advanced analytics on rate impact
- Integration with external pricing APIs
