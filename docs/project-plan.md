# Project Plan

## End-to-End Steps

1. **Data & Requirements Refinement**
   - Validate field definitions for all content types (clients, deals, milestones, etc.).
   - Confirm probability rules, scenario assumptions, and risk categories with stakeholders.
   - **Owner:** Product Lead with Finance Stakeholder
   - **Dependencies:** None

2. **Backend Setup (Strapi + PostgreSQL)**
   - Scaffold Strapi project and configure database connection.
   - Implement content types, relations, and role-based permissions.
   - Seed initial datasets for demo (clients, deals, snapshots).
   - **Owner:** Backend Engineer
   - **Dependencies:** Phase 1 approved requirements

3. **Predictive Service Foundation (Python)**
   - Stand up FastAPI/Flask project with core structure.
   - Create ingestion layer to pull data from Strapi.
   - Define endpoints: base forecast, scenario, risk heatmap, waterfall, recompute hook.
   - **Owner:** ML/Platform Engineer
   - **Dependencies:** Phase 1 requirements, Phase 2 Strapi API contract

4. **Model Development**
   - Prototype probability logic and Monte Carlo simulations.
   - Calibrate models with historical billing data.
   - Automate snapshot writing and webhook-triggered recompute.
   - **Owner:** Data Scientist
   - **Dependencies:** Phase 3 service scaffolding and data access

5. **Frontend Infrastructure (Next.js)**
   - Configure routing, layouts, and authentication flow.
   - Build API layer for Strapi and predictive service.
   - Create shared chart components (stacked area, waterfall, heatmap, tables).
   - **Owner:** Frontend Lead
   - **Dependencies:** Phases 2–3 API availability (mock responses acceptable initially)

6. **Dashboard Implementation**
   - Pipeline Integrity dashboard with KPIs, charts, filters.
   - Financials dashboard with cash flow, receivables, scenario toggle.
   - Executive Summary page with narrative cards and export actions.
   - **Owner:** Frontend Lead with UX Designer
   - **Dependencies:** Phase 5 infrastructure, Phase 4 initial model outputs

7. **Integration & Workflow Features**
   - Wire Strapi webhooks to predictive service recompute endpoint.
   - Implement status updates, risk flag management, snapshot overrides.
   - Add nightly batch job and optional notifications.
   - **Owner:** Integration Engineer
   - **Dependencies:** Phases 2–4 services, Phase 6 UI touchpoints

8. **Testing & Validation**
   - Unit/integration tests for APIs and model outputs.
   - Frontend acceptance tests using seeded data.
   - Stakeholder review sessions for feedback and approval.
   - **Owner:** QA Lead with Product Lead
   - **Dependencies:** Phases 2–7 feature completion

9. **Documentation & Demo Preparation**
   - Refresh scope docs, diagrams, and usage guides in `/docs`.
   - Prepare curated demo dataset and walkthrough script.
   - Package or deploy demo environment.
   - **Owner:** Product Operations
   - **Dependencies:** Phase 8 sign-off

10. **Deployment & Handover**
    - Set up CI/CD pipelines for Strapi, Python service, and Next.js app.
    - Configure monitoring, health checks, and backups.
    - Train end users, deliver documentation, and transition to operations.
    - **Owner:** DevOps Lead
    - **Dependencies:** Phase 9 final documentation and demo approval

