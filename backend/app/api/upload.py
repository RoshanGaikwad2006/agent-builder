import os
import logging
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status

from schemas.upload import UploadResponse
from core.dependencies import get_rag_service
from services.rag.rag_service import RAGService
from core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Upload"])


@router.post(
    "/upload",
    response_model=UploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload and Index PDF Document",
    response_description="Returns the ingestion status details."
)
async def upload_file(
    file: UploadFile = File(..., description="PDF document file to ingest"),
    rag_service: RAGService = Depends(get_rag_service)
):
    """
    Upload a PDF document to store and index it in the Pinecone vector database.

    ### Architecture Details:
    - **Embeddings:** HuggingFace `sentence-transformers/all-MiniLM-L6-v2` (384-dimensional vectors, Python 3.13 override enabled)
    - **Pinecone Index:** Configured dynamically via `PINECONE_INDEX_NAME`
    - **LangChain Splitter:** `RecursiveCharacterTextSplitter` (`chunk_size=500`, `chunk_overlap=20` configured in settings)
    - **RAG Logic:** Saves the uploaded PDF locally, reads and splits contents into text chunks, calculates embeddings, and adds document vectors into Pinecone for real-time querying.
    """
    logger.info(f"Upload request received for file: '{file.filename}'")
    
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        logger.warning(f"Rejected non-PDF file upload: '{file.filename}'")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Only PDF files are allowed."
        )

    # Create upload directory if it does not exist
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    file_path = os.path.join(settings.UPLOAD_DIR, file.filename)
    logger.info(f"Saving temporary file to: {file_path}")
    
    # Save file contents locally
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
        
    # Trigger vector ingestion
    logger.info(f"Beginning indexing for: {file.filename}")
    rag_service.ingest_pdf(file_path)
    
    logger.info(f"Successfully processed upload and indexed: {file.filename}")
    return UploadResponse(
        filename=file.filename,
        status="success",
        message="File uploaded and indexed successfully into the vector database."
    )
