from pydantic import BaseModel, Field
from typing import Literal, Optional


class GameQuestion(BaseModel):
    """Schema for a question."""
    question: str = Field(..., description="The yes/no question to ask the Game Master")


class GameResponse(BaseModel):
    """Schema for the Game Master's response."""
    response: Literal["Yes", "No", "I don't know", "Off-topic", "Invalid question", "CORRECT"] = Field(
        ...,
        description="The Game Master's strict response"
    )
    questions_remaining: Optional[int] = Field(None, description="Number of questions remaining")


class GameStart(BaseModel):
    """Schema for starting a new game."""
    secret_word: str = Field(..., description="The secret word to guess (set by Game Master)")


class GameSession(BaseModel):
    """Schema for game session information."""
    session_id: str
    questions_asked: int
    game_active: bool
    history: list[dict] = []


class ChatRequest(BaseModel):
    """General chat request for Gemini API."""
    message: str = Field(..., description="User message to send to Gemini")
    system_prompt: Optional[str] = Field(None, description="Optional system prompt override")


class ChatResponse(BaseModel):
    """General chat response from Gemini."""
    response: str
    model_used: str

