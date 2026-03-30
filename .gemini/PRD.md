# Product Requirements Document (PRD): IntervYou.AI 2.0

## 1. Product Overview
- **Project Title**: IntervYou.AI 2.0
- **Version**: 2.1 (Drive-Centric ERP)
- **Last Updated**: March 5, 2026
- **Owner**: Product Management Team

---

## 2. Problem Statement
Current campus placement preparation is fragmented and unscalable. Students lack realistic, company-specific interview practice, while Training & Placement Officers (TPOs) lack data-driven visibility into student readiness. Generic AI tools fail to align with specific Job Descriptions (JD) and the institutional "Mission" of placement drives.

---

## 3. Goals & Objectives

### Business Goals
- **Institutional Scale**: Transition from a B2C tool to a robust B2B ERP platform for universities.
- **Mission-Based Evaluation**: Shift focus from generic practice to "Placement Drives" that simulate the entire recruitment pipeline.

### User Goals
- **For Students**: Navigate assigned "Missions" (Drives) tailored to specific JDs with high-fidelity voice and group interaction.
- **For TPOs**: Architect the placement pipeline, set financial brackets (LPA), and track readiness metrics via automated feedback.
- **For Org Admins**: Manage institutional identity and faculty (TPO) access.

---

## 4. Success Metrics
- **Response Latency**: Sub-2-second round-trip for AI voice interaction using local CUDA-optimized STT/TTS.
- **GD Participation**: Successful multi-agent Group Discussions with at least 3 AI participants and 1 student.
- **Institutional Adoption**: 80% reduction in manual mock screening hours for faculty.

---

## 5. Target Users & Personas

### Primary Persona: Prof. Sharma (The TPO)
- **Pain Points**: Lacks objective data for 1,000+ students; manual mock drives are unmanageable.
- **Goals**: Automate the "TCS Ninja" or "Amazon SDE" mission assignment and evaluation.

### Secondary Persona: Rahul (The Student)
- **Pain Points**: Anxiety about specific rounds (Technical, HR/Salary, GD).
- **Goals**: Clear institutional "Missions" and receive actionable, JD-aligned feedback.

### Tertiary Persona: University Dean (The Org Admin)
- **Goals**: Monitor placement health across departments and manage TPO accounts.

---

## 6. Features & Requirements

### Must-Have Features (P0)

1. **AI Voice Interview Engine (Mission-Based)**
   - **Description**: Real-time conversational AI utilizing Whisper (STT), Gemini (LLM), and Kokoro (TTS) running locally on CUDA.
   - **Acceptance Criteria**:
     - [ ] Handles "HR_SALARY" rounds with automatic transition to negotiation.
     - [ ] Uses student resumes and JD context via RAG (local embeddings).

2. **Group Discussion (GD) Multi-Agent System**
   - **Description**: Student interacts with multiple AI bots in a moderated discussion.
   - **Acceptance Criteria**:
     - [ ] Dynamic topic selection from a TPO-provided pool.
     - [ ] Multi-agent participation (bots aware of each other and the student).
     - [ ] Specialized GD evaluation report.

3. **TPO Command Center (Mission Architect)**
   - **Description**: Configure Drives with LPA brackets, specific rounds, and eligibility criteria.
   - **Acceptance Criteria**:
     - [ ] Bulk Student Import (CSV) with auto-credential generation.
     - [ ] "Mission" assignment tracking and analytics.

### Should-Have Features (P1)

1. **Event-Driven Feedback Archive**
   - **Description**: Mission history grouped by Drive, generated asynchronously via Kafka.
   - **Success Metric**: Feedback delivered < 60s after session end.

---

## 7. Explicitly OUT OF SCOPE
- **Video Proctoring (MVP)**: Snapshots are planned (P2), but full video is out of scope.
- **Direct Recruiter Access**: System is for institutional prep only.
- **Mobile Native Apps**: Fully responsive web-only release.

---


## 8. User Scenarios

### Scenario 1: TPO Initiating a Campus Drive
- **Context**: Amazon announces a visit; TPO needs to prep the top 100 candidates.
- **Steps**:
  1. TPO logs in and uploads the Amazon SDE-1 Job Description.
  2. TPO filters students by "CGPA > 8.0" and "Java" skills.
  3. TPO clicks "Launch Drive."
- **Expected Outcome**: Spring Boot triggers Kafka messages to notify students; drives appear on student dashboards.
- **Edge Cases**: JD file is corrupted (System must prompt for a new upload).

### Scenario 2: Student Taking an AI Interview
- **Context**: Rahul opens the "Amazon Mock" task.
- **Steps**:
  1. Rahul clicks "Start Interview"; the frontend connects to the FastAPI Socket server.
  2. The AI introduces itself and asks a question based on the "Amazon" JD context.
  3. Rahul speaks; the AI responds in real-time with a relevant follow-up.
- **Expected Outcome**: The session closes after 15 minutes and triggers the feedback worker.
- **Edge Cases**: Internet disconnects (System must allow resumption within a 5-minute window).

---

## 9. Dependencies & Constraints
- **Technical Constraints**: Requires Gemini Pro API keys and high-speed audio processing.
- **External Dependencies**:
  - **Apache Kafka**: Essential for decoupling Spring Boot (Business) and FastAPI (AI).
  - **PostgreSQL**: For persistent storage of results and student data.
  - **Whisper/Kokoro**: For speech processing.

---

## 10. Timeline & Milestones
- **MVP (Month 1)**: Core Voice-to-Voice AI functionality and basic student login.
- **Beta (Month 2)**: TPO Dashboard, Kafka integration, and asynchronous feedback generation.
- **V2.0 Launch (Month 3)**: Analytics dashboard and performance stress-testing.

---

## 11. Risks & Assumptions
### Risks
- **Audio Latency**: Network jitter could ruin the "real-time" feel.
  - *Mitigation*: Use WebSocket chunking and optimized Python async workers.
### Assumptions
- **Hardware**: Students have access to a basic laptop with a microphone and stable 2Mbps+ internet.

---

## 12. Non-Functional Requirements
- **Performance**: Support 1,000+ concurrent WebSocket connections via FastAPI.
- **Security**: JWT-based authentication via Spring Security; data encryption at rest.
- **Scalability**: All services must be containerized (Docker) for independent scaling of the AI Engine.

---

## 13. References & Resources
- **Tech Stack**: React.js, Spring Boot 3, FastAPI, Kafka, PostgreSQL, Redis.
- **Design Pattern**: Hybrid Microservices (Asynchronous Event-Driven).
