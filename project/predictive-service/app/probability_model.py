"""
Stage-based probability rules and probability adjustment logic
"""
from typing import Dict, Any, Optional
from decimal import Decimal
from datetime import date, datetime, timedelta


class ProbabilityModel:
    """Stage-based probability rules and adjustments"""
    
    # Default stage-based probability rules
    STAGE_PROBABILITIES = {
        "prospecting": Decimal("0.10"),
        "qualification": Decimal("0.25"),
        "proposal": Decimal("0.50"),
        "negotiation": Decimal("0.75"),
        "closed-won": Decimal("1.00"),
        "closed-lost": Decimal("0.00")
    }
    
    # Probability adjustments based on deal attributes
    ADJUSTMENT_FACTORS = {
        "high_value": Decimal("0.05"),  # +5% for deals > 1M
        "low_activity": Decimal("-0.10"),  # -10% if no activity in 30 days
        "risk_flags": Decimal("-0.15"),  # -15% if has high severity risk flags
        "repeat_client": Decimal("0.10"),  # +10% for repeat clients
        "complexity_high": Decimal("-0.05")  # -5% for high complexity
    }
    
    @classmethod
    def get_base_probability(cls, stage: str) -> Decimal:
        """Get base probability for a stage"""
        return cls.STAGE_PROBABILITIES.get(stage.lower(), Decimal("0.50"))
    
    @classmethod
    def adjust_probability(
        cls,
        base_probability: Decimal,
        deal_attrs: Dict[str, Any],
        historical_data: Optional[Dict[str, Any]] = None
    ) -> Decimal:
        """Adjust probability based on deal attributes and historical patterns"""
        adjusted = base_probability
        
        # High value adjustment
        deal_value = Decimal(str(deal_attrs.get("deal_value", 0)))
        if deal_value > 1000000:
            adjusted += cls.ADJUSTMENT_FACTORS["high_value"]
        
        # Activity check
        last_activity = deal_attrs.get("last_activity_at")
        if last_activity:
            try:
                if isinstance(last_activity, str):
                    activity_date = datetime.fromisoformat(last_activity.replace("Z", "+00:00"))
                else:
                    activity_date = last_activity
                
                days_since_activity = (datetime.now(activity_date.tzinfo) - activity_date).days
                if days_since_activity > 30:
                    adjusted += cls.ADJUSTMENT_FACTORS["low_activity"]
            except:
                pass
        
        # Risk flags check
        risk_flags = deal_attrs.get("risk_flags", {}).get("data", [])
        if risk_flags:
            high_severity = any(
                flag.get("attributes", {}).get("severity") == "high" 
                for flag in risk_flags
            )
            if high_severity:
                adjusted += cls.ADJUSTMENT_FACTORS["risk_flags"]
        
        # Repeat client check (would need historical data)
        if historical_data and historical_data.get("is_repeat_client"):
            adjusted += cls.ADJUSTMENT_FACTORS["repeat_client"]
        
        # Complexity check
        project = deal_attrs.get("project", {}).get("data", {})
        if project:
            complexity = project.get("attributes", {}).get("complexity_score", 5)
            if complexity >= 8:
                adjusted += cls.ADJUSTMENT_FACTORS["complexity_high"]
        
        # Clamp between 0 and 1
        adjusted = max(Decimal("0"), min(Decimal("1"), adjusted))
        
        return adjusted
    
    @classmethod
    def compute_deal_probability(
        cls,
        deal_attrs: Dict[str, Any],
        use_override: bool = True,
        historical_data: Optional[Dict[str, Any]] = None
    ) -> Decimal:
        """Compute final probability for a deal"""
        # Use override if available and requested
        if use_override and deal_attrs.get("confidence_override"):
            return Decimal(str(deal_attrs["confidence_override"])) / 100
        
        # Use explicit probability if set
        if deal_attrs.get("probability"):
            base_prob = Decimal(str(deal_attrs["probability"])) / 100
        else:
            # Derive from stage
            stage = deal_attrs.get("stage", "prospecting")
            base_prob = cls.get_base_probability(stage)
        
        # Apply adjustments
        adjusted_prob = cls.adjust_probability(base_prob, deal_attrs, historical_data)
        
        return adjusted_prob
    
    @classmethod
    def get_scenario_probability(
        cls,
        base_probability: Decimal,
        scenario: str,
        scenario_multiplier: Optional[Decimal] = None
    ) -> Decimal:
        """Get probability for a scenario"""
        if scenario == "base":
            return base_probability
        elif scenario == "best" or scenario == "optimistic":
            multiplier = scenario_multiplier or Decimal("1.20")
            return min(Decimal("1.0"), base_probability * multiplier)
        elif scenario == "worst" or scenario == "pessimistic":
            multiplier = scenario_multiplier or Decimal("0.80")
            return max(Decimal("0"), base_probability * multiplier)
        else:
            # Custom scenario - use provided multiplier or default
            multiplier = scenario_multiplier or Decimal("1.0")
            return max(Decimal("0"), min(Decimal("1.0"), base_probability * multiplier))



