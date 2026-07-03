import logging
from typing import List, Optional

from repositories.conversation_repository import ConversationRepository
from models.conversation_model import ConversationModel

logger = logging.getLogger(__name__)


class ConversationService:
    """
    Service layer coordinates CRUD and listing workflows for conversation interactions.
    """

    def __init__(self, repository: ConversationRepository):
        self._repository = repository

    async def get_conversations(self, agent_id: Optional[str] = None) -> List[ConversationModel]:
        """
        Retrieves logs, optionally filtered by agent namespace.
        """
        logger.info(f"Querying conversations list. Filter agent: '{agent_id}'")
        if agent_id:
            return await self._repository.get_history_by_agent(agent_id)
        return await self._repository.get_history()

    async def get_conversation(self, conv_id: str) -> Optional[ConversationModel]:
        """
        Retrieves single conversation log by its ID.
        """
        logger.info(f"Retrieving conversation log details for ID '{conv_id}'")
        return await self._repository.get_conversation_by_id(conv_id)

    async def delete_conversation(self, conv_id: str) -> bool:
        """
        Deletes a single conversation record.
        """
        logger.info(f"Deletings conversation log record ID '{conv_id}'")
        return await self._repository.delete_conversation_by_id(conv_id)
