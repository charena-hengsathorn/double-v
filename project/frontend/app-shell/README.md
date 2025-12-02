# Application Shell

The application shell provides authentication, navigation, and layout components for the Double V Dashboard.

## Structure

```
app-shell/
├── components/
│   ├── AppShell.tsx          # Main shell wrapper with navigation
│   ├── LoginForm.tsx          # Login form component
│   ├── Navigation.tsx         # Top navigation bar
│   └── ProtectedRoute.tsx    # Route protection wrapper
├── context/
│   └── AuthContext.tsx        # Authentication context and provider
└── README.md                  # This file
```

## Components

### AppShell
Main wrapper component that provides the application layout with navigation.

**Usage:**
```tsx
<AppShell>
  {children}
</AppShell>
```

### LoginForm
Login form component with email/password authentication.

**Features:**
- Email/password input
- Error handling
- Loading states
- Demo mode support (allows any credentials for development)

### Navigation
Top navigation bar with:
- Dashboard links
- Active route highlighting
- User info display
- Sign out button
- Mobile-responsive menu

### ProtectedRoute
Wrapper component that protects routes requiring authentication.

**Usage:**
```tsx
<ProtectedRoute>
  <YourPage />
</ProtectedRoute>
```

**Features:**
- Redirects to login if not authenticated
- Shows loading state during auth check
- Wraps content in AppShell

## Context

### AuthContext
Provides authentication state and methods throughout the application.

**Methods:**
- `login(email, password)` - Authenticate user
- `logout()` - Sign out user
- `user` - Current user object
- `isAuthenticated` - Boolean auth status
- `loading` - Loading state

**Usage:**
```tsx
import { useAuth } from '../app-shell/context/AuthContext';

function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuth();
  // ...
}
```

## Authentication Flow

1. User visits `/` → Redirects to `/login` if not authenticated
2. User logs in → Token stored in localStorage
3. User redirected to `/dashboard`
4. Protected routes check authentication
5. If token invalid/expired → Redirect to `/login`

## Routes

- `/` - Home (redirects based on auth status)
- `/login` - Login page
- `/dashboard` - Main dashboard (protected)
- `/dashboard/pipeline-integrity` - Pipeline dashboard (protected)
- `/dashboard/financials` - Financials dashboard (protected)
- `/dashboard/executive-summary` - Executive summary (protected)

## Demo Mode

For development, the authentication includes a demo mode that accepts any email/password combination. This allows testing without setting up Strapi users.

**To disable demo mode:**
Remove the demo fallback in `AuthContext.tsx` `login` method.

## Integration

The app shell is integrated into the root layout:

```tsx
// app/layout.tsx
<AuthProvider>
  {children}
</AuthProvider>
```

Protected routes use the layout:

```tsx
// app/dashboard/layout.tsx
<ProtectedRoute>
  {children}
</ProtectedRoute>
```


