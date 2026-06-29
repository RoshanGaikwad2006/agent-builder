import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)


class DocumentRepository:
    """Repository class managing metadata records for ingested PDF documents."""

    def __init__(self):
        self._ingested_documents: List[Dict[str, Any]] = []

    def record_ingestion(self, filename: str, status: str, chunk_count: int) -> None:
        """
        Saves a record of an ingestion operation.
        """
        record = {
            "filename": filename,
            "status": status,
            "chunk_count": chunk_count
        }
        self._ingested_documents.append(record)
        logger.info(f"Repository logged document ingestion metadata: {filename} (status: {status}, chunks: {chunk_count})")

    def get_all_documents(self) -> List[Dict[str, Any]]:
        """
        Returns a list of all recorded document ingestions.
        """
        return self._ingested_documents
