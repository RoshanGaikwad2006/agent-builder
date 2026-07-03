from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class LeadCreate(BaseModel):
    """
    Schema for creating a captured lead.
    """
    agent_id: str = Field(..., description="Agent profile generating the lead.")
    message: str = Field(..., description="Message/question prompting lead capture.")
    lead_type: str = Field(default="hot", description="Category classification of the lead.")


class LeadResponse(BaseModel):
    """
    Serialization schema for lead details responses.
    """
    id: str = Field(..., description="Unique Lead database ID.")
    agent_id: str
    message: str
    lead_type: str
    created_at: datetime

    class Config:
        populate_by_name = True
