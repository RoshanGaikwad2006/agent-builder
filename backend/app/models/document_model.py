from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class DocumentModel(BaseModel):
    """
    Data model representing a document metadata record stored in MongoDB.
    """
    id: Optional[str] = Field(None, alias="_id")
    filename: str
    original_filename: str
    agent_id: Optional[str] = Field(None, description="Owner agent ID for database isolation.")
    file_size: int
    file_type: str
    number_of_chunks: int
    vector_store: str = "pinecone"
    vector_index_name: str
    upload_status: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
