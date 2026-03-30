# Frontend Pages & Integration Blueprint (FRONTEND_PAGES.md)

This document outlines the required pages for IntervYou.AI 2.0, mapping them to the unified API Gateway (`8080`) and role-based access control (RBAC).

## 1. DESIGN SYSTEM OVERVIEW
*   **Theme**: Industrial Slate (Primary: `#0f172a`, Success: Emerald 500).
*   **Aesthetic**: Sharp corners (`rounded-none`), monospace typography, blueprint grids.
*   **Gateway Sub-paths**:
    *   `/api/core/v1/**` -> Spring Boot (Business Logic/Auth).
    *   `/api/engine/**` -> FastAPI (AI/Sockets).

---

## 2. PAGE INVENTORY

### A. Public & Authentication
| Page Name | Route | RBAC | Key APIs | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Landing Page** | `/` | Public | None | Hero, demo, and CTA. |
| **Unified Auth** | `/auth` | Public | `POST /api/core/v1/auth/login` | Login for all roles. |
| **Org Registration**| `/auth/signup` | Public | `POST /api/core/v1/auth/signup` | Institutional onboarding. |

### B. Student Portal (`ROLE_STUDENT`)
| Page Name | Route | RBAC | Key APIs / WebSockets | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Dashboard** | `/dashboard` | Student | `GET /api/core/v1/drives/student` | Active assigned missions. |
| **History (Archive)**| `/dashboard/history` | Student | `GET /api/core/v1/session/history` | Expandable cards by Drive. |
| **Placement Drives** | `/dashboard/drives` | Student | `GET /api/core/v1/drives` | Global list of missions. |
| **Mission Briefing** | `/interview/mission/:id`| Student | `GET /api/core/v1/drives/:id` | JD summary, LPA, setup. |
| **Live Session** | `/interview/live/:id`| Student | **Socket.IO**: `/socket.io` | Voice-to-voice interaction. |

### C. TPO Portal (`ROLE_TPO`)
| Page Name | Route | RBAC | Key APIs | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **TPO Dashboard** | `/tpo/dashboard` | TPO | `GET /api/core/v1/analytics` | Recruitment metrics. |
| **Student Directory**| `/tpo/students` | TPO | `POST /api/core/v1/students/import`| Bulk CSV management. |
| **Mission Manager** | `/tpo/missions` | TPO | `POST /api/core/v1/drives` | Create rounds/LPA brackets. |

### D. Admin Portal (`ROLE_ORG_ADMIN`)
| Page Name | Route | RBAC | Key APIs | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Admin Dashboard** | `/admin/dashboard` | Admin | `GET /api/core/v1/admin/tpos` | TPO management. |
| **Settings** | `/admin/settings` | Admin | `PUT /api/core/v1/organizations` | Institutional metadata. |

---

## 3. COMPONENT ARCHITECTURE

### Dashboard Layout
*   **BlueprintSidebar**: Technical nav with role indicators.
*   **TechnicalHeader**: Breadcrumbs + "BACK" button + Org branding.
*   **MissionCard**: Industrial card for assigned tasks (Status, Company, Deadline).

### Interview/GD Room
*   **FixedViewport**: Non-scrolling container (`h-screen overflow-hidden`).
*   **TranscriptFlow**: Independently scrolling transcript pane.
*   **WaveformVisualizer**: Real-time voice amplitude display.
*   **ReplayAudioBtn**: Manual trigger for AI voice playback.

---

## 4. INTEGRATION BEST PRACTICES

### WebSocket Initialization
```javascript
const socket = io("http://localhost:8080", {
  path: "/api/engine/socket.io", // Routed via gateway
  transports: ["websocket"],
  auth: { token: "..." }
});
```

### Role-Based Routing
```jsx
<ProtectedRoute role="ROLE_STUDENT">
  <Dashboard />
</ProtectedRoute>
```
---
