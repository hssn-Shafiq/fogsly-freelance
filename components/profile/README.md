# Profile Components Architecture

This folder contains a modular, reusable component architecture for the Profile page.

## Folder Structure

```
components/profile/
├── index.ts                    # Barrel exports for clean imports
├── types.ts                    # Shared TypeScript interfaces and types
├── useProfileState.ts          # Custom hook for profile state management
├── ProfileHeader.tsx           # Header with cover image, avatar, and actions
├── ProfileSidebar.tsx          # Left sidebar with About, Stats, Skills, Socials
├── ProfileBalanceCards.tsx     # Wallet and FOG coins balance cards
├── ProfileTabs.tsx             # Tab navigation component
├── ProfileTabContent.tsx       # Tab content wrapper with lazy loading
└── tabs/
    ├── OverviewTab.tsx         # Recent activity tab
    ├── PortfolioTab.tsx        # Portfolio items tab
    ├── ReviewsTab.tsx          # Reviews and testimonials tab
    └── SettingsTab.tsx         # Profile settings and editing tab
```

## Key Features

### 🚀 **Performance Optimizations**
- **React.memo**: All components are memoized to prevent unnecessary re-renders
- **Lazy Loading**: Tab components are lazy-loaded for better initial load performance
- **Custom Hook**: State management is centralized in `useProfileState`
- **Memoized Callbacks**: All event handlers use `useCallback` for stability

### 🧩 **Modular Design**
- **Single Responsibility**: Each component has a focused, specific purpose
- **Reusable**: Components can be easily reused across different pages
- **Barrel Exports**: Clean import statements via `index.ts`
- **TypeScript**: Full type safety with shared interfaces

### 🎯 **Focus Management**
- **Stable Components**: Components don't recreate on every render
- **Optimized Inputs**: Input components maintain focus during typing
- **Memoized Actions**: Event handlers are stable across renders

## Usage

### Basic Import
```tsx
import {
  ProfileHeader,
  ProfileSidebar,
  ProfileBalanceCards,
  ProfileTabContent,
  useProfileState
} from '../components/profile';
```

### Using the Hook
```tsx
const ProfilePage = ({ navigate, currentUser }) => {
  const { state, actions } = useProfileState(currentUser);
  
  return (
    <div>
      <ProfileHeader
        userProfile={state.userProfile}
        currentUser={currentUser}
        isEditing={state.isEditing}
        onNavigateHome={() => navigate('home')}
        onToggleEdit={() => actions.setIsEditing(!state.isEditing)}
      />
      {/* ... other components */}
    </div>
  );
};
```

## Benefits

1. **Faster Loading**: Lazy-loaded tabs reduce initial bundle size
2. **Better UX**: No more focus loss issues during form editing
3. **Maintainable**: Easy to find and edit specific functionality
4. **Testable**: Each component can be unit tested independently
5. **Scalable**: Easy to add new tabs or modify existing ones
6. **Type Safe**: Full TypeScript coverage with shared interfaces

## Component Props

### ProfileHeader
- `userProfile`: User profile data
- `currentUser`: Firebase user object
- `isEditing`: Boolean for edit mode
- `onNavigateHome`: Callback for home navigation
- `onToggleEdit`: Callback for toggling edit mode

### ProfileTabContent
- `state`: Complete profile state from hook
- `actions`: Action methods from hook
- `currentUser`: Firebase user object

### useProfileState Hook
Returns an object with:
- `state`: All profile state (activeTab, userProfile, isLoading, etc.)
- `actions`: All action methods (setActiveTab, handleFormChange, etc.)

## Migration Notes

The original 770-line ProfilePage.tsx has been reduced to ~70 lines by extracting:
- 6 main components
- 4 tab components  
- 1 custom hook
- Shared types and utilities

This modular approach provides better performance, maintainability, and developer experience.
