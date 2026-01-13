"""
Monte Carlo simulation for revenue forecasting
"""
import random
from typing import List, Dict, Any, Optional
from decimal import Decimal
from datetime import date, datetime, timedelta
from collections import defaultdict
import statistics


class MonteCarloSimulation:
    """Monte Carlo simulation for deal outcomes"""
    
    def __init__(self, seed: Optional[int] = None):
        if seed is not None:
            random.seed(seed)
    
    def simulate_deal_outcome(
        self,
        deal_value: Decimal,
        probability: Decimal,
        iterations: int = 1000
    ) -> Dict[str, Any]:
        """Simulate a single deal outcome"""
        outcomes = []
        for _ in range(iterations):
            # Random draw: deal closes with given probability
            if random.random() < float(probability):
                # Deal closes - add full value
                outcomes.append(float(deal_value))
            else:
                # Deal doesn't close
                outcomes.append(0.0)
        
        return {
            "expected_value": statistics.mean(outcomes),
            "std_dev": statistics.stdev(outcomes) if len(outcomes) > 1 else 0.0,
            "min": min(outcomes),
            "max": max(outcomes),
            "percentiles": {
                "5": self._percentile(outcomes, 5),
                "25": self._percentile(outcomes, 25),
                "50": self._percentile(outcomes, 50),
                "75": self._percentile(outcomes, 75),
                "95": self._percentile(outcomes, 95)
            }
        }
    
    def simulate_portfolio(
        self,
        deals: List[Dict[str, Any]],
        iterations: int = 10000,
        probability_model=None
    ) -> Dict[str, Any]:
        """Simulate a portfolio of deals"""
        portfolio_outcomes = []
        
        for _ in range(iterations):
            iteration_total = Decimal("0")
            
            for deal in deals:
                deal_attrs = deal.get("attributes", {})
                deal_value = Decimal(str(deal_attrs.get("deal_value", 0)))
                
                # Get probability (use model if provided, else use deal probability)
                if probability_model:
                    prob = probability_model.compute_deal_probability(deal_attrs)
                else:
                    prob = Decimal(str(deal_attrs.get("probability", 50))) / 100
                
                # Random draw
                if random.random() < float(prob):
                    iteration_total += deal_value
            
            portfolio_outcomes.append(float(iteration_total))
        
        # Compute statistics
        mean = statistics.mean(portfolio_outcomes)
        std_dev = statistics.stdev(portfolio_outcomes) if len(portfolio_outcomes) > 1 else 0.0
        
        # Confidence intervals
        sorted_outcomes = sorted(portfolio_outcomes)
        confidence_intervals = {
            "50": [
                self._percentile(sorted_outcomes, 25),
                self._percentile(sorted_outcomes, 75)
            ],
            "80": [
                self._percentile(sorted_outcomes, 10),
                self._percentile(sorted_outcomes, 90)
            ],
            "95": [
                self._percentile(sorted_outcomes, 2.5),
                self._percentile(sorted_outcomes, 97.5)
            ]
        }
        
        return {
            "expected_value": mean,
            "std_dev": std_dev,
            "min": min(portfolio_outcomes),
            "max": max(portfolio_outcomes),
            "confidence_intervals": confidence_intervals,
            "distribution": {
                "mean": mean,
                "std_dev": std_dev,
                "percentiles": {
                    "5": self._percentile(sorted_outcomes, 5),
                    "25": self._percentile(sorted_outcomes, 25),
                    "50": self._percentile(sorted_outcomes, 50),
                    "75": self._percentile(sorted_outcomes, 75),
                    "95": self._percentile(sorted_outcomes, 95)
                }
            },
            "iterations": iterations
        }
    
    def simulate_with_timing(
        self,
        deals: List[Dict[str, Any]],
        start_date: date,
        end_date: date,
        iterations: int = 10000,
        probability_model=None
    ) -> Dict[str, Any]:
        """Simulate portfolio with revenue timing distribution"""
        monthly_outcomes = defaultdict(list)
        
        for _ in range(iterations):
            monthly_totals = defaultdict(Decimal)
            
            for deal in deals:
                deal_attrs = deal.get("attributes", {})
                deal_value = Decimal(str(deal_attrs.get("deal_value", 0)))
                
                # Get probability
                if probability_model:
                    prob = probability_model.compute_deal_probability(deal_attrs)
                else:
                    prob = Decimal(str(deal_attrs.get("probability", 50))) / 100
                
                # Random draw
                if random.random() < float(prob):
                    # Determine recognition months
                    rec_start = deal_attrs.get("recognition_start_month")
                    rec_end = deal_attrs.get("recognition_end_month")
                    
                    if rec_start and rec_end:
                        # Distribute across months
                        start = datetime.strptime(rec_start, "%Y-%m-%d").date().replace(day=1)
                        end = datetime.strptime(rec_end, "%Y-%m-%d").date().replace(day=1)
                        
                        months = []
                        current = start
                        while current <= end:
                            if start_date <= current <= end_date:
                                months.append(current)
                            if current.month == 12:
                                current = current.replace(year=current.year + 1, month=1)
                            else:
                                current = current.replace(month=current.month + 1)
                        
                        if months:
                            monthly_amount = deal_value / len(months)
                            for month in months:
                                monthly_totals[month] += monthly_amount
            
            # Record this iteration's monthly totals
            for month, amount in monthly_totals.items():
                monthly_outcomes[month].append(float(amount))
        
        # Compute statistics per month
        monthly_stats = {}
        for month in sorted(monthly_outcomes.keys()):
            outcomes = monthly_outcomes[month]
            monthly_stats[month.isoformat()] = {
                "mean": statistics.mean(outcomes),
                "std_dev": statistics.stdev(outcomes) if len(outcomes) > 1 else 0.0,
                "percentiles": {
                    "5": self._percentile(outcomes, 5),
                    "25": self._percentile(outcomes, 25),
                    "50": self._percentile(outcomes, 50),
                    "75": self._percentile(outcomes, 75),
                    "95": self._percentile(outcomes, 95)
                }
            }
        
        return {
            "monthly_distributions": monthly_stats,
            "iterations": iterations
        }
    
    @staticmethod
    def _percentile(data: List[float], percentile: float) -> float:
        """Calculate percentile of a list"""
        if not data:
            return 0.0
        sorted_data = sorted(data)
        index = (percentile / 100) * (len(sorted_data) - 1)
        lower = int(index)
        upper = lower + 1
        
        if upper >= len(sorted_data):
            return sorted_data[-1]
        
        weight = index - lower
        return sorted_data[lower] * (1 - weight) + sorted_data[upper] * weight





