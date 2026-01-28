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
        
        # If no pipeline deals, fallback to sales-based forecast
        if not deals:
            return await self.compute_sales_based_forecast(start_month, end_month, currency)
        
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
        
        # If no pipeline deals, fallback to sales-based risk analysis
        if not deals:
            return await self.compute_sales_based_risk_heatmap(
                group_by_stage=group_by_stage,
                group_by_probability=group_by_probability,
                min_deal_value=min_deal_value
            )
        
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
    
    async def compute_sales_based_forecast(
        self,
        start_month: Optional[date] = None,
        end_month: Optional[date] = None,
        currency: str = "THB"
    ) -> Dict[str, Any]:
        """Compute forecast based on historical sales and billings data (fallback when no pipeline deals)"""
        if not start_month:
            start_month = date.today().replace(day=1)
        if not end_month:
            end_month = (start_month + timedelta(days=365)).replace(day=1)
        
        try:
            # Fetch all sales data
            all_sales = await self.strapi.get_all_sales()
            sales_data = all_sales.get("total", [])
            
            # Fetch all billings data for cash flow projection
            all_billings = await self.strapi.get_all_billings()
            billings_data = all_billings.get("total", [])
        except Exception as e:
            print(f"Error fetching sales/billings data: {e}")
            sales_data = []
            billings_data = []
        
        # If no sales data, return empty forecast
        if not sales_data:
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
                "model_version": "1.0.0",
                "data_source": "sales_billings"
            }
        
        # Analyze historical sales patterns
        monthly_totals = {}
        total_confirmed = Decimal(0)
        total_tentative = Decimal(0)
        
        # Process sales data
        for sale in sales_data:
            attrs = sale.get("attributes", sale)
            sale_amount = Decimal(str(attrs.get("sale_amount", attrs.get("amount", 0))))
            status = attrs.get("status", "Pending")
            sale_date_str = attrs.get("sale_date") or attrs.get("createdAt")
            
            if not sale_amount or sale_amount <= 0:
                continue
            
            # Determine probability based on status
            if status == "Confirmed":
                probability = Decimal("1.0")  # 100% confirmed
            elif status == "Pending":
                probability = Decimal("0.5")  # 50% tentative
            else:
                probability = Decimal("0.25")  # 25% for other statuses
            
            # Parse sale date
            if sale_date_str:
                try:
                    if isinstance(sale_date_str, str):
                        sale_date = datetime.fromisoformat(sale_date_str.replace('Z', '+00:00')).date()
                    else:
                        sale_date = sale_date_str
                except:
                    sale_date = date.today()
            else:
                sale_date = date.today()
            
            # Project future revenue based on historical patterns
            # For confirmed sales, distribute over next 6-12 months
            # For pending sales, treat as future pipeline
            
            # Calculate months to project
            months_to_project = 6  # Default 6 months
            if status == "Confirmed":
                months_to_project = 12  # Confirmed sales over 12 months
            
            # Start from next month if sale is recent, or from sale date if future
            if sale_date <= date.today():
                projection_start = (date.today() + timedelta(days=30)).replace(day=1)
            else:
                projection_start = sale_date.replace(day=1)
            
            # Distribute sale amount across months
            monthly_amount = sale_amount * probability / Decimal(str(months_to_project))
            
            current_month = projection_start
            months_added = 0
            
            while months_added < months_to_project and current_month <= end_month:
                if current_month >= start_month:
                    if current_month not in monthly_totals:
                        monthly_totals[current_month] = {
                            "confirmed": Decimal(0),
                            "tentative": Decimal(0),
                            "total": Decimal(0)
                        }
                    
                    if probability >= Decimal("0.75"):
                        monthly_totals[current_month]["confirmed"] += monthly_amount
                        total_confirmed += monthly_amount
                    else:
                        monthly_totals[current_month]["tentative"] += monthly_amount
                        total_tentative += monthly_amount
                    
                    monthly_totals[current_month]["total"] += monthly_amount
                    months_added += 1
                
                # Move to next month
                if current_month.month == 12:
                    current_month = current_month.replace(year=current_month.year + 1, month=1)
                else:
                    current_month = current_month.replace(month=current_month.month + 1)
        
        # Add trend projection based on historical average
        if sales_data:
            # Calculate average monthly sales from last 6 months
            today = date.today()
            six_months_ago = (today - timedelta(days=180)).replace(day=1)
            
            historical_sales = []
            for sale in sales_data:
                attrs = sale.get("attributes", sale)
                sale_date_str = attrs.get("sale_date") or attrs.get("createdAt")
                sale_amount = Decimal(str(attrs.get("sale_amount", attrs.get("amount", 0))))
                
                if sale_date_str and sale_amount > 0:
                    try:
                        if isinstance(sale_date_str, str):
                            sale_date = datetime.fromisoformat(sale_date_str.replace('Z', '+00:00')).date()
                        else:
                            sale_date = sale_date_str
                        
                        if six_months_ago <= sale_date <= today:
                            historical_sales.append(sale_amount)
                    except:
                        pass
            
            if historical_sales:
                avg_monthly_sales = sum(historical_sales) / Decimal(str(len(historical_sales))) / Decimal("6")
                
                # Project average trend for remaining months
                current_month = date.today().replace(day=1)
                while current_month <= end_month:
                    if current_month not in monthly_totals:
                        monthly_totals[current_month] = {
                            "confirmed": Decimal(0),
                            "tentative": Decimal(0),
                            "total": Decimal(0)
                        }
                    
                    # Add trend projection as tentative
                    monthly_totals[current_month]["tentative"] += avg_monthly_sales * Decimal("0.3")  # 30% of average
                    monthly_totals[current_month]["total"] += avg_monthly_sales * Decimal("0.3")
                    total_tentative += avg_monthly_sales * Decimal("0.3")
                    
                    # Move to next month
                    if current_month.month == 12:
                        current_month = current_month.replace(year=current_month.year + 1, month=1)
                    else:
                        current_month = current_month.replace(month=current_month.month + 1)
        
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
            "model_version": "1.0.0",
            "data_source": "sales_billings"
        }
    
    async def compute_billings_cashflow_forecast(
        self,
        start_month: Optional[date] = None,
        end_month: Optional[date] = None
    ) -> Dict[str, Any]:
        """Compute cash flow forecast based on billings data"""
        if not start_month:
            start_month = date.today().replace(day=1)
        if not end_month:
            end_month = (start_month + timedelta(days=365)).replace(day=1)
        
        try:
            all_billings = await self.strapi.get_all_billings()
            billings_data = all_billings.get("total", [])
        except Exception as e:
            print(f"Error fetching billings data: {e}")
            billings_data = []
        
        monthly_cashflow = {}
        
        for billing in billings_data:
            attrs = billing.get("attributes", billing)
            amount = Decimal(str(attrs.get("amount", 0)))
            
            # Get invoice date and collected date
            invoice_date_str = attrs.get("invoice_date")
            collected_date_str = attrs.get("collected_date")
            
            # Use month/year if available
            billing_month = attrs.get("month")
            billing_year = attrs.get("year")
            
            if billing_month and billing_year:
                try:
                    billing_date = date(int(billing_year), int(billing_month), 1)
                except:
                    billing_date = None
            else:
                billing_date = None
            
            if invoice_date_str:
                try:
                    if isinstance(invoice_date_str, str):
                        billing_date = datetime.fromisoformat(invoice_date_str.replace('Z', '+00:00')).date().replace(day=1)
                except:
                    pass
            
            if not billing_date:
                continue
            
            if start_month <= billing_date <= end_month:
                if billing_date not in monthly_cashflow:
                    monthly_cashflow[billing_date] = {
                        "inflow": Decimal(0),
                        "outflow": Decimal(0),
                        "net": Decimal(0)
                    }
                
                # If collected, it's inflow; if just invoiced, it's projected inflow
                if collected_date_str:
                    monthly_cashflow[billing_date]["inflow"] += amount
                else:
                    # Projected inflow (80% collection rate assumption)
                    monthly_cashflow[billing_date]["inflow"] += amount * Decimal("0.8")
                
                monthly_cashflow[billing_date]["net"] = (
                    monthly_cashflow[billing_date]["inflow"] - 
                    monthly_cashflow[billing_date]["outflow"]
                )
        
        # Format monthly cashflow
        formatted_monthly = []
        for month in sorted(monthly_cashflow.keys()):
            cf = monthly_cashflow[month]
            formatted_monthly.append({
                "month": month.isoformat(),
                "inflow": float(cf["inflow"]),
                "outflow": float(cf["outflow"]),
                "net": float(cf["net"])
            })
        
        return {
            "cashflow_forecast": {
                "start_month": start_month.isoformat(),
                "end_month": end_month.isoformat(),
                "monthly_totals": formatted_monthly,
                "summary": {
                    "total_inflow": float(sum(cf["inflow"] for cf in monthly_cashflow.values())),
                    "total_outflow": float(sum(cf["outflow"] for cf in monthly_cashflow.values())),
                    "net_cashflow": float(sum(cf["net"] for cf in monthly_cashflow.values()))
                }
            },
            "generated_at": datetime.utcnow().isoformat()
        }
    
    async def compute_sales_based_risk_heatmap(
        self,
        group_by_stage: bool = True,
        group_by_probability: bool = True,
        min_deal_value: Optional[Decimal] = None
    ) -> Dict[str, Any]:
        """Compute risk heatmap from sales data (fallback when no pipeline deals)"""
        try:
            all_sales = await self.strapi.get_all_sales()
            sales_data = all_sales.get("total", [])
        except Exception as e:
            print(f"Error fetching sales data for risk analysis: {e}")
            sales_data = []
        
        stages = ["pending", "confirmed", "closed"]
        prob_buckets = ["0-25%", "25-50%", "50-75%", "75-100%"]
        
        if not sales_data:
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
        
        matrix = {}
        top_risks = []
        total_at_risk = Decimal(0)
        high_risk_count = 0
        medium_risk_count = 0
        
        for sale in sales_data:
            attrs = sale.get("attributes", sale)
            sale_amount = Decimal(str(attrs.get("sale_amount", attrs.get("amount", 0))))
            status = attrs.get("status", "Pending").lower()
            
            if min_deal_value and sale_amount < min_deal_value:
                continue
            
            # Map status to stage
            if status == "confirmed":
                stage = "confirmed"
                probability = 100
            elif status == "pending":
                stage = "pending"
                probability = 50
            else:
                stage = "closed"
                probability = 25
            
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
            matrix[key]["total_value"] += sale_amount
            at_risk = sale_amount * (1 - probability / 100)
            matrix[key]["at_risk_value"] += at_risk
            total_at_risk += at_risk
            
            # Calculate risk score
            risk_score = (1 - probability / 100) * (sale_amount / Decimal("1000000"))  # Normalized
            if risk_score > 0.7:
                high_risk_count += 1
            elif risk_score > 0.4:
                medium_risk_count += 1
            
            sale_id = sale.get("id") or sale.get("documentId", "unknown")
            client_name = attrs.get("client") or attrs.get("customer", "Unknown")
            
            matrix[key]["deals"].append({
                "deal_id": sale_id,
                "deal_name": f"{client_name} - {sale_amount}",
                "value": float(sale_amount),
                "probability": probability / 100
            })
            
            if risk_score > 0.6:
                risk_factors = []
                if probability < 50:
                    risk_factors.append("low_probability")
                if sale_amount > 500000:
                    risk_factors.append("high_value")
                if status == "pending":
                    risk_factors.append("pending_status")
                
                top_risks.append({
                    "deal_id": sale_id,
                    "risk_score": risk_score,
                    "risk_factors": risk_factors
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
            },
            "data_source": "sales"
        }

