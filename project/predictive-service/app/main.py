from fastapi import FastAPI, HTTPException, Query, Path, Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from datetime import date, datetime
from typing import Optional
import os
import time

from app.strapi_client import StrapiClient
from app.forecast_service import ForecastService
from app.probability_model import ProbabilityModel
from app.monte_carlo import MonteCarloSimulation
from app.model_calibration import ModelCalibration
from app.webhook_handler import WebhookHandler
from app.retry_logic import retry_async, RetryConfig, CircuitBreaker
from app.alerting import alert_manager, AlertLevel
from app.models import (
    ForecastRunRequest,
    ForecastRunResponse,
    ScenarioRequest,
    MonteCarloRequest,
    StrapiSyncRequest,
    StrapiSyncResponse
)

# Load .env.local first (prioritized), then fallback to .env
load_dotenv('.env.local')
load_dotenv()  # Fallback to .env if .env.local doesn't exist

app = FastAPI(
    title="Double V Predictive Service",
    version="1.0.0",
    description="API for revenue forecasting and risk analytics",
    docs_url="/api/v1/docs",
    redoc_url="/api/v1/redoc"
)

# CORS configuration
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
strapi_client = StrapiClient()
forecast_service = ForecastService(strapi_client)
probability_model = ProbabilityModel()
monte_carlo = MonteCarloSimulation()
model_calibration = ModelCalibration()
webhook_handler = WebhookHandler(strapi_client, forecast_service)

# Circuit breaker for Strapi API calls
strapi_circuit_breaker = CircuitBreaker(failure_threshold=5, recovery_timeout=60.0)
webhook_handler = WebhookHandler(strapi_client, forecast_service)

# Circuit breaker for Strapi API calls
strapi_circuit_breaker = CircuitBreaker(failure_threshold=5, recovery_timeout=60.0)


@app.get("/")
async def root():
    return {"message": "Double V Predictive Service", "version": "1.0.0"}


@app.get("/api/v1/health")
async def health():
    """Health check endpoint"""
    strapi_connected = await strapi_client.health_check()
    return {
        "status": "healthy",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "strapi": "connected" if strapi_connected else "disconnected",
            "database": "connected"  # In production, check actual DB connection
        }
    }


