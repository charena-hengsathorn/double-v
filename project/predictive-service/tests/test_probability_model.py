"""
Tests for probability model
"""
import pytest
from decimal import Decimal
from app.probability_model import ProbabilityModel


class TestProbabilityModel:
    def test_get_base_probability(self):
        """Test base probability retrieval by stage"""
        model = ProbabilityModel()
        
        assert model.get_base_probability("prospecting") == Decimal("0.10")
        assert model.get_base_probability("qualification") == Decimal("0.25")
        assert model.get_base_probability("proposal") == Decimal("0.50")
        assert model.get_base_probability("negotiation") == Decimal("0.75")
        assert model.get_base_probability("closed-won") == Decimal("1.00")
        assert model.get_base_probability("closed-lost") == Decimal("0.00")
        assert model.get_base_probability("unknown") == Decimal("0.50")  # Default
    
    def test_adjust_probability_high_value(self):
        """Test probability adjustment for high-value deals"""
        model = ProbabilityModel()
        base_prob = Decimal("0.50")
        
        deal_attrs = {"deal_value": 1500000}  # > 1M
        adjusted = model.adjust_probability(base_prob, deal_attrs)
        
        assert adjusted > base_prob
        assert adjusted <= Decimal("1.0")
    
    def test_adjust_probability_low_activity(self):
        """Test probability adjustment for low activity"""
        model = ProbabilityModel()
        base_prob = Decimal("0.50")
        
        from datetime import datetime, timedelta
        deal_attrs = {
            "last_activity_at": (datetime.now() - timedelta(days=35)).isoformat()
        }
        adjusted = model.adjust_probability(base_prob, deal_attrs)
        
        assert adjusted < base_prob
        assert adjusted >= Decimal("0.0")
    
    def test_compute_deal_probability_with_override(self):
        """Test probability computation with confidence override"""
        model = ProbabilityModel()
        
        deal_attrs = {
            "confidence_override": 85,
            "stage": "prospecting"
        }
        
        prob = model.compute_deal_probability(deal_attrs, use_override=True)
        assert prob == Decimal("0.85")
    
    def test_compute_deal_probability_from_stage(self):
        """Test probability computation from stage"""
        model = ProbabilityModel()
        
        deal_attrs = {
            "stage": "negotiation"
        }
        
        prob = model.compute_deal_probability(deal_attrs, use_override=False)
        assert prob == Decimal("0.75")
    
    def test_get_scenario_probability(self):
        """Test scenario probability computation"""
        model = ProbabilityModel()
        base_prob = Decimal("0.50")
        
        # Base scenario
        assert model.get_scenario_probability(base_prob, "base") == base_prob
        
        # Best scenario
        best_prob = model.get_scenario_probability(base_prob, "best")
        assert best_prob > base_prob
        assert best_prob <= Decimal("1.0")
        
        # Worst scenario
        worst_prob = model.get_scenario_probability(base_prob, "worst")
        assert worst_prob < base_prob
        assert worst_prob >= Decimal("0.0")
    
    def test_probability_clamping(self):
        """Test that probabilities are clamped to [0, 1]"""
        model = ProbabilityModel()
        
        # Test with extreme adjustments
        deal_attrs = {
            "deal_value": 2000000,  # High value
            "last_activity_at": (datetime.now() - timedelta(days=100)).isoformat()  # Very old
        }
        
        adjusted = model.adjust_probability(Decimal("0.10"), deal_attrs)
        assert adjusted >= Decimal("0.0")
        assert adjusted <= Decimal("1.0")



