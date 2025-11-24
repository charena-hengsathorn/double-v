# Tech Scope Overview

## Stack Summary
- **Frontend**: React + Next.js for routing, shared layouts, and reusable data visualizations.
- **Backend CMS**: Strapi as headless API for pipeline data, forecasting metadata, and role-based permissions.
- **Predictive Services**: Python (FastAPI/Flask) for forecast modeling, scenario simulations, and risk analytics.
- **Database**: PostgreSQL managed via Strapi; materialized views for performance-sensitive aggregates.

## Architecture & Data Flow
1. Strapi stores source-of-truth entities (clients, projects, pipeline deals, milestones, billings, snapshots, risk flags).
2. Python predictive service pulls data from Strapi, computes forecasts (base, scenario, risk metrics), and returns results via REST endpoints or writes back snapshots.
3. Next.js frontends fetch Strapi + predictive outputs to render dashboards; scenario selections trigger API calls to Python service.
4. Nightly batch jobs (Python) refresh forecasts and snapshots, keeping demo data current.

## Strapi Content Types (Tables)
- `Client`: client_id, name, segment, region.
- `Project`: project_id, client (relation), type, complexity_score.
- `PipelineDeal`: deal_id, project (relation), stage, status, probability, deal_value, currency, expected_close_date, recognition_window, owner, notes.
- `DealMilestone`: milestone_id, deal (relation), sequence, description, scheduled_date, amount, recognition_rule.
- `ForecastSnapshot`: snapshot_date, deal (relation), stage, probability, expected_recognition_month, expected_amount, scenario_label.
- `Billing`: billing_id, deal (relation), invoice_date, amount, collected_date, recognition_month.
- `RiskFlag`: flag_id, deal (relation), category, severity, owner, status, comment.
- `User`: user_id, name, role (sales, finance, exec).

## Predictive Service Endpoints

**Note:** For complete API specification, see [`api-specification.md`](./api-specification.md).

Standardized endpoints (base path: `/api/v1`):
- `GET /api/v1/models/forecast/base`: probability-weighted revenue outlook; returns monthly totals by confidence tier.
- `POST /api/v1/models/forecast/run`: trigger forecast recompute (webhook or scheduled job).
- `GET /api/v1/models/forecast/scenario/:scenario_id`: get scenario forecast (base/best/worst).
- `POST /api/v1/models/forecast/simulate`: run Monte Carlo simulations.
- `GET /api/v1/models/risk/heatmap`: aggregates deals by stage × probability; includes top at-risk list.
- `GET /api/v1/models/variance/waterfall`: compares current snapshot vs. prior snapshot for change analysis.
- `POST /api/v1/models/ingest/strapi-sync`: sync data from Strapi (webhook or scheduled job).
- `GET /api/v1/health`: health check endpoint.

## Frontend Routes & Views
- `/pipeline-integrity`
  - KPI header (confirmed revenue, tentative pipeline, expected conversion rate).
  - Stacked area chart (confirmed vs tentative by month).
  - Forecast waterfall showing delta vs previous snapshot.
  - Risk heatmap (stage × probability) and deal table with filters/flags.
- `/financials`
  - Cash flow chart (billed vs collected).
  - Receivables aging table and margin summary.
  - Scenario toggle connected to predictive service outputs.
- `/executive-summary`
  - Narrative cards summarizing outlook, risks, and recommended actions.
  - Compact tables (top at-risk deals, carryover impacts) with export option.

## Demo Readiness Checklist
- Seed Strapi with sample clients, deals, milestones, billings, and snapshots.
- Implement API connectors in Next.js for Strapi and predictive service.
- Build reusable chart components (stacked area, waterfall, heatmap, funnel).
- Wire scenario toggles to predictive endpoints; handle loading states.
- Provide export functionality (CSV/PDF) for executive summary.
- Set up nightly forecast recompute job and notification hooks (optional).

## Data Model Brainstorm
- **Client**: `client_id`, `name`, `segment`, `region`, `account_owner_id`, `lifetime_value`, timestamps. Relations to projects and deals; optional many-to-many tags.
- **Project**: `project_id`, `client_id`, `name`, `type`, `status`, `complexity_score`, `start_date`, `end_date`, `notes`.
- **PipelineDeal**: `deal_id`, `project_id`, `stage`, `status`, `probability`, `deal_value`, `currency`, `expected_close_date`, `recognition_start_month`, `recognition_end_month`, `sales_owner_id`, `delivery_owner_id`, `source_channel`, `confidence_override`, `last_activity_at`, `forecast_notes`.
- **DealMilestone**: `milestone_id`, `deal_id`, `sequence_order`, `name`, `scheduled_date`, `amount`, `recognition_month`, `billing_type`, `collection_terms`.
- **ForecastSnapshot**: `snapshot_id`, `deal_id`, `snapshot_date`, `scenario`, `probability`, `expected_amount`, `expected_month`, `expected_margin`, `model_version`, `author_id`.
- **Billing**: `billing_id`, `deal_id`, `milestone_id`, `invoice_number`, `invoice_date`, `amount`, `currency`, `collected_date`, `recognition_month`, `status`, `payment_reference`.
- **RiskFlag**: `flag_id`, `deal_id`, `category`, `severity`, `description`, `owner_id`, `created_at`, `resolved_at`, `resolution_notes`.
- **User**: `user_id`, `name`, `email`, `role`, `team`, `active`.
- Optional lookup/support tables: `Stage`, `ProbabilityRule`, `ScenarioPreset`, `Tag`, `ActivityLog`.

## API Endpoints

**For complete API specification with request/response formats, authentication, error handling, and examples, see [`api-specification.md`](./api-specification.md).**

### Strapi CMS (Base Path: `/api`)
- **Clients:** `GET /api/clients`, `POST /api/clients`, `GET /api/clients/:id`, `PATCH /api/clients/:id`, `DELETE /api/clients/:id`
- **Projects:** `GET /api/projects`, `POST /api/projects`, `PATCH /api/projects/:id`, `DELETE /api/projects/:id`
- **Pipeline Deals:** `GET /api/pipeline-deals` (with filters), `POST /api/pipeline-deals`, `PATCH /api/pipeline-deals/:id`, `DELETE /api/pipeline-deals/:id`
- **Deal Milestones:** `GET /api/deal-milestones`, `POST /api/deal-milestones`, `PATCH /api/deal-milestones/:id`
- **Forecast Snapshots:** `GET /api/forecast-snapshots` (filter by scenario), `POST /api/forecast-snapshots` (bulk create supported)
- **Billings:** `GET /api/billings`, `POST /api/billings`, `PATCH /api/billings/:id`
- **Risk Flags:** `GET /api/risk-flags`, `POST /api/risk-flags`, `PATCH /api/risk-flags/:id`
- **Authentication:** `POST /api/auth/local` (login), `GET /api/users/me` (current user)

### Predictive Python Service (Base Path: `/api/v1`)
- **Forecast:** `GET /api/v1/models/forecast/base`, `POST /api/v1/models/forecast/run`, `GET /api/v1/models/forecast/scenario/:scenario_id`, `POST /api/v1/models/forecast/simulate`
- **Risk Analytics:** `GET /api/v1/models/risk/heatmap`
- **Variance Analysis:** `GET /api/v1/models/variance/waterfall`
- **Data Ingestion:** `POST /api/v1/models/ingest/strapi-sync`
- **Health:** `GET /api/v1/health`

