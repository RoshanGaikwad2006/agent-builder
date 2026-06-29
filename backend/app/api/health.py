import time
import logging
from fastapi import APIRouter, Depends, status

from schemas.health import HealthResponse
from core.config import settings
from core.dependencies import get_vectorstore_provider
from services.vectorstore.base import VectorStoreProvider

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Health"])


@router.get(
    "/health",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Get System Health",
    description="Returns the health status, semantic version, database connectivity, and system uptime in seconds."
)
async def health_check(
    vectorstore: VectorStoreProvider = Depends(get_vectorstore_provider)
):
    """
    Check the health of the API server and its connections to downstream services.
    """
    uptime = time.time() - settings.START_TIME

    # Check database connectivity health status
    db_connected = vectorstore.verify_connectivity()
    status_val = "healthy" if db_connected else "degraded"

    if not db_connected:
        logger.warning("Health diagnostic detected connection degradation to Pinecone database.")

    return HealthResponse(
        status=status_val,
        version=settings.APP_VERSION,
        uptime=uptime
    )
