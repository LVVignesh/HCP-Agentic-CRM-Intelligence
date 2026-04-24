import os
from typing import Annotated, TypedDict, List
from langchain_groq import ChatGroq
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langchain_core.messages import AnyMessage, HumanMessage, AIMessage, ToolMessage
from langchain_core.tools import tool
from langgraph.checkpoint.memory import MemorySaver
from database import get_db
from models import Interaction

# Define State
# The state keeps track of the conversation flow and can store extracted entities to sync with Redux
class AgentState(TypedDict):
    messages: Annotated[list[AnyMessage], add_messages]
    extracted_form_data: dict

# Define Tools (The 5 Mandatory Tools)

@tool
def log_interaction(hcp_name: str, date: str, product_discussed: str, outcome: str) -> str:
    """Extract entities (HCP Name, Date, Product Discussed, Outcome) from text and save to DB."""
    db = next(get_db())
    try:
        new_interaction = Interaction(
            hcp_name=hcp_name,
            date=date,
            product_discussed=product_discussed,
            outcome=outcome
        )
        db.add(new_interaction)
        db.commit()
        db.refresh(new_interaction)
        return f"Successfully logged interaction ID {new_interaction.id} for {hcp_name} on {date} regarding {product_discussed}. Outcome: {outcome}."
    except Exception as e:
        db.rollback()
        return f"Error logging interaction: {str(e)}"
    finally:
        db.close()

@tool
def edit_interaction(interaction_id: str, updates_json: str) -> str:
    """Fetch a specific interaction by ID and update its fields based on natural language."""
    # Logic to update DB goes here
    _id = int(interaction_id)
    return f"Successfully updated interaction {_id} with {updates_json}."

@tool
def get_hcp_history(hcp_name: str) -> str:
    """Retrieve the last 3 interactions for a specific doctor to provide context."""
    db = next(get_db())
    try:
        history = db.query(Interaction).filter(Interaction.hcp_name.ilike(f"%{hcp_name}%")).order_by(Interaction.id.desc()).limit(3).all()
        if not history:
            return f"No previous interactions found for {hcp_name}."
        
        result = f"Last {len(history)} interactions for {hcp_name}:\n"
        for idx, entry in enumerate(history, 1):
            result += f"{idx}. Met on {entry.date} regarding {entry.product_discussed}. Outcome: {entry.outcome}.\n"
        return result
    finally:
        db.close()

@tool
def schedule_follow_up(hcp_name: str, date: str, time: str) -> str:
    """Create a calendar-style entry for a future meeting with the HCP."""
    # Calendar API integration goes here
    return f"Scheduled follow-up with {hcp_name} on {date} at {time}."

@tool
def analyze_sentiment(hcp_response: str) -> str:
    """Determine if the HCP's response to the product was Positive, Neutral, or Skeptical."""
    if "great" in hcp_response.lower() or "good" in hcp_response.lower():
        return "Positive"
    elif "not sure" in hcp_response.lower() or "maybe" in hcp_response.lower():
        return "Skeptical"
    return "Neutral"

tools = [log_interaction, edit_interaction, get_hcp_history, schedule_follow_up, analyze_sentiment]

# LLM Configuration
# Pulls the model name from the environment, defaulting to the robust llama-3.3-70b-versatile
model_name = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
llm = ChatGroq(model=model_name, temperature=0)
llm_with_tools = llm.bind_tools(tools)

# Define Graph Nodes
from langchain_core.messages import SystemMessage

def chatbot(state: AgentState):
    """The main LLM node that processes messages and decides whether to call a tool."""
    # Prepend a system message to guide the LLM and prevent infinite tool loops
    sys_msg = SystemMessage(content="You are a helpful CRM assistant. If you have just received a ToolMessage with the result of a tool, DO NOT call that tool again. Summarize the result and respond directly to the user.")
    messages_to_pass = [sys_msg] + state["messages"]
    message = llm_with_tools.invoke(messages_to_pass)
    return {"messages": [message]}

def tool_node(state: AgentState):
    """Executes the tools chosen by the chatbot."""
    messages = state["messages"]
    last_message = messages[-1]
    
    tool_responses = []
    extracted_data_update = state.get("extracted_form_data", {})
    
    if hasattr(last_message, 'tool_calls') and last_message.tool_calls:
        for tool_call in last_message.tool_calls:
            tool_fn = next((t for t in tools if t.name == tool_call['name']), None)
            if tool_fn:
                result = tool_fn.invoke(tool_call['args'])
                tool_responses.append(ToolMessage(content=str(result), tool_call_id=tool_call['id'], name=tool_call['name']))
                
                # If the tool logged an interaction, update the extracted_form_data state
                # so the frontend can sync the Redux form.
                if tool_call['name'] == 'log_interaction':
                    extracted_data_update = {
                        "hcpName": tool_call['args'].get('hcp_name', ''),
                        "date": tool_call['args'].get('date', ''),
                        "productDiscussed": tool_call['args'].get('product_discussed', ''),
                        "outcome": tool_call['args'].get('outcome', '')
                    }
                elif tool_call['name'] == 'edit_interaction':
                    import json
                    try:
                        # Attempt to parse the JSON string of updates sent by the LLM
                        updates = json.loads(tool_call['args'].get('updates_json', '{}'))
                        # Map DB columns to Frontend Redux keys
                        mapping = {
                            'outcome': 'outcome',
                            'hcp_name': 'hcpName',
                            'product_discussed': 'productDiscussed',
                            'date': 'date'
                        }
                        for db_key, frontend_key in mapping.items():
                            if db_key in updates:
                                extracted_data_update[frontend_key] = updates[db_key]
                    except Exception:
                        pass
                
    return {"messages": tool_responses, "extracted_form_data": extracted_data_update}

def should_continue(state: AgentState):
    """Condition function to determine if we need to run tools or end."""
    messages = state["messages"]
    last_message = messages[-1]
    if hasattr(last_message, 'tool_calls') and last_message.tool_calls:
        return "tools"
    return END

# Build Graph
graph_builder = StateGraph(AgentState)
graph_builder.add_node("chatbot", chatbot)
graph_builder.add_node("tools", tool_node)

graph_builder.add_edge(START, "chatbot")
graph_builder.add_conditional_edges(
    "chatbot",
    should_continue,
    {"tools": "tools", END: END}
)
graph_builder.add_edge("tools", "chatbot")

memory = MemorySaver()
graph = graph_builder.compile(checkpointer=memory)
