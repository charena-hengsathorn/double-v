"""
Pydantic models for request/response validation
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import date, datetime
from decimal import Decimal


class ForecastMonthlyTotal(BaseModel):
    month: date
    confirmed: Decimal
    tentative: Decimal
    total: Decimal
    confidence_tiers: Dict[str, Decimal]


class ForecastSummary(BaseModel):
    total_confirmed: Decimal
    total_tentative: Decimal
    total_forecast: Decimal
    conversion_rate: Optional[Decimal] = None


class BaseForecastResponse(BaseModel):
    forecast: Dict[str, Any]
    generated_at: datetime
    model_version: str = "1.0.0"


class ForecastRunRequest(BaseModel):
    scenario_overrides: Optional[Dict[str, Any]] = None
    force_recompute: bool = False
    write_snapshots: bool = True


class ForecastRunResponse(BaseModel):
    status: str
    deals_processed: int
    snapshots_created: int
    execution_time_ms: int
    started_at: datetime
    completed_at: datetime


class ScenarioRequest(BaseModel):
    name: str
    description: Optional[str] = None
    adjustments: List[Dict[str, Any]]


class MonteCarloRequest(BaseModel):
    deal_ids: List[int]
    iterations: int = Field(default=10000, ge=1000, le=100000)
    confidence_levels: List[float] = Field(default=[0.5, 0.8, 0.95])


class RiskHeatmapResponse(BaseModel):
    heatmap: Dict[str, Any]
    top_risks: List[Dict[str, Any]]
    summary: Dict[str, Any]


class WaterfallResponse(BaseModel):
    current_snapshot_date: date
    prior_snapshot_date: date
    variance: Dict[str, Any]


class StrapiSyncRequest(BaseModel):
    entity_types: List[str] = ["pipeline-deals", "billings"]
    since: Optional[datetime] = None
    full_sync: bool = False


class StrapiSyncResponse(BaseModel):
    status: str
    entities_synced: Dict[str, int]
    sync_duration_ms: int




