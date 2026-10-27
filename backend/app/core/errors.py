"""Custom application exceptions and error handling."""
from fastapi import Request
from fastapi.responses import JSONResponse


class ElexonError(RuntimeError):
    """Raised when communication with Elexon BMRS fails or returns invalid data."""
    pass


async def elexon_error_handler(request: Request, exc: ElexonError) -> JSONResponse:
    """Map ElexonError to a structured 503 Service Unavailable response."""
    return JSONResponse(
        status_code=503,
        content={"detail": str(exc)},
    )