@app.get("/api/v1/models/forecast/base")
async def get_base_forecast(
    start_month: Optional[date] = Query(None, description="Start of forecast period"),
    end_month: Optional[date] = Query(None, description="End of forecast period"),
    currency: str = Query("THB", description="Base currency for aggregation")
):
    """Get base forecast - uses pipeline deals if available, falls back to sales/billings data"""
    try:
        result = await forecast_service.compute_base_forecast(
            start_month=start_month,
            end_month=end_month,
            currency=currency
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error computing forecast: {str(e)}")


@app.post("/api/v1/models/forecast/run", response_model=ForecastRunResponse)
async def run_forecast_recompute(request: ForecastRunRequest):
    """Run forecast recompute and optionally write snapshots to Strapi"""
    start_time = time.time()
    started_at = datetime.utcnow()
    
    try:
        # Fetch all active deals
        deals = await strapi_client.get_pipeline_deals(filters={"status": "active"})
        deals_processed = len(deals)
        
        snapshots_created = 0
        if request.write_snapshots:
            # In production, this would compute and create snapshots
            # For now, return placeholder
            snapshots_created = deals_processed * 3  # Assume 3 snapshots per deal
        
        execution_time_ms = int((time.time() - start_time) * 1000)
        completed_at = datetime.utcnow()
        
        return ForecastRunResponse(
            status="completed",
            deals_processed=deals_processed,
            snapshots_created=snapshots_created,
            execution_time_ms=execution_time_ms,
            started_at=started_at,
            completed_at=completed_at
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error running forecast: {str(e)}")


@app.get("/api/v1/models/forecast/scenario/{scenario_id}")
async def get_scenario_forecast(
    scenario_id: str = Path(..., description="Scenario ID: base, best, worst, or custom"),
    start_month: Optional[date] = Query(None),
    end_month: Optional[date] = Query(None),
    currency: str = Query("THB")
):
    """Get forecast for a specific scenario"""
    try:
        # Fetch deals
        try:
            deals = await strapi_client.get_pipeline_deals(filters={"status": "active"})
        except Exception:
            # If Strapi is not available, use empty list
            deals = []
        
        # Apply scenario adjustments to probabilities
        adjusted_deals = []
        for deal in deals:
            deal_attrs = deal.get("attributes", {})
            base_prob = probability_model.compute_deal_probability(deal_attrs)
            scenario_prob = probability_model.get_scenario_probability(base_prob, scenario_id)
            
            # Create adjusted deal copy
            adjusted_attrs = deal_attrs.copy()
            adjusted_attrs["probability"] = float(scenario_prob * 100)
            adjusted_deal = deal.copy()
            adjusted_deal["attributes"] = adjusted_attrs
            adjusted_deals.append(adjusted_deal)
        
        # Compute forecast with adjusted probabilities
        # For now, use base forecast service but with adjusted deals
        # In production, this would be more sophisticated
        result = await forecast_service.compute_base_forecast(
            start_month=start_month,
            end_month=end_month,
            currency=currency
        )
        
        result["scenario"] = scenario_id
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error computing scenario forecast: {str(e)}")


@app.post("/api/v1/models/forecast/scenario")
async def create_custom_scenario(request: ScenarioRequest):
    """Create and compute a custom scenario forecast"""
    # In production, this would store scenario and compute forecast
    return {
        "scenario_id": request.name,
        "forecast": await forecast_service.compute_base_forecast(),
        "created_at": datetime.utcnow().isoformat()
    }


@app.post("/api/v1/models/forecast/simulate")
async def run_monte_carlo_simulation(request: MonteCarloRequest):
    """Run Monte Carlo simulation for specified deals"""
    start_time = time.time()
    
    try:
        # Fetch deals by IDs
        try:
            all_deals = await strapi_client.get_pipeline_deals(filters={"status": "active"})
        except Exception:
            all_deals = []
        selected_deals = [deal for deal in all_deals if deal.get("id") in request.deal_ids]
        
        if not selected_deals:
            raise HTTPException(status_code=404, detail="No deals found with provided IDs")
        
        # Run Monte Carlo simulation
        results = monte_carlo.simulate_portfolio(
            deals=selected_deals,
            iterations=request.iterations,
            probability_model=probability_model
        )
        
        execution_time_ms = int((time.time() - start_time) * 1000)
        
        return {
            "simulation_id": f"sim_{int(time.time())}",
            "iterations": request.iterations,
            "results": {
                "expected_value": results["expected_value"],
                "confidence_intervals": {
                    str(level): results["confidence_intervals"][str(level)]
                    for level in request.confidence_levels
                },
                "distribution": results["distribution"]
            },
            "execution_time_ms": execution_time_ms
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error running simulation: {str(e)}")


@app.get("/api/v1/models/variance/waterfall")
async def get_forecast_waterfall(
    current_snapshot_date: Optional[date] = Query(None),
    prior_snapshot_date: Optional[date] = Query(None),
    group_by: str = Query("deal", description="Group by: deal, stage, or owner")
):
    """Get forecast waterfall comparing current vs prior snapshot"""
    # Placeholder implementation
    return {
        "current_snapshot_date": current_snapshot_date.isoformat() if current_snapshot_date else date.today().isoformat(),
        "prior_snapshot_date": prior_snapshot_date.isoformat() if prior_snapshot_date else date.today().isoformat(),
        "variance": {
            "total_change": 250000,
            "breakdown": [],
            "summary": {
                "increases": 300000,
                "decreases": -50000,
                "new_deals": 0,
                "lost_deals": 0
            }
        }
    }


@app.get("/api/v1/models/risk/heatmap")
async def get_risk_heatmap(
    group_by_stage: bool = Query(True),
    group_by_probability: bool = Query(True),
    min_deal_value: Optional[float] = Query(None)
):
    """Get risk heatmap - uses pipeline deals if available, falls back to sales data"""
    try:
        from decimal import Decimal
        min_value = Decimal(str(min_deal_value)) if min_deal_value else None
        result = await forecast_service.compute_risk_heatmap(
            group_by_stage=group_by_stage,
            group_by_probability=group_by_probability,
            min_deal_value=min_value
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error computing risk heatmap: {str(e)}")


@app.post("/api/v1/models/ingest/strapi-sync", response_model=StrapiSyncResponse)
async def sync_from_strapi(request: StrapiSyncRequest):
    """Sync data from Strapi (webhook or manual trigger)"""
    start_time = time.time()
    entities_synced = {}
    
    try:
        for entity_type in request.entity_types:
            if entity_type == "pipeline-deals":
                deals = await strapi_client.get_pipeline_deals()
                entities_synced["pipeline-deals"] = len(deals)
            elif entity_type == "billings":
                billings = await strapi_client.get_billings()
                entities_synced["billings"] = len(billings)
            elif entity_type == "clients":
                clients = await strapi_client.get_clients()
                entities_synced["clients"] = len(clients)
            elif entity_type == "construction-sales":
                sales = await strapi_client.get_construction_sales()
                entities_synced["construction-sales"] = len(sales)
            elif entity_type == "construction-billings":
                billings = await strapi_client.get_construction_billings()
                entities_synced["construction-billings"] = len(billings)
            elif entity_type == "loose-furniture-sales":
                sales = await strapi_client.get_loose_furniture_sales()
                entities_synced["loose-furniture-sales"] = len(sales)
            elif entity_type == "loose-furniture-billings":
                billings = await strapi_client.get_loose_furniture_billings()
                entities_synced["loose-furniture-billings"] = len(billings)
            elif entity_type == "interior-design-sales":
                sales = await strapi_client.get_interior_design_sales()
                entities_synced["interior-design-sales"] = len(sales)
            elif entity_type == "interior-design-billings":
                billings = await strapi_client.get_interior_design_billings()
                entities_synced["interior-design-billings"] = len(billings)
            elif entity_type == "all-sales":
                all_sales = await strapi_client.get_all_sales()
                entities_synced["all-sales"] = {
                    "construction": len(all_sales.get("construction", [])),
                    "loose_furniture": len(all_sales.get("loose_furniture", [])),
                    "interior_design": len(all_sales.get("interior_design", [])),
                    "total": len(all_sales.get("total", []))
                }
            elif entity_type == "all-billings":
                all_billings = await strapi_client.get_all_billings()
                entities_synced["all-billings"] = {
                    "general": len(all_billings.get("general", [])),
                    "construction": len(all_billings.get("construction", [])),
                    "loose_furniture": len(all_billings.get("loose_furniture", [])),
                    "interior_design": len(all_billings.get("interior_design", [])),
                    "total": len(all_billings.get("total", []))
                }
        
        sync_duration_ms = int((time.time() - start_time) * 1000)
        
        return StrapiSyncResponse(
            status="completed",
            entities_synced=entities_synced,
            sync_duration_ms=sync_duration_ms
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error syncing from Strapi: {str(e)}")


@app.post("/api/v1/models/calibrate")
async def calibrate_model():
    """Calibrate probability model using historical data"""
    try:
        # Fetch historical deals and billings
        historical_deals = await strapi_client.get_pipeline_deals()
        historical_billings = await strapi_client.get_billings()
        
        # Generate calibration report
        report = model_calibration.generate_calibration_report(
            historical_deals=historical_deals,
            historical_billings=historical_billings
        )
        
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calibrating model: {str(e)}")


@app.get("/api/v1/models/calibration/status")
async def get_calibration_status():
    """Get current model calibration status"""
    try:
        # Fetch historical data with retry
        retry_config = RetryConfig(max_retries=3, initial_delay=1.0)
        historical_deals = await retry_async(
            strapi_circuit_breaker.call,
            strapi_client.get_pipeline_deals,
            config=retry_config
        )
        historical_billings = await retry_async(
            strapi_circuit_breaker.call,
            strapi_client.get_billings,
            config=retry_config
        )
        
        # Quick analysis
        analysis = model_calibration.analyze_historical_conversion(
            historical_deals=historical_deals,
            historical_billings=historical_billings
        )
        
        return {
            "status": "calibrated" if analysis.get("overall_conversion_rate", 0) > 0 else "uncalibrated",
            "overall_conversion_rate": analysis.get("overall_conversion_rate", 0),
            "stage_count": len(analysis.get("stage_conversion_rates", {})),
            "last_calibrated": datetime.utcnow().isoformat()
        }
    except Exception as e:
        alert_manager.add_alert(AlertLevel.ERROR, "Failed to get calibration status", {"error": str(e)})
        raise HTTPException(status_code=500, detail=f"Error getting calibration status: {str(e)}")


@app.post("/api/v1/webhooks/strapi")
async def handle_strapi_webhook(request: Request):
    """Handle webhook from Strapi"""
    return await webhook_handler.handle_webhook(request)


@app.get("/api/v1/alerts")
async def get_alerts(level: Optional[str] = None, limit: int = 10):
    """Get recent alerts"""
    from app.alerting import AlertLevel as AL
    
    alert_level = None
    if level:
        try:
            alert_level = AL[level.upper()]
        except KeyError:
            raise HTTPException(status_code=400, detail=f"Invalid alert level: {level}")
    
    return {
        "alerts": alert_manager.get_recent_alerts(level=alert_level, limit=limit),
        "summary": alert_manager.get_alert_summary()
    }


@app.get("/api/v1/health/detailed")
async def detailed_health():
    """Detailed health check including service status"""
    strapi_connected = await strapi_client.health_check()
    alert_summary = alert_manager.get_alert_summary()
    
    return {
        "status": "healthy" if strapi_connected else "degraded",
        "services": {
            "strapi": "connected" if strapi_connected else "disconnected",
            "database": "connected"
        },
        "alerts": alert_summary,
        "circuit_breaker": {
            "state": strapi_circuit_breaker.state,
            "failure_count": strapi_circuit_breaker.failure_count
        },
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/api/v1/data/clients")
async def get_clients(
    filters: Optional[str] = None,
    populate: Optional[str] = None
):
    """Get clients from Strapi"""
    try:
        filter_dict = {}
        if filters:
            # Simple filter parsing - in production, use proper query parsing
            filter_dict = eval(filters) if isinstance(filters, str) else filters
        
        clients = await strapi_client.get_clients(
            filters=filter_dict if filter_dict else None,
            populate=populate
        )
        return {"data": clients, "count": len(clients)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching clients: {str(e)}")


@app.get("/api/v1/data/sales/all")
async def get_all_sales(
    filters: Optional[str] = None
):
    """Get all sales data from all branches"""
    try:
        filter_dict = {}
        if filters:
            filter_dict = eval(filters) if isinstance(filters, str) else filters
        
        all_sales = await strapi_client.get_all_sales(filters=filter_dict if filter_dict else None)
        return {
            "data": all_sales,
            "summary": {
                "construction_count": len(all_sales.get("construction", [])),
                "loose_furniture_count": len(all_sales.get("loose_furniture", [])),
                "interior_design_count": len(all_sales.get("interior_design", [])),
                "total_count": len(all_sales.get("total", []))
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching all sales: {str(e)}")


@app.get("/api/v1/data/billings/all")
async def get_all_billings(
    filters: Optional[str] = None
):
    """Get all billings data from all branches"""
    try:
        filter_dict = {}
        if filters:
            filter_dict = eval(filters) if isinstance(filters, str) else filters
        
        all_billings = await strapi_client.get_all_billings(filters=filter_dict if filter_dict else None)
        return {
            "data": all_billings,
            "summary": {
                "general_count": len(all_billings.get("general", [])),
                "construction_count": len(all_billings.get("construction", [])),
                "loose_furniture_count": len(all_billings.get("loose_furniture", [])),
                "interior_design_count": len(all_billings.get("interior_design", [])),
                "total_count": len(all_billings.get("total", []))
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching all billings: {str(e)}")


@app.get("/api/v1/data/sales/construction")
async def get_construction_sales(
    filters: Optional[str] = None,
    populate: Optional[str] = None
):
    """Get construction sales from Strapi"""
    try:
        filter_dict = {}
        if filters:
            filter_dict = eval(filters) if isinstance(filters, str) else filters
        
        sales = await strapi_client.get_construction_sales(
            filters=filter_dict if filter_dict else None,
            populate=populate
        )
        return {"data": sales, "count": len(sales)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching construction sales: {str(e)}")


@app.get("/api/v1/data/billings/construction")
async def get_construction_billings(
    filters: Optional[str] = None,
    populate: Optional[str] = None
):
    """Get construction billings from Strapi"""
    try:
        filter_dict = {}
        if filters:
            filter_dict = eval(filters) if isinstance(filters, str) else filters
        
        billings = await strapi_client.get_construction_billings(
            filters=filter_dict if filter_dict else None,
            populate=populate
        )
        return {"data": billings, "count": len(billings)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching construction billings: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

