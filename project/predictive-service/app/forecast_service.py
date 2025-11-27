"""
Forecast computation service
"""
from datetime import date, datetime, timedelta
from decimal import Decimal
from typing import List, Dict, Any, Optional
from app.strapi_client import StrapiClient


class ForecastService:
    def __init__(self, strapi_client: StrapiClient):
        self.strapi = strapi_client
    
    async def compute_base_forecast(
        self,
        start_month: Optional[date] = None,
        end_month: Optional[date] = None,
        currency: str = "THB"
    ) -> Dict[str, Any]:
        """Compute base forecast from pipeline deals"""
        if not start_month:
            start_month = date.today().replace(day=1)
        if not end_month:
            end_month = (start_month + timedelta(days=365)).replace(day=1)
        
        # Fetch all active pipeline deals
        try:
            deals = await self.strapi.get_pipeline_deals(
                filters={"status": "active"},
                populate="project"
            )
        except Exception as e:
            # If Strapi is not available or content types not registered, return empty forecast
            deals = []
        
        # Fetch existing forecast snapshots for base scenario
        try:
            snapshots = await self.strapi.get_forecast_snapshots(
                filters={"scenario": "base"}
            )
        except Exception:
            snapshots = []
        
        # Group by month and compute totals
        monthly_totals = {}
        total_confirmed = Decimal(0)
        total_tentative = Decimal(0)
        
        # If no deals, return empty forecast
        if not deals:
            return {
                "forecast": {
                    "start_month": start_month.isoformat(),
                    "end_month": end_month.isoformat(),
                    "currency": currency,
                    "monthly_totals": [],
                    "summary": {
                        "total_confirmed": 0,
                        "total_tentative": 0,
                        "total_forecast": 0,
                        "conversion_rate": 0
                    }
                },
                "generated_at": datetime.utcnow().isoformat(),
                "model_version": "1.0.0"
            }
        
        for deal in deals:
            deal_attrs = deal.get("attributes", {})
            deal_value = Decimal(str(deal_attrs.get("deal_value", 0)))
            probability = Decimal(str(deal_attrs.get("probability", 0))) / 100
            
            # Determine recognition months
            rec_start = deal_attrs.get("recognition_start_month")
            rec_end = deal_attrs.get("recognition_end_month")
            
            if rec_start and rec_end:
                # For now, distribute evenly across months
                # In production, this would use milestone-based recognition
                expected_amount = deal_value * probability
                
                # Simple distribution (in production, use actual milestone dates)
                current_month = datetime.strptime(rec_start, "%Y-%m-%d").date().replace(day=1)
                end_month_date = datetime.strptime(rec_end, "%Y-%m-%d").date().replace(day=1)
                
                months = []
                while current_month <= end_month_date:
                    months.append(current_month)
                    if current_month.month == 12:
                        current_month = current_month.replace(year=current_month.year + 1, month=1)
                    else:
                        current_month = current_month.replace(month=current_month.month + 1)
                
                monthly_amount = expected_amount / len(months) if months else expected_amount
                
                for month in months:
                    if start_month <= month <= end_month:
                        if month not in monthly_totals:
                            monthly_totals[month] = {
                                "confirmed": Decimal(0),
                                "tentative": Decimal(0),
                                "total": Decimal(0)
                            }
                        
                        if probability >= Decimal("0.75"):
                            monthly_totals[month]["confirmed"] += monthly_amount
                            total_confirmed += monthly_amount
                        else:
                            monthly_totals[month]["tentative"] += monthly_amount
                            total_tentative += monthly_amount
                        
                        monthly_totals[month]["total"] += monthly_amount
        
        # Format monthly totals
        formatted_monthly = []
        for month in sorted(monthly_totals.keys()):
            totals = monthly_totals[month]
            formatted_monthly.append({
                "month": month.isoformat(),
                "confirmed": float(totals["confirmed"]),
                "tentative": float(totals["tentative"]),
                "total": float(totals["total"]),
                "confidence_tiers": {
                    "high": float(totals["confirmed"]),
                    "medium": float(totals["tentative"] * Decimal("0.75")),
                    "low": float(totals["tentative"] * Decimal("0.25"))
                }
            })
        
        total_forecast = total_confirmed + total_tentative
        conversion_rate = total_confirmed / total_forecast if total_forecast > 0 else Decimal(0)
        
        return {
            "forecast": {
                "start_month": start_month.isoformat(),
                "end_month": end_month.isoformat(),
                "currency": currency,
                "monthly_totals": formatted_monthly,
                "summary": {
                    "total_confirmed": float(total_confirmed),
                    "total_tentative": float(total_tentative),
                    "total_forecast": float(total_forecast),
                    "conversion_rate": float(conversion_rate)
                }
            },
            "generated_at": datetime.utcnow().isoformat(),
            "model_version": "1.0.0"
        }
    
    async def compute_risk_heatmap(
        self,
        group_by_stage: bool = True,
        group_by_probability: bool = True,
        min_deal_value: Optional[Decimal] = None
    ) -> Dict[str, Any]:
        """Compute risk heatmap from pipeline deals"""
        try:
            deals = await self.strapi.get_pipeline_deals(
                filters={"status": "active"},
                populate="project,risk_flags"
            )
        except Exception:
            # If Strapi is not available, return empty heatmap
            deals = []
        
        # Group deals by stage and probability buckets
        matrix = {}
        top_risks = []
        total_at_risk = Decimal(0)
        high_risk_count = 0
        medium_risk_count = 0
        
        stages = ["prospecting", "qualification", "proposal", "negotiation", "closed-won"]
        prob_buckets = ["0-25%", "25-50%", "50-75%", "75-100%"]
        
        # If no deals, return empty heatmap
        if not deals:
            return {
                "heatmap": {
                    "stages": stages,
                    "probability_buckets": prob_buckets,
                    "matrix": []
                },
                "top_risks": [],
                "summary": {
                    "total_at_risk": 0,
                    "high_risk_count": 0,
                    "medium_risk_count": 0
                }
            }
        
        for deal in deals:
            deal_attrs = deal.get("attributes", {})
            deal_value = Decimal(str(deal_attrs.get("deal_value", 0)))
            
            if min_deal_value and deal_value < min_deal_value:
                continue
            
            stage = deal_attrs.get("stage", "prospecting")
            probability = float(deal_attrs.get("probability", 0))
            
            # Determine probability bucket
            if probability < 25:
                prob_bucket = "0-25%"
            elif probability < 50:
                prob_bucket = "25-50%"
            elif probability < 75:
                prob_bucket = "50-75%"
            else:
                prob_bucket = "75-100%"
            
            key = f"{stage}:{prob_bucket}"
            if key not in matrix:
                matrix[key] = {
                    "stage": stage,
                    "probability_range": prob_bucket,
                    "deal_count": 0,
                    "total_value": Decimal(0),
                    "at_risk_value": Decimal(0),
                    "deals": []
                }
            
            matrix[key]["deal_count"] += 1
            matrix[key]["total_value"] += deal_value
            at_risk = deal_value * (1 - probability / 100)
            matrix[key]["at_risk_value"] += at_risk
            total_at_risk += at_risk
            
            # Calculate risk score
            risk_score = (1 - probability / 100) * (deal_value / 1000000)  # Normalized
            if risk_score > 0.7:
                high_risk_count += 1
            elif risk_score > 0.4:
                medium_risk_count += 1
            
            matrix[key]["deals"].append({
                "deal_id": deal.get("id"),
                "deal_name": deal_attrs.get("name", f"Deal {deal.get('id')}"),
                "value": float(deal_value),
                "probability": probability / 100
            })
            
            if risk_score > 0.6:
                top_risks.append({
                    "deal_id": deal.get("id"),
                    "risk_score": risk_score,
                    "risk_factors": self._identify_risk_factors(deal_attrs)
                })
        
        # Format matrix as list
        formatted_matrix = []
        for stage in stages:
            for prob_bucket in prob_buckets:
                key = f"{stage}:{prob_bucket}"
                if key in matrix:
                    item = matrix[key]
                    formatted_matrix.append({
                        "stage": item["stage"],
                        "probability_range": item["probability_range"],
                        "deal_count": item["deal_count"],
                        "total_value": float(item["total_value"]),
                        "at_risk_value": float(item["at_risk_value"]),
                        "deals": item["deals"][:10]  # Limit to top 10
                    })
        
        # Sort top risks by risk score
        top_risks.sort(key=lambda x: x["risk_score"], reverse=True)
        
        return {
            "heatmap": {
                "stages": stages,
                "probability_buckets": prob_buckets,
                "matrix": formatted_matrix
            },
            "top_risks": top_risks[:20],  # Top 20 risks
            "summary": {
                "total_at_risk": float(total_at_risk),
                "high_risk_count": high_risk_count,
                "medium_risk_count": medium_risk_count
            }
        }
    
    def _identify_risk_factors(self, deal_attrs: Dict[str, Any]) -> List[str]:
        """Identify risk factors for a deal"""
        factors = []
        probability = float(deal_attrs.get("probability", 0))
        
        if probability < 50:
            factors.append("low_probability")
        if deal_attrs.get("deal_value", 0) > 500000:
            factors.append("high_value")
        if deal_attrs.get("last_activity_at"):
            # Check if last activity is old
            factors.append("stale_activity")
        if deal_attrs.get("risk_flags"):
            factors.append("has_risk_flags")
        
        return factors

