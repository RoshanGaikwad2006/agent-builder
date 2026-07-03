from datetime import datetime
from typing import List
from pydantic import BaseModel, Field


class ConversationResponse(BaseModel):
    """
    FastAPI Pydantic schema validation for chat history interaction response payloads.
    """
    id: str = Field(..., description="Unique conversation record ID.")
    user_question: str = Field(..., description="The user query text.")
    ai_answer: str = Field(..., description="The LLM assistant generated response text.")
    sources_used: List[str] = Field(..., description="List of source files retrieved for grounding.")
    model_name: str = Field(..., description="LLM model name.")
    response_time: str = Field(..., description="Performance latency duration.")
    created_at: datetime = Field(..., description="Record creation timestamp.")

    class Config:
        populate_by_name = True
