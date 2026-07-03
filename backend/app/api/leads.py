import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, status

from schemas.lead_schema import LeadResponse
from services.lead_service import LeadService
from core.dependencies import get_lead_service

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Leads"])


@router.get(
    "/leads",
    response_model=List[LeadResponse],
    status_code=status.HTTP_200_OK,
    summary="List captured sales leads",
    description="Returns metadata of all captured sales leads, optionally filtered by agent namespace."
)
async def list_leads(
    agent_id: Optional[str] = None,
    lead_service: LeadService = Depends(get_lead_service)
):
    logger.info(f"API request received to retrieve sales leads. Agent filter: '{agent_id}'")
    leads = await lead_service.get_leads(agent_id)
    return [LeadResponse.model_validate(l.model_dump()) for l in leads]
