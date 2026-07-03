from abc import ABC, abstractmethod
from typing import List, Optional
from langchain_core.vectorstores import VectorStore
from langchain_core.documents import Document


class VectorStoreProvider(ABC):
    """Abstract base class representing a vector store database provider."""

    @abstractmethod
    def get_vectorstore(self) -> VectorStore:
        """
        Returns the configured LangChain VectorStore instance.
        """
        pass

    @abstractmethod
    def add_documents(self, documents: List[Document], namespace: Optional[str] = None) -> None:
        """
        Saves a list of document objects into the vector database.
        """
        pass

    @abstractmethod
    def ensure_index_exists(self) -> None:
        """
        Checks if the configured database index exists; creates it if missing.
        """
        pass

    @abstractmethod
    def verify_connectivity(self) -> bool:
        """
        Runs a telemetry ping check to confirm database connection health.
        """
        pass
