import logging
from typing import List, Optional

from repositories.lead_repository import LeadRepository
from models.lead_model import LeadModel
from schemas.lead_schema import LeadCreate

logger = logging.getLogger(__name__)


class LeadService:
    """
    Service layer coordinating sales lead captures, queries, and business processing.
    """

    def __init__(self, repository: LeadRepository):
        self._repository = repository

    async def create_lead(self, schema: LeadCreate) -> LeadModel:
        """
        Creates and logs a new captured sales lead.
        """
        logger.info(f"Processing creation of sales lead for Agent ID '{schema.agent_id}'")
        lead_data = LeadModel(
            agent_id=schema.agent_id,
            message=schema.message,
            lead_type=schema.lead_type
        )
        inserted_id = await self._repository.create_lead(lead_data)
        lead_data.id = inserted_id
        return lead_data

    async def get_leads(self, agent_id: Optional[str] = None) -> List[LeadModel]:
        """
        Fetches leads, optionally filtered by agent ID namespace.
        """
        logger.info(f"Processing query for leads. Agent ID filter: '{agent_id}'")
        if agent_id:
            return await self._repository.get_leads_by_agent(agent_id)
        return await self._repository.get_all_leads()
