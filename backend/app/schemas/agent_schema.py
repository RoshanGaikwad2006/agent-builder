from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class AgentCreate(BaseModel):
    """
    Validation schema for creating a new agent.
    """
    name: str = Field(..., min_length=1, max_length=100, description="Name of the AI Agent.")
    description: str = Field(..., max_length=500, description="Brief summary of what the agent does.")
    system_prompt: str = Field(..., min_length=1, description="System instructions guiding agent behavior.")
    status: Optional[str] = Field("active", description="Agent state (active, draft, etc.).")


class AgentUpdate(BaseModel):
    """
    Validation schema for modifying an existing agent's fields.
    """
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    system_prompt: Optional[str] = Field(None, min_length=1)
    status: Optional[str] = Field(None)


class AgentResponse(BaseModel):
    """
    Validation response payload representing an AI Agent.
    """
    id: str = Field(..., description="Unique Agent database ID.")
    name: str
    description: str
    system_prompt: str
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True
