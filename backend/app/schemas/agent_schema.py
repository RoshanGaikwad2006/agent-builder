from datetime import datetime
from typing import Optional, List
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


class AgentChatRequest(BaseModel):
    """
    Validation schema for message requests sent to an agent.
    """
    message: str = Field(..., min_length=1, description="Message text sent by the user.")


class AgentChatResponse(BaseModel):
    """
    Validation schema for agent response payloads.
    """
    answer: str = Field(..., description="Agent response answer text.")
    sources: List[str] = Field(default_factory=list, description="Grounding source documents.")
