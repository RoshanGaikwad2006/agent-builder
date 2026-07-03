import os
import time
import logging
from typing import Dict, Any, List, Optional

from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate

from models.conversation_model import ConversationModel
from services.llm.base import LLMProvider
from services.vectorstore.base import VectorStoreProvider
from services.rag.retriever_service import RetrieverService
from services.rag.document_service import DocumentProcessor
from repositories.conversation_repository import ConversationRepository
from core.prompts import system_prompt
from core.exceptions import LLMException

logger = logging.getLogger(__name__)


class RAGService:
    """
    RAG platform orchestrator.
    Combines independent LLM, Vector Store, Retriever, and Ingestion services
    into a cohesive question-answering workflow.
    """

    def __init__(
        self,
        llm_provider: LLMProvider,
        vectorstore_provider: VectorStoreProvider,
        retriever_service: RetrieverService,
        document_service: DocumentProcessor,
        conversation_repository: ConversationRepository
    ):
        self._llm_provider = llm_provider
        self._vectorstore_provider = vectorstore_provider
        self._retriever_service = retriever_service
        self._document_service = document_service
        self._conversation_repository = conversation_repository

        # Re-build chains from injected providers
        self._chat_model = self._llm_provider.get_llm()
        self._retriever = self._retriever_service.get_retriever()
        
        self._prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", "{input}"),
        ])

        logger.info("Constructing production RAG retrieval chain...")
        self.question_answer_chain = create_stuff_documents_chain(self._chat_model, self._prompt)
        self.rag_chain = create_retrieval_chain(self._retriever, self.question_answer_chain)
        logger.info("Production RAG Core Chain initialization complete.")

    async def get_answer(self, question: str) -> Dict[str, Any]:
        """
        Orchestrates question answering by running similarity retrievals and LLM completions.
        Logs latency analytics in the conversation repository.
        """
        logger.info(f"Invoking RAG chain for query: '{question}'")
        start_time = time.time()
        
        try:
            response = self.rag_chain.invoke({"input": question})
        except Exception as e:
            logger.error(f"Error invoking RAG chain: {e}")
            raise LLMException(f"Failed to query language model: {e}") from e
            
        latency = time.time() - start_time
        
        answer = response.get("answer", "")
        context = response.get("context", [])
        
        # Format and extract unique source names
        sources = []
        for doc in context:
            source = doc.metadata.get("source", "Unknown")
            if source and ("/" in source or "\\" in source):
                source = os.path.basename(source)
            if source:
                sources.append(source)
                
        unique_sources = list(set(sources))
        
        # Log interaction metrics in conversation repository
        model_name = getattr(self._chat_model, "model_name", getattr(self._chat_model, "model", "unknown-model"))
        
        from datetime import datetime
        conversation_data = ConversationModel(
            user_question=question,
            ai_answer=answer,
            sources_used=unique_sources,
            model_name=model_name,
            response_time=f"{latency:.2f}s",
            created_at=datetime.utcnow()
        )
        await self._conversation_repository.log_interaction(conversation_data)
        
        logger.info(f"Generated response. Sources count: {len(unique_sources)}. Latency: {latency:.3f}s")
        return {
            "answer": answer,
            "sources": unique_sources
        }

    async def ingest_pdf(self, file_path: str, agent_id: Optional[str] = None) -> int:
        """
        Delegates document parsing and embedding ingestion to the Document Service.
        """
        return await self._document_service.process_and_ingest(file_path, agent_id=agent_id)
