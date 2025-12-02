"""
Alerting and notification system
"""
import logging
from typing import Dict, Any, List, Optional
from enum import Enum
from datetime import datetime
import os

logger = logging.getLogger(__name__)

class AlertLevel(Enum):
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"

class Alert:
    """Alert message"""
    def __init__(
        self,
        level: AlertLevel,
        message: str,
        details: Optional[Dict[str, Any]] = None,
        timestamp: Optional[datetime] = None
    ):
        self.level = level
        self.message = message
        self.details = details or {}
        self.timestamp = timestamp or datetime.utcnow()
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "level": self.level.value,
            "message": self.message,
            "details": self.details,
            "timestamp": self.timestamp.isoformat()
        }

class AlertManager:
    """Manages alerts and notifications"""
    
    def __init__(self):
        self.alerts: List[Alert] = []
        self.max_alerts = 100  # Keep last 100 alerts
        self.webhook_url = os.getenv("ALERT_WEBHOOK_URL")
        self.email_enabled = os.getenv("ALERT_EMAIL_ENABLED", "false").lower() == "true"
    
    def add_alert(
        self,
        level: AlertLevel,
        message: str,
        details: Optional[Dict[str, Any]] = None
    ):
        """Add an alert"""
        alert = Alert(level, message, details)
        self.alerts.append(alert)
        
        # Keep only recent alerts
        if len(self.alerts) > self.max_alerts:
            self.alerts = self.alerts[-self.max_alerts:]
        
        # Log alert
        log_level = {
            AlertLevel.INFO: logging.INFO,
            AlertLevel.WARNING: logging.WARNING,
            AlertLevel.ERROR: logging.ERROR,
            AlertLevel.CRITICAL: logging.CRITICAL,
        }[level]
        
        logger.log(log_level, f"[{level.value.upper()}] {message}", extra=details)
        
        # Send notifications for critical alerts
        if level in [AlertLevel.ERROR, AlertLevel.CRITICAL]:
            self._send_notification(alert)
    
    def get_recent_alerts(self, level: Optional[AlertLevel] = None, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recent alerts, optionally filtered by level"""
        alerts = self.alerts
        if level:
            alerts = [a for a in alerts if a.level == level]
        
        return [a.to_dict() for a in alerts[-limit:]]
    
    def get_alert_summary(self) -> Dict[str, Any]:
        """Get summary of alerts"""
        counts = {
            "info": 0,
            "warning": 0,
            "error": 0,
            "critical": 0
        }
        
        for alert in self.alerts:
            counts[alert.level.value] += 1
        
        return {
            "total": len(self.alerts),
            "by_level": counts,
            "recent": self.get_recent_alerts(limit=5)
        }
    
    def _send_notification(self, alert: Alert):
        """Send notification for critical alerts"""
        # In production, this would send to:
        # - Webhook (Slack, PagerDuty, etc.)
        # - Email
        # - SMS
        # - etc.
        
        if self.webhook_url:
            try:
                import httpx
                # In production, make async HTTP call
                logger.info(f"Would send webhook notification: {alert.message}")
            except Exception as e:
                logger.error(f"Failed to send webhook notification: {e}")
        
        if self.email_enabled:
            logger.info(f"Would send email notification: {alert.message}")

# Global alert manager instance
alert_manager = AlertManager()


