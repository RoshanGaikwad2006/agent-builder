import os
import time
import logging
from typing import List, Optional
from pinecone import Pinecone, ServerlessSpec
from langchain_pinecone import PineconeVectorStore
from langchain_core.vectorstores import VectorStore
from langchain_core.documents import Document

from services.vectorstore.base import VectorStoreProvider
from services.embedding.base import EmbeddingProvider
from core.config import settings
from core.exceptions import VectorStoreException, ConfigurationException

logger = logging.getLogger(__name__)


class PineconeService(VectorStoreProvider):
    """
    Pinecone vector database provider.
    Manages serverless index creation, document insertion, and health connectivity diagnostics.
    """

    def __init__(self, embedding_provider: EmbeddingProvider):
        self.index_name = settings.PINECONE_INDEX_NAME
        self.api_key = settings.PINECONE_API_KEY

        if not self.api_key:
            raise ConfigurationException("PINECONE_API_KEY is not set in configurations.")
        if not self.index_name:
            raise ConfigurationException("PINECONE_INDEX_NAME is not set in configurations.")

        # Injected dependency
        self._embeddings = embedding_provider.get_embeddings()

        # Set environment variables for LangChain client integration
        os.environ["PINECONE_API_KEY"] = self.api_key

        try:
            logger.info("Initializing Pinecone database connection...")
            self.pc = Pinecone(api_key=self.api_key)
            self.ensure_index_exists()

            logger.info(f"Connecting to Pinecone index: '{self.index_name}'...")
            self._docsearch = PineconeVectorStore.from_existing_index(
                index_name=self.index_name,
                embedding=self._embeddings
            )
            logger.info("Pinecone database connection established successfully.")
        except Exception as e:
            logger.error(f"Failed to connect to Pinecone vector store: {e}")
            raise VectorStoreException(f"Failed to connect to Pinecone vector store: {e}") from e

    def get_vectorstore(self) -> VectorStore:
        """
        Returns the PineconeVectorStore instance.
        """
        return self._docsearch

    def ensure_index_exists(self) -> None:
        """
        Verifies if the specified index exists; creates it serverless on AWS if missing.
        """
        try:
            if not self.pc.has_index(self.index_name):
                logger.info(f"Pinecone index '{self.index_name}' not found. Creating index manually...")
                
                dim = settings.VECTOR_DIMENSION
                start_time = time.time()
                
                self.pc.create_index(
                    name=self.index_name,
                    dimension=dim,
                    metric="cosine",
                    spec=ServerlessSpec(cloud="aws", region="us-east-1"),
                )
                latency = time.time() - start_time
                logger.info(f"Pinecone index '{self.index_name}' created successfully. Latency: {latency:.3f}s")
            else:
                logger.info(f"Pinecone index '{self.index_name}' verified exists.")
        except Exception as e:
            logger.error(f"Error checking/creating Pinecone index '{self.index_name}': {e}")
            raise VectorStoreException(f"Error checking/creating Pinecone index: {e}") from e

    def add_documents(self, documents: List[Document], namespace: Optional[str] = None) -> None:
        """
        Saves document chunks into the Pinecone database.
        """
        if not documents:
            logger.warning("No documents provided to upsert into Pinecone.")
            return

        try:
            logger.info(f"Upserting {len(documents)} document vectors into Pinecone index '{self.index_name}' (Namespace: '{namespace}')...")
            start_time = time.time()
            self._docsearch.add_documents(documents, namespace=namespace)
            latency = time.time() - start_time
            logger.info(f"Successfully upserted vectors. Pinecone database latency: {latency:.3f}s")
        except Exception as e:
            logger.error(f"Error upserting documents into Pinecone: {e}")
            raise VectorStoreException(f"Error upserting documents to Pinecone: {e}") from e

    def verify_connectivity(self) -> bool:
        """
        Runs a quick index stats query to confirm database connection health.
        """
        try:
            self.pc.Index(self.index_name).describe_index_stats()
            return True
        except Exception as e:
            logger.error(f"Pinecone connectivity status check failed: {e}")
            return False
