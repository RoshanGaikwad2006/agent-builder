from typing import Optional
from pydantic import BaseModel, Field


class UserModel(BaseModel):
    """
    Data model representing a platform User account.
    """
    id: Optional[str] = Field(None, alias="_id")
    name: str = Field(..., description="Full name of the user.")
    email: str = Field(..., description="Unique contact email address.")
    password_hash: str = Field(..., description="Encrypted secure password hash.")
