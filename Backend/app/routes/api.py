from fastapi import APIRouter, HTTPException, Depends
from app.schemas.game import (
    GameQuestion,
    GameResponse,
    GameStart,
    GameSession,
    ChatRequest,
    ChatResponse
)
from app.services.gemini_service import game_master, GeminiAgent
import uuid
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/game/start", response_model=GameSession)
async def start_game(game_data: GameStart):
    """
    Start a new 20 Questions game session.

    The Game Master will know the secret word and respond to questions.
    """
    try:
        session_id = str(uuid.uuid4())
        session = game_master.create_session(session_id, game_data.secret_word)

        return GameSession(
            session_id=session_id,
            questions_asked=session["questions_asked"],
            game_active=session["game_active"],
            history=session["history"]
        )
    except Exception as e:
        logger.error(f"Error starting game: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/game/{session_id}/question", response_model=GameResponse)
async def ask_question(session_id: str, question: GameQuestion):
    """
    Ask a question in an active game session.

    The Game Master will respond with one of the allowed responses:
    - Yes
    - No
    - I don't know
    - Off-topic
    - Invalid question
    - CORRECT (if you guessed the word)
    """
    try:
        result = await game_master.process_question(session_id, question.question)

        return GameResponse(
            response=result["response"],
            questions_remaining=result["questions_remaining"]
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error processing question: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/game/{session_id}", response_model=GameSession)
async def get_game_session(session_id: str):
    """Get the current state of a game session."""
    try:
        session = game_master.get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")

        return GameSession(
            session_id=session_id,
            questions_asked=session["questions_asked"],
            game_active=session["game_active"],
            history=session["history"]
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting session: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat", response_model=ChatResponse)
async def chat_with_gemini(chat_request: ChatRequest):
    """
    General chat endpoint for Gemini API (not game-specific).

    Use this for regular conversations with Gemini.
    """
    try:
        agent = GeminiAgent(system_prompt=chat_request.system_prompt)
        response = await agent.simple_chat(chat_request.message)

        return ChatResponse(
            response=response,
            model_used="gemini-pro"
        )
    except Exception as e:
        logger.error(f"Error in chat: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "gemini-api"}

