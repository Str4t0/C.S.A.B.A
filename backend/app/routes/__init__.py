"""
API Routes Package
"""

from .users import router as users_router
from .locations import router as locations_router
from .qr_codes import router as qr_router

__all__ = ["users_router", "locations_router", "qr_router"]
