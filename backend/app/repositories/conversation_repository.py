import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)


class ConversationRepository:
    """Repository class managing conversation message logs and performance latency data."""

    def __init__(self):
        self._conversations: List[Dict[str, Any]] = []

    def log_interaction(self, question: str, answer: str, latency: float, model: str) -> None:
        """
        Records a single chat session interaction with its latency and model configurations.
        """
        interaction = {
            "question": question,
            "answer": answer,
            "latency": latency,
            "model": model
        }
        self._conversations.append(interaction)
        logger.info(f"Repository logged chat interaction. Model: '{model}', Latency: {latency:.3f}s")

    def get_history(self) -> List[Dict[str, Any]]:
        """
        Returns the chat interaction history log.
        """
        return self._conversations
