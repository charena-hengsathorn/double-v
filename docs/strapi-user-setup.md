# Strapi User Setup for Login

## Overview

Strapi includes built-in user authentication via the **Users & Permissions** plugin. Users are stored in the `users` table and can be managed through the Strapi Admin panel.

## Creating Users for Login

### Method 1: Via Strapi Admin Panel

1. **Access Admin Panel**: http://localhost:1337/admin
2. **Navigate to**: Content Manager → User (under Users & Permissions)
3. **Create New Entry**:
   - Click "Create new entry"
   - Fill in:
     - **Username**: (required)
     - **Email**: (required, must be unique)
     - **Password**: (required, min 8 characters)
     - **Confirmed**: true
     - **Blocked**: false
   - Click "Save"
4. **Set Role**: 
   - Go to Settings → Users & Permissions Plugin → Roles
   - Assign user to "Authenticated" role (or custom role)

### Method 2: Via API (Programmatic)

```bash
POST http://localhost:1337/api/auth/local/register
Content-Type: application/json

{
  "username": "john.doe",
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

### Method 3: Via Strapi CLI (Development)

You can create users programmatically in a bootstrap script or migration.

## Login Endpoint

The login form uses Strapi's authentication endpoint:

```bash
POST /api/auth/local
Content-Type: application/json

{
  "identifier": "john@example.com",  // Can be email or username
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "john.doe",
    "email": "john@example.com",
    "provider": "local",
    "confirmed": true,
    "blocked": false,
    "role": {
      "id": 1,
      "name": "Authenticated",
      "type": "authenticated"
    }
  }
}
```

## Default Admin User

When you first set up Strapi, you create an admin user. This admin user can:
- Access the admin panel
- Create other users
- Manage permissions

**Note**: Admin users are separate from regular authenticated users.

## User Roles

Strapi has built-in roles:
- **Public**: Unauthenticated users
- **Authenticated**: Logged-in users

You can create custom roles in:
Settings → Users & Permissions Plugin → Roles

## Permissions

Configure what authenticated users can do:
1. Go to Settings → Users & Permissions Plugin → Roles
2. Select "Authenticated" role
3. Enable permissions for:
   - User (read own profile)
   - User Profile (if using extended profile)
   - Other content types as needed

## Testing Login

1. Create a test user in Strapi Admin
2. Use the login form with:
   - Email: the user's email
   - Password: the user's password
3. Should redirect to `/dashboard` on success

## Troubleshooting

**"Invalid identifier or password"**
- Check user exists in Strapi
- Verify email/username is correct
- Check password is correct
- Ensure user is not blocked

**"User not confirmed"**
- Set `confirmed: true` in user settings

**"User is blocked"**
- Set `blocked: false` in user settings

