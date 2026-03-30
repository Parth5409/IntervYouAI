# Minor Project Synopsis: IntervYou.AI 2.0

## 1. Title Page
**Project Title**: IntervYou.AI 2.0: An Institutional AI-Driven Placement Readiness ERP  
**Project Type**: Application-Based  
**Date**: March 5, 2026  

---

## 2. Introduction
IntervYou.AI 2.0 is a specialized ERP platform designed to bridge the gap between academic preparation and professional recruitment. Unlike generic mock interview tools, this project transitions into an institutional "Mission-Based" system where Training & Placement Officers (TPOs) architect specific recruitment simulations (Placement Drives) aligned with real-world Job Descriptions (JDs).

The system utilizes a **Hybrid Microservices Architecture**:
*   **Backend Core (Spring Boot)**: Manages institutional multi-tenancy, Role-Based Access Control (RBAC), and bulk data processing.
*   **AI Engine (FastAPI)**: Handles high-compute tasks including Local Speech-to-Text (STT), Text-to-Speech (TTS), and Large Language Model (LLM) orchestration.

**Technical Terms**: 
*   **Mission-Based Flow**: A structured recruitment pipeline (Technical, HR, GD) assigned to students.
*   **RAG (Retrieval-Augmented Generation)**: Using local vector embeddings to ground AI questions in student resumes and JDs.
*   **Multi-Agent GD**: A group discussion environment featuring multiple AI personas and a human candidate.

---

## 3. Objective
*   To develop a multi-tenant ERP system for universities to manage placement preparation.
*   To automate the creation of "Placement Drives" with automated skill extraction from JDs.
*   To provide TPOs with real-time analytics on student readiness across various departments.
*   To implement a low-latency, voice-to-voice AI interview experience (STT -> LLM -> TTS).
*   To facilitate asynchronous feedback generation via an event-driven Kafka pipeline.

---

## 4. Feasibility Study
*   **Technical Feasibility**: The integration of Spring Boot and FastAPI, coupled with local CUDA-optimized models (Whisper/Kokoro), ensures that the high-latency challenges of AI voice interaction are addressed without expensive API overhead.
*   **Economic Feasibility**: By hosting models locally and utilizing open-weights LLMs for evaluation, the platform reduces long-term operational costs for educational institutions.
*   **Significance**: Universities currently rely on manual mock interviews which are unscalable for thousands of students. This platform provides 24/7 objective evaluation, significantly reducing faculty workload while increasing student confidence.

---

## 5. Methodology / Planning of Work
The project follows a documentation-first, service-oriented development lifecycle:

1.  **Phase 1: Foundation (Completed)**: Establishing the Mono-repo structure, shared PostgreSQL database, and Kafka messaging backbone.
2.  **Phase 2: Core ERP & Multi-Tenancy (Completed)**: Implementing Organization and User models with ROLE_ORG_ADMIN and ROLE_TPO.
3.  **Phase 3: Administrative Suite (In Progress - 50% Complete)**: 
    *   Development of Org Admin settings and TPO management.
    *   Implementation of TPO "Mission Architect" dashboard (Drive creation & Bulk Import).
4.  **Phase 4: Student Portal & Session UI (Pending)**: 
    *   Development of Student Mission Registry and Briefing pages.
    *   Implementation of real-time Interview/GD interfaces.
5.  **Phase 5: AI Engine Refinement (In Progress)**: Optimizing local CUDA inference and RAG logic.

---

## 6. Application Based Project

### a) Software/Hardware Requirements
*   **Backend**: Java 21 (Spring Boot 3.2.2), Python 3.12 (FastAPI).
*   **Middleware**: Apache Kafka 3.6.1, Redis.
*   **Database**: PostgreSQL 16.1.
*   **AI Models**: Google Gemini (LLM), Faster Whisper (STT), Kokoro-82M (TTS).
*   **Hardware (Development)**: NVIDIA GPU with CUDA support (for local STT/TTS optimization).
*   **Frontend**: React 18, Tailwind CSS, shadcn/ui.

### b) Benefits to Society
This project democratizes high-quality career coaching. Students from diverse backgrounds can practice for elite company interviews in a low-stakes, high-fidelity environment. It empowers educational institutions to improve their placement statistics through data-driven intervention, ultimately contributing to a more prepared and employable workforce.

---

## 7. Bibliography
1.  Spring Boot Documentation: [https://spring.io/projects/spring-boot](https://spring.io/projects/spring-boot)
2.  FastAPI Asynchronous Patterns: [https://fastapi.tiangolo.com/](https://fastapi.tiangolo.com/)
3.  "Attention is All You Need" (Transformer Architecture) - Vaswani et al.
4.  Apache Kafka Event-Driven Design Patterns.
5.  Google Gemini API Documentation.
