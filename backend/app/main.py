"""FastAPI application entry point."""
import logging

from fastapi import FastAPI, Request
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

    # Vercel Path Normalizer: Vercel rewrite routes to /api/index.py while preserving
    # the requested client path in the 'x-matched-path' header.
    @app.middleware("http")
    async def vercel_path_normalizer(request: Request, call_next):
        matched_path = request.headers.get("x-matched-path")
        if matched_path:
            request.scope["path"] = matched_path.split("?")[0]
        return await call_next(request)

    # CORS configuration
    is_wildcard = "*" in settings.cors_origins
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"] if is_wildcard else settings.cors_origins,
        allow_origin_regex=None if is_wildcard else r"https://.*\.vercel\.app",
        allow_credentials=not is_wildcard,
        allow_methods=["GET"],
        allow_headers=["*"],
    )

    # Exception Handlers
    app.add_exception_handler(ElexonError, elexon_error_handler)

    # Root status and direct health checks
    @app.get("/", tags=["Health"])
    def root():
        return {
            "status": "ok",
            "service": "wind-analytics",
            "docs": "/docs",
            "health": "/api/health",
        }

    @app.get("/health", tags=["Health"])
    def direct_health():
        return {"status": "ok", "service": "wind-analytics"}

    # Include Routes
    app.include_router(api_router)

    return app



app = create_app()
