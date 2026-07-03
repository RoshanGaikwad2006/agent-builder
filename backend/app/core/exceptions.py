class RAGPlatformException(Exception):
    """Base exception for all errors in the RAG platform."""
    def __init__(self, message: str, detail: str = None):
        super().__init__(message)
        self.message = message
        self.detail = detail


class ConfigurationException(RAGPlatformException):
    """Raised when application configurations are missing or invalid."""
    pass


class VectorStoreException(RAGPlatformException):
    """Raised when operations on the vector database fail."""
    pass


class LLMException(RAGPlatformException):
    """Raised when requests to the LLM model or OpenRouter API fail."""
    pass


class DocumentProcessingException(RAGPlatformException):
    """Raised when PDF loading, parsing, or text splitting operations fail."""
    pass


class DatabaseConnectionException(RAGPlatformException):
    """Raised when connecting to MongoDB database fails or pings timeout."""
    pass


class DatabaseWriteException(RAGPlatformException):
    """Raised when write operations (inserts, updates, deletes) in MongoDB fail."""
    pass
