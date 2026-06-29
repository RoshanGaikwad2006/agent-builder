from pydantic import BaseModel, Field

class UploadResponse(BaseModel):
    filename: str = Field(..., description="Name of the uploaded file.")
    status: str = Field(..., description="Ingestion status (e.g. success, failure).")
    message: str = Field(..., description="Detail message about the operation status.")
