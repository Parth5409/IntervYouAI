# Application Flow Documentation: IntervYou.AI 2.0 (APP_FLOW.md)

## 1. ENTRY POINTS
* **Direct URL Access**: `https://intervyou.ai/` leads to the landing page.
* **Institutional Signup**: `/auth/signup` for Organization Admins.
* **Unified Login**: `/auth/login` for all roles (Org Admin, TPO, Student).
* **Deep Links**: `/interview/mission/:driveId` for specific placement rounds.

---

## 2. CORE USER FLOWS

### A. TPO: Mission Architecture
1. **Screen**: TPO Dashboard (`/tpo/dashboard`)
2. **Action**: Clicks "Create Mission (Drive)."
3. **Configuration**:
    * Upload JD (AI extracts skills).
    * Set Salary Brackets (Min/Max LPA).
    * Toggle Rounds: `TECHNICAL`, `HR_SALARY`, `GD`.
    * Lock Parameters: Difficulty, question count.
4. **Assignment**: Bulk import students via CSV; system notifies via Kafka.

### B. Student: Navigating Missions
1. **Screen**: Student Dashboard (`/dashboard`)
2. **View**: "Assigned Missions" list with company branding.
3. **Briefing**: `/interview/mission/:id` - Shows mission status, LPA, and JD summary.
4. **Execution**:
    * **Round 1 (Technical)**: WebSocket interview.
    * **Round 2 (HR_SALARY)**: Behavioral vetting transitioning to Salary Negotiation.
    * **Round 3 (GD)**: Multi-agent group discussion with AI bots.
5. **History**: `/dashboard/history` - Archive of all sessions grouped by Drive.

### C. Org Admin: System Health
1. **Screen**: Admin Dashboard (`/admin/dashboard`)
2. **Action**: Create TPO accounts, configure institution details (logo, name).

---

## 3. NAVIGATION MAP

```text
ROOT (/)
├── Landing Page [Public]
│   └── Unified Auth [/auth]
├── STUDENT PORTAL [/dashboard] [ROLE_STUDENT]
│   ├── Mission Registry (Assigned Drives)
│   ├── Mission History [/dashboard/history]
│   ├── Placement Drives [/dashboard/drives]
│   └── Mission Briefing [/interview/mission/:id]
│       └── Live Session (Interview/GD)
├── TPO PORTAL [/tpo] [ROLE_TPO]
│   ├── TPO Dashboard [/tpo/dashboard]
│   ├── Student Directory [/tpo/students]
│   └── Mission Manager [/tpo/missions]
└── ADMIN PORTAL [/admin] [ROLE_ORG_ADMIN]
    ├── Admin Dashboard [/admin/dashboard]
    └── Institution Settings [/admin/settings]
```

---

## 4. SESSION INTERFACE LOGIC

### Interview/GD Room
* **Fixed Architecture**: Non-scrolling `h-screen` layout.
* **Transcript**: Independently scrolling container for history.
* **Controls**:
    * **Waveform**: Active during student speech.
    * **Replay Audio**: Button to manually trigger AI voice playback.
    * **End Mission**: Finalizes session and triggers Kafka feedback worker.

### State Transitions (HR_SALARY)
```python
IF progress > 70% AND score_avg > threshold:
    THEN AI.persona = "Hiring Manager"
    THEN AI.topic = "Salary Negotiation" (using LPA bracket)
ELSE:
    THEN AI.persona = "Technical Lead"
```

---

## 5. ERROR HANDLING
* **Audio Playback Blocked**: Displays "Replay Audio" button prominently.
* **Unauthorized Access**: RoleGate redirects to `/auth` with "Access Denied" toast.
* **Disconnected Session**: AI Engine supports resumption within 5 minutes.

---
