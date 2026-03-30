# Technology Stack Document (TECH_STACK.md)

## 1. STACK OVERVIEW
* **Architecture Pattern**: **Hybrid Microservices (Event-Driven)**.
    * **Gateway**: `8080` (Unified Entry Point).
    * **Backend Core**: `8081` (Java 21 / Spring Boot 3.2.2). Business logic, Auth, Institutional ERP.
    * **AI Engine**: `8000` (Python 3.12 / FastAPI 0.110.0). High-compute LLM/STT/TTS.
    * **Messaging**: **Apache Kafka 3.6.1**. Decoupled feedback and resume processing.
* **Justification**: Mirrors modern enterprise systems (Uber/Swiggy). Java ensures high-performance institutional logic; Python provides the cutting-edge AI ecosystem with local CUDA optimization.

---

## 2. FRONTEND STACK
* **Framework**: **React 18.2.0** (Vite-powered).
* **Language**: **TypeScript 5.3.3**.
* **Styling**: **TailwindCSS 3.4.6**.
* **Design System**: Industrial Slate (Slate-950 / Emerald-500).
* **State Management**: **Redux Toolkit 2.6.1**.
* **Routing**: **React Router Dom 6.22.0**.
* **Components**: **shadcn/ui** (customized for sharp corners).
* **Animations**: **framer-motion 10.16.4**.

---

## 3. BACKEND STACK

### Core Services (Java)
* **Runtime**: **JDK 21**.
* **Framework**: **Spring Boot 3.2.2**.
* **Data Persistence**: **Spring Data JPA / Hibernate 6**.
* **Security**: **Spring Security (JWT Stateless)**.
* **Integrations**: `KafkaTemplate` for event-driven flows.

### AI Engine (Python)
* **Runtime**: **Python 3.12.12**.
* **Framework**: **FastAPI 0.110.0** with `python-socketio`.
* **LLM Orchestration**: **LangChain 1.2.9** with **Google Gemini (gemini-2.5-flash)**.
* **Speech-to-Text (STT)**: **Faster Whisper 1.2.1** (CUDA-optimized, float16).
* **Text-to-Speech (TTS)**: **Kokoro-82M** (Local inference via CUDA).
* **RAG & Embeddings**: **FAISS** with **Ollama (`all-minilm:l6-v2`)** for local vectors.

### Infrastructure
* **Database**: **PostgreSQL 16.1** (Shared Instance).
* **Messaging**: **Apache Kafka 3.6.1**.
* **Media Storage**: **Cloudinary** (Profiles/Resumes).
* **Docker**: Root-level `docker-compose.yml` for Kafka, Zookeeper, PostgreSQL, Redis.

---

## 4. DATABASE SCHEMA & MIGRATIONS
* **Strategy**: **Liquibase** (Java) and **Alembic** (Python).
* **Seeding**: Custom Python scripts using `pandas` and `faker`.
* **Backup**: Daily RDS snapshots (Railway/AWS).

---

## 5. SECURITY CONSIDERATIONS
* **Auth Flow**: JWT with synchronized secret between Core and AI Engine.
* **RBAC**: `ROLE_ORG_ADMIN`, `ROLE_TPO`, `ROLE_STUDENT`.
* **Data Privacy**: PII scrubbing in logs; @JsonIgnore on sensitive fields.
* **Rate Limiting**: 15 missions per student per 24h via Redis.

---
