"""Vercel Serverless Function entrypoint for FastAPI."""
import sys
from pathlib import Path

# Ensure backend root is on sys.path so 'app' can be resolved
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.main import app  # noqa: E402

__all__ = ["app"]
