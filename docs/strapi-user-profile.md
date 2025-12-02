# Strapi User Profile Content Type

## Overview

The User Profile content type extends Strapi's built-in user authentication with additional profile information.

## Built-in Authentication

Strapi includes user authentication via the **Users & Permissions** plugin:
- Built-in User model (email, username, password)
- JWT token authentication
- Role-based permissions
- Login/Register endpoints

**Endpoints:**
- `POST /api/auth/local` - Login
- `POST /api/auth/local/register` - Register
- `GET /api/users/me` - Get current user

## User Profile Content Type

The `user-profile` content type stores extended user information:

### Fields

- `user_id` (string, unique, required) - Links to Strapi user
- `first_name` (string) - User's first name
- `last_name` (string) - User's last name
- `role` (enumeration) - User role: executive, finance, sales, analyst, admin
- `department` (string) - Department name
- `phone` (string) - Phone number
- `avatar_url` (string) - Profile picture URL
- `preferences` (JSON) - User preferences/settings
- `last_login_at` (datetime) - Last login timestamp
- `is_active` (boolean) - Account active status

### Usage

**Create User Profile:**
```bash
POST /api/user-profiles
{
  "data": {
    "user_id": "1",
    "first_name": "John",
    "last_name": "Doe",
    "role": "executive",
    "department": "Finance"
  }
}
```

**Get User Profile:**
```bash
GET /api/user-profiles?filters[user_id][$eq]=1
```

## Integration with Login

The login form uses Strapi's built-in authentication:
1. User submits email/password
2. Frontend calls `POST /api/auth/local`
3. Strapi returns JWT token and user object
4. Token stored in localStorage
5. Token included in API requests via Authorization header

## Permissions

User Profile permissions are configured in Strapi Admin:
- Settings → Users & Permissions Plugin → Roles
- Configure permissions for Authenticated and Public roles


