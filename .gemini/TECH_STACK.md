# Technology Stack Document (TECH_STACK.md)

## 1. STACK OVERVIEW
* **Architecture Pattern**: **Hybrid Microservices (Event-Driven)**.
    * **Backend Core (Java/Spring Boot)**: Handles business logic, authentication, and structured data management.
    * **AI Engine (Python/FastAPI)**: Manages heavy computational tasks like LLMs, Speech-to-Text (STT), and Text-to-Speech (TTS).
    * **Middleware (Apache Kafka)**: Facilitates asynchronous communication and decoupling between services.
* **Deployment Strategy**: **Container-based Orchestration (Docker Compose)**. Services are decoupled to scale independent of one another.
* **Justification**: This architecture mirrors modern enterprise systems (like Uber or Swiggy). Using Java ensures high-performance business logic, while Python provides access to the cutting-edge AI ecosystem without blocking the main thread.

---

## 2. FRONTEND STACK
* **Framework**: **React 18.2.0**
    * **Documentation**: [https://react.dev/](https://react.dev/)
    * **License**: MIT
    * **Reason**: Standard for building high-performance SPAs.
    * **Alternatives**: Vue.js (Rejected due to team expertise and ecosystem integration).
* **Language**: **TypeScript 5.3.3**
    * **Documentation**: [https://www.typescriptlang.org/](https://www.typescriptlang.org/)
    * **Reason**: Ensures type safety across complex AI data payloads.
* **Styling**: **TailwindCSS 3.4.6**
    * **Documentation**: [https://tailwindcss.com/](https://tailwindcss.com/)
    * **Reason**: Rapid UI development with low bundle size.
* **State Management**: **Redux Toolkit 2.6.1**
    * **Documentation**: [https://redux-toolkit.js.org/](https://redux-toolkit.js.org/)
    * **Reason**: Centralized store for complex student interview states.
* **Routing**: **React Router Dom 6.22.0**
    * **Reason**: standard routing solution for React applications.

---

## 3. BACKEND STACK

### Core Services
* **Runtime (Business Logic)**: **JDK 21**
    * **Framework**: **Spring Boot 3.2.2**
    * **Documentation**: [https://spring.io/projects/spring-boot](https://spring.io/projects/spring-boot)
    * **Reason**: Built-in support for Kafka, security, and enterprise data management.
* **Runtime (AI Engine)**: **Python 3.12.12**
    * **Framework**: **FastAPI 0.110.0**
    * **Documentation**: [https://fastapi.tiangolo.com/](https://fastapi.tiangolo.com/)
    * **Reason**: Asynchronous performance ideal for Socket.IO and AI model serving.

### Infrastructure
* **Database**: **PostgreSQL 16.1**
    * **ORM**: **SQLAlchemy 2.0.46** (Python) / **Spring Data JPA** (Java)
    * **Reason**: Reliable relational data for students, drives, and interview transcripts.
* **Messaging**: **Apache Kafka 3.6.1**
    * **Reason**: Asynchronous task offloading for generating interview feedback.
* **Storage**: **Cloudinary 1.44.1**
    * **Reason**: Cloud-based management for student audio recordings.

---

## 4. DATABASE SCHEMA
* **Migration Strategy**: **Alembic 1.18.3** (Python) and **Liquibase** (Java).
* **Seeding Approach**: Manual scripts using Python `pandas` and `faker` for testing.
* **Backup Policy**: Daily snapshots on managed database instances (RDS/Railway).

---

## 5. PACKAGE.JSON SCRIPTS
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build --sourcemap",
    "test": "vitest run",
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "serve": "vite preview"
  }
}
```

---

## 6. DEPENDENCIES LOCK

### Frontend (`package.json` extracts)
```json
{
  "react": "18.2.0",
  "react-dom": "18.2.0",
  "@reduxjs/toolkit": "2.6.1",
  "axios": "1.7.9",
  "socket.io-client": "4.8.1",
  "framer-motion": "10.16.4",
  "recharts": "^2.15.2"
}
```

### Backend (`requirements.txt` extracts)
```text
fastapi==0.110.0
uvicorn[standard]==0.27.1
python-socketio==5.11.0
langchain==1.2.9
faster_whisper==1.2.1
kokoro==0.9.4
pydantic==2.12.5
bcrypt==3.2.2
```

---

## 7. SECURITY CONSIDERATIONS
* **Auth Flow**: JWT (JSON Web Tokens) with a 24-hour expiry.
* **Password Hashing**: bcrypt with 12 rounds of salting.
* **CORS**: Restricted to specific frontend university subdomains.
* **Rate Limiting**: 15 interview attempts per student per 24 hours to prevent AI API abuse.

---