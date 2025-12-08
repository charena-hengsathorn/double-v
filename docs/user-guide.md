# Double V Dashboard - User Guide

## Overview

The Double V Dashboard is an executive dashboard suite for revenue forecasting and pipeline management. It provides three main views:

1. **Pipeline Integrity** - Monitor conversion health and risk exposure
2. **Financials** - Evaluate cash flow and overall revenue outlook
3. **Executive Summary** - Rapid insight via concise summary

## Getting Started

### Accessing the Dashboard

- **Local Development**: http://localhost:3000
- **Production**: https://double-v-frontend.vercel.app

### First-Time Setup

1. **Configure Strapi Permissions** (Required for data access):
   - Open Strapi Admin: http://localhost:1337/admin (or production URL)
   - Navigate to: Settings → Users & Permissions Plugin → Roles → Public
   - Enable all permissions for all content types:
     - Client
     - Project
     - Pipeline Deal
     - Deal Milestone
     - Forecast Snapshot
     - Billing
     - Risk Flag
   - Click Save

2. **Add Sample Data** (Optional):
   - Use Strapi admin panel to create sample clients, deals, and billings
   - Data will automatically appear in dashboards

## Dashboard Features

### Pipeline Integrity Dashboard

**Purpose**: Monitor conversion health, identify bottlenecks, and assess risk exposure.

**Features**:
- **KPI Cards**: Total Forecast, Total Confirmed, Total Tentative, Conversion Rate
- **Revenue Outlook Chart**: Stacked area chart showing monthly revenue by scenario
- **Risk Heatmap**: Visual representation of deals grouped by stage and probability
- **Scenario Toggle**: Switch between base, best, and worst case scenarios

**How to Use**:
1. Navigate to Pipeline Integrity from the homepage
2. Use the scenario toggle to view different forecast scenarios
3. Review the risk heatmap to identify high-risk deals
4. Examine monthly totals to understand revenue distribution

### Financials Dashboard

**Purpose**: Evaluate cash flow, track receivables, and gain insights into overall revenue outlook.

**Features**:
- **KPI Cards**: Billed YTD, Collected YTD, Outstanding A/R, Total Forecast
- **Revenue Forecast Chart**: Monthly revenue projections
- **Forecast Waterfall**: Comparison of current vs. prior snapshot showing variance

**How to Use**:
1. Navigate to Financials from the homepage
2. Review YTD metrics to understand current financial position
3. Examine the forecast chart for future revenue outlook
4. Use the waterfall chart to understand forecast changes over time

### Executive Summary Dashboard

**Purpose**: Get rapid, high-level insights into key metrics, risks, and recommended actions.

**Features**:
- **Overall Revenue Outlook**: Total forecast with at-risk amount
- **KPI Cards**: Total Forecast, Total At Risk, High Risk Deals count
- **Top At-Risk Deals**: List of deals requiring attention

**How to Use**:
1. Navigate to Executive Summary from the homepage
2. Review overall revenue outlook at the top
3. Examine KPI cards for key metrics
4. Review top at-risk deals list for immediate action items

## Scenarios

The dashboard supports multiple forecast scenarios:

- **Base**: Standard forecast using current probabilities
- **Best Case**: Optimistic scenario with adjusted probabilities
- **Worst Case**: Pessimistic scenario with adjusted probabilities
- **Custom**: User-defined scenarios (coming soon)

## Data Management

### Adding Data via Strapi

1. Log into Strapi Admin panel
2. Navigate to Content Manager
3. Select the content type (Client, Project, Pipeline Deal, etc.)
4. Click "Create new entry"
5. Fill in required fields
6. Click Save and Publish

### Data Sync

- Data syncs automatically when changes are made in Strapi
- Predictive service recomputes forecasts on webhook triggers
- Frontend refreshes data on page load

## Troubleshooting

### No Data Showing

1. **Check Strapi Permissions**: Ensure public role has all permissions enabled
2. **Verify Services**: Confirm all services are running:
   - Strapi: http://localhost:1337/admin
   - Predictive Service: http://localhost:8000/api/v1/health
   - Frontend: http://localhost:3000
3. **Check Browser Console**: Look for API errors in browser developer tools

### Charts Not Rendering

- Ensure JavaScript is enabled
- Check browser console for errors
- Try refreshing the page
- Clear browser cache if needed

### 404 Errors

- Verify all services are running
- Check that Strapi permissions are configured
- Review service logs for errors

## Support

For technical issues or questions:
- Review the [Troubleshooting Guide](./troubleshooting.md)
- Check the [API Specification](./api-specification.md)
- Review service logs in terminal

## Best Practices

1. **Regular Data Updates**: Keep pipeline deals and billings up to date in Strapi
2. **Review Scenarios**: Regularly review different forecast scenarios to understand risk
3. **Monitor Risk Flags**: Pay attention to high-risk deals identified in the heatmap
4. **Export Data**: Use export functionality (coming soon) to share insights with stakeholders



