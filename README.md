# IntervYou.AI

**IntervYou.AI** is a full-stack, Generative AI-powered web platform designed to simulate real-world interview environments. It provides a seamless, real-time, voice-to-voice experience for users to practice for various interview formats, including Technical, HR, Salary Negotiation, and Group Discussions.

## ✨ Features

- **Real-Time Voice Interviews**: Engage in natural, voice-to-voice conversations with an AI interviewer.
- **Multiple Interview Modes**: Practice for Technical, HR, Salary Negotiation, and Group Discussion (GD) rounds.
- **Retrieval-Augmented Generation (RAG)**: Get personalized questions based on your uploaded resume and company-specific data.
- **Multi-Agent GD Simulator**: Participate in a group discussion with multiple AI bots, each with a unique personality.
- **Advanced Speech Technology**: Utilizes high-performance, self-hosted models for both Speech-to-Text (`Faster-Whisper`) and Text-to-Speech (`Kokoro-82M`).
- **Comprehensive Feedback**: Receive detailed, AI-generated feedback with scores, strengths, improvement areas, and actionable recommendations.
- **User Dashboard**: Track your progress, review interview history, and manage your profile.

---

## 🛠️ Tech Stack

| Layer             | Technologies                                                                                             |
| ----------------- | -------------------------------------------------------------------------------------------------------- |
| **Frontend**      | React (Vite), JavaScript, TailwindCSS, Socket.IO Client, Axios, React Router, React Context               |
| **Backend**       | FastAPI (Python), PostgreSQL, SQLAlchemy (Async), Socket.IO, Docker                                      |
| **AI/ML**         |                                                                                                          |
| ↳ *LLM*           | Google Gemini (`gemini-2.5-flash`) via `langchain-google-genai`                                            |
| ↳ *Embeddings*    | Ollama (`all-minilm:l6-v2`)                                                                              |
| ↳ *Vector Store*  | FAISS                                                                                                    |
| ↳ *Speech-to-Text*| Faster-Whisper (`distil-large-v3`)                                                                       |
| ↳ *Text-to-Speech*| Kokoro (`Kokoro-82M`)                                                                                    |
| **File Storage**  | Cloudinary (for user resumes and profile images)                                                         |
| **Authentication**| JWT with HTTP-only cookies                                                                               |

---

## 🚀 Setup and Installation

### Prerequisites

- Docker and Docker Compose
- Python 3.12+
- Node.js v22.16+
- An account with [Cloudinary](https://cloudinary.com/) and [Google AI Studio](https://aistudio.google.com/) for API keys.

### 1. Backend Setup

First, set up the containerized services (Postgres and Ollama).

```bash
# Navigate to the backend directory
cd backend

# Start the database and Ollama services in the background
docker-compose up -d
```

Next, set up the main FastAPI application.

```bash
# Create and activate a Python virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create the .env file from the example
cp .env.example .env
```

**Update `.env`** with your credentials:
- `DATABASE_URL`: Should be pre-configured for Docker (`postgresql+asyncpg://postgres:root@localhost/interview_db`).
- `GOOGLE_API_KEY`: Your Google Gemini API key.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Your Cloudinary credentials.

Finally, run the backend server:

```bash
# Run the FastAPI application
uvicorn main:application --reload --port 8000
```

The backend will be available at `http://localhost:8000`.

### 2. Frontend Setup

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Create the .env file from the example
cp .env.example .env
```

**Update `.env`** with your credentials:
- `VITE_API_URL`: `http://localhost:8000/api`
- `VITE_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_UPLOAD_PRESET`: Your Cloudinary credentials.

Finally, run the frontend development server:

```bash
# Run the React application
npm start
```

The frontend will be available at `http://localhost:4028`.

---

## 📁 Project Structure

The project is organized into two main parts: `backend` and `frontend`.

```
IntervYouAI/
├── backend/                # FastAPI application
│   ├── llm/                # Gemini and Embedding model integrations
│   ├── orchestrator/       # Core logic for interviews and GDs
│   ├── routes/             # API endpoint definitions
│   ├── socket_app/         # Socket.IO event handlers
│   ├── stt/                # Speech-to-Text service
│   ├── tts/                # Text-to-Speech service
│   ├── utils/              # Database, auth, and other utilities
│   ├── main.py             # FastAPI app entry point
│   └── docker-compose.yml  # Docker services for Postgres & Ollama
└── frontend/               # React application
    ├── src/
    │   ├── components/     # Reusable UI components
    │   ├── hooks/          # Custom React hooks (auth, audio)
    │   ├── pages/          # Application pages/screens
    │   ├── utils/          # API client, Cloudinary helper
    │   └── App.jsx         # Main application component
    └── vite.config.mjs     # Vite configuration
```

---

## 🔌 Real-Time Events (Socket.IO)

The application relies on Socket.IO for real-time communication. Key events include:

- **1-on-1 Interviews**:
  - `start_interview`: Initializes a session.
  - `audio_chunk`: Streams user's voice data for transcription.
  - `new_ai_message`: Receives AI response (text and audio).
  - `end_interview`: Finalizes the session and triggers feedback generation.

- **Group Discussions**:
  - `start_discussion`: Initializes a GD session with AI bots.
  - `gd_audio_chunk`: Streams user's voice data.
  - `new_message`: Receives messages from AI bots (text and audio).
  - `speaker_change`: Manages who is currently speaking.
  - `end_discussion`: Ends the GD and generates feedback.
