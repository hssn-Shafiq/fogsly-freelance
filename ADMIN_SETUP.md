# Admin Panel Setup Guide

## Overview
The admin panel allows administrators to manage themes dynamically through a secure interface.

## Features
- ✅ Secure admin authentication
- ✅ Dynamic theme management (create, edit, delete themes)
- ✅ Color picker integration
- ✅ Real-time theme application
- ✅ Firestore integration for persistence

## Initial Setup

### 1. Create Admin User
First, you need to create an admin user in Firebase Auth and mark them as admin in Firestore:

```javascript
// In your Firebase console or through code
import { adminSetupService } from './firebase/services/adminSetupService';

// This will create default themes and can be extended to create admin users
await adminSetupService.initializeDefaultThemes();
```

### 2. Mark User as Admin
In Firestore, create a document in the `adminUsers` collection:

```json
// Collection: adminUsers
// Document ID: {userId from Firebase Auth}
{
  "userId": "user-auth-id",
  "email": "admin@fogsly.com",
  "role": "super_admin",
  "permissions": ["theme_management"],
  "createdAt": "2024-01-01T00:00:00Z",
  "createdBy": "system"
}
```

### 3. Access Admin Panel
1. Navigate to the footer and click "Admin Panel"
2. Login with admin credentials
3. Access theme management from the sidebar

## Theme Management

### Adding New Themes
1. Go to Theme Management in admin panel
2. Click "Add New Theme"
3. Enter theme name
4. Use color pickers to select colors:
   - Primary Color
   - Secondary Color
   - Background Color
   - Text Color
   - Border Color
5. Click "Create Theme"

### Editing Themes
1. Click edit icon on any theme card
2. Modify colors using color pickers
3. Click "Update Theme"

### Deleting Themes
1. Click delete icon on theme card
2. Confirm deletion (note: cannot delete if it's the current active theme)

## File Structure

```
firebase/
├── types/
│   └── admin.ts           # Admin and theme types
├── services/
│   ├── adminAuthService.ts        # Admin authentication
│   ├── themeService.ts           # Theme CRUD operations
│   ├── adminSetupService.ts      # Setup utilities
│   └── themeIntegrationService.ts # Theme loading/application
│
components/admin/
├── AdminPanelLayout.tsx   # Admin layout with sidebar
└── ThemeManagement.tsx    # Theme management interface
│
pages/
├── AdminAuthPage.tsx      # Admin login page
└── AdminPage.tsx         # Main admin dashboard
```

## Security Notes

- Admin authentication is separate from regular user auth
- Only users marked in `adminUsers` collection can access admin panel
- Theme changes are applied in real-time across the application
- All admin actions are logged and tracked

## Troubleshooting

### Cannot Access Admin Panel
- Ensure user is in `adminUsers` Firestore collection
- Check that user has correct permissions
- Verify Firebase Auth is working

### Themes Not Applying
- Check browser console for errors
- Ensure theme document exists in Firestore
- Verify CSS variables are properly set

### Color Picker Issues
- Ensure modern browser support for input[type="color"]
- Check that color values are in hex format (#rrggbb)
