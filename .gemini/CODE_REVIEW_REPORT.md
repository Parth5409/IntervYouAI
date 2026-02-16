# Code Review Report: IntervYou.AI 2.0

This report summarizes the findings from the CodeRabbit review, categorized by severity and impact. These improvements align with the architectural goals defined in `.gemini/BACKEND_STRUCTURE.md` and the design principles in `.gemini/FRONTEND_GUIDELINES.md`.

## 1. Security & Privacy (Critical)

| Issue | Location | Impact |
| :--- | :--- | :--- |
| **Hardcoded JWT Secret** | `backend-core/.../application.yaml`, `ai-engine/utils/auth.py` | Predictable tokens allow authentication bypass if env vars are missing. |
| **Wildcard Kafka Packages** | `backend-core/.../application.yaml` | `spring.json.trusted.packages: "*"` allows arbitrary deserialization (RCE risk). |
| **PII in Logs** | `AuthTokenFilter.java` | Logging user emails at INFO level violates GDPR/CCPA compliance. |
| **Vulnerable Dependencies** | `pom.xml`, `package.json`, `requirements.txt` | CVEs in Spring Boot, PostgreSQL Driver, Axios, Pillow, and Starlette. |
| **Auth Bypass** | `OrganizationController.java` | `GET /organizations` exposes all orgs without authorization checks. |
| **Test Endpoints** | `WebSecurityConfig.java` | `/api/core/v1/test/` is publicly accessible in production. |

## 2. Reliability & Error Handling (High)

| Issue | Location | Impact |
| :--- | :--- | :--- |
| **Silent Failures** | Kafka Consumers/Producers | Swallowing exceptions prevents retries and causes silent data loss. |
| **Raw Exception Leak** | `GlobalExceptionHandler.java` | Exposing `ex.getMessage()` to clients can leak internal system details. |
| **Generic Exceptions** | Multiple Services | Use of `RuntimeException` makes error mapping (404, 400, 409) inconsistent. |
| **Unsafe JWT Validation** | `JwtUtils.java` | Missing `SignatureException` and `NoSuchElementException` handling. |
| **Unstable UI State** | `system-config/index.jsx` | `isLoading` remains true on fetch failure, sticking the UI on a loader. |

## 3. Performance & Scalability (Medium)

| Issue | Location | Impact |
| :--- | :--- | :--- |
| **In-Memory Filtering** | `PlacementDriveService.java` | `findAll().stream().filter()` loads thousands of students into RAM. Needs DB-level filtering. |
| **Precision Mismatch** | `StudentProfile` / `database.py` | Using `Double` (Python/Java) vs `BigDecimal` for CGPA causes precision issues. |

## 4. UX & Accessibility (Medium)

| Issue | Location | Impact |
| :--- | :--- | :--- |
| **Hook Violations** | `Checkbox.jsx` | Conditional `useId()` call violates React's Rules of Hooks, causing crashes. |
| **Broken Select UI** | `Select.jsx` | Dropdown doesn't close on outside click; forwarded refs are not attached. |
| **Role Logic Bug** | `RegistrationForm.jsx` | Mismatch between `ORG_ADMIN` and `ROLE_ORG_ADMIN` prevents field rendering. |
| **Accessibility Gaps** | `Input.jsx`, `TrustSignals.jsx` | Missing label associations and sub-12px font sizes (`text-[8px]`). |

## 5. Documentation & Project Standards (Low)

| Issue | Location | Impact |
| :--- | :--- | :--- |
| **Absolute Paths** | `GEMINI.md` | `file:///home/parth/...` links break for any other developer/environment. |
| **Broken Markdown** | `.gemini/*.md` | Unclosed JSON and Bash code blocks cause rendering issues in IDEs/Docs. |
| **Hardcoded Test URLs** | `AiIntegrationServiceTest.java` | Tests mock the wrong path (`/api/analysis` vs `/api/engine/analysis`). |

---

## Prioritized Implementation Plan

### Phase 1: Security Hardening (Immediate)
1. Patch dependencies (Spring Boot, Axios, Pillow).
2. Remove hardcoded secrets and add "fail-fast" checks.
3. Restrict Kafka trusted packages and secure org endpoints.

### Phase 2: Core Reliability & Refactoring
1. Standardize `GlobalExceptionHandler` and custom domain exceptions.
2. Fix silent Kafka exception swallowing.
3. Align CGPA types to `BigDecimal` across the stack.

### Phase 3: UI Stability & Performance
1. Fix React Hook violations in `Checkbox`.
2. Implement DB-level filtering for Placement Drives.
3. Resolve `Select` component bugs (click-outside/refs).

### Phase 4: Polish & Documentation
1. Fix markdown rendering and absolute paths.
2. Address accessibility (ARIA labels, font sizes).
3. Clean up test suites (JUnit assertions, unused imports).
