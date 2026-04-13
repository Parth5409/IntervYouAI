# IntervYou.AI 2.0

**IntervYou.AI** is a high-performance, Generative AI-powered interview simulation platform. It provides a real-time, voice-to-voice experience for Technical, HR, and Group Discussion (GD) simulations, leveraging a microservices architecture for scalability and intelligence.

## ✨ Core Pillars

- **Real-Time Voice Intelligence**: Ultra-low latency voice-to-voice interactions using `Faster-Whisper` (STT) and `Kokoro-82M` (TTS).
- **Context-Aware Simulations**: RAG-powered interviews that ingest user resumes and specific Job Descriptions (JD) to tailor every question.
- **Multi-Agent GD Simulator**: Participate in group discussions with multiple AI bots, each with unique behavioral archetypes and dynamic turn-taking.
- **Deep Analytics**: AI-driven evaluation of technical skills, communication clarity, and behavioral alignment, visualized for both Students and TPOs.
- **Microservices Architecture**: Decoupled AI orchestration, core business logic, and API gateway for production-grade reliability.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React (Vite), TailwindCSS, Socket.IO Client, Framer Motion |
| **API Gateway** | Java Spring Cloud Gateway |
| **Core Backend** | Java Spring Boot (v3.2), Hibernate, PostgreSQL |
| **AI Engine** | FastAPI (Python 3.12), LangChain, LangGraph |
| **Messaging** | Apache Kafka (Async event-driven processing) |
| **AI Models** | Google Gemini 2.0 Flash, Ollama (`all-minilm`) |
| **Speech Stack** | Faster-Whisper (`distil-large-v3`), Kokoro-82M (Self-hosted) |
| **Vector Store** | FAISS / ChromaDB |

---

## 📁 Project Structure

```text
IntervYouAI/
├── ai-engine/           # Python: LLM Orchestration, RAG, STT/TTS, Socket.IO
├── api-gateway/         # Java: Request routing and security
├── backend-core/        # Java: User management, Analytics, DB persistence
├── frontend/            # React: Modern, responsive UI/UX
├── .gemini/             # Project Intelligence: PRD, Flow, Architecture docs
└── docker-compose.yml   # Infrastructure: Postgres, Kafka, Zookeeper, Ollama
```

---

## 🚀 Quick Start (Development)

### 1. Infrastructure
Ensure Docker is running and start the core services:
```bash
docker-compose up -d
```

### 2. Backend Services
#### Core (Java)
```bash
cd backend-core
./mvnw spring-boot:run
```

#### Gateway (Java)
```bash
cd api-gateway
./mvnw spring-boot:run
```

#### AI Engine (Python)
```bash
cd ai-engine
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
# Run the FastAPI application
uvicorn main:app --host 127.0.0.1 --port 8000 --http h11 --ws websockets --proxy-headers
```

### 2. Frontend Setup


```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🧠 Project Intelligence
This repository is optimized for AI-assisted development ("Vibecoding"). Critical documentation and architectural standards are located in:
- [`.gemini/PRD.md`](.gemini/PRD.md) - Product requirements and features.
- [`.gemini/APP_FLOW.md`](.gemini/APP_FLOW.md) - Detailed sequence and data flows.
- [`.gemini/TECH_STACK.md`](.gemini/TECH_STACK.md) - Detailed technical specifications.

---

## 🔌 Socket.IO Event Map
- `start_interview`: Handshake and RAG initialization.
- `audio_chunk`: Real-time PCM audio streaming (User -> Engine).
- `new_ai_message`: Response delivery (Engine -> User).
- `speaker_change`: Dynamic GD turn-taking control.
- `end_session`: Triggering the evaluation pipeline via Kafka.
