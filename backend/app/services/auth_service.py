import os
import hmac
import base64
import hashlib
import logging
import jwt
from datetime import datetime, timedelta
from typing import Optional, Tuple

from repositories.user_repository import UserRepository
from models.user_model import UserModel
from schemas.user_schema import UserRegister, UserLogin
from core.config import settings

logger = logging.getLogger(__name__)

# JWT configuration defaults
JWT_SECRET = "super-secret-developer-key-please-replace-in-production-stage"
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours


class PasswordHasher:
    """
    Utility class managing standard secure cryptography hashing logic using PBKDF2.
    """

    @staticmethod
    def hash_password(password: str) -> str:
        salt = os.urandom(16)
        pw_hash = hashlib.pbkdf2_hmac(
            "sha256", 
            password.encode("utf-8"), 
            salt, 
            100000
        )
        combined = salt + pw_hash
        return base64.b64encode(combined).decode("utf-8")

    @staticmethod
    def verify_password(password: str, hashed: str) -> bool:
        try:
            combined = base64.b64decode(hashed.encode("utf-8"))
            salt = combined[:16]
            pw_hash = combined[16:]
            new_hash = hashlib.pbkdf2_hmac(
                "sha256", 
                password.encode("utf-8"), 
                salt, 
                100000
            )
            return hmac.compare_digest(pw_hash, new_hash)
        except Exception:
            return False


class AuthService:
    """
    Service layer coordinating user logins, registrations, password validations, and JWT issuance.
    """

    def __init__(self, repository: UserRepository):
        self._repository = repository

    async def register_user(self, schema: UserRegister) -> UserModel:
        """
        Validates unique constraints and registers a new User account.
        """
        logger.info(f"Processing register request for email: '{schema.email}'")
        existing = await self._repository.get_user_by_email(schema.email)
        if existing:
            raise ValueError(f"An account with email '{schema.email}' is already registered.")

        hashed_pwd = PasswordHasher.hash_password(schema.password)
        user_data = UserModel(
            name=schema.name,
            email=schema.email.lower().strip(),
            password_hash=hashed_pwd
        )
        inserted_id = await self._repository.create_user(user_data)
        user_data.id = inserted_id
        return user_data

    async def authenticate_user(self, schema: UserLogin) -> Tuple[UserModel, str]:
        """
        Verifies login credentials and issues authorization JWT keys.
        """
        logger.info(f"Processing login credentials check for: '{schema.email}'")
        user = await self._repository.get_user_by_email(schema.email)
        if not user or not PasswordHasher.verify_password(schema.password, user.password_hash):
            raise ValueError("Invalid email or password.")

        token = self.create_jwt_token(str(user.id))
        return user, token

    def create_jwt_token(self, user_id: str) -> str:
        """
        Generates authorization token keys.
        """
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        payload = {
            "sub": user_id,
            "exp": expire
        }
        return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

    def verify_jwt_token(self, token: str) -> Optional[str]:
        """
        Decodes and validates token signatures. Returns user_id if valid.
        """
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            return payload.get("sub")
        except jwt.PyJWTError:
            return None
