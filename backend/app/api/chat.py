import logging
from fastapi import APIRouter, Depends, status

from schemas.chat import ChatRequest, ChatResponse
from core.dependencies import get_rag_service
from services.rag.rag_service import RAGService

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Chat"])


@router.post(
    "/chat",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK,
    summary="Process Chat Query via RAG",
    response_description="Returns the answer and source documents retrieved from the vector index."
)
async def chat(
    request: ChatRequest,
    rag_service: RAGService = Depends(get_rag_service)
):
    """
    Submit a prompt to be answered by the RAG backend system using the ingested knowledge base.

    ### Architecture Details:
    - **LLM Provider:** OpenAI/OpenRouter (Configurable)
    - **LLM Model:** Configured dynamically from settings (defaults to gpt-4o / openrouter/free)
    - **Prompt:** Defined in `src/prompt.py` (restricts outputs to concise, document-grounded responses)
    - **Retriever:** Vector database similarity retriever (similarity metric: cosine)
    - **Embeddings:** HuggingFace `sentence-transformers/all-MiniLM-L6-v2` (384-dimensional vectors, Python 3.13 workaround enabled)
    - **Pinecone Index:** Configured dynamically (defaults to `rag-index` / `rag-production`)
    - **LangChain Chain:** `create_retrieval_chain` + `create_stuff_documents_chain`
    - **RAG Logic:** Resolves queries by mapping query vectors to Pinecone database contents, extracting matching text, stuffing it into prompts, and requesting completion from OpenAI.
    """
    logger.info(f"Chat request received: '{request.question}'")
    result = await rag_service.get_answer(request.question)
    logger.info("Successfully resolved RAG answer.")
    return ChatResponse(
        answer=result["answer"],
        sources=result["sources"]
    )
