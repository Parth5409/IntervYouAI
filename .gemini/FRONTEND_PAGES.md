# Frontend Pages & Integration Blueprint (FRONTEND_PAGES.md)

This document outlines the required pages for IntervYou.AI 2.0, mapping them to the unified API Gateway and role-based access control (RBAC).

## 1. DESIGN SYSTEM OVERVIEW
*   **Theme**: Industrial Slate (Primary: `#0f172a`, Success: Emerald 600).
*   **Base URL**: `http://localhost:8080` (Unified Gateway).
*   **Path Strategy**:
    *   `/api/core/v1/**` -> Business Logic (Spring Boot).
    *   `/api/engine/**` -> AI & Sockets (FastAPI).

---

## 2. PAGE INVENTORY

### A. Public & Authentication
| Page Name | Route | RBAC | Key APIs | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Landing Page** | `/` | Public | None | Hero section, demo, and CTA. |
| **Unified Auth** | `/auth` | Public | `POST /api/core/v1/auth/login`<br>`POST /api/core/v1/auth/signup` | Login and student registration. |

### B. Student Portal (`ROLE_STUDENT`)
| Page Name | Route | RBAC | Key APIs / WebSockets | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Dashboard** | `/dashboard` | Student | `GET /api/core/v1/drives`<br>`GET /api/core/v1/sessions` | View active drives and history. |
| **Waiting Room** | `/interview/:id/setup` | Student | `GET /api/core/v1/drives/:id` | Mic test & JD context preview. |
| **Live Interview** | `/interview/:id` | Student | **Socket.IO**: `/api/engine/socket.io` | Voice-to-voice AI interaction. |
| **Feedback Report** | `/results/:id` | Student | `GET /api/core/v1/sessions/:id` | Skill charts and transcript review. |

### C. TPO Portal (`ROLE_TPO`)
| Page Name | Route | RBAC | Key APIs | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **TPO Dashboard** | `/tpo/dashboard` | TPO | `GET /api/core/v1/analytics/overview` | High-level placement stats. |
| **Drive Manager** | `/tpo/drives` | TPO | `POST /api/core/v1/drives`<br>`POST /api/engine/analysis/extract-skills` | Create mock drives from JDs. |
| **Student Directory**| `/tpo/students` | TPO | `POST /api/core/v1/students/bulk-import` | Bulk student management. |

---

## 3. ADDITIONAL PAGES NEEDED (Gaps Found)

To make the ERP system truly production-ready, the following pages are recommended for implementation:

1.  **Organization Onboarding (`/admin/setup`)**:
    *   **RBAC**: `ROLE_ORG_ADMIN`.
    *   **Need**: Initial setup for a university (adding name, logo, and TPO accounts).
    *   **API**: `POST /api/core/v1/organizations`.

2.  **Profile Settings (`/settings`)**:
    *   **RBAC**: Authenticated (All).
    *   **Need**: Allows students to update skills/PRN and TPOs to change designations.
    *   **API**: `GET/POST /api/core/v1/students/profile`.

3.  **Global Error Pages (`/404`, `/500`)**:
    *   **Need**: Graceful handling of routing errors or AI Engine timeouts.

---

## 4. INTEGRATION BEST PRACTICES

### WebSocket Initialization
The frontend must initialize the Socket.IO client using the specific gateway sub-path:
```javascript
const socket = io("http://localhost:8080", {
  path: "/api/engine/socket.io",
  transports: ["websocket"]
});
```

### Protected Routing
Wrap the portal components in a `RoleGate` to ensure users cannot access dashboards without the correct JWT claim:
```jsx
<Route path="/tpo/*" element={
  <RoleGate allowed="ROLE_TPO">
    <TpoLayout />
  </RoleGate>
} />
```
