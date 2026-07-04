from pydantic import BaseModel, Field

class HealthResponse(BaseModel):
    status: str = Field(..., description="Application health status (e.g. healthy).")
    database: str = Field(..., description="Database connectivity status (e.g. connected).")
