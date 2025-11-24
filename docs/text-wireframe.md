# Text Wireframe

```
[Top Nav]
--------------------------------------------------------------------------------
| Double V Dashboard Suite | [Pipeline Integrity] [Financials] [Executive Summary] |
| Filters: Month [dropdown]  Scenario [Base ▾]  Owner [All ▾]     [Export]        |
--------------------------------------------------------------------------------

PIPELINE INTEGRITY (Main View)
--------------------------------------------------------------------------------
| KPI Cards (row)                                                               |
| ---------------------------------------------------------------------------- |
| | Confirmed Revenue | Tentative Pipeline | Conversion Rate | Risk Exposure | |
| ---------------------------------------------------------------------------- |

| Stacked Area Trend (Confirmed vs Tentative by Month)                          |
| ---------------------------------------------------------------------------   |
| |                                                                           | |
| |                                                                           | |
| ---------------------------------------------------------------------------   |

| Waterfall – Forecast Change vs Last Snapshot                                 |
| ---------------------------------------------------------------------------   |
| |                                                                           | |
| ---------------------------------------------------------------------------   |

| Two Columns                                                                 |
| --------------------------------------------------------------------------- |
| | Risk Heatmap (Stage × Probability)    | Deals Table                        |
| |-------------------------------------- |----------------------------------- |
| | [Matrix with colored cells]           | Columns: Client, Deal, Stage,      |
| | Legend: Low ▢ Medium ▢ High           | Probability, Value, Risk Flag ▢    |
| |                                      | Actions: [Update] [Flag]           |
| --------------------------------------------------------------------------- |

| Alerts Panel (bottom)                                                        |
| --------------------------------------------------------------------------- |
| | ⚠ Deal XYZ slipped one month – review milestone schedule.                 |
| | ⚠ Deal ABC >50% probability drop – escalate to owner.                     |
| --------------------------------------------------------------------------- |


FINANCIALS (Secondary View)
--------------------------------------------------------------------------------
| KPI Cards: Billed YTD | Collected YTD | Outstanding AR | Gross Margin        |
--------------------------------------------------------------------------------
| Cash Flow Chart (line / bars by month)                                       |
| Receivables Aging Table (0-30, 31-60, 61-90, 90+)                            |
| Scenario Toggle Buttons (Base / Best / Worst) tied to forecast API           |
| Margin by Segment Bar Chart                                                  |


EXECUTIVE SUMMARY (Snapshot View)
--------------------------------------------------------------------------------
| Hero Statement: “Base forecast: 185M THB with 38M at risk”                   |
| Three Narrative Cards (Outlook, Risks, Actions)                              |
| Compact Tables                                                               |
|  - Top 5 At-Risk Deals (Probability, Value, Owner, Action)                   |
|  - Carryover Impact (Project, Amount, Next-Year Timing)                      |
| Download Buttons: [PDF Report] [CSV Summary]                                 |
--------------------------------------------------------------------------------

SIDE PANEL (Optional fly-out)
--------------------------------------------------------------------------------
| Scenario Notes                                                               |
| - Probability adjustments                                                    |
| - Model assumptions                                                          |
| Activity Log                                                                 |
| - “User A updated Deal XYZ probability to 60%”                               |
--------------------------------------------------------------------------------
```


