# Visual Scope

## Entity Relationship Overview

```mermaid
erDiagram
    CLIENT ||--o{ PROJECT : hosts
    PROJECT ||--o{ PIPELINE_DEAL : contains
    PIPELINE_DEAL ||--o{ DEAL_MILESTONE : schedules
    DEAL_MILESTONE ||--o{ BILLING : invoices
    PIPELINE_DEAL ||--o{ FORECAST_SNAPSHOT : records
    PIPELINE_DEAL ||--o{ RISK_FLAG : flags
    USER ||--o{ PIPELINE_DEAL : owns
    USER ||--o{ RISK_FLAG : manages

    CLIENT {
      uuid client_id
      string name
      string segment
      string region
      uuid account_owner_id
    }

    PROJECT {
      uuid project_id
      uuid client_id
      string name
      string type
      string status
      int complexity_score
    }

    PIPELINE_DEAL {
      uuid deal_id
      uuid project_id
      string stage
      string status
      float probability
      decimal deal_value
      date expected_close_date
      date recognition_start_month
      date recognition_end_month
    }

    DEAL_MILESTONE {
      uuid milestone_id
      uuid deal_id
      int sequence_order
      date scheduled_date
      decimal amount
    }

    BILLING {
      uuid billing_id
      uuid milestone_id
      uuid deal_id
      date invoice_date
      decimal amount
      date collected_date
    }

    FORECAST_SNAPSHOT {
      uuid snapshot_id
      uuid deal_id
      date snapshot_date
      string scenario
      float probability
      decimal expected_amount
      date expected_month
    }

    RISK_FLAG {
      uuid flag_id
      uuid deal_id
      string category
      string severity
      string status
    }

    USER {
      uuid user_id
      string name
      string role
    }
```

## Data Flow Sequence (Forecast Recompute)

```mermaid
sequenceDiagram
    participant FE as Next.js Frontend
    participant STRAPI as Strapi CMS
    participant PY as Python Predictive Service
    participant DB as PostgreSQL

    FE->>STRAPI: PATCH /pipeline-deals/:id (update status/probability)
    STRAPI-->>DB: Persist deal update
    STRAPI->>PY: POST /models/forecast/run (webhook)
    PY->>STRAPI: GET /pipeline-deals?filters[...] (fetch latest data)
    PY->>DB: (optional direct read replicas)
    PY-->>PY: Run probability model & simulations
    PY->>STRAPI: POST /forecast-snapshots (write results)
    FE->>STRAPI: GET /forecast-snapshots?scenario=base
    STRAPI-->>FE: Updated forecast dataset
```

## Dashboard Data Retrieval Sequence

```mermaid
sequenceDiagram
    participant USER as Exec User
    participant FE as Next.js Frontend
    participant STRAPI as Strapi CMS
    participant PY as Predictive Service

    USER->>FE: Open /pipeline-integrity
    FE->>STRAPI: GET /pipeline-deals?populate=milestones,riskFlags
    STRAPI-->>FE: Deal + milestone data
    FE->>PY: GET /models/risk/heatmap
    PY-->>FE: Risk heatmap dataset
    FE->>STRAPI: GET /forecast-snapshots?scenario=base
    STRAPI-->>FE: Snapshot timeline
    FE-->>USER: Render stacked area, waterfall, heatmap, tables
```

## Integration Notes
- Mermaid diagrams illustrate relationships and sequences; adjust attributes as schema evolves.
- Forecast recompute path highlights webhook-triggered model execution.
- Dashboard retrieval flow separates Strapi CRUD data from predictive analytics endpoints.
- **For complete API endpoint specifications, see [`api-specification.md`](./api-specification.md).**

