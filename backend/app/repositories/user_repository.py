import logging
from typing import Optional
from bson import ObjectId
from bson.errors import InvalidId
from motor.motor_asyncio import AsyncIOMotorDatabase

from models.user_model import UserModel
from core.exceptions import DatabaseWriteException

logger = logging.getLogger(__name__)


class UserRepository:
    """
    Repository layer managing users collection operations in MongoDB.
    """

    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db["users"]

    async def create_user(self, user_data: UserModel) -> str:
        """
        Inserts a new platform user document.
        """
        try:
            doc_dict = user_data.model_dump(by_alias=True, exclude_none=True)
            result = await self.collection.insert_one(doc_dict)
            inserted_id = str(result.inserted_id)
            logger.info(f"Registered new User account: '{user_data.email}' (ID: {inserted_id})")
            return inserted_id
        except Exception as e:
            logger.error(f"Failed to save user in MongoDB: {e}")
            raise DatabaseWriteException(f"Failed to create user account: {e}") from e

    async def get_user_by_email(self, email: str) -> Optional[UserModel]:
        """
        Finds a user document by exact email lookup.
        """
        try:
            doc = await self.collection.find_one({"email": email.lower().strip()})
            if doc:
                doc["_id"] = str(doc["_id"])
                return UserModel.model_validate(doc)
            return None
        except Exception as e:
            logger.error(f"Failed to query user by email '{email}': {e}")
            raise DatabaseWriteException(f"Failed to query user: {e}") from e

    async def get_user_by_id(self, user_id: str) -> Optional[UserModel]:
        """
        Finds a user document by its MongoDB ObjectId.
        """
        try:
            object_id = ObjectId(user_id)
        except InvalidId:
            logger.warning(f"Invalid ObjectId format for user lookup: '{user_id}'")
            return None

        try:
            doc = await self.collection.find_one({"_id": object_id})
            if doc:
                doc["_id"] = str(doc["_id"])
                return UserModel.model_validate(doc)
            return None
        except Exception as e:
            logger.error(f"Failed to query user by ID '{user_id}': {e}")
            raise DatabaseWriteException(f"Failed to query user: {e}") from e
