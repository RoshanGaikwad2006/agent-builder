import logging
from typing import List, Optional
from bson import ObjectId
from bson.errors import InvalidId
from motor.motor_asyncio import AsyncIOMotorDatabase

from models.conversation_model import ConversationModel
from core.exceptions import DatabaseWriteException

logger = logging.getLogger(__name__)


class ConversationRepository:
    """
    Repository class managing conversation message logs and interaction latency stats in MongoDB.
    """

    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db["conversations"]

    async def log_interaction(self, conversation_data: ConversationModel) -> str:
        """
        Records a single chat session interaction with its latency and model configurations.
        """
        try:
            doc_dict = conversation_data.model_dump(by_alias=True, exclude_none=True)
            result = await self.collection.insert_one(doc_dict)
            inserted_id = str(result.inserted_id)
            logger.info(f"Logged chat interaction in MongoDB. Model: '{conversation_data.model_name}', Latency: {conversation_data.response_time} (ID: {inserted_id})")
            return inserted_id
        except Exception as e:
            logger.error(f"Failed to save conversation in MongoDB: {e}")
            raise DatabaseWriteException(f"Failed to save conversation history: {e}") from e

    async def get_history(self) -> List[ConversationModel]:
        """
        Returns the chat interaction history logs.
        """
        try:
            cursor = self.collection.find().sort("created_at", -1)
            conversations = []
            async for doc in cursor:
                doc["_id"] = str(doc["_id"])
                conversations.append(ConversationModel.model_validate(doc))
            return conversations
        except Exception as e:
            logger.error(f"Failed to fetch conversation history from MongoDB: {e}")
            raise DatabaseWriteException(f"Failed to fetch conversation history: {e}") from e

    async def get_history_by_agent(self, agent_id: str) -> List[ConversationModel]:
        """
        Returns the chat interaction history logs specifically for an agent.
        """
        try:
            cursor = self.collection.find({"agent_id": agent_id}).sort("created_at", 1)
            conversations = []
            async for doc in cursor:
                doc["_id"] = str(doc["_id"])
                conversations.append(ConversationModel.model_validate(doc))
            return conversations
        except Exception as e:
            logger.error(f"Failed to fetch conversation history for Agent '{agent_id}' from MongoDB: {e}")
            raise DatabaseWriteException(f"Failed to fetch conversation history: {e}") from e

    async def get_conversation_by_id(self, conv_id: str) -> Optional[ConversationModel]:
        """
        Retrieves a single conversation record by its ID.
        """
        try:
            object_id = ObjectId(conv_id)
        except InvalidId:
            logger.warning(f"Invalid ObjectId format provided: '{conv_id}'")
            return None

        try:
            doc = await self.collection.find_one({"_id": object_id})
            if doc:
                doc["_id"] = str(doc["_id"])
                return ConversationModel.model_validate(doc)
            return None
        except Exception as e:
            logger.error(f"Failed to fetch conversation by ID '{conv_id}': {e}")
            raise DatabaseWriteException(f"Failed to fetch conversation: {e}") from e

    async def delete_conversation_by_id(self, conv_id: str) -> bool:
        """
        Deletes a single conversation record by its ID.
        """
        try:
            object_id = ObjectId(conv_id)
        except InvalidId:
            logger.warning(f"Invalid ObjectId format provided for deletion: '{conv_id}'")
            return False

        try:
            result = await self.collection.delete_one({"_id": object_id})
            return result.deleted_count > 0
        except Exception as e:
            logger.error(f"Failed to delete conversation by ID '{conv_id}': {e}")
            raise DatabaseWriteException(f"Failed to delete conversation: {e}") from e
