# Implementation Plan: IntervYou.AI 2.0 (IMPLEMENTATION_PLAN.md)

## 1. OVERVIEW
- **Project Name**: IntervYou.AI 2.0
- **MVP Target Date**: 12 Weeks from Start
- **Build Philosophy**: **Documentation-First & Service-Oriented**. Every feature is documented in `PRD.md` and `BACKEND_STRUCTURE.md` before a single line of code is written to prevent architectural drift.

---

## 2. PHASE 1: PROJECT SETUP & FOUNDATION

### Step 1.1: Initialize Project Structure
- **Duration**: 2 Days
- **Goal**: Establish the mono-repo/multi-repo structure for the Hybrid Microservices architecture.
- **Tasks**:
  1. Initialize Spring Boot (Java 21) project using Spring Initializr.
  2. Initialize FastAPI (Python 3.12.12) project.
  3. Initialize Vite/React frontend.
- **Commands**:
  ```bash
  # Frontend
  npm create vite@latest frontend -- --template react-ts
  # Python AI Engine
  mkdir ai-engine && cd ai-engine && python -m venv venv && pip install fastapi uvicorn
#### Success Criteria:
- [ ] All three sub-directories (`/frontend`, `/backend-core`, `/ai-engine`) exist.
- [ ] Hello World endpoints are accessible for both backends.

### Step 1.2: Environment & Database Setup
- **Tasks**:
  1. Setup Docker Compose for PostgreSQL, Kafka, and Redis.
  2. Configure `.env` files based on `TECH_STACK.md`.
- **Success Criteria**:
  1. [ ] `docker-compose up` starts all infrastructure services without errors.
  2. [ ] Connection established from Spring Boot to PostgreSQL.

---

## 3. PHASE 2: DESIGN SYSTEM IMPLEMENTATION

### Step 2.1: Setup Design Tokens
- **Tasks**: Update `tailwind.config.js` with Slate and Emerald scales from `FRONTEND_GUIDELINES.md`.
- **Code Snippet**:
  ```javascript
  // tailwind.config.js
  theme: {
    extend: {
      colors: {
        slate: { 900: '#0f172a' }, // Primary Brand
        emerald: { 600: '#059669' } // Success
      }
    }
  }
  ```

### Step 2.2: Build Core Components
- **Order**: Buttons -> Inputs -> Layout Wrappers -> Modals.
- **Testing**: Visual regression testing using Storybook or local component gallery.

---

## 4. PHASE 3: AUTHENTICATION SYSTEM

### Step 3.1: Backend - Auth Endpoints
- **Reference**: `BACKEND_STRUCTURE.md` Section 3.
- **Tasks**:
  1. Implement Bcrypt hashing for `users` table.
  2. Create JWT generation logic in Spring Boot.
- **Success Criteria**:
  1. [ ] `POST /api/v1/auth/login` returns a valid JWT.

### Step 3.2: Frontend - Auth Pages
- **Reference**: `APP_FLOW.md` Section 2.
- **Tasks**: Implement Login and Registration forms with `react-hook-form`.

---

## 5. PHASE 4: CORE FEATURES (P0)

### Step 4.1: TPO Drive Management
- **Backend**: Implement `placement_drives` CRUD and Kafka producer for assignments.
- **Frontend**: Build JD upload form and student filtering UI.

### Step 4.2: AI Voice Interview Engine (The "Muscle")
- **Sub-tasks**:
  1. **WebSocket Setup**: Initialize `python-socketio` server in FastAPI.
  2. **STT Integration**: Connect `faster_whisper` to process incoming audio chunks.
  3. **LLM Logic**: Implement LangChain with Google Gemini for JD-aware questioning.
  4. **TTS Integration**: Implement Kokoro for real-time voice response.
- **Success Criteria**:
  1. [ ] Latency from student speech to AI response is < 2 seconds.

---

## 6. PHASE 5: TESTING & REFINEMENT
- **Unit Testing**: Vitest (Frontend) and JUnit (Backend) with 80% coverage targets.
- **Integration Testing**: Playwright for "Happy Path" interview flow as defined in `APP_FLOW.md`.

---

## 7. PHASE 6: DEPLOYMENT
### Step 6.1: Staging & Production
- **Platform**: Vercel (Frontend) and AWS/Railway (Backends).
- **Monitoring**: Setup Sentry for error logging and Prometheus for Kafka lag monitoring.

---

## 8. MILESTONES & TIMELINE

| Milestone | Target Date | Deliverables |
| :--- | :--- | :--- |
| M1: Foundation | Week 2 | Docker environment + Frontend Layout |
| M2: Auth & TPO | Week 5 | Login/Register + Drive Creation + Kafka Messaging |
| M3: The AI Core | Week 9 | Voice-to-Voice WebSocket Interview functioning |
| M4: MVP Launch | Week 12 | End-to-end flow with automated feedback reports |

---

## 9. RISK MITIGATION

| Risk | Impact | Mitigation |
| :--- | :--- | :--- |
| AI Latency | High | Use `faster_whisper` in streaming mode; move to GPU-optimized instances. |
| Schema Changes | Medium | Strict use of Liquibase/Alembic migrations for DB sync. |
| API Costs | Low | Implement Redis-based rate limiting to prevent Gemini API over-usage. |

---

## 10. SUCCESS CRITERIA
- [ ] **P0 Complete**: TPO can assign drives; Students can complete AI interviews.
- [ ] **Performance**: Voice latency < 2s; UI remains responsive during audio streaming.
- [ ] **Compliance**: WCAG 2.1 AA contrast and keyboard accessibility met.

---

## 11. POST-MVP ROADMAP
- **P1 Features**: Multi-student analytics for TPOs; Growth-graph visualizations for students.
- **Optimization**: Self-hosting LLMs (Ollama) to reduce API costs for larger universities.
- **User Feedback**: Iterating on AI "personality" based on faculty interview style preferences.

