import logging
from typing import List, Optional
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from models.lead_model import LeadModel
from core.exceptions import DatabaseWriteException

logger = logging.getLogger(__name__)


class LeadRepository:
    """
    Repository layer managing sales leads collections in MongoDB.
    """

    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db["leads"]

    async def create_lead(self, lead_data: LeadModel) -> str:
        """
        Inserts a new sales lead log record.
        """
        try:
            doc_dict = lead_data.model_dump(by_alias=True, exclude_none=True)
            result = await self.collection.insert_one(doc_dict)
            inserted_id = str(result.inserted_id)
            logger.info(f"Logged sales lead capture: Agent ID '{lead_data.agent_id}', Type: {lead_data.lead_type} (ID: {inserted_id})")
            return inserted_id
        except Exception as e:
            logger.error(f"Failed to log sales lead in MongoDB: {e}")
            raise DatabaseWriteException(f"Failed to write sales lead: {e}") from e

    async def get_all_leads(self) -> List[LeadModel]:
        """
        Returns list of all sales leads logged across the platform.
        """
        try:
            cursor = self.collection.find().sort("created_at", -1)
            leads = []
            async for doc in cursor:
                doc["_id"] = str(doc["_id"])
                leads.append(LeadModel.model_validate(doc))
            return leads
        except Exception as e:
            logger.error(f"Failed to fetch leads from MongoDB: {e}")
            raise DatabaseWriteException(f"Failed to retrieve leads: {e}") from e

    async def get_leads_by_agent(self, agent_id: str) -> List[LeadModel]:
        """
        Returns list of leads captured by a specific agent namespace.
        """
        try:
            cursor = self.collection.find({"agent_id": agent_id}).sort("created_at", -1)
            leads = []
            async for doc in cursor:
                doc["_id"] = str(doc["_id"])
                leads.append(LeadModel.model_validate(doc))
            return leads
        except Exception as e:
            logger.error(f"Failed to fetch leads for Agent '{agent_id}' from MongoDB: {e}")
            raise DatabaseWriteException(f"Failed to retrieve leads: {e}") from e
