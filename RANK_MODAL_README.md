# Rank Congratulations Modal

## Overview
A celebration modal that shows when users sign up or achieve rankings on FOGSLY. Features animated rank banners, congratulatory messages, and tier-specific content.

## Features
- 🏆 **Tier-based celebrations** - Different animations and messages for each rank tier
- 🎨 **Animated rank banner** - Full-size FogslyRankBanner with celebrations
- ✨ **Floating celebration elements** - Stars, sparkles, trophies, and party poppers
- 🎯 **Contextual messaging** - Personalized congratulations based on rank and user status
- 📱 **Responsive design** - Works perfectly on all screen sizes

## Rank Tiers
- **Legend** (Top 5) - Gold theme with legendary messaging
- **Master** (Top 20) - Gold theme with master-level recognition
- **Vanguard** (21-100) - Silver theme for advanced users
- **Early Bird** (101-300) - Bronze theme for pioneers
- **Champion** (301-1000) - Blue theme for rising stars
- **Rookie** (1001+) - Green theme for newcomers

## Usage

### Automatic Trigger
The modal automatically shows when:
1. User signs up and logs in for the first time
2. 1.5 second delay after successful login
3. User navigates to home page after authentication

### Manual Testing
You can manually trigger the modal for testing:

```javascript
// In browser console
window.showRankModal(42); // Shows modal with rank #42
window.showRankModal(5);  // Shows modal with rank #5 (Legend tier)
window.showRankModal(1337); // Shows modal with rank #1337 (Rookie tier)
```

### Integration
```tsx
<RankCongratulationsModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  userRank={userRank}
  userName="John Doe"
  isNewUser={true}
/>
```

## Customization
- Messages and themes are tier-based and automatically selected
- Rank banner uses the same system as profile rank badges
- Floating elements and animations can be customized in the component
- Celebration colors match the tier themes

## Files
- `components/modals/RankCongratulationsModal.tsx` - Main component
- `styles/animations.css` - Custom animations and effects
- `components/badges/FogslyRankBanner.tsx` - Rank banner component

## Dependencies
- Framer Motion for animations
- Lucide React for icons
- FOGSLY rank banner system
