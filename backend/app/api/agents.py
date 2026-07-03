import os
import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile

from schemas.agent_schema import AgentCreate, AgentUpdate, AgentResponse, AgentChatRequest, AgentChatResponse
from schemas.upload import UploadResponse
from schemas.document_schema import DocumentResponse
from schemas.conversation_schema import ConversationResponse
from services.agent_service import AgentService
from services.agent_runtime_service import AgentRuntimeService
from services.rag.rag_service import RAGService
from repositories.document_repository import DocumentRepository
from repositories.conversation_repository import ConversationRepository
from core.dependencies import (
    get_agent_service,
    get_document_repository,
    get_agent_runtime_service,
    get_conversation_repository,
    get_rag_service
)
from core.config import settings

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


@router.post(
    "/agents/{id}/knowledge/upload",
    response_model=UploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload and Index PDF for Agent",
    description="Uploads a PDF file, splits it, embeds it, and indexes it into Pinecone under the agent's isolated namespace."
)
async def upload_agent_knowledge(
    id: str,
    file: UploadFile = File(..., description="PDF document file to ingest"),
    rag_service: RAGService = Depends(get_rag_service),
    agent_service: AgentService = Depends(get_agent_service)
):
    logger.info(f"Agent knowledge upload request received for Agent ID: '{id}', file: '{file.filename}'")
    # Verify agent exists first
    agent = await agent_service.get_agent(id)
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agent with ID '{id}' was not found."
        )

    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Only PDF files are allowed."
        )

    # Create upload directory if it does not exist
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    file_path = os.path.join(settings.UPLOAD_DIR, f"{id}_{file.filename}")
    
    # Save file contents locally
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
        
    # Trigger vector ingestion under namespace
    await rag_service.ingest_pdf(file_path, agent_id=id)
    
    return UploadResponse(
        filename=file.filename,
        status="success",
        message=f"File uploaded and indexed successfully into agent {id}'s knowledge base."
    )


@router.get(
    "/agents/{id}/knowledge",
    response_model=List[DocumentResponse],
    status_code=status.HTTP_200_OK,
    summary="List Ingested Documents for Agent",
    description="Retrieves a list of all document metadata associated with this specific agent from MongoDB."
)
async def list_agent_knowledge(
    id: str,
    doc_repository: DocumentRepository = Depends(get_document_repository),
    agent_service: AgentService = Depends(get_agent_service)
):
    logger.info(f"Request received to list knowledge for Agent ID: '{id}'")
    agent = await agent_service.get_agent(id)
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agent with ID '{id}' was not found."
        )
    docs = await doc_repository.get_documents_by_agent(id)
    return [DocumentResponse.model_validate(d.model_dump()) for d in docs]


@router.post(
    "/agents/{agent_id}/chat",
    response_model=AgentChatResponse,
    status_code=status.HTTP_200_OK,
    summary="Chat with custom agent profile",
    description="Invokes the isolated agent execution engine to retrieve grounded answers from its Pinecone namespace."
)
async def chat_with_agent(
    agent_id: str,
    request: AgentChatRequest,
    runtime_service: AgentRuntimeService = Depends(get_agent_runtime_service)
):
    logger.info(f"Chat request received for Agent ID '{agent_id}'")
    response = await runtime_service.get_agent_response(agent_id, request.message)
    if not response:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agent with ID '{agent_id}' was not found or is inactive."
        )
    return AgentChatResponse.model_validate(response)


@router.get(
    "/agents/{agent_id}/history",
    response_model=List[ConversationResponse],
    status_code=status.HTTP_200_OK,
    summary="Get conversation history log for agent",
    description="Returns list of previously logged user queries and agent responses."
)
async def get_agent_chat_history(
    agent_id: str,
    conv_repository: ConversationRepository = Depends(get_conversation_repository),
    agent_service: AgentService = Depends(get_agent_service)
):
    logger.info(f"History request received for Agent ID '{agent_id}'")
    agent = await agent_service.get_agent(agent_id)
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agent with ID '{agent_id}' was not found."
        )
    history = await conv_repository.get_history_by_agent(agent_id)
    return [ConversationResponse.model_validate(h.model_dump()) for h in history]


@router.post(
    "/agents/{id}/deploy",
    response_model=AgentResponse,
    status_code=status.HTTP_200_OK,
    summary="Deploy AI Agent publicly",
    description="Sets deployment status flags and generates a public shareable URL for the agent."
)
async def deploy_agent(
    id: str,
    agent_service: AgentService = Depends(get_agent_service)
):
    logger.info(f"Deployment request received for Agent ID: '{id}'")
    agent = await agent_service.deploy_agent(id)
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agent with ID '{id}' was not found or could not be deployed."
        )
    return AgentResponse.model_validate(agent.model_dump())
