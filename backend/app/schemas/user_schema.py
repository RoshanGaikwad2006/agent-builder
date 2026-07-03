from pydantic import BaseModel, Field


class UserRegister(BaseModel):
    """
    Schema validation input for creating a new user account.
    """
    name: str = Field(..., min_length=1, max_length=100, description="Full name of the user.")
    email: str = Field(..., min_length=3, max_length=100, description="Unique account email.")
    password: str = Field(..., min_length=6, description="Password must contain at least 6 characters.")


class UserLogin(BaseModel):
    """
    Schema validation input for login authorization.
    """
    email: str = Field(..., description="Login email.")
    password: str = Field(..., description="Login secret password.")


class UserResponse(BaseModel):
    """
    Schema serialization return payload for User specs.
    """
    id: str = Field(..., description="Unique User database ID.")
    name: str
    email: str

    class Config:
        populate_by_name = True
