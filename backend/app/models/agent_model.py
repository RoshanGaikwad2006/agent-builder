from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class AgentModel(BaseModel):
    """
    Data model representing an AI Agent specification record stored in MongoDB.
    """
    id: Optional[str] = Field(None, alias="_id")
    name: str
    description: str
    system_prompt: str
    status: str = "active"
    deployment_id: Optional[str] = Field(None, description="Unique deployment identifier.")
    public_url: Optional[str] = Field(None, description="Public shareable URL.")
    is_deployed: bool = Field(False, description="Deployment status flag.")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
