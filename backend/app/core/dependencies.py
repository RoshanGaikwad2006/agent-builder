from functools import lru_cache
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorDatabase

from database.mongodb import MongoDBManager
from repositories.document_repository import DocumentRepository
from repositories.conversation_repository import ConversationRepository
from repositories.agent_repository import AgentRepository
from repositories.lead_repository import LeadRepository
from repositories.user_repository import UserRepository
from services.agent_service import AgentService
from services.lead_service import LeadService
from services.conversation_service import ConversationService
from services.auth_service import AuthService
from models.user_model import UserModel
from services.embedding.base import EmbeddingProvider
from services.embedding.huggingface_service import HuggingFaceEmbeddingService
from services.vectorstore.base import VectorStoreProvider
from services.vectorstore.pinecone_service import PineconeService
from services.llm.base import LLMProvider
from services.llm.factory import LLMProviderFactory
from services.rag.document_service import DocumentProcessor, PDFDocumentService
from services.rag.retriever_service import RetrieverService
from services.rag.rag_service import RAGService
from services.agent_runtime_service import AgentRuntimeService


@lru_cache()
def get_mongodb_manager() -> MongoDBManager:
    """
    Returns the singleton connection manager instance for MongoDB.
    """
    return MongoDBManager()


def get_database(db_manager: MongoDBManager = Depends(get_mongodb_manager)) -> AsyncIOMotorDatabase:
    """
    Dependency provider that returns the active MongoDB database instance.
    """
    return db_manager.db


def get_document_repository(db: AsyncIOMotorDatabase = Depends(get_database)) -> DocumentRepository:
    """
    Returns a DocumentRepository instance resolved with the active database connection.
    """
    return DocumentRepository(db=db)


def get_conversation_repository(db: AsyncIOMotorDatabase = Depends(get_database)) -> ConversationRepository:
    """
    Returns a ConversationRepository instance resolved with the active database connection.
    """
    return ConversationRepository(db=db)


def get_agent_repository(db: AsyncIOMotorDatabase = Depends(get_database)) -> AgentRepository:
    """
    Returns an AgentRepository instance resolved with the active database connection.
    """
    return AgentRepository(db=db)


def get_agent_service(agent_repo: AgentRepository = Depends(get_agent_repository)) -> AgentService:
    """
    Returns an AgentService instance resolved with the agent repository dependency.
    """
    return AgentService(agent_repository=agent_repo)


def get_lead_repository(db: AsyncIOMotorDatabase = Depends(get_database)) -> LeadRepository:
    """
    Returns a LeadRepository instance resolved with the active database connection.
    """
    return LeadRepository(db=db)


def get_lead_service(repo: LeadRepository = Depends(get_lead_repository)) -> LeadService:
    """
    Returns a LeadService instance.
    """
    return LeadService(repository=repo)


def get_conversation_service(repo: ConversationRepository = Depends(get_conversation_repository)) -> ConversationService:
    """
    Returns a ConversationService instance.
    """
    return ConversationService(repository=repo)


def get_user_repository(db: AsyncIOMotorDatabase = Depends(get_database)) -> UserRepository:
    """
    Returns a UserRepository instance.
    """
    return UserRepository(db=db)


def get_auth_service(repo: UserRepository = Depends(get_user_repository)) -> AuthService:
    """
    Returns an AuthService instance.
    """
    return AuthService(repository=repo)


@lru_cache()
def get_embedding_provider() -> EmbeddingProvider:
    """
    Returns the singleton instance of the EmbeddingProvider.
    """
    return HuggingFaceEmbeddingService()


@lru_cache()
def get_vectorstore_provider() -> VectorStoreProvider:
    """
    Returns the singleton instance of the VectorStoreProvider.
    """
    embeddings = get_embedding_provider()
    return PineconeService(embedding_provider=embeddings)


@lru_cache()
def get_llm_provider() -> LLMProvider:
    """
    Returns the singleton instance of the LLMProvider.
    """
    return LLMProviderFactory.get_provider("openai")


def get_document_service(
    vectorstore: VectorStoreProvider = Depends(get_vectorstore_provider),
    doc_repo: DocumentRepository = Depends(get_document_repository)
) -> DocumentProcessor:
    """
    Returns the PDFDocumentService instance.
    """
    return PDFDocumentService(vectorstore_provider=vectorstore, doc_repository=doc_repo)


def get_retriever_service(
    vectorstore: VectorStoreProvider = Depends(get_vectorstore_provider)
) -> RetrieverService:
    """
    Returns the RetrieverService instance.
    """
    return RetrieverService(vectorstore_provider=vectorstore)


def get_rag_service(
    llm: LLMProvider = Depends(get_llm_provider),
    vectorstore: VectorStoreProvider = Depends(get_vectorstore_provider),
    retriever: RetrieverService = Depends(get_retriever_service),
    doc_service: DocumentProcessor = Depends(get_document_service),
    conv_repo: ConversationRepository = Depends(get_conversation_repository)
) -> RAGService:
    """
    Returns the RAGService orchestrator instance.
    Resolves and injects all downstream components (LLMs, database repos, processors).
    """
    return RAGService(
        llm_provider=llm,
        vectorstore_provider=vectorstore,
        retriever_service=retriever,
        document_service=doc_service,
        conversation_repository=conv_repo
    )


def get_agent_runtime_service(
    llm: LLMProvider = Depends(get_llm_provider),
    retriever: RetrieverService = Depends(get_retriever_service),
    agent_repo: AgentRepository = Depends(get_agent_repository),
    conv_repo: ConversationRepository = Depends(get_conversation_repository),
    lead_repo: LeadRepository = Depends(get_lead_repository)
) -> AgentRuntimeService:
    """
    Returns an AgentRuntimeService resolved with downstream LLM, vector search, and repositories.
    """
    return AgentRuntimeService(
        llm_provider=llm,
        retriever_service=retriever,
        agent_repository=agent_repo,
        conversation_repository=conv_repo,
        lead_repository=lead_repo
    )


security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    user_repo: UserRepository = Depends(get_user_repository),
    auth_service: AuthService = Depends(get_auth_service)
) -> UserModel:
    """
    HTTPBearer dependency resolver that parses Authorization headers, decodes JWT keys, and returns User context.
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is missing. Please log in."
        )
    token = credentials.credentials
    user_id = auth_service.verify_jwt_token(token)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is invalid or has expired."
        )
    user = await user_repo.get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticated user specifications not found."
        )
    return user
