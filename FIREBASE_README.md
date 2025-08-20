# Firebase Integration Setup

This project has been set up with Firebase Authentication and Firestore for user management and profile data.

## Features Implemented

### 🔐 Authentication
- ✅ User Registration (Sign Up)
- ✅ User Login (Sign In)
- ✅ User Logout
- ✅ Authentication State Management


### 👤 User Management
- ✅ User Data Storage (users collection)
- ✅ User Profile Storage (userProfile collection)
- ✅ Profile Editing (Name, Role, Location, Bio, Skills, Social Links)
- ✅ Real-time Auth State Monitoring

### 📊 Profile Features
- ✅ Editable Profile Fields
- ✅ Skills Management (Add/Remove)
- ✅ Social Links
- ✅ Static/Dynamic Content Display
- ✅ Portfolio, Reviews, Activity Sections (Future Dynamic)

## Firebase Collections

### `users` Collection
```typescript
{
  uid: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'moderator'; // System role (admin controlled)
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}
```

### `userProfile` Collection
```typescript
{
  userId: string;
  name: string;
  email: string;
  role: string; // Display role (user controlled)
  location: string;
  bio: string;
  skills: string[];
  social: {
    linkedin: string;
    twitter: string;
    dribbble: string;
    github: string;
  };
  portfolio: Array; // Future feature
  reviews: Array;   // Future feature
  activity: Array;  // Future feature
  createdAt: Date;
  updatedAt: Date;
}
```

## How to Use

### 1. Authentication Flow
1. User visits `/auth` page
2. Can choose to Login, Sign Up
3. On successful auth, redirected to home page
4. Profile page shows user data from Firebase

### 2. Profile Editing
1. Go to Profile page (requires login)
2. Click the Edit button (pencil icon) in the header
3. Edit any field: Name, Role, Location, Bio, Skills, Social Links
4. Click "Save Changes" to update Firebase
5. Changes are reflected immediately

### 3. Protected Routes
- Dashboard: Requires login
- Profile: Requires login
- Other pages: Public access

## File Structure

```
firebase/
├── config.ts           # Firebase app initialization
├── index.ts           # Export all Firebase services
├── services/
│   ├── authService.ts  # Authentication functions
│   └── userService.ts  # User data CRUD operations
└── types/
    └── user.ts        # TypeScript types
```

## Key Functions

### Authentication
- `signUp(signupData)` - Register new user
- `signIn(loginData)` - Login existing user
- `signOutUser()` - Logout user
- `onAuthStateChange(callback)` - Listen to auth changes

### User Data
- `createUserData(userData)` - Create user record
- `createUserProfile(profileData)` - Create user profile
- `getUserProfile(userId)` - Get user profile
- `updateUserProfile(userId, updates)` - Update profile
- `setupNewUser(uid, email, name)` - Complete new user setup

## Future Enhancements
- ✨ Portfolio management (add/edit/delete projects)
- ✨ Review system
- ✨ Activity tracking
- ✨ Image upload for avatars and cover photos
- ✨ Advanced user settings
- ✨ Admin panel for user management

## Notes
- Static data is shown for portfolio/reviews when no dynamic data exists
- Media upload is prepared but not implemented (Firebase Storage not used due to cost)
- Email field is read-only (managed by Firebase Auth)
- Skills are managed as an array with add/remove functionality
