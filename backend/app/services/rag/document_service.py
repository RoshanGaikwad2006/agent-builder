import os
import time
import logging
from abc import ABC, abstractmethod
from langchain_core.documents import Document
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter

from services.vectorstore.base import VectorStoreProvider
from repositories.document_repository import DocumentRepository
from core.config import settings
from core.exceptions import DocumentProcessingException

logger = logging.getLogger(__name__)


def filter_to_minimal_docs(docs: list[Document]) -> list[Document]:
    """
    Given a list of Document objects, return a new list of Document objects
    containing only 'source' in metadata and the original page_content.
    """
    minimal_docs: list[Document] = []
    for doc in docs:
        src = doc.metadata.get("source")
        minimal_docs.append(
            Document(
                page_content=doc.page_content,
                metadata={"source": src}
            )
        )
    return minimal_docs


class DocumentProcessor(ABC):
    """Abstract base class representing a document ingestion processor."""

    @abstractmethod
    def process_and_ingest(self, file_path: str) -> int:
        """
        Loads a document, chunks it, embeds it, and indexes it.
        Returns the number of valid chunks successfully upserted.
        """
        pass


class PDFDocumentService(DocumentProcessor):
    """
    PDF document processor service.
    Coordinates PyPDF page parsing, text splitting, string unicode cleanups, 
    vector insertions, and repository logging.
    """

    def __init__(self, vectorstore_provider: VectorStoreProvider, doc_repository: DocumentRepository):
        self._vectorstore = vectorstore_provider
        self._repository = doc_repository

        # Load centralized parameter bounds
        self.chunk_size = settings.CHUNK_SIZE
        self.chunk_overlap = settings.CHUNK_OVERLAP

    def process_and_ingest(self, file_path: str) -> int:
        """
        Processes and upserts a local PDF file into the vector database.
        """
        if not file_path or not os.path.exists(file_path):
            raise DocumentProcessingException(f"Invalid PDF file path: {file_path}")

        logger.info(f"Loading and processing PDF file for ingestion: {file_path}")
        start_time = time.time()
        filename = os.path.basename(file_path)

        try:
            # 1. Parse PDF pages
            loader = PyPDFLoader(file_path)
            documents = loader.load()
            logger.info(f"Parsed {len(documents)} pages from PDF. Latency: {time.time() - start_time:.3f}s")
            
            # 2. Filter metadata structure
            minimal_docs = filter_to_minimal_docs(documents)

            # 3. Segment text into chunks
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=self.chunk_size,
                chunk_overlap=self.chunk_overlap
            )
            text_chunks = text_splitter.split_documents(minimal_docs)
            logger.info(f"Generated {len(text_chunks)} raw chunk segments.")

            # 4. Clean and sanitize all texts to prevent Python 3.13 tokenization errors
            valid_chunks = []
            for chunk in text_chunks:
                if chunk.page_content is not None:
                    # Force cast to standard string and remove invalid unicode surrogates/nulls
                    text_val = str(chunk.page_content).encode('utf-8', errors='ignore').decode('utf-8').strip()
                    if text_val:
                        chunk.page_content = text_val
                        valid_chunks.append(chunk)

            logger.info(f"Filtered {len(text_chunks) - len(valid_chunks)} empty/invalid chunks.")

            # 5. Insert vectors to database
            if valid_chunks:
                self._vectorstore.add_documents(valid_chunks)
            else:
                logger.warning("No valid text chunks found in PDF for ingestion.")

            # 6. Record metadata ingestion in repository
            self._repository.record_ingestion(
                filename=filename,
                status="success",
                chunk_count=len(valid_chunks)
            )

            total_time = time.time() - start_time
            logger.info(f"Ingestion pipeline complete for: '{filename}'. Total time: {total_time:.3f}s")
            return len(valid_chunks)

        except Exception as e:
            logger.error(f"Failed to process and ingest PDF document '{filename}': {e}", exc_info=True)
            self._repository.record_ingestion(
                filename=filename,
                status="failed",
                chunk_count=0
            )
            raise DocumentProcessingException(f"Failed to process and ingest PDF document: {e}") from e
