"""
Tests for Monte Carlo simulation
"""
import pytest
from decimal import Decimal
from app.monte_carlo import MonteCarloSimulation


class TestMonteCarloSimulation:
    def test_simulate_deal_outcome(self):
        """Test single deal outcome simulation"""
        sim = MonteCarloSimulation(seed=42)
        
        deal_value = Decimal("100000")
        probability = Decimal("0.75")
        
        result = sim.simulate_deal_outcome(deal_value, probability, iterations=1000)
        
        assert "expected_value" in result
        assert "std_dev" in result
        assert "min" in result
        assert "max" in result
        assert "percentiles" in result
        
        # Expected value should be close to deal_value * probability
        expected = float(deal_value * probability)
        assert abs(result["expected_value"] - expected) < expected * 0.1  # Within 10%
    
    def test_simulate_portfolio(self):
        """Test portfolio simulation"""
        sim = MonteCarloSimulation(seed=42)
        
        deals = [
            {
                "attributes": {
                    "deal_value": 100000,
                    "probability": 50
                }
            },
            {
                "attributes": {
                    "deal_value": 200000,
                    "probability": 75
                }
            }
        ]
        
        result = sim.simulate_portfolio(deals, iterations=1000)
        
        assert "expected_value" in result
        assert "confidence_intervals" in result
        assert "distribution" in result
        assert "iterations" in result
        
        # Expected value should be positive
        assert result["expected_value"] > 0
        
        # Confidence intervals should be valid
        assert "50" in result["confidence_intervals"]
        assert "80" in result["confidence_intervals"]
        assert "95" in result["confidence_intervals"]
    
    def test_percentile_calculation(self):
        """Test percentile calculation"""
        sim = MonteCarloSimulation()
        
        data = [1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0]
        
        assert sim._percentile(data, 50) == 5.5  # Median
        assert sim._percentile(data, 25) == 3.25  # Q1
        assert sim._percentile(data, 75) == 7.75  # Q3
    
    def test_empty_data_handling(self):
        """Test handling of empty data"""
        sim = MonteCarloSimulation()
        
        assert sim._percentile([], 50) == 0.0




