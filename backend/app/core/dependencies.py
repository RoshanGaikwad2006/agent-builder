from functools import lru_cache

from repositories.document_repository import DocumentRepository
from repositories.conversation_repository import ConversationRepository
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
def get_document_repository() -> DocumentRepository:
    """
    Returns the singleton instance of the DocumentRepository.
    """
    return DocumentRepository()


@lru_cache()
def get_conversation_repository() -> ConversationRepository:
    """
    Returns the singleton instance of the ConversationRepository.
    """
    return ConversationRepository()


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


@lru_cache()
def get_document_service() -> DocumentProcessor:
    """
    Returns the singleton instance of the PDFDocumentService.
    """
    vectorstore = get_vectorstore_provider()
    doc_repo = get_document_repository()
    return PDFDocumentService(vectorstore_provider=vectorstore, doc_repository=doc_repo)


@lru_cache()
def get_retriever_service() -> RetrieverService:
    """
    Returns the singleton instance of the RetrieverService.
    """
    vectorstore = get_vectorstore_provider()
    return RetrieverService(vectorstore_provider=vectorstore)


@lru_cache()
def get_rag_service() -> RAGService:
    """
    Returns the singleton instance of the RAGService.
    Resolves and injects all downstream components (LLMs, embeddings, stores, processors).
    """
    return RAGService(
        llm_provider=get_llm_provider(),
        vectorstore_provider=get_vectorstore_provider(),
        retriever_service=get_retriever_service(),
        document_service=get_document_service(),
        conversation_repository=get_conversation_repository()
    )
