# EduLink

EduLink is a learning management platform built for classroom collaboration. It includes role-based dashboards, subject management, study material sharing, real-time chat, and an AI-powered chat summarization system for extracting key discussion points, topics, insights, and weak areas from classroom conversations.

## Features

- JWT authentication and role-based access
- Admin, teacher, and student workflows
- Subject creation, browsing, enrollment, and classroom management
- Study material upload and download
- Real-time classroom chat using WebSocket/STOMP
- Chat persistence with MySQL
- Doubt marking, resolving, and upvoting
- AI chat summarization with Python FastAPI NLP service
- Hybrid NLP + optional Grok refinement for better summaries

## Tech Stack

**Frontend**
- React
- Vite
- Tailwind CSS
- Axios
- SockJS/STOMP

**Backend**
- Spring Boot
- Spring Security
- JWT
- Spring Data JPA
- WebSocket
- MySQL

**AI/NLP Service**
- Python
- FastAPI
- Sentence Transformers
- KeyBERT
- TextRank
- BART
- Optional Grok/xAI refinement

## Project Structure

```text
edulink-major/
├── edulink-frontend/
├── Edulink Backend/
│   └── EdLink/
├── conversation_summarizer/
└── SUMMARIZATION_PIPELINE_CONTEXT.md
```

## Running The Project

### 1. Backend

```bash
cd "Edulink Backend/EdLink"
./mvnw spring-boot:run
```

Backend runs on:

```text
http://localhost:8075
```

### 2. Frontend

```bash
cd edulink-frontend
npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

### 3. Python Summarization Service

```bash
cd conversation_summarizer
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000
```

Python API runs on:

```text
http://localhost:8000
```

Health check:

```text
http://localhost:8000/health
```

## Chat Summarization Flow

```text
React Chat UI
  ↓
Spring Boot API
  ↓
Fetch chats from MySQL
  ↓
Python FastAPI NLP service
  ↓
Local NLP preprocessing and summarization
  ↓
Optional Grok refinement
  ↓
Summary displayed in React
```

The summarizer returns:

```json
{
  "summary": "...",
  "topics": [],
  "insights": [],
  "weakAreas": []
}
```

## Optional Grok Setup

Create:

```text
conversation_summarizer/.env
```

Add:

```env
XAI_API_KEY=your_api_key_here
GROK_MODEL=grok-2-latest
```

If no key is configured, the summarizer still works using the local NLP fallback.

## Documentation

For detailed summarization architecture and module-level explanation, see:

```text
SUMMARIZATION_PIPELINE_CONTEXT.md
```

