import logging
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from bson.errors import InvalidId
from motor.motor_asyncio import AsyncIOMotorDatabase

from models.agent_model import AgentModel
from core.exceptions import DatabaseWriteException

logger = logging.getLogger(__name__)


class AgentRepository:
    """
    Repository class managing CRUD operations for custom AI Agents in MongoDB.
    """

    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db["agents"]

    async def create_agent(self, agent_data: AgentModel) -> str:
        try:
            doc_dict = agent_data.model_dump(by_alias=True, exclude_none=True)
            result = await self.collection.insert_one(doc_dict)
            inserted_id = str(result.inserted_id)
            logger.info(f"Successfully created agent: '{agent_data.name}' (ID: {inserted_id})")
            return inserted_id
        except Exception as e:
            logger.error(f"Failed to create agent in MongoDB: {e}")
            raise DatabaseWriteException(f"Failed to create agent: {e}") from e

    async def get_all_agents(self) -> List[AgentModel]:
        try:
            cursor = self.collection.find().sort("created_at", -1)
            agents = []
            async for doc in cursor:
                doc["_id"] = str(doc["_id"])
                agents.append(AgentModel.model_validate(doc))
            return agents
        except Exception as e:
            logger.error(f"Failed to fetch agents list from MongoDB: {e}")
            raise DatabaseWriteException(f"Failed to retrieve agents list: {e}") from e

    async def get_agent_by_id(self, agent_id: str) -> Optional[AgentModel]:
        try:
            object_id = ObjectId(agent_id)
        except InvalidId:
            logger.warning(f"Invalid ObjectId format provided: '{agent_id}'")
            return None

        try:
            doc = await self.collection.find_one({"_id": object_id})
            if doc:
                doc["_id"] = str(doc["_id"])
                return AgentModel.model_validate(doc)
            return None
        except Exception as e:
            logger.error(f"Failed to fetch agent by ID '{agent_id}': {e}")
            raise DatabaseWriteException(f"Failed to retrieve agent specs: {e}") from e

    async def update_agent(self, agent_id: str, update_data: dict) -> bool:
        try:
            object_id = ObjectId(agent_id)
        except InvalidId:
            logger.warning(f"Invalid ObjectId format provided for update: '{agent_id}'")
            return False

        try:
            update_data["updated_at"] = datetime.utcnow()
            result = await self.collection.update_one(
                {"_id": object_id},
                {"$set": update_data}
            )
            return result.modified_count > 0 or result.matched_count > 0
        except Exception as e:
            logger.error(f"Failed to update agent by ID '{agent_id}': {e}")
            raise DatabaseWriteException(f"Failed to update agent: {e}") from e

    async def delete_agent(self, agent_id: str) -> bool:
        try:
            object_id = ObjectId(agent_id)
        except InvalidId:
            logger.warning(f"Invalid ObjectId format provided for deletion: '{agent_id}'")
            return False

        try:
            result = await self.collection.delete_one({"_id": object_id})
            return result.deleted_count > 0
        except Exception as e:
            logger.error(f"Failed to delete agent by ID '{agent_id}': {e}")
            raise DatabaseWriteException(f"Failed to delete agent: {e}") from e
