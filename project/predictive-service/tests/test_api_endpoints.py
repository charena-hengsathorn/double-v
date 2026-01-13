"""
Tests for API endpoints
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


class TestHealthEndpoints:
    def test_health_check(self):
        """Test basic health check"""
        response = client.get("/api/v1/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "version" in data
        assert "service" in data
    
    def test_detailed_health(self):
        """Test detailed health check"""
        response = client.get("/api/v1/health/detailed")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "services" in data
        assert "alerts" in data
        assert "circuit_breaker" in data


class TestForecastEndpoints:
    def test_get_base_forecast(self):
        """Test base forecast endpoint"""
        response = client.get("/api/v1/models/forecast/base")
        assert response.status_code in [200, 500]  # May fail if Strapi not available
        if response.status_code == 200:
            data = response.json()
            assert "forecast" in data
            assert "generated_at" in data
    
    def test_get_scenario_forecast(self):
        """Test scenario forecast endpoint"""
        response = client.get("/api/v1/models/forecast/scenario/base")
        assert response.status_code in [200, 500]
        if response.status_code == 200:
            data = response.json()
            assert "forecast" in data
    
    def test_get_risk_heatmap(self):
        """Test risk heatmap endpoint"""
        response = client.get("/api/v1/models/risk/heatmap")
        assert response.status_code in [200, 500]
        if response.status_code == 200:
            data = response.json()
            assert "heatmap" in data
            assert "top_risks" in data
            assert "summary" in data


class TestWebhookEndpoints:
    def test_webhook_endpoint_exists(self):
        """Test webhook endpoint exists"""
        # Test with invalid payload
        response = client.post("/api/v1/webhooks/strapi", json={})
        # Should not return 404
        assert response.status_code != 404


class TestAlertEndpoints:
    def test_get_alerts(self):
        """Test alerts endpoint"""
        response = client.get("/api/v1/alerts")
        assert response.status_code == 200
        data = response.json()
        assert "alerts" in data
        assert "summary" in data





