from fastapi import APIRouter, HTTPException, Depends
from app.schemas.lobby import (
    LobbyQuestion,
    LobbyResponse,
    LobbySession,
    ChatRequest,
    ChatResponse,
    LobbyCreate,
    LobbyCreateResponse,
    ParticipantJoin,
    ParticipantJoinResponse,
    LobbyStart,
    LobbyStartResponse,
    LobbyInfo,
    UserReconnect,
    UserReconnectResponse
)
from app.models.lobby import Lobby
from app.models.user import User
from app.services.gemini_service import lobby_master, GeminiAgent
import uuid
import logging
from typing import Dict

logger = logging.getLogger(__name__)

router = APIRouter()

# In-memory storage for lobbies
lobbies: Dict[str, Lobby] = {}  # key: pin, value: Lobby object


@router.post("/lobby/create", response_model=LobbyCreateResponse)
async def create_lobby(lobby_data: LobbyCreate):
    """
    Create a new lobby with a unique PIN.
    
    The host provides their name, the secret concept, and optional context.
    Returns a 7-digit PIN that participants can use to join.
    """
    try:
        # Generate unique PIN
        pin = Lobby.generate_pin()
        while pin in lobbies:
            pin = Lobby.generate_pin()
        
        # Create host user
        host = User(name=lobby_data.host_name)
        
        # Create lobby instance with unique PIN, host, and concept
        lobby = Lobby(
            pin=pin,
            host=host,
            secret_concept=lobby_data.secret_concept,
            context=lobby_data.context
        )
        
        lobbies[lobby.pin] = lobby
        
        logger.info(f"Lobby created with PIN {lobby.pin} by host {host.name}")
        
        return LobbyCreateResponse(
            pin=lobby.pin,
            host_id=host.user_id,
            host_name=host.name
        )
    except Exception as e:
        logger.error(f"Error creating lobby: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/lobby/join", response_model=ParticipantJoinResponse)
async def join_lobby(join_data: ParticipantJoin):
    """
    Join an existing lobby using a PIN.
    
    Participants provide the 7-digit PIN and their name to join the lobby.
    """
    try:
        lobby = lobbies.get(join_data.pin)
        
        if not lobby:
            raise HTTPException(status_code=404, detail="Lobby not found with that PIN")
        
        if lobby.lobby_started:
            raise HTTPException(status_code=400, detail="Lobby has already started")
        
        # Create participant user
        participant = User(name=join_data.participant_name)
        
        # Add participant using Lobby method
        try:
            lobby.add_participant(participant)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        
        logger.info(f"Participant {participant.name} joined lobby {join_data.pin}")
        
        return ParticipantJoinResponse(
            pin=lobby.pin,
            user_id=participant.user_id,
            participant_name=participant.name,
            host_name=lobby.host.name,
            participants=lobby.get_participant_names()
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error joining lobby: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/lobby/start", response_model=LobbyStartResponse)
async def start_lobby(lobby_start: LobbyStart):
    """
    Start the lobby.
    
    The host uses this endpoint to start the lobby after participants have joined.
    This creates a session with the Lobby Master AI.
    """
    try:
        lobby = lobbies.get(lobby_start.pin)
        
        if not lobby:
            raise HTTPException(status_code=404, detail="Lobby not found with that PIN")
        
        # Verify host_id
        if lobby.host.user_id != lobby_start.host_id:
            raise HTTPException(status_code=403, detail="Only the host can start the lobby")
        
        # Create a session with the Lobby Master
        session_id = str(uuid.uuid4())
        session = lobby_master.create_session(session_id, lobby.secret_concept)
        
        # Start lobby using Lobby method
        try:
            lobby.start(session_id)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        
        logger.info(f"Lobby started {lobby_start.pin} with session {session_id}")
        
        return LobbyStartResponse(
            pin=lobby.pin,
            session_id=session_id,
            lobby_started=True,
            participants=lobby.get_participant_names()
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error starting lobby: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/lobby/{pin}", response_model=LobbyInfo)
async def get_lobby_info(pin: str):
    """Get information about a lobby using its PIN."""
    try:
        lobby = lobbies.get(pin)
        
        if not lobby:
            raise HTTPException(status_code=404, detail="Lobby not found")
        
        return LobbyInfo(
            pin=lobby.pin,
            host_name=lobby.host.name,
            participants=lobby.get_participant_names(),
            secret_concept=lobby.secret_concept,
            context=lobby.context,
            lobby_started=lobby.lobby_started,
            lobby_active=lobby.lobby_active
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting lobby info: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/lobby/reconnect", response_model=UserReconnectResponse)
async def reconnect_user(reconnect_data: UserReconnect):
    """
    Reconnect a user (host or participant) to a lobby after page refresh.
    
    Users provide their PIN and user_id to restore their session.
    """
    try:
        lobby = lobbies.get(reconnect_data.pin)
        
        if not lobby:
            raise HTTPException(status_code=404, detail="Lobby not found with that PIN")
        
        # Check if user is the host
        if lobby.host.user_id == reconnect_data.user_id:
            return UserReconnectResponse(
                pin=lobby.pin,
                user_id=lobby.host.user_id,
                user_name=lobby.host.name,
                is_host=True,
                lobby_started=lobby.lobby_started,
                participants=lobby.get_participant_names()
            )
        
        # Check if user is a participant
        participant = lobby.get_participant(reconnect_data.user_id)
        if participant:
            return UserReconnectResponse(
                pin=lobby.pin,
                user_id=participant.user_id,
                user_name=participant.name,
                is_host=False,
                lobby_started=lobby.lobby_started,
                participants=lobby.get_participant_names()
            )
        
        raise HTTPException(status_code=404, detail="User not found in this lobby")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error reconnecting user: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/session/{session_id}/question", response_model=LobbyResponse)
async def ask_question(session_id: str, question: LobbyQuestion):
    """
    Ask a question in an active lobby session.

    The Lobby Master will respond with one of the allowed responses:
    - Yes
    - No
    - I don't know
    - Off-topic
    - Invalid question
    - CORRECT (if you guessed the word)
    """
    try:
        result = await lobby_master.process_question(session_id, question.question)

        return LobbyResponse(
            response=result["response"],
            questions_remaining=result["questions_remaining"]
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error processing question: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/session/{session_id}", response_model=LobbySession)
async def get_session_info(session_id: str):
    """Get the current state of a lobby session."""
    try:
        session = lobby_master.get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")

        return LobbySession(
            session_id=session_id,
            questions_asked=session["questions_asked"],
            lobby_active=session["lobby_active"],
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
    General chat endpoint for Gemini API (not lobby-specific).

    Use this for regular conversations with Gemini.
    """
    try:
        agent = GeminiAgent(system_prompt=chat_request.system_prompt)
        response = await agent.simple_chat(chat_request.message)

        return ChatResponse(
            response=response,
            model_used="gemini-2.5-flash"
        )
    except Exception as e:
        logger.error(f"Error in chat: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "gemini-api"}

