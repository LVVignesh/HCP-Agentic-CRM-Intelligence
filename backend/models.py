from pydantic import BaseModel, Field
from sqlalchemy import Column, Integer, String, Text
from database import Base

# SQLAlchemy Models

class Interaction(Base):
    __tablename__ = "interactions"

    id = Column(Integer, primary_key=True, index=True)
    hcp_name = Column(String, index=True)
    date = Column(String) # For simplicity, string as YYYY-MM-DD
    product_discussed = Column(String)
    outcome = Column(Text)
    sentiment = Column(String, nullable=True)

# Pydantic models for API and Tool inputs

class InteractionLog(BaseModel):
    hcp_name: str = Field(description="Name of the Healthcare Professional")
    date: str = Field(description="Date of interaction (YYYY-MM-DD)")
    product_discussed: str = Field(description="Product discussed during the meeting")
    outcome: str = Field(description="Outcome of the interaction")

class InteractionUpdate(BaseModel):
    interaction_id: int
    updates: dict

class FollowUp(BaseModel):
    hcp_name: str
    date: str
    topic: str

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    thread_id: str = "default"
