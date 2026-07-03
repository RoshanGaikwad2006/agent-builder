import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status

from schemas.conversation_schema import ConversationResponse
from services.conversation_service import ConversationService
from core.dependencies import get_conversation_service

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Conversations"])


@router.get(
    "/conversations",
    response_model=List[ConversationResponse],
    status_code=status.HTTP_200_OK,
    summary="List Conversations History",
    description="Returns metadata logs of all chat interactions stored in MongoDB, optionally filtered by agent."
)
async def list_conversations(
    agent_id: Optional[str] = None,
    conv_service: ConversationService = Depends(get_conversation_service)
):
    logger.info(f"API request received to list conversations. Agent filter: '{agent_id}'")
    convs = await conv_service.get_conversations(agent_id)
    return [ConversationResponse.model_validate(c.model_dump()) for c in convs]


@router.get(
    "/conversations/{id}",
    response_model=ConversationResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Conversation by ID",
    description="Retrieves a single conversation chat log by its database ID."
)
async def get_conversation(
    id: str,
    conv_service: ConversationService = Depends(get_conversation_service)
):
    logger.info(f"API request received to retrieve conversation by ID: '{id}'")
    conv = await conv_service.get_conversation(id)
    if not conv:
        logger.warning(f"Conversation ID '{id}' was not found.")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conversation with ID '{id}' was not found."
        )
    return ConversationResponse.model_validate(conv.model_dump())


@router.delete(
    "/conversations/{id}",
    status_code=status.HTTP_200_OK,
    summary="Delete Conversation by ID",
    description="Deletes a single conversation chat log from MongoDB by its database ID."
)
async def delete_conversation(
    id: str,
    conv_service: ConversationService = Depends(get_conversation_service)
):
    logger.info(f"API request received to delete conversation by ID: '{id}'")
    success = await conv_service.delete_conversation(id)
    if not success:
        logger.warning(f"Conversation ID '{id}' not found for deletion.")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conversation with ID '{id}' was not found."
        )
    return {
        "status": "success",
        "message": f"Conversation with ID '{id}' successfully deleted from database."
    }
