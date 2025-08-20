# Firebase Account Migration Guide

## Current Rules Analysis
❌ **Your current rules deny all access** (`allow read, write: if false`)
✅ **New rules provided** support your FOGSLY project requirements

## Required Collections in Your FOGSLY Project

Based on your code, your project uses these Firestore collections:

1. **`users`** - User account data
2. **`userProfile`** - User profile information  
3. **`customThemes`** - Admin-created themes
4. **`adminUsers`** - Admin user data (if any)

## Security Rules Explanation

### 1. User Data Protection
```javascript
match /users/{userId} {
  allow read, write: if isAuthenticated() && isOwner(userId);
  allow read: if isAdmin();
}
```
- Users can only access their own data
- Admins can read all user data

### 2. Theme Management
```javascript
match /customThemes/{themeId} {
  allow read: if isAuthenticated();
  allow write: if isAdmin();
}
```
- All logged-in users can read themes
- Only admins can create/modify themes

### 3. Admin Protection
```javascript
function isAdmin() {
  return request.auth != null && 
         request.auth.token.role == 'admin';
}
```
- Checks for admin role in Firebase Auth custom claims

## Setup Steps for New Firebase Account

### 1. Update Firebase Configuration
Update your `firebase/config.ts` with new project credentials:

```typescript
const firebaseConfig = {
  apiKey: "your-new-api-key",
  authDomain: "your-new-project.firebaseapp.com",
  projectId: "your-new-project-id",
  storageBucket: "your-new-project.firebasestorage.app",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id",
  measurementId: "your-measurement-id"
};
```

### 2. Deploy Security Rules
Copy the rules from `firestore.rules` and paste them in your Firebase Console:
1. Go to Firestore Database
2. Click on "Rules" tab
3. Replace existing rules with the new ones
4. Click "Publish"

### 3. Enable Authentication
In Firebase Console:
1. Go to Authentication
2. Enable Email/Password sign-in method
3. Add your domain to authorized domains

### 4. Set Up Admin Users
You'll need to manually set admin custom claims:

```javascript
// Use Firebase Admin SDK or Firebase CLI
admin.auth().setCustomUserClaims(uid, { role: 'admin' });
```

### 5. Initialize Default Data
Run your app once to initialize default themes and admin data.

## Security Features

✅ **User Isolation** - Users can only access their own data
✅ **Admin Controls** - Admins have elevated permissions
✅ **Theme Protection** - Only admins can modify themes
✅ **Authentication Required** - No anonymous access
✅ **Principle of Least Privilege** - Each user gets minimum required access

## Testing Checklist

After deploying rules, test:

- [ ] User registration/login works
- [ ] Users can read/write their own profiles
- [ ] Users can read themes (for theme switching)
- [ ] Non-admins cannot write to themes
- [ ] Admins can create/edit/delete themes
- [ ] Unauthorized access is denied

## Important Notes

1. **Test Mode vs Production**: These rules are production-ready and secure
2. **Admin Setup**: You'll need to manually set admin claims for the first admin user
3. **Backup**: Always backup your data before migrating
4. **Gradual Migration**: Consider testing with a subset of data first

## Common Issues & Solutions

**Issue**: Users can't read themes
**Solution**: Ensure users are authenticated when accessing theme data

**Issue**: Admin operations fail
**Solution**: Verify admin custom claims are set correctly

**Issue**: Authentication errors
**Solution**: Check Firebase config and authorized domains
