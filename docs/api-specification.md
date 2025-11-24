# API Specification

## Base URLs
- **Strapi CMS**: `http://localhost:1337/api` (development)
- **Predictive Service**: `http://localhost:8000/api/v1` (development)
- **Next.js Frontend**: `http://localhost:3000` (development)

## API Versioning
All predictive service endpoints use `/api/v1` prefix. Strapi uses `/api` prefix.

## Authentication
All endpoints require authentication via JWT tokens obtained from Strapi auth endpoints.

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

---

## Strapi CMS API

### Base Path: `/api`

### Clients

#### List Clients
```
GET /api/clients
```

**Query Parameters:**
- `populate` (string, optional): Relations to populate (e.g., `projects,projects.deals`)
- `filters` (object, optional): Filter criteria
- `sort` (string, optional): Sort field (e.g., `name:asc`)
- `pagination[page]` (number, optional): Page number
- `pagination[pageSize]` (number, optional): Items per page

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "name": "Client Name",
        "segment": "enterprise",
        "region": "APAC",
        "account_owner_id": 1,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
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

#### Get Client by ID
```
GET /api/clients/:id
```

**Response:** Single client object with populated relations

#### Create Client
```
POST /api/clients
```

**Request Body:**
```json
{
  "data": {
    "name": "Client Name",
    "segment": "enterprise",
    "region": "APAC",
    "account_owner_id": 1
  }
}
```

#### Update Client
```
PATCH /api/clients/:id
```

**Request Body:** Same as create

#### Delete Client
```
DELETE /api/clients/:id
```

---

### Projects

#### List Projects
```
GET /api/projects
```

**Query Parameters:** Same as clients

#### Get Project by ID
```
GET /api/projects/:id
```

#### Create Project
```
POST /api/projects
```

**Request Body:**
```json
{
  "data": {
    "name": "Project Name",
    "type": "consulting",
    "status": "active",
    "complexity_score": 5,
    "client": 1,
    "start_date": "2024-01-01",
    "end_date": "2024-12-31"
  }
}
```

#### Update Project
```
PATCH /api/projects/:id
```

#### Delete Project
```
DELETE /api/projects/:id
```

---

### Pipeline Deals

#### List Pipeline Deals
```
GET /api/pipeline-deals
```

