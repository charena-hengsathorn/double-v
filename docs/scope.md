# Executive Dashboard Scope

## Vision
Deliver two focused dashboards backed by a shared predictive revenue model:
- **Pipeline Integrity app** to monitor conversion health and risk exposure.
- **Financials app** to evaluate cash flow and overall revenue outlook.

## Objectives
- Translate current-year billing into next-year revenue projections.
- Quantify risk by probability-weighting “to be confirm” deals and monitoring slippage.
- Provide executives with rapid insight via a concise summary report.

## Dashboard Concepts
- **Revenue Outlook (stacked area)**: monthly totals with confirmed vs. tentative bands.
- **Forecast Waterfall**: shows how deal movements change the latest projection.
- **Conversion Risk Heatmap**: stage × probability view highlighting at-risk revenue.
- **Stage Funnel & Alerts**: track counts/values per stage, surface overdue updates.
- **Scenario Toggles**: best/base/worst cases driven by probability assumptions.
- **Financials Page**: cash flow timing, billed vs. collected view, receivables, margins.

## Predictive Model Notes
- Inputs: historical billings, planned monthly amounts, current pipeline attributes.
- Outputs: expected revenue timing, probability-weighted totals, scenario analysis.
- Techniques: stage-based probability rules plus Monte Carlo for high-value deals.

## Deal Attributes (Data Fields)
- Lifecycle: stage, status, probability, expected close date, recognition window, last activity.
- Commercials: deal value, billing milestones, payment terms, currency, margin estimate.
- Client context: client segment, region, account owner, historic conversion rate.
- Delivery risk: resource readiness, complexity score, dependency flags, prior slippage.
- Metadata: responsible exec, forecast notes, risk flags.

## Data Model (Initial Tables)
- **clients**: `client_id`, name, segment, region.
- **projects**: `project_id`, `client_id`, name, type, complexity_score.
- **pipeline_deals**: `deal_id`, `project_id`, stage, status, probability, deal_value, currency, expected_close_date, expected_recognition_start, expected_recognition_end, owner_id, notes.
- **deal_milestones**: `milestone_id`, `deal_id`, sequence, description, scheduled_date, amount, recognition_rule.
- **forecast_snapshots**: snapshot_date, `deal_id`, stage, probability, expected_recognition_month, expected_amount.
- **billings**: `billing_id`, `deal_id`, invoice_date, amount, collected_date, recognition_month.
- **users**: `user_id`, name, role.
- **risk_flags** (optional): `flag_id`, `deal_id`, category, severity, owner, status.

## Input Interfaces
- Deal creation/edit form covering lifecycle, commercial, and risk data.
- Milestone schedule editor (grid view).
- Probability & forecast override panel writing to snapshots.
- Status update actions (stage changes, confirm toggles).
- Risk flag capture/resolution workflow.
- Financial data entry/import for billings and collections.

## Executive Summary Deliverable
- Top-line metrics: confirmed revenue, to-be-confirmed pipeline, base-case projection.
- Risk posture: quantified exposure, timing concentration, top at-risk deals.
- Operational focus: priority actions to accelerate, mitigate slippage, or diversify.
- Appendices: confirmed schedule, unconfirmed pipeline table with probabilities, carryover impact analysis.

