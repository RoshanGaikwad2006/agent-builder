import logging
from fastapi import APIRouter, Depends, HTTPException, status

from schemas.user_schema import UserRegister, UserLogin, UserResponse
from services.auth_service import AuthService
from models.user_model import UserModel
from core.dependencies import get_auth_service, get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Authentication"])


@router.post(
    "/auth/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new User account",
    description="Creates a new secure platform account with unique email controls."
)
async def register_account(
    payload: UserRegister,
    auth_service: AuthService = Depends(get_auth_service)
):
    try:
        user = await auth_service.register_user(payload)
        return UserResponse.model_validate(user.model_dump())
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post(
    "/auth/login",
    status_code=status.HTTP_200_OK,
    summary="Login user and acquire auth keys",
    description="Validates credentials and returns JWT bearer tokens."
)
async def login_account(
    payload: UserLogin,
    auth_service: AuthService = Depends(get_auth_service)
):
    try:
        user, token = await auth_service.authenticate_user(payload)
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": UserResponse.model_validate(user.model_dump())
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )


@router.get(
    "/auth/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Fetch current user specs profile",
    description="Decodes JWT tokens and returns authenticated account information."
)
async def get_my_profile(
    current_user: UserModel = Depends(get_current_user)
):
    return UserResponse.model_validate(current_user.model_dump())
