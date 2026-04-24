from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from graph import graph
from langchain_core.messages import HumanMessage
from dotenv import load_dotenv
from database import engine, Base
import models

load_dotenv()

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="HCP CRM Agent API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    thread_id: str

@app.post("/api/chat")
async def chat_endpoint(req: ChatRequest):
    """
    Endpoint to receive chat messages and return the LangGraph agent's response.
    It passes the user's message to the agent state and processes the graph.
    """
    config = {"configurable": {"thread_id": req.thread_id}}
    
    # Initialize state with the new message
    inputs = {
        "messages": [HumanMessage(content=req.message)]
    }
    
    # Run the graph
    result_state = graph.invoke(inputs, config=config)
    
    # Extract the latest AI message
    last_message = result_state["messages"][-1]
    
    # Extract form data updated by tools to keep Redux in sync
    extracted_data = result_state.get("extracted_form_data", {})
    
    return {
        "response": last_message.content,
        "extracted_data": extracted_data
    }
