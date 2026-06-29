from abc import ABC, abstractmethod
from langchain_core.language_models.chat_models import BaseChatModel


class LLMProvider(ABC):
    """Abstract base class representing an LLM model provider."""

    @abstractmethod
    def get_llm(self) -> BaseChatModel:
        """
        Returns the configured LangChain chat model instance.
        """
        pass