**Query Parameters:**
- `populate` (string, optional): `milestones,riskFlags,project,project.client`
- `filters[stage]` (string, optional): Filter by stage
- `filters[status]` (string, optional): Filter by status
- `filters[probability][$gte]` (number, optional): Minimum probability
- `filters[expected_close_date][$gte]` (date, optional): From date
- `sort` (string, optional): `deal_value:desc`, `expected_close_date:asc`, etc.

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "stage": "negotiation",
        "status": "active",
        "probability": 0.75,
        "deal_value": 500000,
        "currency": "THB",
        "expected_close_date": "2024-06-01",
        "recognition_start_month": "2024-07-01",
        "recognition_end_month": "2024-12-01",
        "sales_owner_id": 1,
        "last_activity_at": "2024-01-15T10:00:00.000Z",
        "project": { "data": { "id": 1, "attributes": {...} } },
        "milestones": { "data": [...] },
        "riskFlags": { "data": [...] }
      }
    }
  ],
  "meta": { "pagination": {...} }
}
```

#### Get Deal by ID
```
GET /api/pipeline-deals/:id?populate=*
```

#### Create Deal
```
POST /api/pipeline-deals
```

**Request Body:**
```json
{
  "data": {
    "stage": "proposal",
    "status": "active",
    "probability": 0.5,
    "deal_value": 300000,
    "currency": "THB",
    "expected_close_date": "2024-05-01",
    "recognition_start_month": "2024-06-01",
    "recognition_end_month": "2024-12-01",
    "project": 1,
    "sales_owner_id": 1
  }
}
```

#### Update Deal
```
PATCH /api/pipeline-deals/:id
```

#### Delete Deal
```
DELETE /api/pipeline-deals/:id
```

---

### Deal Milestones

#### List Milestones for Deal
```
GET /api/pipeline-deals/:dealId/milestones
```

**Alternative:**
```
GET /api/deal-milestones?filters[deal][id][$eq]=:dealId
```

#### Create Milestone
```
POST /api/deal-milestones
```

**Request Body:**
```json
{
  "data": {
    "deal": 1,
    "sequence_order": 1,
    "name": "Project Kickoff",
    "scheduled_date": "2024-07-01",
    "amount": 100000,
    "recognition_month": "2024-07-01",
    "billing_type": "invoice",
    "collection_terms": "net_30"
  }
}
```

#### Update Milestone
```
PATCH /api/deal-milestones/:id
```

#### Delete Milestone
```
DELETE /api/deal-milestones/:id
```

---

### Forecast Snapshots

#### List Snapshots
```
GET /api/forecast-snapshots
```

**Query Parameters:**
- `filters[scenario]` (string, optional): `base`, `best`, `worst`
- `filters[snapshot_date][$gte]` (date, optional): From date
- `filters[deal][id][$eq]` (number, optional): Filter by deal
- `sort` (string, optional): `snapshot_date:desc`

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "snapshot_date": "2024-01-15",
        "scenario": "base",
        "probability": 0.75,
        "expected_amount": 375000,
        "expected_month": "2024-07-01",
        "expected_margin": 0.25,
        "model_version": "1.0.0",
        "deal": { "data": { "id": 1, "attributes": {...} } }
      }
    }
  ]
}
```

#### Create Snapshot (Manual Override or Model Write)
```
POST /api/forecast-snapshots
```

**Request Body:**
```json
{
  "data": {
    "snapshot_date": "2024-01-15",
    "scenario": "base",
    "probability": 0.75,
    "expected_amount": 375000,
    "expected_month": "2024-07-01",
    "expected_margin": 0.25,
    "model_version": "1.0.0",
    "deal": 1,
    "author_id": 1
  }
}
```

#### Bulk Create Snapshots
```
POST /api/forecast-snapshots/bulk
```

**Request Body:**
```json
{
  "data": [
    { "data": {...} },
    { "data": {...} }
  ]
}
```

---

### Billings

#### List Billings
```
GET /api/billings
```

**Query Parameters:**
- `filters[status]` (string, optional): `pending`, `collected`, `overdue`
- `filters[deal][id][$eq]` (number, optional)
- `filters[recognition_month]` (date, optional)

#### Create Billing
```
POST /api/billings
```

**Request Body:**
```json
{
  "data": {
    "deal": 1,
    "milestone": 1,
    "invoice_number": "INV-2024-001",
    "invoice_date": "2024-07-01",
    "amount": 100000,
    "currency": "THB",
    "collected_date": null,
    "recognition_month": "2024-07-01",
    "status": "pending",
    "payment_reference": null
  }
}
```

#### Update Billing
```
PATCH /api/billings/:id
```

---

### Risk Flags

#### List Risk Flags
```
GET /api/risk-flags
```

**Query Parameters:**
- `filters[deal][id][$eq]` (number, optional)
- `filters[severity]` (string, optional): `low`, `medium`, `high`, `critical`
- `filters[status]` (string, optional): `open`, `resolved`

#### Create Risk Flag
```
POST /api/risk-flags
```

**Request Body:**
```json
{
  "data": {
    "deal": 1,
    "category": "timing",
    "severity": "high",
    "description": "Deal may slip due to client budget approval delay",
    "owner_id": 1
  }
}
```

#### Update Risk Flag (Resolve)
```
PATCH /api/risk-flags/:id
```

**Request Body:**
```json
{
  "data": {
    "status": "resolved",
    "resolved_at": "2024-01-20T00:00:00.000Z",
    "resolution_notes": "Client approved budget, deal back on track"
  }
}
```

