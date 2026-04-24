# AI-First CRM HCP Module

This repository contains the solution for the AI-First CRM HCP Module assignment. It features a "Log Interaction Screen" for field representatives in the Life Sciences domain, built with a modern tech stack and an intelligent AI agent.

## Architecture & Tech Stack

### Frontend
*   **Framework:** React.js (via Vite)
*   **State Management:** Redux Toolkit
*   **Styling:** Tailwind CSS (configured with the Google Inter font for a professional Pharma aesthetic)
*   **Components:** 
    *   `FormComponent`: A structured UI for manually logging interaction details.
    *   `ChatComponent`: A conversational interface that communicates with the AI agent.

### Backend
*   **Framework:** Python FastAPI
*   **AI Framework:** LangGraph
*   **LLM Provider:** Groq (`llama-3.3-70b-versatile` selected for its superior context handling and structured extraction capabilities). *Note: The system architecture remains fully compatible with other Groq models like `gemma2-9b-it` by simply changing the environment variable.*
*   **Database:** SQLAlchemy ORM (configured to support PostgreSQL/MySQL via `.env`, defaulting to SQLite for local development)

## Core AI Logic & LangGraph Tools

The backend utilizes a LangGraph state machine to handle natural language inputs from the user. The AI agent acts as a conversational assistant with access to 5 specific tools:

1.  **`log_interaction`**: Extracts entities (HCP Name, Date, Product Discussed, Outcome) from the chat and safely inserts a new record into the SQL database using SQLAlchemy sessions.
2.  **`edit_interaction`**: Allows the user to modify an existing interaction record in the database using natural language.
3.  **`get_hcp_history`**: Queries the database to retrieve the last 3 interactions with a specific HCP to provide context to the representative.
4.  **`schedule_follow_up`**: Simulates creating a calendar entry for a future meeting based on the conversation.
5.  **`analyze_sentiment`**: Evaluates the HCP's response to determine if their sentiment was Positive, Neutral, or Skeptical.

## How the Application Works (Code Flow)

1.  **User Input:** The user types a message in the React `ChatComponent`.
2.  **API Call:** The frontend sends a POST request to the FastAPI `/api/chat` endpoint.
3.  **LangGraph State Machine:** The message is added to the `AgentState` and passed to the Groq LLM.
4.  **Tool Execution:** If the LLM determines a tool is needed (e.g., logging an interaction), the LangGraph routes execution to the `tool_node`. The Python tool function executes the SQL transaction and updates the `extracted_form_data` in the state.
5.  **Redux Synchronization:** FastAPI returns the AI's response and the extracted data to the frontend. The `ChatComponent` dispatches this data to the Redux store, which instantly and automatically populates the `FormComponent` UI.

## Setup Instructions

### 1. Backend Setup
```bash
cd backend
pip install fastapi uvicorn sqlalchemy langgraph langchain-groq python-dotenv pydantic
```
*   Create a `.env` file in the `backend` directory and add your Groq API key:
    ```
    GROQ_API_KEY=your_api_key_here
    DATABASE_URL=sqlite:///./crm.db  # Or your PostgreSQL/MySQL connection string
    ```
*   Run the server:
    ```bash
    python -m uvicorn main:app --reload
    ```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*   Open the provided local URL (e.g., `http://localhost:5173`) in your browser.
