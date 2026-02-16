# Architectural Blueprint: Drive-Centric Mission System (V2.1)

## 1. VISION OVERVIEW
Transition IntervYou.AI from a generic self-service practice tool to an **Institutional Mission-Based Platform**. In this model, the Training & Placement Officer (TPO) acts as the **Mission Architect**, defining the exact parameters of a recruitment simulation, while the student acts as the **Candidate** navigating a predefined pipeline.

---

## 2. CORE ARCHITECTURAL SHIFTS

### A. Generic vs. Mission-Based
*   **OLD**: Student chooses any company, any role, and any difficulty.
*   **NEW**: Student is assigned a **Placement Drive**. The simulation context (JD, Role, Salary, Rounds) is derived entirely from the TPO's configuration.

### B. Module Consolidation (HR + Salary)
*   **OLD**: HR and Salary Negotiation were separate, disconnected sessions.
*   **NEW**: A unified **Final Selection Round**. The AI transitions from behavioral vetting to financial negotiation in a single session, using the Drive's specific LPA (Lakhs Per Annum) ranges.

---

## 3. DATABASE SCHEMA EVOLUTION (Backend-Core)

### `PlacementDrive` Entity Updates
The `PlacementDrive` entity will now be the primary configuration hub for simulations.

| Field | Type | Description |
| :--- | :--- | :--- |
| `min_lpa` | `BigDecimal` | Minimum salary offered in Rs. LPA. |
| `max_lpa` | `BigDecimal` | Maximum salary offered in Rs. LPA. |
| `active_modules` | `Set<RoundType>` | EnumSet: `[TECHNICAL, HR_SALARY, GD]` |
| `config_json` | `JSONB` | Stores module-specific parameters (Difficulty, No. of questions). |

#### Round Configuration Object (JSONB):
```json
{
  "technical": {
    "difficulty": "HARD",
    "questions": 10,
    "allow_student_override": false
  },
  "hr_salary": {
    "difficulty": "MEDIUM",
    "questions": 8,
    "negotiation_style": "ASSERTIVE"
  },
  "gd": {
    "duration": 20,
    "topic_mode": "JD_BASED"
  }
}
```

---

## 4. TPO WORKFLOW: THE MISSION ARCHITECT

### Step 1: Drive Identity
*   **Entity Name**: Google, Microsoft, etc.
*   **Financial Bracket**: Entry of `min` and `max` LPA (e.g., 12.0 to 15.5 LPA).
*   **Job Description**: PDF upload or raw text (The primary source of truth for the AI).

### Step 2: Pipeline Configuration
*   **Toggle Modules**: Select which rounds are required for this drive.
*   **Parameter Locking**: TPO chooses whether to fix the difficulty/question count for all students or allow them to choose their own "Stress Level."

---

## 5. STUDENT WORKFLOW: THE CANDIDATE

### Step 1: Drive Registry (`/interview/setup`)
*   Replaces the old "Setup Wizard."
*   Displays a list of **Assigned Missions** (Drives).
*   **Drive Card UI**:
    *   Company Branding.
    *   Pipeline Status (e.g., `0/2 Rounds Complete`).
    *   LPA Bracket Display.

### Step 2: Mission Brief (`/interview/drive/:id`)
*   Displays the full JD summary and TPO's specific instructions.
*   Shows the **Mission Pipeline**:
    *   **Round 1: TECHNICAL** (Status: START)
    *   **Round 2: HR_SALARY** (Status: LOCKED - Depends on R1)

### Step 3: Tactical Setup (The "Slim" Wizard)
*   Student clicks [START MISSION].
*   If TPO allowed overrides, student selects `Complexity` and `Sequence Length`.
*   If locked, the screen simply shows "SYNCING PROTOCOLS..." and a [READY FOR UPLINK] button.

---

## 6. AI-ENGINE LOGIC (FastAPI Integration)

### A. Context Injection
The AI Engine will now receive a broader `Context Object`:
*   `resume_data`: Extracted skills and history.
*   `jd_data`: Job requirements.
*   `financial_data`: `min_lpa` and `max_lpa`.

### B. The HR_SALARY Orchestrator State Machine
1.  **State: BEHAVIORAL**: Conducts 70% of the session using HR persona.
2.  **Transition**: AI analyzes performance. If "Passed," triggers transition.
3.  **State: NEGOTIATION**: AI shifts persona to Hiring Manager. *"We liked your technical depth. Let's discuss compensation. Our standard offer is [min_lpa]..."*

---

## 7. API ENDPOINTS & ROUTING

### New Routes:
*   `GET /api/core/v1/drives/student`: Fetch list of assigned drives for the current student.
*   `GET /api/core/v1/drives/{id}/details`: Fetch specific drive config and student progress.
*   `POST /api/engine/session/mission`: Start a session tied specifically to a Drive Round.

---

## 8. SUCCESS CRITERIA
1.  **Reduced Friction**: Student can start an interview in < 2 clicks from the registry.
2.  **Standardization**: TPOs can ensure every student in a "TCS Ninja" drive faces the same 8-question "Medium" difficulty challenge.
3.  **Realism**: The transition from behavioral talk to salary talk feels seamless and high-stakes.
