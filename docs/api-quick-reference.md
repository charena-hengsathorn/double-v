# API Quick Reference

## Strapi API

**Base URL**: `http://localhost:1337/api` (local) or `https://double-v-strapi-dd98523889e0.herokuapp.com/api` (production)

### Authentication

```bash
# Login
POST /api/auth/local
{
  "identifier": "user@example.com",
  "password": "password"
}
```

### Content Types

#### Clients
```bash
GET    /api/clients
GET    /api/clients/:id
POST   /api/clients
PATCH  /api/clients/:id
DELETE /api/clients/:id
```

#### Pipeline Deals
```bash
GET    /api/pipeline-deals?filters[status][$eq]=active
GET    /api/pipeline-deals/:id?populate=project,deal_milestones
POST   /api/pipeline-deals
PATCH  /api/pipeline-deals/:id
DELETE /api/pipeline-deals/:id
```

#### Billings
```bash
GET    /api/billings?populate=deal,milestone
GET    /api/billings/:id
POST   /api/billings
PATCH  /api/billings/:id
```

#### Forecast Snapshots
```bash
GET    /api/forecast-snapshots?filters[scenario][$eq]=base
POST   /api/forecast-snapshots
```

#### Risk Flags
```bash
GET    /api/risk-flags?populate=deal
POST   /api/risk-flags
PATCH  /api/risk-flags/:id
```

## Predictive Service API

**Base URL**: `http://localhost:8000/api/v1` (local) or `https://double-v-predictive-10a3079347ff.herokuapp.com/api/v1` (production)

**Interactive Docs**: `/api/v1/docs` (Swagger UI) or `/api/v1/redoc` (ReDoc)

### Health Check

```bash
GET /api/v1/health
# Response: {"status": "healthy", "version": "1.0.0"}
```

### Forecast Endpoints

#### Base Forecast
```bash
GET /api/v1/models/forecast/base?currency=THB&start_month=2024-01-01&end_month=2024-12-31
```

#### Scenario Forecast
```bash
GET /api/v1/models/forecast/scenario/base?currency=THB
GET /api/v1/models/forecast/scenario/best?currency=THB
GET /api/v1/models/forecast/scenario/worst?currency=THB
```

#### Run Forecast Recompute
```bash
POST /api/v1/models/forecast/run
{
  "write_snapshots": true
}
```

#### Create Custom Scenario
```bash
POST /api/v1/models/forecast/scenario
{
  "name": "custom-scenario",
  "probability_adjustments": {
    "prospecting": 0.1,
    "qualification": 0.2
  }
}
```

### Risk Analytics

#### Risk Heatmap
```bash
GET /api/v1/models/risk/heatmap?group_by_stage=true&group_by_probability=true
```

#### Forecast Waterfall
```bash
GET /api/v1/models/variance/waterfall?current_snapshot_date=2024-01-01&prior_snapshot_date=2023-12-01&group_by=deal
```

### Monte Carlo Simulation

```bash
POST /api/v1/models/forecast/simulate
{
  "deal_ids": [1, 2, 3],
  "iterations": 10000,
  "confidence_levels": [0.5, 0.8, 0.95]
}
```

### Model Calibration

```bash
POST /api/v1/models/calibrate
GET  /api/v1/models/calibration/status
```

### Data Sync

```bash
POST /api/v1/models/ingest/strapi-sync
{
  "entity_types": ["pipeline-deals", "billings"],
  "full_sync": true,
  "since": "2024-01-01T00:00:00Z"
}
```

### Webhooks

```bash
POST /api/v1/webhooks/strapi
Headers:
  X-Strapi-Event: entry.create
  X-Strapi-Entity: pipeline-deal
  X-Strapi-Signature: <HMAC signature>
Body: <Strapi webhook payload>
```

### Alerts

```bash
GET /api/v1/alerts
GET /api/v1/alerts?level=ERROR
```

## Example cURL Commands

### Get Base Forecast
```bash
curl -X GET "http://localhost:8000/api/v1/models/forecast/base?currency=THB" \
  -H "Content-Type: application/json"
```

### Get Risk Heatmap
```bash
curl -X GET "http://localhost:8000/api/v1/models/risk/heatmap" \
  -H "Content-Type: application/json"
```

### Get Pipeline Deals
```bash
curl -X GET "http://localhost:1337/api/pipeline-deals?filters[status][\$eq]=active&populate=project" \
  -H "Content-Type: application/json"
```

### Create Pipeline Deal
```bash
curl -X POST "http://localhost:1337/api/pipeline-deals" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "deal_id": "DEAL-001",
      "stage": "proposal",
      "status": "active",
      "probability": 60,
      "deal_value": 100000,
      "currency": "USD"
    }
  }'
```

## Response Formats

### Strapi Response
```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "deal_id": "DEAL-001",
        "stage": "proposal",
        "status": "active",
        "probability": 60,
        "deal_value": 100000
      }
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 1,
      "total": 1
    }
  }
}
```

### Predictive Service Response
```json
{
  "forecast": {
    "start_month": "2024-01-01",
    "end_month": "2024-12-31",
    "currency": "THB",
    "monthly_totals": [
      {
        "month": "2024-01",
        "confirmed": 50000,
        "tentative": 100000,
        "total": 150000
      }
    ],
    "summary": {
      "total_forecast": 1800000,
      "total_confirmed": 600000,
      "total_tentative": 1200000,
      "conversion_rate": 0.33
    }
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Invalid request parameters"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

## Rate Limiting

- Strapi: No rate limiting configured (default)
- Predictive Service: No rate limiting configured (default)
- Production: Consider implementing rate limiting

## Authentication

- Strapi: JWT tokens (obtain via `/api/auth/local`)
- Predictive Service: API tokens via `STRAPI_API_TOKEN` env var
- Webhooks: HMAC signature verification via `STRAPI_WEBHOOK_SECRET`

For complete API documentation, see [API Specification](./api-specification.md).


