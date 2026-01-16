# Strapi to Predictive Service Connection

## Overview
The predictive service has been updated to connect to Strapi and fetch all data types used in the application.

## Changes Made

### 1. Updated StrapiClient (`project/predictive-service/app/strapi_client.py`)

Added methods to fetch all content types:

**New Methods:**
- `get_clients()` - Fetch clients from Strapi
- `get_construction_sales()` - Fetch construction sales
- `get_construction_billings()` - Fetch construction billings
- `get_loose_furniture_sales()` - Fetch loose furniture sales
- `get_loose_furniture_billings()` - Fetch loose furniture billings
- `get_interior_design_sales()` - Fetch interior design sales
- `get_interior_design_billings()` - Fetch interior design billings
- `get_all_sales()` - Fetch all sales from all branches (aggregated)
- `get_all_billings()` - Fetch all billings from all branches (aggregated)

**Enhanced Methods:**
- `get_billings()` - Now supports `populate` parameter
- `health_check()` - Improved to try multiple endpoints

**Error Handling:**
- All methods gracefully handle 404 errors (content type not found)
- Returns empty arrays instead of throwing errors for missing content types

### 2. Updated API Endpoints (`project/predictive-service/app/main.py`)

**New Endpoints:**
- `GET /api/v1/data/clients` - Get all clients
- `GET /api/v1/data/sales/all` - Get all sales from all branches
- `GET /api/v1/data/billings/all` - Get all billings from all branches
- `GET /api/v1/data/sales/construction` - Get construction sales
- `GET /api/v1/data/billings/construction` - Get construction billings

**Updated Endpoints:**
- `POST /api/v1/models/ingest/strapi-sync` - Now supports syncing all content types:
  - `clients`
  - `construction-sales`, `construction-billings`
  - `loose-furniture-sales`, `loose-furniture-billings`
  - `interior-design-sales`, `interior-design-billings`
  - `all-sales`, `all-billings`

## Configuration Required

### Environment Variables

The predictive service needs the following environment variables:

1. **STRAPI_URL** (Required)
   - Local: `http://localhost:1337/api`
   - Production: `https://double-v-strapi-dd98523889e0.herokuapp.com/api`
   - Already configured in Heroku

2. **STRAPI_API_TOKEN** (Required)
   - API token for service-to-service authentication
   - **Action Required:** Generate in Strapi admin and set in Heroku
   - To generate:
     1. Log into Strapi admin panel
     2. Go to Settings → API Tokens
     3. Create a new API token with appropriate permissions
     4. Set it in Heroku: `heroku config:set STRAPI_API_TOKEN=your-token-here --app double-v-predictive`

3. **STRAPI_WEBHOOK_SECRET** (Optional)
   - For webhook verification
   - Can be any secure string

### Heroku Configuration

Check current configuration:
```bash
heroku config --app double-v-predictive
```

Set missing variables:
```bash
heroku config:set STRAPI_API_TOKEN=your-token-here --app double-v-predictive
```

## Testing the Connection

### 1. Health Check
```bash
curl https://double-v-predictive-10a3079347ff.herokuapp.com/api/v1/health
```

Expected response:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2025-01-XX...",
  "services": {
    "strapi": "connected",
    "database": "connected"
  }
}
```

### 2. Test Data Fetching
```bash
# Get all clients
curl https://double-v-predictive-10a3079347ff.herokuapp.com/api/v1/data/clients

# Get all sales
curl https://double-v-predictive-10a3079347ff.herokuapp.com/api/v1/data/sales/all

# Get all billings
curl https://double-v-predictive-10a3079347ff.herokuapp.com/api/v1/data/billings/all
```

### 3. Test Sync Endpoint
```bash
curl -X POST https://double-v-predictive-10a3079347ff.herokuapp.com/api/v1/models/ingest/strapi-sync \
  -H "Content-Type: application/json" \
  -d '{
    "entity_types": ["clients", "all-sales", "all-billings"]
  }'
```

## Data Flow

```
Strapi (Heroku)
    ↓
Predictive Service (Heroku)
    ↓
Frontend (Vercel)
```

1. **Strapi** stores all data (clients, sales, billings, etc.)
2. **Predictive Service** fetches data from Strapi via API
3. **Predictive Service** processes data and generates forecasts
4. **Frontend** calls Predictive Service endpoints to display data

## API Endpoints Summary

### Data Endpoints
- `GET /api/v1/data/clients` - Get clients
- `GET /api/v1/data/sales/all` - Get all sales
- `GET /api/v1/data/billings/all` - Get all billings
- `GET /api/v1/data/sales/construction` - Get construction sales
- `GET /api/v1/data/billings/construction` - Get construction billings

### Forecast Endpoints (Existing)
- `GET /api/v1/models/forecast/base` - Base forecast
- `GET /api/v1/models/forecast/scenario/{scenario_id}` - Scenario forecast
- `GET /api/v1/models/risk/heatmap` - Risk heatmap
- `POST /api/v1/models/ingest/strapi-sync` - Sync from Strapi

## Next Steps

1. **Generate API Token in Strapi**
   - Log into Strapi admin
   - Create API token with read permissions
   - Set in Heroku config

2. **Test Connection**
   - Use health check endpoint
   - Test data fetching endpoints
   - Verify data is returned correctly

3. **Update Forecast Service** (Optional)
   - Modify `forecast_service.py` to use new data sources
   - Incorporate sales and billings data into forecasts

4. **Monitor**
   - Check Heroku logs: `heroku logs --tail --app double-v-predictive`
   - Monitor health endpoint for connection status

## Troubleshooting

### Connection Issues
- Verify `STRAPI_URL` is correct
- Check `STRAPI_API_TOKEN` is set and valid
- Ensure Strapi is running and accessible
- Check CORS settings in Strapi

### 404 Errors
- Content type may not exist in Strapi
- Check Strapi admin to verify content types are created
- Methods return empty arrays for missing content types (graceful handling)

### Authentication Errors
- Verify API token has correct permissions
- Check token hasn't expired
- Ensure token is set in Heroku config

## Files Modified

1. `project/predictive-service/app/strapi_client.py` - Added all data fetching methods
2. `project/predictive-service/app/main.py` - Added new API endpoints

## Related Documentation

- Environment Variables: `ENV_VARS_SUMMARY.md`
- Deployment Links: `DEPLOYMENT_LINKS.md`
- Strapi Configuration: Check Strapi admin panel

