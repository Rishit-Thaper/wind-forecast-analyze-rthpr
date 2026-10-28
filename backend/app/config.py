"""Backward compatibility alias for app.core.config."""
from app.core.config import (
    FEBRUARY_START,
    JANUARY_START,
    UTC,
    Settings,
    get_settings,
    settings,
)

__all__ = ["Settings", "get_settings", "settings", "JANUARY_START", "FEBRUARY_START", "UTC"]
