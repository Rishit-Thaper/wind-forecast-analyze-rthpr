"""FastAPI application entry point."""
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import get_settings
from app.core.errors import ElexonError, elexon_error_handler

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("wind_analytics")


def create_app() -> FastAPI:
    """Application factory for FastAPI app."""
    settings = get_settings()

    app = FastAPI(
        title="Wind Analytics API",
        description="UK national wind-generation forecast accuracy dashboard API for January 2026.",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # CORS configuration
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["GET"],
        allow_headers=["*"],
    )

    # Exception Handlers
    app.add_exception_handler(ElexonError, elexon_error_handler)

    # Include Routes
    app.include_router(api_router)

    return app


app = create_app()
