# AI Agent Builder Platform (RAG Core)

This repository serves as the production-grade Retrieval-Augmented Generation (RAG) backend and interface for the AI Agent Builder Platform. It features a fully modular Clean Architecture, a FastAPI backend, and a React + Vite + Tailwind CSS frontend.

---

## 🛠️ Tech Stack

### 1. Backend Layer
- **Framework:** FastAPI
- **Server:** Uvicorn (reload-enabled)
- **Settings Validation:** Pydantic Settings
- **RAG Orchestration:** LangChain
- **Vector Database:** Pinecone (AWS `us-east-1` serverless spec)
- **Embeddings:** HuggingFace Sentence Transformers (`all-MiniLM-L6-v2`, 384-dimensional dense vectors)
- **LLM Completion:** OpenAI / OpenRouter (supports custom base URLs and free tiers)

### 2. Frontend Layer
- **Framework:** React 19 (Single-Page Application)
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4
- **Routing:** React Router DOM
- **API Communication:** Axios Service Clients
- **Theme Support:** Class-based Light / Dark Mode

---

## 📂 Project Structure

```
rag-foundation/
├── backend/                  # Production FastAPI application
│   └── app/
│       ├── main.py           # Startup checks, CORS, and central exception maps
│       ├── api/              # Route endpoints (chat, upload, health checks)
│       ├── services/         # Layered service providers (embedding, vectorstore, LLM, RAG)
│       ├── repositories/     # Repository patterns tracking ingestion & latencies
│       └── core/             # Central configs, JSON logs, exceptions, and dependency caching
├── frontend/                 # Single-Page React application
│   ├── src/
│   │   ├── layouts/          # Dashboard subrouting & theme context frames
│   │   ├── pages/            # Chat interface & Document ingestion views
│   │   ├── services/         # Ingestion and query API clients (Axios)
│   │   └── components/       # UI elements (PDF uploader, chat bubbles, sidebar, progress bar)
│   ├── package.json          # Node scripts and dependencies
│   └── vite.config.js        # Vite configurations
└── src/                      # Legacy RAG base utilities
```

---

## 🚀 Running Locally

### 1. Configuration Setup
Create a `.env` file at the root of the project:
```env
OPENAI_API_KEY="your-api-key"
PINECONE_API_KEY="your-api-key"
PINECONE_INDEX_NAME="rag-production"

# Optional: Configuration for OpenRouter free tier
OPENAI_API_BASE="https://openrouter.ai/api/v1"
LLM_MODEL_NAME="openrouter/free"
```

### 2. Start the Backend API
```bash
python -m uvicorn backend.app.main:app --port 8080 --reload
```

### 3. Start the React Frontend
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.
