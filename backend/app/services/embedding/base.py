from abc import ABC, abstractmethod
from langchain_core.embeddings import Embeddings


class EmbeddingProvider(ABC):
    """Abstract base class representing an embedding provider."""

    @abstractmethod
    def get_embeddings(self) -> Embeddings:
        """
        Returns the configured LangChain Embeddings model instance.
        """
        pass
