import logging
from typing import List, Optional
from bson import ObjectId
from bson.errors import InvalidId
from motor.motor_asyncio import AsyncIOMotorDatabase

from models.document_model import DocumentModel
from core.exceptions import DatabaseWriteException

logger = logging.getLogger(__name__)


class DocumentRepository:
    """
    Repository class managing metadata records for ingested PDF documents in MongoDB.
    """

    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db["documents"]

    async def record_ingestion(self, document_data: DocumentModel) -> str:
        """
        Saves a record of an ingestion operation.
        """
        try:
            # Exclude id field if None to allow MongoDB to auto-generate _id
            doc_dict = document_data.model_dump(by_alias=True, exclude_none=True)
            result = await self.collection.insert_one(doc_dict)
            inserted_id = str(result.inserted_id)
            logger.info(f"Recorded document ingestion metadata: {document_data.filename} (ID: {inserted_id})")
            return inserted_id
        except Exception as e:
            logger.error(f"Failed to record document ingestion in MongoDB: {e}")
            raise DatabaseWriteException(f"Failed to save document metadata: {e}") from e

    async def get_all_documents(self) -> List[DocumentModel]:
        """
        Returns a list of all recorded document ingestions.
        """
        try:
            cursor = self.collection.find().sort("created_at", -1)
            documents = []
            async for doc in cursor:
                doc["_id"] = str(doc["_id"])
                documents.append(DocumentModel.model_validate(doc))
            return documents
        except Exception as e:
            logger.error(f"Failed to fetch documents from MongoDB: {e}")
            raise DatabaseWriteException(f"Failed to fetch documents: {e}") from e

    async def get_documents_by_agent(self, agent_id: str) -> List[DocumentModel]:
        """
        Returns a list of all documents ingested for a specific agent.
        """
        try:
            cursor = self.collection.find({"agent_id": agent_id}).sort("created_at", -1)
            documents = []
            async for doc in cursor:
                doc["_id"] = str(doc["_id"])
                documents.append(DocumentModel.model_validate(doc))
            return documents
        except Exception as e:
            logger.error(f"Failed to fetch documents for Agent ID '{agent_id}' from MongoDB: {e}")
            raise DatabaseWriteException(f"Failed to fetch agent documents: {e}") from e

    async def get_document_by_id(self, doc_id: str) -> Optional[DocumentModel]:
        """
        Retrieves a single document metadata record by its ID.
        """
        try:
            object_id = ObjectId(doc_id)
        except InvalidId:
            logger.warning(f"Invalid ObjectId format provided: '{doc_id}'")
            return None

        try:
            doc = await self.collection.find_one({"_id": object_id})
            if doc:
                doc["_id"] = str(doc["_id"])
                return DocumentModel.model_validate(doc)
            return None
        except Exception as e:
            logger.error(f"Failed to fetch document by ID '{doc_id}': {e}")
            raise DatabaseWriteException(f"Failed to fetch document metadata: {e}") from e

    async def delete_document_by_id(self, doc_id: str) -> bool:
        """
        Deletes a single document metadata record by its ID.
        """
        try:
            object_id = ObjectId(doc_id)
        except InvalidId:
            logger.warning(f"Invalid ObjectId format provided for deletion: '{doc_id}'")
            return False

        try:
            result = await self.collection.delete_one({"_id": object_id})
            return result.deleted_count > 0
        except Exception as e:
            logger.error(f"Failed to delete document by ID '{doc_id}': {e}")
            raise DatabaseWriteException(f"Failed to delete document metadata: {e}") from e
