import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status

from schemas.agent_schema import AgentCreate, AgentUpdate, AgentResponse
from services.agent_service import AgentService
from core.dependencies import get_agent_service

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Agents"])


@router.post(
    "/agents",
    response_model=AgentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new AI Agent",
    description="Registers a new custom AI agent with configuration prompt rules."
)
async def create_agent(
    request: AgentCreate,
    agent_service: AgentService = Depends(get_agent_service)
):
    logger.info(f"API request received to create agent: '{request.name}'")
    agent = await agent_service.create_agent(request)
    return AgentResponse.model_validate(agent.model_dump())


@router.get(
    "/agents",
    response_model=List[AgentResponse],
    status_code=status.HTTP_200_OK,
    summary="List all AI Agents",
    description="Returns metadata specifications of all registered AI agents in MongoDB."
)
async def list_agents(
    agent_service: AgentService = Depends(get_agent_service)
):
    logger.info("API request received to list all agents.")
    agents = await agent_service.get_agents()
    return [AgentResponse.model_validate(a.model_dump()) for a in agents]


@router.get(
    "/agents/{id}",
    response_model=AgentResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Agent specifications by ID",
    description="Retrieves a single agent's prompt details and state metadata."
)
async def get_agent(
    id: str,
    agent_service: AgentService = Depends(get_agent_service)
):
    logger.info(f"API request received to retrieve agent specs for ID: '{id}'")
    agent = await agent_service.get_agent(id)
    if not agent:
        logger.warning(f"Agent ID '{id}' was not found.")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agent with ID '{id}' was not found."
        )
    return AgentResponse.model_validate(agent.model_dump())


@router.put(
    "/agents/{id}",
    response_model=AgentResponse,
    status_code=status.HTTP_200_OK,
    summary="Update Agent specifications by ID",
    description="Modifies configurable variables of an existing agent in MongoDB."
)
async def update_agent(
    id: str,
    request: AgentUpdate,
    agent_service: AgentService = Depends(get_agent_service)
):
    logger.info(f"API request received to update agent ID: '{id}'")
    agent = await agent_service.update_agent(id, request)
    if not agent:
        logger.warning(f"Agent ID '{id}' not found for updating.")
        raise HTTPException(
            status_code=status.HTTP_444_NOT_FOUND if hasattr(status, "HTTP_444_NOT_FOUND") else status.HTTP_404_NOT_FOUND,
            detail=f"Agent with ID '{id}' was not found or could not be updated."
        )
    return AgentResponse.model_validate(agent.model_dump())


@router.delete(
    "/agents/{id}",
    status_code=status.HTTP_200_OK,
    summary="Delete Agent by ID",
    description="Deletes a registered agent configuration from the database."
)
async def delete_agent(
    id: str,
    agent_service: AgentService = Depends(get_agent_service)
):
    logger.info(f"API request received to delete agent ID: '{id}'")
    success = await agent_service.delete_agent(id)
    if not success:
        logger.warning(f"Agent ID '{id}' not found for deletion.")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agent with ID '{id}' was not found."
        )
    return {
        "status": "success",
        "message": f"Agent with ID '{id}' successfully deleted from database."
    }
