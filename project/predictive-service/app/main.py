from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(title="Double V Predictive Service", version="1.0.0")

# CORS configuration
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Double V Predictive Service", "version": "1.0.0"}

@app.get("/api/v1/health")
async def health():
    return {
        "status": "healthy",
        "version": "1.0.0",
        "service": "predictive-service"
    }

@app.get("/api/v1/models/forecast/base")
async def get_base_forecast():
    """Get base forecast - placeholder"""
    return {
        "forecast": {
            "start_month": "2024-01-01",
            "end_month": "2024-12-31",
            "monthly_totals": [],
            "summary": {
                "total_confirmed": 0,
                "total_tentative": 0,
                "total_forecast": 0
            }
        }
    }

@app.get("/api/v1/models/risk/heatmap")
async def get_risk_heatmap():
    """Get risk heatmap - placeholder"""
    return {
        "heatmap": {
            "stages": [],
            "probability_buckets": [],
            "matrix": []
        },
        "top_risks": [],
        "summary": {
            "total_at_risk": 0,
            "high_risk_count": 0
        }
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

