"""
Strapi API client for fetching data
"""
import httpx
import os
from typing import Optional, Dict, Any, List
from datetime import datetime


class StrapiClient:
    def __init__(self):
        self.base_url = os.getenv("STRAPI_URL", "http://localhost:1337/api")
        self.api_token = os.getenv("STRAPI_API_TOKEN")
        self.timeout = 30.0
        
    def _get_headers(self) -> Dict[str, str]:
        headers = {"Content-Type": "application/json"}
        if self.api_token:
            headers["Authorization"] = f"Bearer {self.api_token}"
        return headers
    
    async def get_pipeline_deals(
        self,
        filters: Optional[Dict[str, Any]] = None,
        populate: Optional[str] = None,
        sort: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Fetch pipeline deals from Strapi"""
        params = {}
        if filters:
            # Convert filters dict to Strapi query format
            for key, value in filters.items():
                params[f"filters[{key}]"] = value
        if populate:
            params["populate"] = populate
        if sort:
            params["sort"] = sort
            
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(
                f"{self.base_url}/pipeline-deals",
                headers=self._get_headers(),
                params=params
            )
            response.raise_for_status()
            data = response.json()
            return data.get("data", [])
    
    async def get_forecast_snapshots(
        self,
        filters: Optional[Dict[str, Any]] = None,
        populate: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Fetch forecast snapshots from Strapi"""
        params = {}
        if filters:
            for key, value in filters.items():
                params[f"filters[{key}]"] = value
        if populate:
            params["populate"] = populate
            
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(
                f"{self.base_url}/forecast-snapshots",
                headers=self._get_headers(),
                params=params
            )
            response.raise_for_status()
            data = response.json()
            return data.get("data", [])
    
    async def create_forecast_snapshot(self, snapshot_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a forecast snapshot in Strapi"""
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                f"{self.base_url}/forecast-snapshots",
                headers=self._get_headers(),
                json={"data": snapshot_data}
            )
            response.raise_for_status()
            return response.json()
    
    async def bulk_create_snapshots(self, snapshots: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Bulk create forecast snapshots"""
        # Note: Strapi doesn't have native bulk create, so we'll do sequential
        # In production, you might want to batch these
        results = []
        for snapshot in snapshots:
            try:
                result = await self.create_forecast_snapshot(snapshot)
                results.append(result)
            except Exception as e:
                # Log error but continue
                print(f"Error creating snapshot: {e}")
        return {"created": len(results), "results": results}
    
    async def get_billings(
        self,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """Fetch billing records from Strapi"""
        params = {}
        if filters:
            for key, value in filters.items():
                params[f"filters[{key}]"] = value
                
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(
                f"{self.base_url}/billings",
                headers=self._get_headers(),
                params=params
            )
            response.raise_for_status()
            data = response.json()
            return data.get("data", [])
    
    async def health_check(self) -> bool:
        """Check if Strapi is accessible"""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{self.base_url.replace('/api', '')}/admin")
                return response.status_code < 500
        except:
            return False




