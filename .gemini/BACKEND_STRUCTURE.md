# Backend Structure Documentation (BACKEND_STRUCTURE.md)

## 1. ARCHITECTURE OVERVIEW
* **System Architecture**: **Hybrid Microservices**. Spring Boot serves as the RESTful API gateway for business logic, while FastAPI handles specialized WebSocket-based AI streaming.
* **Authentication Strategy**: **Stateless JWT**. Spring Security manages token issuance/validation; FastAPI validates tokens for WebSocket handshakes.
* **Data Flow**: 
    1. TPO assigns Drive (Spring Boot -> PostgreSQL).
    2. Kafka publishes notification.
    3. Student starts Interview (Frontend -> WebSocket -> FastAPI).
    4. Feedback generated asynchronously (FastAPI -> Kafka -> Spring Boot).
* **Caching Strategy**: **Redis** for rate limiting, session metadata, and temporary AI context storage.



---

## 2. DATABASE SCHEMA (PostgreSQL)

**Table Name**: `users`
**Purpose**: Stores authentication data and profile information for all roles.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PRIMARY KEY | Unique identifier |
| `email` | `VARCHAR(255)` | UNIQUE, NOT NULL | University email |
| `password_hash` | `VARCHAR(255)` | NOT NULL | Bcrypt hashed password |
| `role` | `VARCHAR(20)` | NOT NULL | 'STUDENT' or 'TPO' |
| `created_at` | `TIMESTAMP` | DEFAULT NOW() | Record creation time |
| `updated_at` | `TIMESTAMP` | DEFAULT NOW() | Last update time |

**Table Name**: `placement_drives`
**Purpose**: Stores TPO-created recruitment events and job descriptions.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PRIMARY KEY | Unique identifier |
| `tpo_id` | `UUID` | FK (users.id) | Creator reference |
| `company_name` | `VARCHAR(100)` | NOT NULL | Name of the company |
| `job_description` | `TEXT` | NOT NULL | Full JD text for AI context |
| `min_cgpa` | `DECIMAL(3,2)` | DEFAULT 0.0 | Eligibility filter |

**Table Name**: `interview_sessions`
**Purpose**: Records individual interview attempts and AI-generated scores.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PRIMARY KEY | Unique identifier |
| `student_id` | `UUID` | FK (users.id) | Candidate reference |
| `drive_id` | `UUID` | FK (placement_drives.id) | Job context reference |
| `overall_score` | `INTEGER` | DEFAULT 0 | AI-calculated final score |
| `transcript` | `JSONB` | NULL | Full conversation log |

---

## 3. API ENDPOINTS (v1)

### Authentication
**POST `/api/v1/auth/login`**
* **Purpose**: Authenticates user and returns JWT.
* **Authentication**: Public
* **Request Body**:
```json
{
  "email": "student@university.edu",
  "password": "securePassword123"
}
```
- **Success (200)**: Returns `accessToken` and `refreshToken`.

---

### Placement Drives (TPO Only)
**POST `/api/v1/drives`**
* **Purpose**: Create a new mock interview drive.
* **Request Body**:
```json
{
  "companyName": "Google",
  "jdText": "SDE-1 requirements...",
  "minCgpa": 8.5
}
```
* **Side Effects**: Publishes Kafka event to `notification-events` topic.

---

## 4. AUTHENTICATION & AUTHORIZATION
* **JWT Payload**: Contains `userId`, `role`, and `exp`.
* **Password Security**:
    * **Algorithm**: Bcrypt.
    * **Salt Rounds**: 12.
* **Authorization Levels**:
    * **Public**: `/auth/login`, `/auth/register`.
    * **Authenticated**: `/student/dashboard`, `/interview/*`.
    * **TPO Admin**: `/tpo/**` (Spring Security `@PreAuthorize("hasRole('TPO')")`).

---

## 5. CACHING STRATEGY (Redis)
* **Session Cache**: Temporary storage of LLM conversation history during live sockets to minimize DB writes.
* **Rate Limiting**:
    * `/auth/login`: 5 attempts per 15 mins.
    * **AI API**: 50 requests per minute per IP.
* **Invalidation**: On `POST /api/v1/drives`, invalidate the student dashboard cache for all eligible users.

---

## 6. ERROR HANDLING
Standard Response Format:
```json
{
  "success": false,
  "errorCode": "INSUFFICIENT_PERMISSIONS",
  "message": "You are not eligible for this drive.",
  "timestamp": "2026-02-06T20:57:14Z"
}
```

---

## 7. BACKUP & RECOVERY
* **Strategy**: Daily full RDS snapshots at 02:00 UTC; 30-day retention.
* **Location**: AWS S3 (Cross-region replication).
* **Recovery**:
    1. Provision new PostgreSQL instance.
    2. Restore most recent snapshot.
    3. Run Alembic/Liquibase migrations to sync any delta schema changes.

---

## 8. API VERSIONING
* **Current Version**: v1
* **Strategy**: URL-based versioning (`/api/v1/...`).
* **Deprecation**: Versions are supported for 6 months after a new major release.
