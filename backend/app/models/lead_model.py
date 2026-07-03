from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class LeadModel(BaseModel):
    """
    Data model representing a hot lead capture event.
    """
    id: Optional[str] = Field(None, alias="_id")
    agent_id: str
    message: str
    lead_type: str = "hot"
    created_at: datetime = Field(default_factory=datetime.utcnow)
