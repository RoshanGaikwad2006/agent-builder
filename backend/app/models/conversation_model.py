from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class ConversationModel(BaseModel):
    """
    Data model representing a chat conversation record stored in MongoDB.
    """
    id: Optional[str] = Field(None, alias="_id")
    user_question: str
    ai_answer: str
    agent_id: Optional[str] = Field(None, description="Associated Agent database ID.")
    sources_used: List[str] = Field(default_factory=list)
    model_name: str
    response_time: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
