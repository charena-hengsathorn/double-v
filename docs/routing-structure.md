# Routing Structure

## API Routes

### `/api/sales`
- **GET**: Fetch all sales entries
- **POST**: Create a new sales entry
- Proxies to Strapi: `http://localhost:1337/api/sales`

### `/api/sales/[id]`
- **GET**: Fetch a specific sales entry by ID
- **PUT**: Update a sales entry by ID
- **DELETE**: Delete a sales entry by ID
- Proxies to Strapi: `http://localhost:1337/api/sales/:id`

## Page Routes

### Root Routes
- `/` - Redirects to `/dashboard` (if authenticated) or `/login` (if not)
- `/login` - Login page

### Dashboard Routes
- `/dashboard` - Dashboard home page with navigation cards
- `/dashboard/pipeline-integrity` - Pipeline integrity analysis
- `/dashboard/financials` - Financial overview and charts
- `/dashboard/executive-summary` - Executive summary dashboard
- `/dashboard/cashflow` - Cashflow metrics and projections

### Top-Level Routes
- `/cashflow` - Cashflow Table (detailed sales entry management)

## Navigation Structure

### Main Navigation (Sidebar)
- Dashboard → `/dashboard`
- Cashflow Table → `/cashflow`

### Dashboard Sub-Pages (shown when on `/dashboard/*`)
- Pipeline Integrity → `/dashboard/pipeline-integrity`
- Financials → `/dashboard/financials`
- Executive Summary → `/dashboard/executive-summary`
- Cashflow → `/dashboard/cashflow`

## Route Protection

All routes except `/login` and `/` are protected by `ProtectedRoute` component, which:
1. Checks authentication status
2. Redirects to `/login` if not authenticated
3. Wraps content in `AppShell` (includes Sidebar) if authenticated

## Removed Routes

The following duplicate routes were removed:
- `/executive-summary` (now `/dashboard/executive-summary`)
- `/financials` (now `/dashboard/financials`)
- `/pipeline-integrity` (now `/dashboard/pipeline-integrity`)


## API Routes

### `/api/sales`
- **GET**: Fetch all sales entries
- **POST**: Create a new sales entry
- Proxies to Strapi: `http://localhost:1337/api/sales`

### `/api/sales/[id]`
- **GET**: Fetch a specific sales entry by ID
- **PUT**: Update a sales entry by ID
- **DELETE**: Delete a sales entry by ID
- Proxies to Strapi: `http://localhost:1337/api/sales/:id`

## Page Routes

### Root Routes
- `/` - Redirects to `/dashboard` (if authenticated) or `/login` (if not)
- `/login` - Login page

### Dashboard Routes
- `/dashboard` - Dashboard home page with navigation cards
- `/dashboard/pipeline-integrity` - Pipeline integrity analysis
- `/dashboard/financials` - Financial overview and charts
- `/dashboard/executive-summary` - Executive summary dashboard
- `/dashboard/cashflow` - Cashflow metrics and projections

### Top-Level Routes
- `/cashflow` - Cashflow Table (detailed sales entry management)

## Navigation Structure

### Main Navigation (Sidebar)
- Dashboard → `/dashboard`
- Cashflow Table → `/cashflow`

### Dashboard Sub-Pages (shown when on `/dashboard/*`)
- Pipeline Integrity → `/dashboard/pipeline-integrity`
- Financials → `/dashboard/financials`
- Executive Summary → `/dashboard/executive-summary`
- Cashflow → `/dashboard/cashflow`

## Route Protection

All routes except `/login` and `/` are protected by `ProtectedRoute` component, which:
1. Checks authentication status
2. Redirects to `/login` if not authenticated
3. Wraps content in `AppShell` (includes Sidebar) if authenticated

## Removed Routes

The following duplicate routes were removed:
- `/executive-summary` (now `/dashboard/executive-summary`)
- `/financials` (now `/dashboard/financials`)
- `/pipeline-integrity` (now `/dashboard/pipeline-integrity`)



