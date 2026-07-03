import logging
from typing import List, Optional
from datetime import datetime

from repositories.agent_repository import AgentRepository
from schemas.agent_schema import AgentCreate, AgentUpdate
from models.agent_model import AgentModel

logger = logging.getLogger(__name__)


class AgentService:
    """
    Service class encapsulating business operations and validation logic for AI Agents.
    """

    def __init__(self, agent_repository: AgentRepository):
        self._repository = agent_repository

    async def create_agent(self, schema: AgentCreate) -> AgentModel:
        logger.info(f"Processing agent creation request: '{schema.name}'")
        agent_data = AgentModel(
            name=schema.name,
            description=schema.description,
            system_prompt=schema.system_prompt,
            status=schema.status,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        inserted_id = await self._repository.create_agent(agent_data)
        agent_data.id = inserted_id
        return agent_data

    async def get_agents(self) -> List[AgentModel]:
        logger.info("Processing fetch all agents request.")
        return await self._repository.get_all_agents()

    async def get_agent(self, agent_id: str) -> Optional[AgentModel]:
        logger.info(f"Processing fetch agent specs by ID: '{agent_id}'")
        return await self._repository.get_agent_by_id(agent_id)

    async def update_agent(self, agent_id: str, schema: AgentUpdate) -> Optional[AgentModel]:
        logger.info(f"Processing update agent request for ID: '{agent_id}'")
        # Exclude unset fields from the update dict to prevent resetting defaults
        update_dict = schema.model_dump(exclude_unset=True)
        if not update_dict:
            logger.info("No modifications specified in the update request payload.")
            return await self.get_agent(agent_id)

        success = await self._repository.update_agent(agent_id, update_dict)
        if not success:
            logger.warning(f"Could not update agent with ID '{agent_id}'. Model was not found or not modified.")
            return None
        return await self.get_agent(agent_id)

    async def delete_agent(self, agent_id: str) -> bool:
        logger.info(f"Processing delete agent request for ID: '{agent_id}'")
        return await self._repository.delete_agent(agent_id)
