"""
Model calibration using historical billing data
"""
from typing import List, Dict, Any, Optional
from decimal import Decimal
from datetime import date, datetime, timedelta
from collections import defaultdict
from app.probability_model import ProbabilityModel


class ModelCalibration:
    """Calibrate probability models using historical data"""
    
    def __init__(self):
        self.probability_model = ProbabilityModel()
    
    def analyze_historical_conversion(
        self,
        historical_deals: List[Dict[str, Any]],
        historical_billings: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Analyze historical conversion rates by stage"""
        # Map billings to deals
        deal_billings = defaultdict(list)
        for billing in historical_billings:
            deal_id = billing.get("attributes", {}).get("deal", {}).get("data", {}).get("id")
            if deal_id:
                deal_billings[deal_id].append(billing)
        
        # Analyze by stage
        stage_stats = defaultdict(lambda: {"total": 0, "converted": 0, "total_value": Decimal("0"), "converted_value": Decimal("0")})
        
        for deal in historical_deals:
            deal_attrs = deal.get("attributes", {})
            stage = deal_attrs.get("stage", "unknown")
            deal_value = Decimal(str(deal_attrs.get("deal_value", 0)))
            deal_id = deal.get("id")
            
            stage_stats[stage]["total"] += 1
            stage_stats[stage]["total_value"] += deal_value
            
            # Check if deal converted (has billings)
            if deal_id in deal_billings and len(deal_billings[deal_id]) > 0:
                stage_stats[stage]["converted"] += 1
                stage_stats[stage]["converted_value"] += deal_value
        
        # Calculate conversion rates
        calibration_results = {}
        for stage, stats in stage_stats.items():
            conversion_rate = stats["converted"] / stats["total"] if stats["total"] > 0 else 0
            value_conversion_rate = float(stats["converted_value"] / stats["total_value"]) if stats["total_value"] > 0 else 0
            
            calibration_results[stage] = {
                "conversion_rate": conversion_rate,
                "value_conversion_rate": value_conversion_rate,
                "sample_size": stats["total"],
                "converted_count": stats["converted"],
                "total_value": float(stats["total_value"]),
                "converted_value": float(stats["converted_value"])
            }
        
        return {
            "stage_conversion_rates": calibration_results,
            "overall_conversion_rate": sum(s["converted"] for s in stage_stats.values()) / sum(s["total"] for s in stage_stats.values()) if sum(s["total"] for s in stage_stats.values()) > 0 else 0
        }
    
    def calibrate_stage_probabilities(
        self,
        historical_deals: List[Dict[str, Any]],
        historical_billings: List[Dict[str, Any]]
    ) -> Dict[str, Decimal]:
        """Calibrate stage probabilities based on historical data"""
        analysis = self.analyze_historical_conversion(historical_deals, historical_billings)
        
        calibrated = {}
        for stage, stats in analysis["stage_conversion_rates"].items():
            # Use historical conversion rate, but apply smoothing
            historical_rate = Decimal(str(stats["conversion_rate"]))
            default_rate = self.probability_model.get_base_probability(stage)
            
            # Weighted average: 70% historical, 30% default (if sample size is small)
            sample_size = stats["sample_size"]
            if sample_size >= 20:
                weight_historical = Decimal("0.8")
            elif sample_size >= 10:
                weight_historical = Decimal("0.6")
            else:
                weight_historical = Decimal("0.4")
            
            calibrated_rate = (historical_rate * weight_historical) + (default_rate * (Decimal("1") - weight_historical))
            calibrated[stage] = calibrated_rate
        
        return calibrated
    
    def validate_model_performance(
        self,
        predicted_probabilities: Dict[int, Decimal],
        actual_outcomes: Dict[int, bool],
        bins: int = 10
    ) -> Dict[str, Any]:
        """Validate model calibration using calibration curve"""
        # Group predictions into bins
        bin_ranges = [(i / bins, (i + 1) / bins) for i in range(bins)]
        bin_stats = {i: {"predicted": [], "actual": []} for i in range(bins)}
        
        for deal_id, predicted_prob in predicted_probabilities.items():
            actual_outcome = actual_outcomes.get(deal_id, False)
            
            # Find which bin this prediction falls into
            for i, (low, high) in enumerate(bin_ranges):
                if low <= float(predicted_prob) < high or (i == bins - 1 and float(predicted_prob) == 1.0):
                    bin_stats[i]["predicted"].append(float(predicted_prob))
                    bin_stats[i]["actual"].append(1.0 if actual_outcome else 0.0)
                    break
        
        # Calculate calibration metrics
        calibration_curve = []
        for i in range(bins):
            if bin_stats[i]["predicted"]:
                avg_predicted = sum(bin_stats[i]["predicted"]) / len(bin_stats[i]["predicted"])
                avg_actual = sum(bin_stats[i]["actual"]) / len(bin_stats[i]["actual"])
                sample_size = len(bin_stats[i]["predicted"])
                
                calibration_curve.append({
                    "bin": i,
                    "predicted_probability": avg_predicted,
                    "actual_rate": avg_actual,
                    "sample_size": sample_size,
                    "calibration_error": abs(avg_predicted - avg_actual)
                })
        
        # Calculate overall calibration error
        total_error = sum(point["calibration_error"] * point["sample_size"] for point in calibration_curve)
        total_samples = sum(point["sample_size"] for point in calibration_curve)
        mean_calibration_error = total_error / total_samples if total_samples > 0 else 0
        
        return {
            "calibration_curve": calibration_curve,
            "mean_calibration_error": mean_calibration_error,
            "bins": bins,
            "total_samples": total_samples
        }
    
    def generate_calibration_report(
        self,
        historical_deals: List[Dict[str, Any]],
        historical_billings: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Generate comprehensive calibration report"""
        conversion_analysis = self.analyze_historical_conversion(historical_deals, historical_billings)
        calibrated_probabilities = self.calibrate_stage_probabilities(historical_deals, historical_billings)
        
        return {
            "conversion_analysis": conversion_analysis,
            "calibrated_probabilities": {k: float(v) for k, v in calibrated_probabilities.items()},
            "recommendations": self._generate_recommendations(conversion_analysis, calibrated_probabilities),
            "generated_at": datetime.utcnow().isoformat()
        }
    
    def _generate_recommendations(
        self,
        conversion_analysis: Dict[str, Any],
        calibrated_probabilities: Dict[str, Decimal]
    ) -> List[str]:
        """Generate recommendations based on calibration results"""
        recommendations = []
        
        overall_rate = conversion_analysis.get("overall_conversion_rate", 0)
        if overall_rate < 0.3:
            recommendations.append("Overall conversion rate is low. Consider reviewing qualification criteria.")
        
        stage_rates = conversion_analysis.get("stage_conversion_rates", {})
        for stage, stats in stage_rates.items():
            if stats["sample_size"] < 10:
                recommendations.append(f"Insufficient data for stage '{stage}' ({stats['sample_size']} samples). Collect more data before relying on calibrated probabilities.")
            
            conversion_rate = stats["conversion_rate"]
            calibrated_prob = float(calibrated_probabilities.get(stage, 0))
            
            if abs(conversion_rate - calibrated_prob) > 0.2:
                recommendations.append(f"Large discrepancy between historical rate ({conversion_rate:.2%}) and calibrated probability ({calibrated_prob:.2%}) for stage '{stage}'. Review model assumptions.")
        
        return recommendations





