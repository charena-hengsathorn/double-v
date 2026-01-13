# Phase 5: Model Development & Calibration Summary

## ✅ Completed Implementation

### 1. Probability Model (`app/probability_model.py`)

**Stage-Based Probability Rules:**
- Default probabilities by stage:
  - Prospecting: 10%
  - Qualification: 25%
  - Proposal: 50%
  - Negotiation: 75%
  - Closed-Won: 100%
  - Closed-Lost: 0%

**Probability Adjustments:**
- High value deals (>1M): +5%
- Low activity (>30 days): -10%
- High severity risk flags: -15%
- Repeat clients: +10%
- High complexity (score ≥8): -5%

**Features:**
- `get_base_probability(stage)` - Get base probability for a stage
- `adjust_probability()` - Apply adjustments based on deal attributes
- `compute_deal_probability()` - Compute final probability with overrides
- `get_scenario_probability()` - Get probability for different scenarios (base/best/worst)

### 2. Monte Carlo Simulation (`app/monte_carlo.py`)

**Simulation Capabilities:**
- Single deal outcome simulation
- Portfolio-level simulation
- Revenue timing distribution simulation

**Features:**
- `simulate_deal_outcome()` - Simulate individual deal with probability
- `simulate_portfolio()` - Simulate multiple deals with confidence intervals
- `simulate_with_timing()` - Simulate with monthly revenue distribution
- Statistical outputs: mean, std dev, percentiles, confidence intervals

**Outputs:**
- Expected value
- Confidence intervals (50%, 80%, 95%)
- Distribution statistics (mean, std dev, percentiles)
- Min/max values

### 3. Model Calibration (`app/model_calibration.py`)

**Calibration Features:**
- Historical conversion rate analysis by stage
- Stage probability calibration from historical data
- Model validation using calibration curves
- Comprehensive calibration reports

**Features:**
- `analyze_historical_conversion()` - Analyze conversion rates by stage
- `calibrate_stage_probabilities()` - Calibrate probabilities from historical data
- `validate_model_performance()` - Validate using calibration curves
- `generate_calibration_report()` - Generate comprehensive reports with recommendations

**Calibration Process:**
1. Analyze historical deals and billings
2. Calculate conversion rates by stage
3. Weight historical data with defaults (smoothing)
4. Generate calibrated probabilities
5. Provide recommendations for model improvement

### 4. Updated API Endpoints

**Enhanced Endpoints:**
- `POST /api/v1/models/forecast/simulate` - Now uses actual Monte Carlo simulation
- `GET /api/v1/models/forecast/scenario/{scenario_id}` - Applies scenario probability adjustments
- `POST /api/v1/models/calibrate` - New endpoint for model calibration
- `GET /api/v1/models/calibration/status` - New endpoint for calibration status

**Integration:**
- Forecast service now uses probability model for adjustments
- Monte Carlo simulation integrated with probability model
- Scenario forecasts apply probability multipliers

## Model Features

### Probability Computation Flow
1. Start with base probability (from stage or explicit value)
2. Apply confidence override if available
3. Adjust based on deal attributes (value, activity, risk flags, etc.)
4. Apply scenario multipliers (base/best/worst)
5. Clamp to valid range [0, 1]

### Monte Carlo Simulation Process
1. For each iteration:
   - For each deal, draw random outcome based on probability
   - Sum successful deal values
   - Record monthly revenue distribution (if timing simulation)
2. Aggregate results across all iterations
3. Calculate statistics: mean, std dev, percentiles, confidence intervals

### Calibration Process
1. Fetch historical deals and billings from Strapi
2. Map billings to deals to determine conversions
3. Calculate conversion rates by stage
4. Weight historical rates with default probabilities (smoothing)
5. Generate calibrated probabilities
6. Validate using calibration curves
7. Provide recommendations

## Files Created

1. `app/probability_model.py` - Probability rules and adjustments
2. `app/monte_carlo.py` - Monte Carlo simulation engine
3. `app/model_calibration.py` - Model calibration and validation

## Files Updated

1. `app/main.py` - Integrated probability model and Monte Carlo simulation
2. `app/forecast_service.py` - Uses probability model (via main.py integration)

## Next Steps

1. **Test with Real Data**: Run calibration with actual historical data
2. **Tune Parameters**: Adjust probability rules and adjustment factors based on business feedback
3. **Performance Optimization**: Optimize Monte Carlo simulation for large portfolios
4. **Validation**: Run validation experiments and generate evaluation reports
5. **Human Review Gate**: Finance leader approval on model assumptions and performance metrics

## Status

✅ **Phase 5: Completed** - All model components implemented and integrated

**Ready for Phase 6: Frontend Automation**





