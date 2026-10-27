"""Backward compatibility alias for app.core.config."""
from app.core.config import Settings, get_settings, settings, JANUARY_START, FEBRUARY_START, UTC

__all__ = ["Settings", "get_settings", "settings", "JANUARY_START", "FEBRUARY_START", "UTC"]
