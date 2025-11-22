from pydantic import BaseModel, Field
from typing import Literal, Optional, List


class LobbyCreate(BaseModel):
    """Schema for creating a new lobby."""
    host_name: str = Field(..., description="Name of the host creating the lobby")
    secret_concept: str = Field(..., description="The secret word/concept to guess")
    context: Optional[str] = Field(None, description="Optional additional context for the concept")
    topic: str = Field(..., description="Topic/description shown to participants")
    time_limit: int = Field(..., description="Time limit in seconds")


class LobbyCreateResponse(BaseModel):
    """Schema for lobby creation response."""
    pin: str = Field(..., description="7-digit PIN to join the lobby")
    host_id: str = Field(..., description="Unique host identifier for reconnection")
    host_name: str


class ParticipantJoin(BaseModel):
    """Schema for a participant joining a lobby."""
    pin: str = Field(..., description="7-digit PIN of the lobby to join")
    participant_name: str = Field(..., description="Name of the participant")


class ParticipantJoinResponse(BaseModel):
    """Schema for participant join response."""
    pin: str
    user_id: str = Field(..., description="Unique user identifier for reconnection")
    participant_name: str
    host_name: str
    participants: List[str] = Field(..., description="List of all participants in the lobby")


class LobbyInfo(BaseModel):
    """Schema for lobby information."""
    pin: str
    host_name: str
    participants: List[str]
    secret_concept: Optional[str] = Field(None, description="Only visible to host")
    context: Optional[str] = Field(None, description="Only visible to host")
    start_time: Optional[str] = Field(None, description="ISO datetime when lobby started")
    timelimit: int = Field(..., description="Time limit in seconds")
    topic: str = Field(..., description="Topic/description visible to all participants")


class LobbyQuestion(BaseModel):
    """Schema for a question."""
    question: str = Field(..., description="The yes/no question to ask the Lobby Master")


class LobbyResponse(BaseModel):
    """Schema for the Lobby Master's response."""
    response: Literal["Yes", "No", "I don't know", "Off-topic", "Invalid question", "CORRECT"] = Field(
        ...,
        description="The Lobby Master's strict response"
    )
    questions_remaining: Optional[int] = Field(None, description="Number of questions remaining")


class UserReconnect(BaseModel):
    """Schema for user reconnection."""
    pin: str = Field(..., description="7-digit PIN of the lobby")
    user_id: str = Field(..., description="User's unique identifier")


class UserReconnectResponse(BaseModel):
    """Schema for user reconnect response."""
    pin: str
    user_id: str
    user_name: str
    is_host: bool
    start_time: Optional[str] = Field(None, description="ISO datetime when lobby started")
    participants: List[str]


class LobbyStart(BaseModel):
    """Schema for starting the lobby."""
    pin: str = Field(..., description="7-digit PIN of the lobby")
    host_id: str = Field(..., description="Host's unique identifier for authentication")
    secret_concept: Optional[str] = Field(None, description="Optional update to the secret word/concept")
    context: Optional[str] = Field(None, description="Optional update to additional context")
    topic: Optional[str] = Field(None, description="Optional update to topic/description")
    time_limit: Optional[int] = Field(None, description="Optional update to time limit in seconds")


class LobbyStartResponse(BaseModel):
    """Schema for lobby start response."""
    pin: str
    start_time: str = Field(..., description="ISO datetime when lobby started")
    participants: List[str]


class LobbySession(BaseModel):
    """Schema for lobby session information."""
    session_id: str
    questions_asked: int
    history: list[dict] = []


class ChatRequest(BaseModel):
    """General chat request for Gemini API."""
    message: str = Field(..., description="User message to send to Gemini")
    system_prompt: Optional[str] = Field(None, description="Optional system prompt override")


class ChatResponse(BaseModel):
    """General chat response from Gemini."""
    response: str
    model_used: str