---

### Users & Authentication

#### Register User (Admin only)
```
POST /api/auth/local/register
```

#### Login
```
POST /api/auth/local
```

**Request Body:**
```json
{
  "identifier": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "user@example.com",
    "email": "user@example.com",
    "role": {
      "id": 1,
      "name": "Authenticated",
      "type": "authenticated"
    }
  }
}
```

#### Get Current User
```
GET /api/users/me
```

**Headers:** `Authorization: Bearer <token>`

---

## Predictive Service API

### Base Path: `/api/v1`

### Health Check

#### Health Status
```
GET /api/v1/health
```

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2024-01-15T10:00:00.000Z",
  "services": {
    "strapi": "connected",
    "database": "connected"
  }
}
```

---

### Forecast Endpoints

#### Get Base Forecast
```
GET /api/v1/models/forecast/base
```

**Query Parameters:**
- `start_month` (date, optional): Start of forecast period (default: current month)
- `end_month` (date, optional): End of forecast period (default: +12 months)
- `currency` (string, optional): Base currency for aggregation (default: THB)

**Response:**
```json
{
  "forecast": {
    "start_month": "2024-01-01",
    "end_month": "2024-12-31",
    "currency": "THB",
    "monthly_totals": [
      {
        "month": "2024-01-01",
        "confirmed": 500000,
        "tentative": 200000,
        "total": 700000,
        "confidence_tiers": {
          "high": 500000,
          "medium": 150000,
          "low": 50000
        }
      }
    ],
    "summary": {
      "total_confirmed": 6000000,
      "total_tentative": 2400000,
      "total_forecast": 8400000,
      "conversion_rate": 0.714
    }
  },
  "generated_at": "2024-01-15T10:00:00.000Z",
  "model_version": "1.0.0"
}
```

#### Run Forecast Recompute
```
POST /api/v1/models/forecast/run
```

**Request Body:**
```json
{
  "scenario_overrides": {
    "deal_id": 1,
    "probability_override": 0.8
  },
  "force_recompute": false,
  "write_snapshots": true
}
```

**Response:**
```json
{
  "status": "completed",
  "deals_processed": 150,
  "snapshots_created": 450,
  "execution_time_ms": 1250,
  "started_at": "2024-01-15T10:00:00.000Z",
  "completed_at": "2024-01-15T10:00:20.250Z"
}
```

#### Get Scenario Forecast
```
GET /api/v1/models/forecast/scenario/:scenario_id
```

**Path Parameters:**
- `scenario_id` (string): `base`, `best`, `worst`, or custom scenario ID

**Query Parameters:** Same as base forecast

**Response:** Same structure as base forecast

#### Create Custom Scenario
```
POST /api/v1/models/forecast/scenario
```

**Request Body:**
```json
{
  "name": "optimistic_q2",
  "description": "Optimistic Q2 scenario with higher probabilities",
  "adjustments": [
    {
      "deal_id": 1,
      "probability_multiplier": 1.2,
      "timing_shift_days": -30
    }
  ]
}
```

**Response:**
```json
{
  "scenario_id": "optimistic_q2",
  "forecast": { ... },
  "created_at": "2024-01-15T10:00:00.000Z"
}
```

#### Run Monte Carlo Simulation
```
POST /api/v1/models/forecast/simulate
```

**Request Body:**
```json
{
  "deal_ids": [1, 2, 3],
  "iterations": 10000,
  "confidence_levels": [0.5, 0.8, 0.95]
}
```

**Response:**
```json
{
  "simulation_id": "sim_abc123",
  "iterations": 10000,
  "results": {
    "expected_value": 1500000,
    "confidence_intervals": {
      "50": [1200000, 1800000],
      "80": [1000000, 2000000],
      "95": [800000, 2200000]
    },
    "distribution": {
      "mean": 1500000,
      "std_dev": 300000,
      "percentiles": { ... }
    }
  },
  "execution_time_ms": 5000
}
```

#### Get Forecast Waterfall
```
GET /api/v1/models/variance/waterfall
```

**Query Parameters:**
- `current_snapshot_date` (date, optional): Current snapshot date (default: latest)
- `prior_snapshot_date` (date, optional): Prior snapshot date (default: previous)
- `group_by` (string, optional): `deal`, `stage`, `owner` (default: `deal`)

**Response:**
```json
{
  "current_snapshot_date": "2024-01-15",
  "prior_snapshot_date": "2024-01-01",
  "variance": {
    "total_change": 250000,
    "breakdown": [
      {
        "deal_id": 1,
        "deal_name": "Enterprise Deal A",
        "prior_amount": 500000,
        "current_amount": 600000,
        "change": 100000,
        "change_reason": "probability_increase"
      }
    ],
    "summary": {
      "increases": 300000,
      "decreases": -50000,
      "new_deals": 0,
      "lost_deals": 0
    }
  }
}
```

---

### Risk Analytics

#### Get Risk Heatmap
```
GET /api/v1/models/risk/heatmap
```

**Query Parameters:**
- `group_by_stage` (boolean, optional): Group by stage (default: true)
- `group_by_probability` (boolean, optional): Group by probability buckets (default: true)
- `min_deal_value` (number, optional): Filter minimum deal value

**Response:**
```json
{
  "heatmap": {
    "stages": ["proposal", "negotiation", "contracting", "closed"],
    "probability_buckets": ["0-25%", "25-50%", "50-75%", "75-100%"],
    "matrix": [
      {
        "stage": "proposal",
        "probability_range": "0-25%",
        "deal_count": 5,
        "total_value": 500000,
        "at_risk_value": 125000,
        "deals": [
          {
            "deal_id": 1,
            "deal_name": "Deal A",
            "value": 100000,
            "probability": 0.2
          }
        ]
      }
    ]
  },
  "top_risks": [
    {
      "deal_id": 1,
      "risk_score": 0.85,
      "risk_factors": ["low_probability", "high_value", "slippage_risk"]
    }
  ],
  "summary": {
    "total_at_risk": 1500000,
    "high_risk_count": 12,
    "medium_risk_count": 25
  }
}
```

---

### Data Ingestion

#### Sync from Strapi
```
POST /api/v1/models/ingest/strapi-sync
```

**Request Body:**
```json
{
  "entity_types": ["pipeline-deals", "billings"],
  "since": "2024-01-01T00:00:00.000Z",
  "full_sync": false
}
```

**Response:**
```json
{
  "status": "completed",
  "entities_synced": {
    "pipeline-deals": 150,
    "billings": 300
  },
  "sync_duration_ms": 2000
}
```

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "error": {
    "status": 400,
    "name": "ValidationError",
    "message": "Invalid request parameters",
    "details": {
      "field": "probability",
      "issue": "Value must be between 0 and 1"
    }
  }
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `422` - Unprocessable Entity (business logic error)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error
- `503` - Service Unavailable (maintenance mode)

---

## Rate Limiting

- **Strapi API**: 100 requests/minute per user
- **Predictive Service**: 50 requests/minute per user
- **Bulk Operations**: 10 requests/minute per user

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248000
```

---

## Webhooks

### Strapi → Predictive Service

**Endpoint:** `POST /api/v1/models/forecast/run` (webhook)

**Headers:**
```
X-Strapi-Event: entry.create|entry.update|entry.delete
X-Strapi-Entity: pipeline-deal
X-Strapi-Signature: <hmac_signature>
```

**Request Body:**
```json
{
  "event": "entry.update",
  "entity": "pipeline-deal",
  "entry": {
    "id": 1,
    "data": { ... }
  }
}
```

**Security:** Webhook requests must include valid HMAC signature in `X-Strapi-Signature` header.

