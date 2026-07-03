from functools import lru_cache
from fastapi import Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from database.mongodb import MongoDBManager
from repositories.document_repository import DocumentRepository
from repositories.conversation_repository import ConversationRepository
from repositories.agent_repository import AgentRepository
from services.agent_service import AgentService
from services.embedding.base import EmbeddingProvider
from services.embedding.huggingface_service import HuggingFaceEmbeddingService
from services.vectorstore.base import VectorStoreProvider
from services.vectorstore.pinecone_service import PineconeService
from services.llm.base import LLMProvider
from services.llm.factory import LLMProviderFactory
from services.rag.document_service import DocumentProcessor, PDFDocumentService
from services.rag.retriever_service import RetrieverService
from services.rag.rag_service import RAGService


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
