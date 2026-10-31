"""Backward compatibility alias for app.core.config."""
from app.core.config import (
    DECISION_END,
    DECISION_START,
    DELIVERY_END,
    DELIVERY_START,
    UTC,
    Settings,
    get_settings,
    settings,
)

__all__ = [
    "Settings",
    "get_settings",
    "settings",
    "DECISION_START",
    "DECISION_END",
    "DELIVERY_START",
    "DELIVERY_END",
    "UTC",
]
