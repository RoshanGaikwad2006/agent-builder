import os
import logging
from langchain_openai import ChatOpenAI
from langchain_core.language_models.chat_models import BaseChatModel

from services.llm.base import LLMProvider
from core.config import settings
from core.exceptions import LLMException, ConfigurationException

logger = logging.getLogger(__name__)


class OpenAIService(LLMProvider):
    """
    OpenAI and OpenRouter chat completions provider.
    Binds keys, base endpoints, and LLM model names dynamically from settings.
    """

    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        self.api_base = settings.OPENAI_API_BASE
        self.model_name = settings.LLM_MODEL_NAME

        if not self.api_key:
            raise ConfigurationException("OPENAI_API_KEY is not set in configurations.")
        if not self.model_name:
            raise ConfigurationException("LLM_MODEL_NAME is not set in configurations.")

        # Set environment variables for LangChain integration
        os.environ["OPENAI_API_KEY"] = self.api_key

        try:
            if self.api_base:
                logger.info(f"Initializing OpenRouter/Custom ChatModel ({self.model_name}) at {self.api_base}...")
                self._chat_model = ChatOpenAI(
                    model=self.model_name,
                    openai_api_base=self.api_base
                )
            else:
                logger.info(f"Initializing standard OpenAI ChatModel ({self.model_name})...")
                self._chat_model = ChatOpenAI(model=self.model_name)
                
            logger.info("OpenAI model client loaded successfully.")
        except Exception as e:
            logger.error(f"Failed to initialize OpenAI chat model client: {e}")
            raise LLMException(f"Failed to initialize OpenAI chat model: {e}") from e

    def get_llm(self) -> BaseChatModel:
        """
        Returns the initialized ChatOpenAI instance.
        """
        return self._chat_model
