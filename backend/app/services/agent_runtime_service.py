import os
import time
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate

from services.llm.base import LLMProvider
from services.rag.retriever_service import RetrieverService
from repositories.agent_repository import AgentRepository
from repositories.conversation_repository import ConversationRepository
from models.conversation_model import ConversationModel
from models.lead_model import LeadModel
from core.exceptions import LLMException

logger = logging.getLogger(__name__)


class AgentRuntimeService:
    """
    Agent runtime engine responsible for dynamically building isolated RAG chains
    based on agent instructions and retrieving vectors from the agent's Pinecone namespace.
    """

    def __init__(
        self,
        llm_provider: LLMProvider,
        retriever_service: RetrieverService,
        agent_repository: AgentRepository,
        conversation_repository: ConversationRepository,
        lead_repository: Any
    ):
        self._llm_provider = llm_provider
        self._retriever_service = retriever_service
        self._agent_repository = agent_repository
        self._conversation_repository = conversation_repository
        self._lead_repository = lead_repository

    async def get_agent_response(self, agent_id: str, question: str) -> Optional[Dict[str, Any]]:
        logger.info(f"Invoking Agent Chat Runtime for Agent ID: '{agent_id}' with question: '{question}'")
        start_time = time.time()

        # 1. Load Agent from MongoDB
        agent = await self._agent_repository.get_agent_by_id(agent_id)
        if not agent:
            logger.warning(f"Runtime execution failed: Agent ID '{agent_id}' not found.")
            return None

        system_prompt = agent.system_prompt
        if "{context}" not in system_prompt:
            system_prompt = system_prompt + "\n\nUse the following pieces of retrieved context to answer the question:\n{context}"
        namespace = f"agent_{agent_id}"

        # 2. Retrieve only agent namespace vectors
        retriever = self._retriever_service.get_retriever(namespace=namespace)

        # 3. Create agent prompt & LLM chain
        chat_model = self._llm_provider.get_llm()
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", "{input}"),
        ])

        try:
            qa_chain = create_stuff_documents_chain(chat_model, prompt)
            rag_chain = create_retrieval_chain(retriever, qa_chain)
            response = rag_chain.invoke({"input": question})
        except Exception as e:
            logger.error(f"Error invoking Agent retrieval chain: {e}")
            raise LLMException(f"Failed to query agent LLM: {e}") from e

        latency = time.time() - start_time
        answer = response.get("answer", "")
        context = response.get("context", [])

        # Extract unique grounding sources
        unique_sources = []
        for doc in context:
            source = doc.metadata.get("source", "Unknown")
            if source and ("/" in source or "\\" in source):
                source = os.path.basename(source)
            if source and source not in unique_sources:
                unique_sources.append(source)

        # Model name resolution
        model_name = getattr(chat_model, "model_name", None) or getattr(chat_model, "model", None) or "unknown"
        if hasattr(chat_model, "client") and hasattr(chat_model.client, "model"):
            model_name = chat_model.client.model

        # 4. Save conversation log in MongoDB
        conversation_data = ConversationModel(
            user_question=question,
            ai_answer=answer,
            agent_id=agent_id,
            sources_used=unique_sources,
            model_name=model_name,
            response_time=f"{latency:.2f}s",
            created_at=datetime.utcnow()
        )
        await self._conversation_repository.log_interaction(conversation_data)

        # 5. Lead Detection Check
        lead_keywords = {"price", "pricing", "cost", "demo", "buy", "purchase", "call", "contact", "quotation"}
        normalized_question = question.lower()
        if any(keyword in normalized_question for keyword in lead_keywords):
            try:
                lead_data = LeadModel(
                    agent_id=agent_id,
                    message=question,
                    lead_type="hot",
                    created_at=datetime.utcnow()
                )
                await self._lead_repository.create_lead(lead_data)
            except Exception as e:
                logger.error(f"Failed to log auto-detected lead: {e}")

        logger.info(f"Agent response generated. Sources count: {len(unique_sources)}. Latency: {latency:.3f}s")
        return {
            "answer": answer,
            "sources": unique_sources
        }
