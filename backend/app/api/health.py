import logging
from fastapi import APIRouter, Depends, status

from schemas.health import HealthResponse
from core.config import settings
from core.dependencies import get_mongodb_manager
from database.mongodb import MongoDBManager

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Health"])


@router.get(
    "/health",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Get System Health",
    description="Returns the health status and database connectivity status."
)
async def health_check(
    mongo_manager: MongoDBManager = Depends(get_mongodb_manager)
):
    """
    Check the health of the API server and its connection to MongoDB.
    """
    mongo_ok = await mongo_manager.verify_connectivity()
    
    if mongo_ok:
        status_val = "healthy"
        db_connected = "connected"
    else:
        status_val = "unhealthy"
        db_connected = "disconnected"
        logger.warning("Health diagnostic detected connection degradation to MongoDB database.")

    return HealthResponse(
        status=status_val,
        database=db_connected
    )
