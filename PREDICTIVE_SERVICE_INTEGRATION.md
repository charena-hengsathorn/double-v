# Predictive Service Integration with Current Data

## Current Situation

### What the Predictive Service Expects:
The predictive service is designed to work with **Pipeline Deals** - prospective deals that haven't closed yet. It needs:

1. **Pipeline Deals** with fields:
   - `deal_value` - Expected deal value
   - `probability` - Probability of closing (0-100%)
   - `stage` - Pipeline stage (prospecting, qualification, proposal, negotiation, closed-won)
   - `recognition_start_month` - When revenue recognition starts (YYYY-MM-DD)
   - `recognition_end_month` - When revenue recognition ends (YYYY-MM-DD)
   - `status` - "active" or "inactive"

2. **Forecast Snapshots** - Historical snapshots of forecasts for comparison

### What We Currently Have:
- **Sales Data** (Construction, Interior Design, Loose Furniture):
  - `sale_amount` - Actual sale amount
  - `construction_cost` / `cost` - Cost
  - `project_profit` / `profit` - Profit
  - `sale_date` - When the sale occurred
  - `status` - Confirmed/Pending/Closed
  - `client` - Client name

- **Billings Data** (Construction, Interior Design, Loose Furniture):
  - `amount` - Billing amount
  - `invoice_date` - When invoiced
  - `collected_date` - When payment collected
  - `status` - sent/collected/overdue
  - `month` / `year` - Billing period

## The Gap

The predictive service is designed for **forward-looking forecasting** (predicting future revenue from pipeline deals), but our current data is **backward-looking** (actual sales and billings that have already occurred).

## Solutions

### Option 1: Create Pipeline Deals from Sales Data (Recommended for Quick Start)

Convert existing sales data into pipeline deals format:

**Implementation Steps:**
1. Create a mapping service that converts sales to pipeline deals
2. For "Pending" sales, treat them as pipeline deals with:
   - `deal_value` = `sale_amount`
   - `probability` = Based on status (Pending = 50%, Confirmed = 100%)
   - `stage` = "negotiation" for Pending, "closed-won" for Confirmed
   - `recognition_start_month` = Next month or based on project timeline
   - `recognition_end_month` = Estimated project completion

**Pros:**
- Quick to implement
- Uses existing predictive service code
- Can work with current sales data

**Cons:**
- Not true pipeline forecasting (these are already sales)
- Limited predictive value

### Option 2: Create New Forecast Service Using Sales/Billings Data (Better Long-term)

Build a new forecasting model that uses historical sales and billings to predict future revenue:

**Implementation Steps:**
1. Create `sales_based_forecast_service.py` that:
   - Analyzes historical sales patterns
   - Uses billings data to predict future cash flow
   - Projects revenue based on:
     - Average sales per month
     - Seasonal trends
     - Client repeat business patterns
     - Project completion timelines

2. Key calculations:
   - **Revenue Forecast**: Based on historical sales trends
   - **Cash Flow Forecast**: Based on billing patterns and collection times
   - **Profit Forecast**: Based on historical profit margins

**Pros:**
- More accurate for actual business operations
- Uses real historical data
- Better for financial planning

**Cons:**
- Requires new code development
- More complex implementation

### Option 3: Hybrid Approach (Best Solution)

Combine both approaches:

1. **For Confirmed Sales**: Use billings data to forecast cash flow
2. **For Pending Sales**: Treat as pipeline deals for forecasting
3. **For Future Planning**: Create actual pipeline deals in Strapi for new opportunities

**Implementation:**
- Modify `forecast_service.py` to:
  - Check for pipeline deals first
  - If no pipeline deals, use sales/billings data
  - Combine both sources for comprehensive forecast

## Required Changes

### 1. Update Forecast Service to Use Sales/Billings Data

**File**: `project/predictive-service/app/forecast_service.py`

