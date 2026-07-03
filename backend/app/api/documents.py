import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status

from schemas.document_schema import DocumentResponse
from repositories.document_repository import DocumentRepository
from core.dependencies import get_document_repository

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Documents"])


@router.get(
    "/documents",
    response_model=List[DocumentResponse],
    status_code=status.HTTP_200_OK,
    summary="List Ingested Documents",
    description="Returns metadata records of all ingested PDF files in MongoDB."
)
async def list_documents(
    doc_repository: DocumentRepository = Depends(get_document_repository)
):
    logger.info("Request received to list all document metadata records.")
    docs = await doc_repository.get_all_documents()
    return [DocumentResponse.model_validate(d.model_dump(by_alias=True)) for d in docs]


@router.get(
    "/documents/{id}",
    response_model=DocumentResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Document Metadata by ID",
    description="Retrieves a single document metadata record by its database ID."
)
async def get_document(
    id: str,
    doc_repository: DocumentRepository = Depends(get_document_repository)
):
    logger.info(f"Request received to retrieve document by ID: '{id}'")
    doc = await doc_repository.get_document_by_id(id)
    if not doc:
        logger.warning(f"Document ID '{id}' was not found.")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID '{id}' was not found."
        )
    return DocumentResponse.model_validate(doc.model_dump(by_alias=True))


@router.delete(
    "/documents/{id}",
    status_code=status.HTTP_200_OK,
    summary="Delete Document Metadata by ID",
    description="Deletes a single document metadata record from MongoDB by its database ID."
)
async def delete_document(
    id: str,
    doc_repository: DocumentRepository = Depends(get_document_repository)
):
    logger.info(f"Request received to delete document by ID: '{id}'")
    success = await doc_repository.delete_document_by_id(id)
    if not success:
        logger.warning(f"Document ID '{id}' not found for deletion.")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID '{id}' was not found."
        )
    return {
        "status": "success",
        "message": f"Document with ID '{id}' successfully deleted from database."
    }
