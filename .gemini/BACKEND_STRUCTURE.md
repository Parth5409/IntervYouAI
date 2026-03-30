# Backend Structure Documentation (BACKEND_STRUCTURE.md)

## 1. ARCHITECTURE OVERVIEW
* **System Architecture**: **Hybrid Microservices (Event-Driven)**.
    * **Gateway**: `8080` (Unified Entry Point).
    * **Backend Core**: `8081` (Java/Spring Boot 3.2.2). Business logic, Auth, and Institutional ERP.
    * **AI Engine**: `8000` (Python/FastAPI 0.110.0). High-compute LLM/STT/TTS tasks.
* **Authentication**: **Stateless JWT**. Claims include `userId`, `orgId`, and `role`.
* **Data Flow**:
    1. TPO assigns Drive (Core -> PostgreSQL).
    2. Kafka publishes to `drive-events`.
    3. Student starts "Mission" (Frontend -> Core -> AI Engine).
    4. Feedback generated asynchronously (AI Engine -> Kafka -> Core).
* **AI Processing**: Local CUDA-based STT (Whisper) and TTS (Kokoro).

---

## 2. DATABASE SCHEMA (PostgreSQL - Shared)

**Table Name**: `organizations`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PRIMARY KEY | Institutional identifier |
| `name` | `VARCHAR(255)` | UNIQUE, NOT NULL| College/University name |
| `org_code` | `VARCHAR(50)` | UNIQUE, NOT NULL| Used for bulk-generated creds |

**Table Name**: `users`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PRIMARY KEY | Unique identifier |
| `org_id` | `UUID` | FK (orgs.id) | Multi-tenancy link |
| `role` | `VARCHAR(20)` | NOT NULL | `ROLE_STUDENT`, `ROLE_TPO`, `ROLE_ORG_ADMIN` |

**Table Name**: `placement_drives`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PRIMARY KEY | Mission ID |
| `min_lpa` | `DECIMAL(10,2)` | NOT NULL | Financial floor |
| `max_lpa` | `DECIMAL(10,2)` | NOT NULL | Financial ceiling |
| `active_modules` | `VARCHAR[]` | ARRAY | `TECHNICAL`, `HR_SALARY`, `GD` |
| `config_json` | `JSONB` | NULL | Round-specific locking |

**Table Name**: `interview_sessions`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PRIMARY KEY | Session identifier |
| `type` | `VARCHAR(20)` | NOT NULL | `INTERVIEW`, `MISSION`, `GD` |
| `overall_score` | `INTEGER` | DEFAULT 0 | AI Score |
| `transcript` | `JSONB` | NULL | Hibernate-mapped JSON |

---

## 3. API ENDPOINTS (v1)

### Authentication & Org (Spring Boot)
- **POST `/api/core/v1/auth/signup`**: Institutional registration.
- **POST `/api/core/v1/auth/login`**: Unified login for all roles.
- **GET `/api/core/v1/user/me`**: Context-aware profile (RBAC).

### Placement Missions (Spring Boot)
- **POST `/api/core/v1/drives`**: Mission creation (TPO).
- **GET `/api/core/v1/drives/student`**: Fetch assigned missions for candidate.
- **POST `/api/core/v1/students/bulk-import`**: CSV-based onboarding.

### AI Sessions (AI Engine via Gateway)
- **POST `/api/engine/session/mission`**: Initialize a Drive-linked interaction.
- **WS `/socket.io`**: Real-time voice stream.

---

## 4. AUTHENTICATION & AUTHORIZATION
* **Role Enforcement**: `ROLE_ORG_ADMIN` (Full System Control), `ROLE_TPO` (Faculty), `ROLE_STUDENT` (Candidate).
* **JWT Shared Secret**: Synchronized between Core and AI Engine.
* **CORS**: Gateway-level filtering with `OPTIONS` preflight support.

---

## 5. INFRASTRUCTURE & CACHING
* **Kafka Topics**: `resume-events`, `interview-feedback`, `drive-events`.
* **Vector Stores**: `resume_user_<uuid>` (Local FAISS).
* **Audio Storage**: Local CUDA models + Cloudinary for user assets.

---
