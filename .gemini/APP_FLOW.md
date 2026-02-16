# Application Flow Documentation: IntervYou.AI 2.0 (APP_FLOW.md)

## 1. ENTRY POINTS
* **Direct URL Access**: `https://intervyou.ai/` leads to the landing page.
* **Deep Links**:
    * **Email Notifications**: "You've been assigned a mock drive" → `/interview/:driveId`
    * **Push Notifications**: "Your feedback is ready" → `/results/:sessionId`
* **OAuth/Social Login**: Single Sign-On (SSO) via Google/Microsoft using university domain credentials.
* **Search Engines**: Public landing page optimized for "AI Mock Interview Practice."

---

## 2. CORE USER FLOWS

### A. TPO: Placement Drive Creation
**HAPPY PATH**:
1.  **Screen**: TPO Dashboard (`/tpo/dashboard`)
2.  **UI Elements**: "Create New Drive" button, Drive List table, Analytics summary.
3.  **User Action**: Clicks "Create New Drive."
4.  **System Response**: Opens multi-step modal.
5.  **User Action**: Uploads Job Description (JD) and sets eligibility (e.g., CGPA > 7.5).
6.  **Validation**: Backend parses JD; checks if at least 1 student matches criteria.
7.  **User Action**: Clicks "Assign & Launch."
8.  **Next State**: System sends Kafka events for notifications; Drive appears in "Active" status.
9.  **Success Criteria**: Success toast appears; Drive ID is generated in PostgreSQL.

**ERROR STATES**:
* **Unsupported File**: Display: *"Format not supported. Please upload PDF or Docx."*
* **Eligibility Mismatch**: Display: *"Zero students found with these criteria. Adjust filters?"*

### B. Student: AI Voice Interview
**HAPPY PATH**:
1.  **Screen**: Interview Waiting Room (`/interview/:id/setup`)
2.  **UI Elements**: Mic test visualizer, "Start Interview" button, JD summary card.
3.  **User Action**: Clicks "Start Interview."
4.  **System Response**: Handshake between Frontend and FastAPI via Socket.IO.
5.  **Step-by-Step**:
    * AI greets student with audio (TTS) and text.
    * Student speaks answer; real-time waveform appears.
    * System sends audio chunks to Whisper (STT) → Gemini (LLM).
    * AI asks follow-up based on JD context.
6.  **Success Criteria**: "Session Complete" modal triggers after 15 mins or 10 questions.

---

## 3. NAVIGATION MAP

```text
ROOT (/)
├── Landing Page [Public]
│   └── Login / Signup Page [Public]
├── STUDENT PORTAL [/dashboard] [Auth Required]
│   ├── Active Drives List
│   ├── History & Reports [/results]
│   │   └── Detailed Analysis [/results/:id]
│   └── Live Interview Portal [/interview/:id]
├── TPO PORTAL [/tpo] [Auth Required: Role=TPO]
│   ├── TPO Dashboard [/dashboard/tpo]
│   ├── Drive Management [/tpo/drives]
│   │   └── Create Drive Sheet
│   └── Student Directory [/tpo/students]
│       └── Bulk Import Sheet
└── ADMIN PORTAL [/admin] [Auth Required: Role=ORG_ADMIN]
    ├── Admin Dashboard [/dashboard/admin]
    ├── TPO Management [/admin/tpo]
    └── System Configuration [/admin/system]
```

## 4. SCREEN INVENTORY

| Screen Name | Route | Access | Key UI Elements | Actions | State Variants |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Landing | `/` | Public | Hero, Demo Video, CTA | Go to Login | Loaded |
| Dashboard | `/dashboard` | Student | Task cards, Recent Scores | Start Drive | Empty, Loading |
| Student Dashboard| `/student/dashboard`| Student | Overview, History | Start Drive | Data/No Data |
| Interview | `/interview/:id` | Student | Waveform, Mic Button, End | Speak, Exit | Connecting, Active |
| Reports | `/results/:id` | Both | Skill charts, Transcript | Download PDF | Generating, Ready |
| TPO Dashboard | `/tpo/dashboard`| TPO | Global Stats, Drive Table | Create, Import | Data/No Data |
| Student Directory| `/tpo/students`| TPO | Student Table, Import Button | Bulk Import | Data/No Data |
| Drive Manager | `/tpo/drives` | TPO | Drive Cards, Create Button | Create, Assign | Data/No Data |
| Admin Dashboard | `/admin/dashboard`| Admin | System Stats, Health | Manage TPOs | Data/No Data |
| TPO Management | `/admin/tpo` | Admin | TPO Table, Add Button | Create TPO | Data/No Data |
| System Config | `/admin/system` | Admin | Settings Form, Save Button | Update Org | Loaded |

## 5. DECISION POINTS

### Role-Based Routing
```python
IF user.isLoggedIn == FALSE:
    THEN Redirect to (/auth)
ELSE IF user.role == "TPO":
    THEN Redirect to (/tpo/dashboard)
ELSE:
    THEN Redirect to (/dashboard)
```

### Interview State Logic
```python
IF socket.connection == "OPEN":
    THEN Show "AI is listening..." (Waveform active)
ELSE IF socket.connection == "PROCESSING":
    THEN Show "AI is thinking..." (Loading shimmer)
ELSE:
    THEN Show "Reconnecting..." (Yellow Alert)
```

### Drive Eligibility
```python
IF student.cgpa < drive.minimum_cgpa:
    THEN Button.style = "disabled"
    THEN Tooltip = "You do not meet the CGPA requirement for this drive."
```

## 6. ERROR HANDLING
* **404 Error**: Custom "Lost in Space" page with a "Back to Dashboard" button.
* **500 Error**: Alert: "Our AI engine is currently overloaded. Please try again in 5 minutes."
* **Network Offline**: Persistent top-bar banner: "You are offline. Live features are disabled."
* **Validation Failure**: Inline red text below input fields with specific corrective action.

## 7. RESPONSIVE BEHAVIOR
* **Desktop**: Full side-navigation, detailed data tables, and dual-pane interview screen (Transcript on left, Waveform on right).
* **Mobile**:
    * Bottom-navigation bar for students.
    * "Tap to Speak" large button (FAB) replaces the transcript view for focus.
    * Charts simplified to vertical bars instead of complex radar charts.

## 8. ANIMATIONS & TRANSITIONS
* **Page Transitions**: 200ms ease-in/out fade between dashboard tabs.
* **AI Waveform**: SVG animation that scales frequency based on microphone input volume.
* **Feedback Generation**: A "Magic Wand" or processing animation plays for 5 seconds while the Kafka worker processes the final report.
* **Success Feedback**: Confetti effect on the "Result Summary" screen if the score is > 85%.

