import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status

from schemas.conversation_schema import ConversationResponse
from repositories.conversation_repository import ConversationRepository
from core.dependencies import get_conversation_repository

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Conversations"])


@router.get(
    "/conversations",
    response_model=List[ConversationResponse],
    status_code=status.HTTP_200_OK,
    summary="List Conversations History",
    description="Returns metadata logs of all chat interactions stored in MongoDB."
)
async def list_conversations(
    conv_repository: ConversationRepository = Depends(get_conversation_repository)
):
    logger.info("Request received to list all conversation records.")
    convs = await conv_repository.get_history()
    return [ConversationResponse.model_validate(c.model_dump(by_alias=True)) for c in convs]


@router.get(
    "/conversations/{id}",
    response_model=ConversationResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Conversation by ID",
    description="Retrieves a single conversation chat log by its database ID."
)
async def get_conversation(
    id: str,
    conv_repository: ConversationRepository = Depends(get_conversation_repository)
):
    logger.info(f"Request received to retrieve conversation by ID: '{id}'")
    conv = await conv_repository.get_conversation_by_id(id)
    if not conv:
        logger.warning(f"Conversation ID '{id}' was not found.")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conversation with ID '{id}' was not found."
        )
    return ConversationResponse.model_validate(conv.model_dump(by_alias=True))


@router.delete(
    "/conversations/{id}",
    status_code=status.HTTP_200_OK,
    summary="Delete Conversation by ID",
    description="Deletes a single conversation chat log from MongoDB by its database ID."
)
async def delete_conversation(
    id: str,
    conv_repository: ConversationRepository = Depends(get_conversation_repository)
):
    logger.info(f"Request received to delete conversation by ID: '{id}'")
    success = await conv_repository.delete_conversation_by_id(id)
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