Add new method:
```python
async def compute_sales_based_forecast(
    self,
    start_month: Optional[date] = None,
    end_month: Optional[date] = None,
    currency: str = "THB"
) -> Dict[str, Any]:
    """Compute forecast based on historical sales and billings"""
    # Fetch all sales data
    all_sales = await self.strapi.get_all_sales()
    
    # Fetch all billings data
    all_billings = await self.strapi.get_all_billings()
    
    # Analyze patterns and project future revenue
    # ... implementation
```

### 2. Update Main API Endpoints

**File**: `project/predictive-service/app/main.py`

Modify `/api/v1/models/forecast/base` to:
- First try to get pipeline deals
- If no pipeline deals, fall back to sales-based forecast
- Combine both if available

### 3. Create Sales-to-Pipeline Converter (Optional)

**New File**: `project/predictive-service/app/sales_to_pipeline.py`

```python
async def convert_sales_to_pipeline_deals(sales_data: List[Dict]) -> List[Dict]:
    """Convert sales data to pipeline deals format"""
    pipeline_deals = []
    for sale in sales_data:
        attrs = sale.get("attributes", sale)
        if attrs.get("status") == "Pending":
            pipeline_deals.append({
                "deal_value": attrs.get("sale_amount", 0),
                "probability": 50,  # Pending = 50% probability
                "stage": "negotiation",
                "recognition_start_month": calculate_start_month(attrs),
                "recognition_end_month": calculate_end_month(attrs),
                "status": "active"
            })
    return pipeline_deals
```

## Immediate Action Items

### Priority 1: Make Forecast Service Work with Current Data

1. **Modify `forecast_service.py`**:
   - Add fallback to use sales data when no pipeline deals exist
   - Create sales-based forecast calculation
   - Use billings data for cash flow projections

2. **Update API endpoints**:
   - `/api/v1/models/forecast/base` - Use sales data if no pipeline deals
   - `/api/v1/models/risk/heatmap` - Use sales data for risk analysis

### Priority 2: Create Pipeline Deals Content Type in Strapi

If you want true pipeline forecasting:
1. Ensure `pipeline-deals` content type exists in Strapi
2. Add required fields:
   - deal_value (Number)
   - probability (Number, 0-100)
   - stage (Enum: prospecting, qualification, proposal, negotiation, closed-won)
   - recognition_start_month (Date)
   - recognition_end_month (Date)
   - status (Enum: active, inactive)

### Priority 3: Data Migration/Conversion

1. Convert existing "Pending" sales to pipeline deals
2. Set up webhook to automatically create pipeline deals from new sales
3. Create forecast snapshots from historical data

## Testing Checklist

- [ ] Verify sales data is accessible via Strapi API
- [ ] Test forecast service with sales data
- [ ] Verify billings data can be used for cash flow
- [ ] Test risk heatmap with sales data
- [ ] Verify dashboard displays forecast correctly
- [ ] Test with empty data (graceful fallback)

## Code Changes Needed

### Files to Modify:

1. **`project/predictive-service/app/forecast_service.py`**
   - Add `compute_sales_based_forecast()` method
   - Modify `compute_base_forecast()` to use sales data as fallback

2. **`project/predictive-service/app/main.py`**
   - Update forecast endpoints to handle sales data
   - Add new endpoint for sales-based forecasts

3. **`project/predictive-service/app/strapi_client.py`**
   - Already has methods to fetch sales/billings ✅
   - May need to add date filtering

### New Files to Create:

1. **`project/predictive-service/app/sales_forecast_service.py`** (Optional)
   - Dedicated service for sales-based forecasting
   - Time series analysis
   - Trend projection

## Environment Variables

Ensure these are set in Heroku:
- `STRAPI_URL` ✅ (already set)
- `STRAPI_API_TOKEN` ✅ (already set)

## Next Steps

1. **Immediate**: Modify forecast service to use sales/billings data when pipeline deals are unavailable
2. **Short-term**: Create sales-based forecast calculations
3. **Long-term**: Set up proper pipeline deals in Strapi for true forecasting

