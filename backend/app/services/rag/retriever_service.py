import logging
from langchain_core.retrievers import BaseRetriever

from typing import Optional
from services.vectorstore.base import VectorStoreProvider
from core.config import settings

logger = logging.getLogger(__name__)


class RetrieverService:
    """Service class encapsulating document similarity retrieval configurations."""

    def __init__(self, vectorstore_provider: VectorStoreProvider):
        self._vectorstore = vectorstore_provider
        self.k = settings.RETRIEVER_K

    def get_retriever(self, namespace: Optional[str] = None) -> BaseRetriever:
        """
        Configures and returns the similarity retriever.
        """
        logger.info(f"Configuring similarity retriever with k={self.k}, namespace={namespace}...")
        vectorstore = self._vectorstore.get_vectorstore()
        search_kwargs = {"k": self.k}
        if namespace:
            search_kwargs["namespace"] = namespace

        retriever = vectorstore.as_retriever(
            search_type="similarity",
            search_kwargs=search_kwargs
        )
        return retriever
