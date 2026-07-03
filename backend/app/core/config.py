import os
import time
import sys
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    OPENAI_API_KEY: str = ""
    PINECONE_API_KEY: str = ""
    PINECONE_INDEX_NAME: str = "rag-index"
    OPENAI_API_BASE: str = ""
    LLM_MODEL_NAME: str = "gpt-4o"

    # Operational RAG Parameters
    CHUNK_SIZE: int = 500
    CHUNK_OVERLAP: int = 20
    RETRIEVER_K: int = 3
    EMBEDDING_MODEL_NAME: str = "sentence-transformers/all-MiniLM-L6-v2"
    VECTOR_DIMENSION: int = 384

    # MongoDB Configurations
    MONGODB_URI: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "rag_platform"

    HOST: str = "0.0.0.0"
    PORT: int = 8080
    LOG_LEVEL: str = "INFO"
    UPLOAD_DIR: str = "uploads"

    APP_VERSION: str = "1.0.0"
    START_TIME: float = time.time()

settings = Settings()
