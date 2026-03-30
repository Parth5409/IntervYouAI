---
name: langchain-agent-setup
description: Configuration and extension patterns for the Gemini-powered LangChain agents.
version: 1.0.0
---

# LangChain Agent Setup

## LLM Initialization
We use Google's Gemini models via `langchain-google-genai`.

**Class:** `GeminiLLM` in `llm/gemini.py`
**Model:** `gemini-2.5-flash` (or environment configured)

### Initialization Pattern
```python
self.llm = ChatGoogleGenerativeAI(
    model=model_name,
    google_api_key=self.api_key,
    temperature=0.7,
    max_tokens=4096,
    callbacks=[GeminiCallbackHandler()],
    convert_system_message_to_human=True
)
```

## Adding "Tools" / Capabilities
The current architecture uses a **Prompt Engineering** pattern rather than explicit LangChain `Tool` objects (bind_tools). New capabilities are added as methods to `GeminiLLM` with dedicated System Prompts.

### Step 1: Define System Prompt
Add a condition in `_get_system_message` inside `llm/gemini.py`:

```python
def _get_system_message(self, session_type, stage, context):
    if session_type == "NEW_CAPABILITY":
        return "You are a specialized AI for [Task]..."
```

### Step 2: Create Capability Method
Add a new async method to `GeminiLLM`:

```python
async def generate_new_capability_response(self, context: Dict, user_input: str) -> str:
    system_msg = self._get_system_message("NEW_CAPABILITY", "active", context)
    messages = [
        SystemMessage(content=system_msg),
        HumanMessage(content=user_input)
    ]
    response = await self.llm.ainvoke(messages)
    return response.content.strip()
```

### Step 3: Integrate into Orchestrator
Call this method from `InterviewOrchestrator` in `orchestrator/interview.py`.

## Frontend-Backend Communication
The system uses a **Hybrid** approach:
1.  **Stateful Session:** Managed via Socket.IO (`socket_app/`).
2.  **Response Format:** Full JSON objects (Text + Audio), **NOT** streaming.

**Flow:**
1.  User speaks -> STT -> Text sent to Backend.
2.  Backend `InterviewOrchestrator` processes text.
3.  `GeminiLLM` generates **complete** text response (awaited).
4.  `TTS Service` generates audio.
5.  Backend returns `(text, audio_bytes)` to Socket handler.
6.  Frontend receives event with full payload.

**Constraint:** Do not implement token-by-token streaming unless the entire `InterviewOrchestrator` flow is refactored to support async generators.
