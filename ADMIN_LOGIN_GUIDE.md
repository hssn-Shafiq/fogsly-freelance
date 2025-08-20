# Admin Access Setup Guide

## How to Make a User an Admin

### Method 1: Using Firebase Console (Recommended)
1. Go to your Firebase Console
2. Navigate to Firestore Database
3. Find the `users` collection
4. Locate your user document (by email or UID)
5. Edit the document and change the `role` field from `"user"` to `"admin"`
6. Save the changes

### Method 2: Using Firebase Admin SDK (if you have backend access)
```javascript
import { getFirestore } from 'firebase-admin/firestore';

const db = getFirestore();

// Update user role to admin
await db.collection('users').doc(USER_UID).update({
  role: 'admin',
  updatedAt: new Date()
});
```

## Admin Login Path

### 🔗 **Admin Panel URL**: `/admin`

### Ways to Access Admin Panel:
1. **Direct URL**: Navigate to `http://localhost:5173/admin` (or your domain + `/admin`)
2. **Footer Link**: Click "Admin Panel" in the footer (bottom right)
3. **Direct Navigation**: Use browser address bar

### Login Flow:
1. Navigate to `/admin`
2. You'll be redirected to admin login page
3. Enter your email and password (same as regular login)
4. System will verify you have `role: "admin"` in users collection
5. If admin role confirmed → Access granted to admin panel
6. If not admin → Automatically signed out with error message

## User Document Structure for Admin

Your user document in Firestore should look like this:

```json
{
  "uid": "user-unique-id",
  "email": "admin@example.com",
  "name": "Admin User",
  "role": "admin",        // ← This must be "admin"
  "status": "active",
  "city": "Your City",
  "country": "Your Country", 
  "phone": "+1234567890",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

## Testing Admin Access

1. **Create/Update User**: Make sure you have a user in the `users` collection with `role: "admin"`
2. **Login Normally**: First login as a regular user to ensure your account exists
3. **Update Role**: Change your role to "admin" in Firestore
4. **Test Admin Access**: 
   - Go to `http://localhost:5173/admin`
   - Login with your credentials
   - Should redirect to admin dashboard

## Troubleshooting

### "Access denied. Admin privileges required"
- Check that your user document has `role: "admin"`
- Verify you're using the correct email/password
- Make sure the user document exists in the `users` collection

### "User not found in system"
- The user needs to exist in the `users` collection first
- Register as a normal user first, then update the role

### Can't access admin panel
- Clear browser cache/cookies
- Check browser console for errors
- Verify Firestore rules allow reading user documents

## Admin Features Available

Once logged in as admin, you can:
- ✅ **Theme Management**: Create, edit, delete themes
- ✅ **Color Picker**: Select custom colors for themes  
- ✅ **Real-time Preview**: See theme changes immediately
- ✅ **Theme Persistence**: All changes saved to Firestore

## Security Notes

- Only users with `role: "admin"` can access admin panel
- Admin authentication is verified on every admin page load
- Non-admin users are automatically signed out if they try to access admin features
- All admin actions are logged in browser console
