from services.llm.base import LLMProvider
from services.llm.openai_service import OpenAIService


class LLMProviderFactory:
    """Factory class to select and resolve LLM model providers."""

    @staticmethod
    def get_provider(provider_type: str = "openai") -> LLMProvider:
        """
        Factory method returning the concrete LLMProvider client instance.
        """
        prov_type = provider_type.lower()
        if prov_type == "openai":
            return OpenAIService()
        raise ValueError(f"Unsupported LLM provider type: {provider_type}")
