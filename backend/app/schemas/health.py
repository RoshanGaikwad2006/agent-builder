from pydantic import BaseModel, Field

class HealthResponse(BaseModel):
    status: str = Field(..., description="Application health status (e.g. healthy).")
    version: str = Field(..., description="The current version of the application.")
    uptime: float = Field(..., description="Uptime of the application in seconds.")
