"""
Webhook handler for Strapi events
"""
import hmac
import hashlib
import json
from typing import Dict, Any, Optional
from fastapi import Request, HTTPException, Header
from app.strapi_client import StrapiClient
from app.forecast_service import ForecastService
from app.probability_model import ProbabilityModel
import os
import logging

logger = logging.getLogger(__name__)

class WebhookHandler:
    def __init__(self, strapi_client: StrapiClient, forecast_service: ForecastService):
        self.strapi = strapi_client
        self.forecast_service = forecast_service
        self.webhook_secret = os.getenv("STRAPI_WEBHOOK_SECRET", "")
    
    def verify_signature(self, payload: bytes, signature: str) -> bool:
        """Verify HMAC signature of webhook payload"""
        if not self.webhook_secret:
            logger.warning("Webhook secret not configured, skipping signature verification")
            return True
        
        expected_signature = hmac.new(
            self.webhook_secret.encode(),
            payload,
            hashlib.sha256
        ).hexdigest()
        
        return hmac.compare_digest(expected_signature, signature)
    
    async def handle_webhook(
        self,
        request: Request,
        x_strapi_event: Optional[str] = Header(None),
        x_strapi_entity: Optional[str] = Header(None),
        x_strapi_signature: Optional[str] = Header(None)
    ) -> Dict[str, Any]:
        """Handle incoming webhook from Strapi"""
        try:
            # Read raw body for signature verification
            body = await request.body()
            
            # Verify signature if provided
            if x_strapi_signature:
                if not self.verify_signature(body, x_strapi_signature):
                    logger.error("Invalid webhook signature")
                    raise HTTPException(status_code=401, detail="Invalid webhook signature")
            
            # Parse JSON payload
            payload = json.loads(body.decode())
            event = x_strapi_event or payload.get("event")
            entity = x_strapi_entity or payload.get("entity")
            
            logger.info(f"Received webhook: {event} for {entity}")
            
            # Handle different event types
            if event == "entry.create" or event == "entry.update":
                if entity == "pipeline-deal":
                    return await self._handle_deal_change(payload)
                elif entity == "billing":
                    return await self._handle_billing_change(payload)
            
            elif event == "entry.delete":
                if entity == "pipeline-deal":
                    return await self._handle_deal_delete(payload)
            
            return {
                "status": "processed",
                "event": event,
                "entity": entity,
                "message": "Event processed but no action taken"
            }
            
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON in webhook payload: {e}")
            raise HTTPException(status_code=400, detail="Invalid JSON payload")
        except Exception as e:
            logger.error(f"Error processing webhook: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Error processing webhook: {str(e)}")
    
    async def _handle_deal_change(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Handle pipeline deal create/update"""
        entry = payload.get("entry", {})
        deal_id = entry.get("id")
        
        if not deal_id:
            return {"status": "skipped", "reason": "No deal ID in payload"}
        
        logger.info(f"Processing deal change for deal ID: {deal_id}")
        
        # Trigger forecast recompute for this deal
        # In production, this would be more sophisticated
        try:
            # Fetch updated deal
            deals = await self.strapi.get_pipeline_deals(filters={"id": deal_id})
            if not deals:
                return {"status": "skipped", "reason": "Deal not found"}
            
            # For now, just log the change
            # In production, this would trigger a forecast recompute
            logger.info(f"Deal {deal_id} changed, forecast recompute would be triggered")
            
            return {
                "status": "processed",
                "deal_id": deal_id,
                "action": "forecast_recompute_queued"
            }
        except Exception as e:
            logger.error(f"Error handling deal change: {e}")
            return {
                "status": "error",
                "deal_id": deal_id,
                "error": str(e)
            }
    
    async def _handle_billing_change(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Handle billing create/update"""
        entry = payload.get("entry", {})
        billing_id = entry.get("id")
        
        logger.info(f"Processing billing change for billing ID: {billing_id}")
        
        # Billing changes might affect historical data used for calibration
        # In production, this would trigger calibration update
        return {
            "status": "processed",
            "billing_id": billing_id,
            "action": "calibration_update_queued"
        }
    
    async def _handle_deal_delete(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Handle pipeline deal delete"""
        entry = payload.get("entry", {})
        deal_id = entry.get("id")
        
        logger.info(f"Processing deal delete for deal ID: {deal_id}")
        
        # Remove forecast snapshots for deleted deal
        # In production, this would clean up related data
        return {
            "status": "processed",
            "deal_id": deal_id,
            "action": "cleanup_queued"
        }

