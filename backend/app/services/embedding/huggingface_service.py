import logging
from langchain_core.embeddings import Embeddings
from langchain_community.embeddings import HuggingFaceEmbeddings
from transformers import AutoTokenizer

from services.embedding.base import EmbeddingProvider
from core.config import settings
from core.exceptions import ConfigurationException

logger = logging.getLogger(__name__)


class HuggingFaceEmbeddingService(EmbeddingProvider):
    """
    Hugging Face local sentence-transformers embedding provider.
    Handles device loading and incorporates tokenization workarounds for Python 3.13.
    """

    def __init__(self):
        model_name = settings.EMBEDDING_MODEL_NAME
        if not model_name:
            raise ConfigurationException("EMBEDDING_MODEL_NAME is not set in configuration settings.")

        logger.info(f"Initializing Hugging Face embeddings model: {model_name}...")
        try:
            self._embeddings = HuggingFaceEmbeddings(model_name=model_name)

            # Workaround for Python 3.13 Hugging Face Rust tokenizers type conversion bug:
            # Use the slow Python-based tokenizer instead of the Rust-based fast tokenizer.
            try:
                self._embeddings.client.tokenizer = AutoTokenizer.from_pretrained(
                    model_name,
                    use_fast=False
                )
                logger.info("Registered slow Python tokenizer override successfully.")
            except Exception as token_err:
                logger.warning(f"Could not initialize slow tokenizer override: {token_err}")

            # Verify client works correctly
            logger.info("Executing diagnostic embedding check for Hugging Face model...")
            test_vector = self._embeddings.embed_query("diagnostic check")
            logger.info(f"Diagnostic embedding query succeeded. Dimension size: {len(test_vector)}")

        except Exception as e:
            logger.critical(f"Failed to initialize Hugging Face embeddings: {e}")
            raise ConfigurationException(f"Failed to initialize Hugging Face embeddings: {e}") from e

    def get_embeddings(self) -> Embeddings:
        """
        Returns the initialized HuggingFaceEmbeddings object.
        """
        return self._embeddings
