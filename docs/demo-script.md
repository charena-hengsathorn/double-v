# Double V Dashboard - Demo Script

## Pre-Demo Checklist

- [ ] All services are running (Strapi, Predictive Service, Frontend)
- [ ] Strapi permissions are configured
- [ ] Sample data is loaded (optional but recommended)
- [ ] Browser is open to http://localhost:3000

## Demo Flow (10-15 minutes)

### 1. Introduction (1 minute)

**Say**: "Today I'll show you the Double V Dashboard, an executive dashboard suite for revenue forecasting and pipeline management. It provides three main views: Pipeline Integrity, Financials, and Executive Summary."

**Show**: Homepage with three dashboard cards

### 2. Pipeline Integrity Dashboard (3-4 minutes)

**Navigate to**: Pipeline Integrity

**Say**: "The Pipeline Integrity dashboard helps monitor conversion health and identify risk exposure."

**Demonstrate**:
1. **KPI Cards**: "These cards show our total forecast, confirmed revenue, tentative revenue, and conversion rate."
2. **Scenario Toggle**: "We can switch between base, best, and worst case scenarios to understand different outcomes."
   - Toggle between scenarios
   - Show how the chart updates
3. **Revenue Outlook Chart**: "This stacked area chart shows monthly revenue distribution across the forecast period."
   - Point out confirmed vs tentative revenue
   - Explain confidence tiers
4. **Risk Heatmap**: "The risk heatmap groups deals by stage and probability, helping us identify high-risk areas."
   - Point out high-risk cells
   - Explain the color coding

### 3. Financials Dashboard (3-4 minutes)

**Navigate to**: Financials

**Say**: "The Financials dashboard evaluates cash flow and provides insights into our revenue outlook."

**Demonstrate**:
1. **KPI Cards**: "We can see billed YTD, collected YTD, outstanding accounts receivable, and total forecast."
2. **Revenue Forecast Chart**: "This shows our projected revenue over the next 12 months."
3. **Forecast Waterfall**: "The waterfall chart compares our current forecast snapshot to a prior snapshot, showing what changed and why."
   - Explain variance breakdown
   - Show increases vs decreases

### 4. Executive Summary (2-3 minutes)

**Navigate to**: Executive Summary

**Say**: "The Executive Summary provides rapid, high-level insights for strategic decision-making."

**Demonstrate**:
1. **Overall Revenue Outlook**: "At the top, we see our total forecast with the amount at risk."
2. **KPI Cards**: "Key metrics at a glance: total forecast, total at risk, and high-risk deal count."
3. **Top At-Risk Deals**: "This list highlights deals that require immediate attention."
   - Review a few high-risk deals
   - Explain risk factors

### 5. Data Management (2-3 minutes)

**Navigate to**: Strapi Admin (http://localhost:1337/admin)

**Say**: "All data is managed through Strapi, our headless CMS."

**Demonstrate**:
1. **Content Types**: Show the different content types (Clients, Projects, Pipeline Deals, etc.)
2. **Create a Deal**: "Let me show you how easy it is to add a new pipeline deal."
   - Create a sample deal
   - Show how it appears in the dashboard
3. **Real-time Updates**: "When we update data in Strapi, the predictive service automatically recomputes forecasts."

### 6. Q&A and Wrap-up (2-3 minutes)

**Say**: "The dashboard is fully functional and ready for use. All services are deployed and can be accessed via the production URLs."

**Key Points to Emphasize**:
- Real-time data synchronization
- Multiple scenario analysis
- Risk identification and management
- Comprehensive financial insights
- Easy data management through Strapi

## Sample Data Suggestions

For a compelling demo, create:

1. **3-5 Clients** with different segments
2. **10-15 Pipeline Deals** across different stages:
   - 2-3 in prospecting (low probability)
   - 3-4 in qualification (medium probability)
   - 3-4 in proposal (medium-high probability)
   - 2-3 in negotiation (high probability)
   - 1-2 closed-won
3. **5-10 Billing Records** with various statuses
4. **2-3 Risk Flags** on high-value deals

## Troubleshooting During Demo

If something doesn't work:

1. **No Data Showing**: 
   - Check Strapi permissions
   - Verify services are running
   - Check browser console

2. **Charts Not Loading**:
   - Refresh the page
   - Check API endpoints are responding

3. **404 Errors**:
   - Verify Strapi permissions
   - Check service logs

## Post-Demo

- Provide access to documentation
- Share production URLs
- Offer to set up additional sample data
- Schedule follow-up for questions





