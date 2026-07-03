from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class DocumentResponse(BaseModel):
    """
    FastAPI Pydantic schema validation for document metadata response payloads.
    """
    id: str = Field(..., description="Unique document database record ID.")
    filename: str = Field(..., description="Sanitized stored file name.")
    original_filename: str = Field(..., description="Original name of the uploaded document.")
    agent_id: Optional[str] = Field(None, description="Owner agent database ID.")
    file_size: int = Field(..., description="Size of the file in bytes.")
    file_type: str = Field(..., description="Content type or file extension.")
    number_of_chunks: int = Field(..., description="Number of generated text segments.")
    vector_store: str = Field(..., description="Target vector store database.")
    vector_index_name: str = Field(..., description="Target vector index name.")
    upload_status: str = Field(..., description="Ingestion processing status.")
    created_at: datetime = Field(..., description="Record creation timestamp.")
    updated_at: datetime = Field(..., description="Record update timestamp.")

    class Config:
        populate_by_name = True
