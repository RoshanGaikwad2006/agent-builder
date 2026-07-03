import os
import sys
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware

# Ensure correct sys.path configuration so that app can find local api/core/schemas/services
# modules even if executed from the repository root
app_dir = os.path.dirname(os.path.abspath(__file__))
if app_dir not in sys.path:
    sys.path.append(app_dir)

from api import health, chat, upload, documents, conversations, agents, leads, auth
from core.config import settings
from core.logging import setup_logging
from core.exceptions import (
    RAGPlatformException,
    ConfigurationException,
    VectorStoreException,
    LLMException,
    DocumentProcessingException,
    DatabaseConnectionException,
    DatabaseWriteException
)
from core.dependencies import get_vectorstore_provider, get_mongodb_manager

# Setup central logging system
setup_logging(settings.LOG_LEVEL)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Handles application startup validation and shutdown lifecycle events.
    """
    logger.info("Initializing AI Agent Builder Platform - RAG Core Backend...")
    logger.info(f"Configuration: HOST={settings.HOST}, PORT={settings.PORT}, LOG_LEVEL={settings.LOG_LEVEL}")
    logger.info(f"Target Pinecone Index: '{settings.PINECONE_INDEX_NAME}'")

    # Startup credential validations
    if not settings.OPENAI_API_KEY:
        logger.warning("OPENAI_API_KEY is missing. RAG chat queries will fail until set.")
    if not settings.PINECONE_API_KEY:
        logger.warning("PINECONE_API_KEY is missing. Ingestions/Retrievals will fail until set.")

    # Initialize MongoDB connection
    mongo_manager = get_mongodb_manager()
    await mongo_manager.connect()

    yield
    # Close MongoDB connection
    await mongo_manager.disconnect()
    logger.info("Stopping RAG Core Backend service...")


app = FastAPI(
    title="AI Agent Builder Platform - RAG Core",
    description=(
        "Production-ready FastAPI RAG core serving as the foundation for the AI Agent Builder Platform. "
        "Provides REST endpoints for similarity vector query resolution and automated PDF context ingestion."
    ),
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Enable CORS (Cross-Origin Resource Sharing) middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include subrouters
app.include_router(health.router)
app.include_router(chat.router)
app.include_router(upload.router)
app.include_router(documents.router)
app.include_router(conversations.router)
app.include_router(agents.router)
app.include_router(leads.router)
app.include_router(auth.router)


@app.get(
    "/",
    status_code=status.HTTP_200_OK,
    summary="Get API Metadata",
    description="Returns high-level runtime metadata and configuration specs for the RAG core backend service."
)
async def read_root():
    return {
        "title": app.title,
        "description": app.description,
        "version": app.version,
        "docs_url": "/docs",
        "redoc_url": "/redoc",
        "configuration": {
            "llm_provider": "OpenAI",
            "llm_model": settings.LLM_MODEL_NAME,
            "embeddings_provider": "HuggingFace",
            "embeddings_model": settings.EMBEDDING_MODEL_NAME,
            "vector_database": "Pinecone",
            "index_name": settings.PINECONE_INDEX_NAME
        }
    }


# Centralized Platform Exception Handler
@app.exception_handler(RAGPlatformException)
async def rag_platform_exception_handler(request: Request, exc: RAGPlatformException):
    logger.error(f"Platform error on {request.method} {request.url.path}: {exc.message} (Class: {exc.__class__.__name__})")
    
    # Map custom exceptions to appropriate HTTP Status codes
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    if isinstance(exc, LLMException):
        status_code = status.HTTP_502_BAD_GATEWAY
    elif isinstance(exc, VectorStoreException):
        status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    elif isinstance(exc, DocumentProcessingException):
        status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
    elif isinstance(exc, ConfigurationException):
        status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    elif isinstance(exc, DatabaseConnectionException):
        status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    elif isinstance(exc, DatabaseWriteException):
        status_code = status.HTTP_500_INTERNAL_SERVER_ERROR

    return JSONResponse(
        status_code=status_code,
        content={
            "detail": exc.message,
            "error_type": exc.__class__.__name__
        }
    )


# Centralized Validation Error Handler
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning(f"Request validation failure on endpoint {request.method} {request.url.path}: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Request payload validation failed.",
            "errors": exc.errors()
        }
    )


# Centralized Global Unhandled Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception encountered on {request.method} {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An unexpected server error occurred. Please contact the administrator or check log files."
        }
    )
