# API Router Explanation

## Overview

The Double V project uses a **three-layer API routing architecture**:

1. **Next.js API Routes** (`/app/api/`) - Server-side proxy endpoints
2. **API Client Layer** (`/lib/api.ts`) - Frontend abstraction for API calls
3. **FastAPI Router** (`predictive-service/app/main.py`) - Backend service endpoints

---

## 1. Next.js API Routes (`/app/api/`)

These are **server-side API endpoints** that run in your Next.js application. They act as **proxies** between your frontend and backend services.

### Structure
```
app/api/
└── sales/
    ├── route.ts          # Handles /api/sales (GET, POST)
    └── [id]/
        └── route.ts      # Handles /api/sales/:id (GET, PUT, DELETE)
```

### Purpose
- **Hide backend URLs** from the frontend (security)
- **Handle CORS** issues by routing through Next.js server
- **Add server-side logic** (authentication, error handling)
- **Centralize error handling** and response formatting

### Example: `/app/api/sales/route.ts`

```typescript
// This runs on the Next.js server
export async function GET(request: NextRequest) {
  // Proxies request to Strapi backend
  const response = await fetch(`${STRAPI_URL}/api/sales`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });
  // Returns response to frontend
  return NextResponse.json(data);
}
```

**Routes available:**
- `GET /api/sales` - List all sales
- `POST /api/sales` - Create a sale
- `GET /api/sales/:id` - Get a specific sale
- `PUT /api/sales/:id` - Update a sale
- `DELETE /api/sales/:id` - Delete a sale

**Why use Next.js API Routes?**
- The `sales` content type in Strapi may not be properly configured
- This proxy handles 404 errors gracefully
- Provides a consistent API interface even if Strapi is down

---

## 2. API Client Layer (`/lib/api.ts`)

This is the **frontend abstraction layer** that your React components use to make API calls. It provides a clean, typed interface to both Strapi and the Predictive Service.

### Two Main Clients

#### A. `strapiApi` - Strapi CMS Client
Directly calls Strapi API with authentication:

```typescript
strapiApi.getPipelineDeals()      // Get all deals
strapiApi.getClients()            // Get all clients
strapiApi.getBillings()           // Get all billings
strapiApi.getForecastSnapshots()  // Get forecast history
strapiApi.getRiskFlags()          // Get risk flags

// For sales, uses Next.js API route proxy:
strapiApi.getSales()              // Calls /api/sales (Next.js route)
strapiApi.createSales(data)       // Calls /api/sales (Next.js route)
```

**Features:**
- Automatic JWT token injection (from localStorage)
- Error handling (404 → empty array)
- Query parameter building
- Population of related entities

#### B. `predictiveApi` - Predictive Service Client
Calls the Python FastAPI service:

```typescript
predictiveApi.getHealth()                    // Service health check
predictiveApi.getBaseForecast()              // Base revenue forecast
predictiveApi.getScenarioForecast('best')    // Scenario forecasts
predictiveApi.getRiskHeatmap()               // Risk analysis
predictiveApi.getForecastWaterfall()         // Forecast variance
predictiveApi.runMonteCarloSimulation()      // Monte Carlo simulation
```

**Used in your Executive Summary page:**
```typescript
const [forecastData, heatmapData] = await Promise.all([
  predictiveApi.getBaseForecast(),
  predictiveApi.getRiskHeatmap(),
]);
```

---

## 3. FastAPI Router (`predictive-service/app/main.py`)

This is the **backend Python service** that handles all predictive analytics and forecasting logic.

### Main Endpoints

#### Health & Status
- `GET /api/v1/health` - Basic health check
- `GET /api/v1/health/detailed` - Detailed health with service status

#### Forecast Endpoints
- `GET /api/v1/models/forecast/base` - Base forecast calculation
- `GET /api/v1/models/forecast/scenario/{scenario_id}` - Scenario forecasts (base/best/worst)
- `POST /api/v1/models/forecast/run` - Trigger forecast recomputation
- `POST /api/v1/models/forecast/simulate` - Monte Carlo simulation

#### Risk Analysis
- `GET /api/v1/models/risk/heatmap` - Risk heatmap by stage/probability
- `GET /api/v1/models/variance/waterfall` - Forecast variance analysis

#### Model Management
- `POST /api/v1/models/calibrate` - Calibrate probability model
- `GET /api/v1/models/calibration/status` - Check calibration status

#### Integration
- `POST /api/v1/webhooks/strapi` - Handle Strapi webhooks
- `POST /api/v1/models/ingest/strapi-sync` - Manual sync from Strapi

#### Monitoring
- `GET /api/v1/alerts` - Get system alerts

### Example Request Flow

```
Frontend Component
  ↓
predictiveApi.getBaseForecast()
  ↓
HTTP GET to: http://localhost:8000/api/v1/models/forecast/base
  ↓
FastAPI Router (app/main.py)
  ↓
ForecastService.compute_base_forecast()
  ↓
StrapiClient.get_pipeline_deals()
  ↓
Strapi API
  ↓
Returns forecast data back through the chain
```

---

## Complete Request Flow Example

### Scenario: Loading Executive Summary

1. **User visits `/dashboard/executive-summary`**
2. **Component calls:**
   ```typescript
   predictiveApi.getBaseForecast()
   predictiveApi.getRiskHeatmap()
   ```

3. **API Client (`lib/api.ts`)** makes HTTP requests:
   ```typescript
   axios.get('http://localhost:8000/api/v1/models/forecast/base')
   axios.get('http://localhost:8000/api/v1/models/risk/heatmap')
   ```

4. **FastAPI Router** receives requests:
   - Routes to `get_base_forecast()` handler
   - Routes to `get_risk_heatmap()` handler

5. **Services execute:**
   - `ForecastService` computes forecast
   - `StrapiClient` fetches deal data from Strapi
   - Risk analysis is performed

6. **Response flows back:**
   - FastAPI → API Client → React Component → UI Update

---

## Why This Architecture?

### Separation of Concerns
- **Next.js API Routes**: Handle frontend-specific concerns (CORS, error formatting)
- **API Client**: Provides clean abstraction for React components
- **FastAPI Router**: Handles business logic and data processing

### Flexibility
- Can swap backend services without changing frontend code
- Can add caching, rate limiting, or transformation in API routes
- Can mock services during development

### Security
- Backend URLs not exposed to browser
- Authentication tokens handled server-side
- Centralized error handling prevents information leakage

---

## Key Files to Know

| File | Purpose | Used By |
|------|---------|---------|
| `/app/api/sales/route.ts` | Next.js API proxy for sales | Frontend components |
| `/lib/api.ts` | API client abstraction | All frontend components |
| `/predictive-service/app/main.py` | FastAPI router | Predictive service |
| `/predictive-service/app/forecast_service.py` | Forecast logic | FastAPI router |
| `/predictive-service/app/strapi_client.py` | Strapi integration | Predictive service |

---

## Quick Reference

### From Frontend Component:

```typescript
// Strapi data (most endpoints)
import { strapiApi } from '@/lib/api';
const deals = await strapiApi.getPipelineDeals();

// Predictive analytics
import { predictiveApi } from '@/lib/api';
const forecast = await predictiveApi.getBaseForecast();

// Sales (via Next.js proxy)
const sales = await strapiApi.getSales(); // Uses /api/sales route
```

### Direct API Calls:

```bash
# Strapi (with auth token)
curl -H "Authorization: Bearer <token>" \
  http://localhost:1337/api/pipeline-deals

# Predictive Service
curl http://localhost:8000/api/v1/models/forecast/base

# Next.js API Route (proxy)
curl http://localhost:3000/api/sales
```

