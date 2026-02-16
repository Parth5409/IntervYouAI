# Product Requirements Document (PRD): IntervYou.AI 2.0

## 1. Product Overview
- **Project Title**: IntervYou.AI 2.0
- **Version**: 2.0
- **Last Updated**: February 6, 2026
- **Owner**: Product Management Team

---

## 2. Problem Statement
Current campus placement preparation is fragmented and unscalable. Students lack realistic, company-specific interview practice, while Training & Placement Officers (TPOs) lack data-driven visibility into student readiness. Manual mock interviews are time-consuming, and generic AI tools fail to align with specific Job Descriptions (JD) provided by visiting recruiters.

---

## 3. Goals & Objectives

### Business Goals
- **Scalability**: Successfully support 500+ concurrent interview sessions without system degradation via microservices.
- **Institutional Adoption**: Transition from a B2C tool to a robust B2B platform for educational institutions.

### User Goals
- **For Students**: Practice interviews tailored to specific company JDs with low-latency voice interaction.
- **For TPOs**: Automate the assignment of mock drives and track "Placement Readiness" metrics across departments.

---

## 4. Success Metrics
- **Response Latency**: Maintain a sub-2-second round-trip for AI voice interaction (STT -> LLM -> TTS).
- **Readiness Accuracy**: Achieve a 90% correlation between AI-generated scores and subsequent faculty assessments.
- **Completion Rate**: 80% of students assigned to a "Drive" complete their mock interview within the deadline.
- **Operational Savings**: 70% reduction in man-hours spent by faculty on initial mock screening rounds.

---

## 5. Target Users & Personas

### Primary Persona: Prof. Sharma (The TPO)
- **Demographics**: 45-55 years old, University Placement Head.
- **Pain Points**: Overwhelmed by volume (1,000+ students); lacks objective data to identify "at-risk" students.
- **Goals**: Increase overall campus placement percentage and automate repetitive screening.
- **Technical Proficiency**: Moderate.

### Secondary Persona: Rahul (The Student)
- **Demographics**: 21 years old, Final year Engineering student.
- **Pain Points**: High anxiety; receives no feedback from generic online practice; needs role-specific prep (e.g., "Google SDE" vs "TCS Ninja").
- **Goals**: Gain confidence and clear the first round of actual campus interviews.
- **Technical Proficiency**: High.

---

## 6. Features & Requirements

### Must-Have Features (P0)

1. **AI Voice Interview Engine**
   - **Description**: Real-time conversational AI utilizing Whisper (STT), Gemini (LLM), and Kokoro (TTS).
   - **User Story**: As a student, I want to speak my answers naturally so that the experience feels like a real human interaction.
   - **Acceptance Criteria**:
     - [ ] System handles audio streaming via WebSockets.
     - [ ] AI generates follow-up questions based on previous answers and the JD.
     - [ ] AI response includes both synchronized audio and text transcripts.
   - **Success Metric**: Latency < 2000ms.

2. **TPO Command Center (Drive Management)**
   - **Description**: Portal for faculty to upload JDs and bulk-assign interviews to students based on criteria.
   - **User Story**: As a TPO, I want to create a "TCS Digital" drive so that I can prepare all students with 7.5+ CGPA.
   - **Acceptance Criteria**:
     - [ ] Support for PDF/Docx JD uploads.
     - [ ] Filtering logic for student bulk-assignment (CGPA, Branch, Skills).
   - **Success Metric**: Drive setup completed in < 5 minutes.

### Should-Have Features (P1)

1. **Event-Driven Feedback Reports**
   - **Description**: Detailed performance analysis generated asynchronously via Kafka after the session ends.
   - **User Story**: As a student, I want a categorized score report (Technical, Communication, Confidence) so I know where to improve.
   - **Acceptance Criteria**:
     - [ ] Report generation must not block the main application UI.
     - [ ] Feedback includes specific "Better Answer" suggestions for failed questions.
   - **Success Metric**: Feedback delivered within 60 seconds of interview completion.

### Nice-to-Have Features (P2)

1. **Student Growth Graph**
   - **Description**: A visual dashboard showing a student’s progress over multiple interview attempts.
   - **Success Metric**: 50% increase in repeat users month-over-month.

---

## 7. Explicitly OUT OF SCOPE
- **Video/Proctoring**: No webcam monitoring or eye-tracking in this version.
- **Resume Editor**: The system parses resumes but does not provide tools to edit or format them.
- **B2C Payments**: V2.0 focuses on institutional licensing; individual student billing is out of scope.
- **Mobile Native Apps**: This is a web-only responsive release.
- **Direct Recruiter Access**: Recruiters cannot log in; only TPOs and Students have accounts.

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
