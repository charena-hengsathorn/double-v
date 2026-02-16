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
        filters: Optional[Dict[str, Any]] = None,
        populate: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Fetch billing records from Strapi"""
        params = {}
        if filters:
            for key, value in filters.items():
                params[f"filters[{key}]"] = value
        if populate:
            params["populate"] = populate
                
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.get(
                    f"{self.base_url}/billings",
                    headers=self._get_headers(),
                    params=params
                )
                response.raise_for_status()
                data = response.json()
                return data.get("data", [])
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 404:
                    return []
                raise
    
    async def get_clients(
        self,
        filters: Optional[Dict[str, Any]] = None,
        populate: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Fetch clients from Strapi"""
        params = {}
        if filters:
            for key, value in filters.items():
                params[f"filters[{key}]"] = value
        if populate:
            params["populate"] = populate
            
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.get(
                    f"{self.base_url}/clients",
                    headers=self._get_headers(),
                    params=params
                )
                response.raise_for_status()
                data = response.json()
                return data.get("data", [])
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 404:
                    return []
                raise
    
    async def get_construction_sales(
        self,
        filters: Optional[Dict[str, Any]] = None,
        populate: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Fetch construction sales from Strapi"""
        params = {}
        if filters:
            for key, value in filters.items():
                params[f"filters[{key}]"] = value
        if populate:
            params["populate"] = populate
            
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.get(
                    f"{self.base_url}/construction-sales",
                    headers=self._get_headers(),
                    params=params
                )
                response.raise_for_status()
                data = response.json()
                return data.get("data", [])
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 404:
                    return []
                raise
    
    async def get_construction_billings(
        self,
        filters: Optional[Dict[str, Any]] = None,
        populate: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Fetch construction billings from Strapi"""
        params = {}
        if filters:
            for key, value in filters.items():
                params[f"filters[{key}]"] = value
        if populate:
            params["populate"] = populate
            
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.get(
                    f"{self.base_url}/construction-billings",
                    headers=self._get_headers(),
                    params=params
                )
                response.raise_for_status()
                data = response.json()
                return data.get("data", [])
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 404:
                    return []
                raise
    
    async def get_loose_furniture_sales(
        self,
        filters: Optional[Dict[str, Any]] = None,
        populate: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Fetch loose furniture sales from Strapi"""
        params = {}
        if filters:
            for key, value in filters.items():
                params[f"filters[{key}]"] = value
        if populate:
            params["populate"] = populate
            
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.get(
                    f"{self.base_url}/loose-furniture-sales",
                    headers=self._get_headers(),
                    params=params
                )
                response.raise_for_status()
                data = response.json()
                return data.get("data", [])
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 404:
                    return []
                raise
    
    async def get_loose_furniture_billings(
        self,
        filters: Optional[Dict[str, Any]] = None,
        populate: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Fetch loose furniture billings from Strapi"""
        params = {}
        if filters:
            for key, value in filters.items():
                params[f"filters[{key}]"] = value
        if populate:
            params["populate"] = populate
            
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.get(
                    f"{self.base_url}/loose-furniture-billings",
                    headers=self._get_headers(),
                    params=params
                )
                response.raise_for_status()
                data = response.json()
                return data.get("data", [])
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 404:
                    return []
                raise
    
    async def get_interior_design_sales(
        self,
        filters: Optional[Dict[str, Any]] = None,
        populate: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Fetch interior design sales from Strapi"""
        params = {}
        if filters:
            for key, value in filters.items():
                params[f"filters[{key}]"] = value
        if populate:
            params["populate"] = populate
            
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.get(
                    f"{self.base_url}/interior-design-sales",
                    headers=self._get_headers(),
                    params=params
                )
                response.raise_for_status()
                data = response.json()
                return data.get("data", [])
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 404:
                    return []
                raise
    
    async def get_interior_design_billings(
        self,
        filters: Optional[Dict[str, Any]] = None,
        populate: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Fetch interior design billings from Strapi"""
        params = {}
        if filters:
            for key, value in filters.items():
                params[f"filters[{key}]"] = value
        if populate:
            params["populate"] = populate
            
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.get(
                    f"{self.base_url}/interior-design-billings",
                    headers=self._get_headers(),
                    params=params
                )
                response.raise_for_status()
                data = response.json()
                return data.get("data", [])
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 404:
                    return []
                raise
    
    async def get_all_sales(
        self,
        filters: Optional[Dict[str, Any]] = None
    ) -> Dict[str, List[Dict[str, Any]]]:
        """Fetch all sales data from all branches"""
        try:
            construction = await self.get_construction_sales(filters=filters)
            loose_furniture = await self.get_loose_furniture_sales(filters=filters)
            interior_design = await self.get_interior_design_sales(filters=filters)
            
            return {
                "construction": construction,
                "loose_furniture": loose_furniture,
                "interior_design": interior_design,
                "total": construction + loose_furniture + interior_design
            }
        except Exception as e:
            print(f"Error fetching all sales: {e}")
            return {
                "construction": [],
                "loose_furniture": [],
                "interior_design": [],
                "total": []
            }
    
    async def get_all_billings(
        self,
        filters: Optional[Dict[str, Any]] = None
    ) -> Dict[str, List[Dict[str, Any]]]:
        """Fetch all billings data from all branches"""
        try:
            general = await self.get_billings(filters=filters)
            construction = await self.get_construction_billings(filters=filters)
            loose_furniture = await self.get_loose_furniture_billings(filters=filters)
            interior_design = await self.get_interior_design_billings(filters=filters)
            
            return {
                "general": general,
                "construction": construction,
                "loose_furniture": loose_furniture,
                "interior_design": interior_design,
                "total": general + construction + loose_furniture + interior_design
            }
        except Exception as e:
            print(f"Error fetching all billings: {e}")
            return {
                "general": [],
                "construction": [],
                "loose_furniture": [],
                "interior_design": [],
                "total": []
            }
    
    async def get_projects(
        self,
        filters: Optional[Dict[str, Any]] = None,
        populate: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Fetch projects from Strapi"""
        params = {}
        if filters:
            for key, value in filters.items():
                params[f"filters[{key}]"] = value
        if populate:
            params["populate"] = populate
            
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.get(
                    f"{self.base_url}/projects",
                    headers=self._get_headers(),
                    params=params
                )
                response.raise_for_status()
                data = response.json()
                return data.get("data", [])
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 404:
                    return []
                raise
    
    async def health_check(self) -> bool:
        """Check if Strapi is accessible"""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                # Try to access the admin endpoint or a simple API endpoint
                base_url = self.base_url.replace('/api', '')
                response = await client.get(f"{base_url}/admin", headers=self._get_headers())
                return response.status_code < 500
        except:
            # If admin endpoint fails, try a simple API endpoint
            try:
                async with httpx.AsyncClient(timeout=5.0) as client:
                    response = await client.get(f"{self.base_url}/clients?pagination[limit]=1", headers=self._get_headers())
                    return response.status_code < 500
            except:
                return False





