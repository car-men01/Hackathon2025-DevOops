from fastapi import APIRouter, HTTPException, Depends
from app.schemas.lobby import (
    LobbyQuestion,
    LobbyResponse,
    ChatRequest,
    ChatResponse,
    LobbyCreate,
    LobbyCreateResponse,
    ParticipantJoin,
    ParticipantJoinResponse,
    ParticipantLeave,
    ParticipantLeaveResponse,
    LobbyStart,
    LobbyStartResponse,
    LobbyDelete,
    LobbyInfo,
    UserReconnect,
    UserReconnectResponse,
    LobbyDeleteResponse
)
from app.services.GeminiAgent import GeminiAgent
from app.services.GameMasterAgent import game_master
from app.models.lobby import Lobby
from app.models.user import User
import uuid
import logging
from typing import Dict
from datetime import datetime

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/lobby/create", response_model=LobbyCreateResponse)
async def create_lobby(lobby_data: LobbyCreate):
    """
    Create a new lobby with a unique PIN.
    
    The host provides their name, the secret concept, and optional context.
    Returns a 7-digit PIN that participants can use to join.
    """
    print("Received request to create lobby")
    try:
        logger.info(f"[CREATE_LOBBY] Request received: host_name={lobby_data.host_name}, secret_concept={lobby_data.secret_concept}, context={lobby_data.context}, topic={lobby_data.topic}, time_limit={lobby_data.time_limit}")
        
        # Generate unique PIN
        pin = Lobby.generate_pin()
        while pin in game_master.lobbies:
            pin = Lobby.generate_pin()
        
        logger.info(f"[CREATE_LOBBY] Generated PIN: {pin}")
        
        # Create host user
        host = User(name=lobby_data.host_name)
        logger.info(f"[CREATE_LOBBY] Created host user: user_id={host.user_id}, name={host.name}")
        
        # Create lobby instance with unique PIN, host, and concept
        lobby = Lobby(
            pin=pin,
            host=host,
            secret_concept=lobby_data.secret_concept,
            context=lobby_data.context,
            topic=lobby_data.topic,
            timelimit=lobby_data.time_limit
        )
        print("Creating lobby with PIN:", lobby.pin)
        game_master.create_lobby(lobby)
        print("Lobby created with PIN:", lobby.pin)
        logger.info(f"Lobby created with PIN {lobby.pin} by host {host.name}")
        
        response = LobbyCreateResponse(
            pin=lobby.pin,
            host_id=host.user_id,
            host_name=host.name
        )
        logger.info(f"[CREATE_LOBBY] Returning response: {response}")
        
        return response
    except Exception as e:
        logger.error(f"[CREATE_LOBBY] Error creating lobby: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/lobby/join", response_model=ParticipantJoinResponse)
async def join_lobby(join_data: ParticipantJoin):
    """
    Join an existing lobby using a PIN.
    
    Participants provide the 7-digit PIN and their name to join the lobby.
    """
    try:
        lobby = game_master.get_lobby(join_data.pin)
        
        if not lobby:
            raise HTTPException(status_code=404, detail="Lobby not found with that PIN")
        
        if lobby.start_time is not None:
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


@router.post("/lobby/leave", response_model=ParticipantLeaveResponse)
async def leave_lobby(leave_data: ParticipantLeave):
    """
    Leave a lobby.
    
    Participants provide the 7-digit PIN and their user_id to leave the lobby.
    """
    try:
        lobby = game_master.get_lobby(leave_data.pin)
        
        if not lobby:
            raise HTTPException(status_code=404, detail="Lobby not found with that PIN")
        
        # Remove participant using Lobby method
        lobby.remove_participant(leave_data.user_id)
        
        logger.info(f"Participant {leave_data.user_id} left lobby {leave_data.pin}")
        
        return ParticipantLeaveResponse(
            pin=lobby.pin,
            message="Successfully left the lobby"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error leaving lobby: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/lobby/start", response_model=LobbyStartResponse)
async def start_lobby(lobby_start: LobbyStart):
    """
    Start the lobby.
    
    The host uses this endpoint to start the lobby after participants have joined.
    This creates a lobby with the Lobby Master AI.
    Optionally updates concept, context, topic, and time_limit if provided.
    """
    try:
        logger.info(f"[START_LOBBY] Request received: pin={lobby_start.pin}, host_id={lobby_start.host_id}")
        logger.info(f"[START_LOBBY] Available lobbies: {list(game_master.lobbies.keys())}")
        
        lobby = game_master.get_lobby(lobby_start.pin)
        
        if not lobby:
            logger.error(f"[START_LOBBY] Lobby not found: {lobby_start.pin}")
            raise HTTPException(status_code=404, detail="Lobby not found with that PIN")
        
        logger.info(f"[START_LOBBY] Lobby found: pin={lobby.pin}, host_user_id={lobby.host.user_id}")
        
        # Verify host_id
        if lobby.host.user_id != lobby_start.host_id:
            logger.error(f"[START_LOBBY] Host ID mismatch: expected={lobby.host.user_id}, received={lobby_start.host_id}")
            raise HTTPException(status_code=403, detail="Only the host can start the lobby")
        
        # Update lobby fields if provided
        if lobby_start.secret_concept is not None:
            lobby.secret_concept = lobby_start.secret_concept
            logger.info(f"[START_LOBBY] Updated secret_concept: {lobby_start.secret_concept}")
        
        if lobby_start.context is not None:
            lobby.context = lobby_start.context
            logger.info(f"[START_LOBBY] Updated context: {lobby_start.context}")
        
        if lobby_start.topic is not None:
            lobby.topic = lobby_start.topic
            logger.info(f"[START_LOBBY] Updated topic: {lobby_start.topic}")
        
        if lobby_start.time_limit is not None:
            lobby.timelimit = lobby_start.time_limit
            logger.info(f"[START_LOBBY] Updated time_limit: {lobby_start.time_limit}")
        
        # Parse start_time if provided
        start_dt = None
        if lobby_start.start_time:
            try:
                # Handle ISO format with Z or offset
                start_dt = datetime.fromisoformat(lobby_start.start_time.replace('Z', '+00:00'))
                logger.info(f"[START_LOBBY] Using provided start_time: {start_dt}")
            except ValueError:
                logger.warning(f"[START_LOBBY] Invalid start_time format: {lobby_start.start_time}, using current time")

        # Start lobby using Lobby method
        try:
            lobby.start(start_time=start_dt)
            logger.info(f"[START_LOBBY] Lobby started successfully: {lobby_start.pin}")
        except ValueError as e:
            logger.error(f"[START_LOBBY] Error starting lobby: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))
        
        logger.info(f"[START_LOBBY] Lobby started {lobby_start.pin}")
        
        response = LobbyStartResponse(
            pin=lobby.pin,
            start_time=lobby.start_time.isoformat(),
            participants=lobby.get_participant_names()
        )
        logger.info(f"[START_LOBBY] Returning response: {response}")
        return response
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error starting lobby: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/lobby/delete", response_model=LobbyDeleteResponse)
async def delete_lobby(delete_data: LobbyDelete):
    """
    Delete a lobby and all its data (users and questions).
    Only the host can delete the lobby.
    """
    try:
        lobby = game_master.get_lobby(delete_data.pin)
        
        if not lobby:
            raise HTTPException(status_code=404, detail="Lobby not found with that PIN")
        
        # Verify host_id
        if lobby.host.user_id != delete_data.host_id:
            logger.error(f"[DELETE_LOBBY] Host ID mismatch: expected={lobby.host.user_id}, received={delete_data.host_id}")
            raise HTTPException(status_code=403, detail="Only the host can delete the lobby")
        
        # Delete the lobby from game_master
        del game_master.lobbies[delete_data.pin]
        
        logger.info(f"Lobby deleted {delete_data.pin}")
        
        return LobbyDeleteResponse(
            pin=delete_data.pin,
            message="Lobby and all associated data deleted successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting lobby: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/lobby/{pin}", response_model=LobbyInfo)
async def get_lobby_info(pin: str, user_id: str):
    """Get information about a lobby using its PIN. Secret concept and context only visible to host."""
    try:
        logger.info(f"[GET_LOBBY_INFO] Request received: pin={pin}, user_id={user_id}")
        logger.info(f"[GET_LOBBY_INFO] Available lobbies: {list(game_master.lobbies.keys())}")
        
        lobby = game_master.get_lobby(pin)
        
        if not lobby:
            logger.error(f"[GET_LOBBY_INFO] Lobby not found: {pin}")
            raise HTTPException(status_code=404, detail="Lobby not found")
        
        logger.info(f"[GET_LOBBY_INFO] Lobby found: pin={lobby.pin}, host={lobby.host.name}, participants={lobby.get_participant_names()}")
        
        # Check if the requesting user is the host
        is_host = lobby.host.user_id == user_id
        logger.info(f"[GET_LOBBY_INFO] User is host: {is_host}")
        
        logger.info(f"[GET_LOBBY_INFO] Lobby topic: {lobby.topic}")
        
        response = LobbyInfo(
            pin=lobby.pin,
            host_name=lobby.host.name,
            participants=lobby.get_participant_names(),
            topic=lobby.topic,
            timelimit=lobby.timelimit,
            start_time=lobby.start_time.isoformat() if lobby.start_time else None,
            secret_concept=lobby.secret_concept if is_host else None,
            context=lobby.context if is_host else None,
            lobby_active=lobby.start_time is not None
        )
        logger.info(f"[GET_LOBBY_INFO] Returning response with topic: {response.topic}")
        logger.info(f"[GET_LOBBY_INFO] Full response: {response}")
        return response
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting lobby info: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/lobby/reconnect", response_model=UserReconnectResponse)
async def reconnect_user(reconnect_data: UserReconnect):
    """
    Reconnect a user (host or participant) to a lobby after page refresh.
    
    Users provide their PIN and user_id.
    """
    try:
        lobby = game_master.get_lobby(reconnect_data.pin)
        
        if not lobby:
            raise HTTPException(status_code=404, detail="Lobby not found with that PIN")
        
        # Check if user is the host
        if lobby.host.user_id == reconnect_data.user_id:
            return UserReconnectResponse(
                pin=lobby.pin,
                user_id=lobby.host.user_id,
                user_name=lobby.host.name,
                is_host=True,
                start_time=lobby.start_time.isoformat() if lobby.start_time else None,
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
                start_time=lobby.start_time.isoformat() if lobby.start_time else None,
                participants=lobby.get_participant_names()
            )
        
        raise HTTPException(status_code=404, detail="User not found in this lobby")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error reconnecting user: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/lobby/{pin}/question", response_model=LobbyResponse)
async def ask_question(pin: str, question: LobbyQuestion):
    """
    Ask a question in an active lobby.

    The Lobby Master will respond with one of the allowed responses:
    - Yes
    - No
    - I don't know
    - Off-topic
    - Invalid question
    - CORRECT (if you guessed the word)
    """
    try:
        result = await game_master.process_question(pin, question.user_id, question.question)

        return LobbyResponse(
            question_id=result["question_id"],
            response=result["response"],
            message=result["message"]
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error processing question: {str(e)}")
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


@router.post("/qr/generate")
async def generate_qr_code(link: str):
    """
    Generate a QR code from a link and return as base64 data URL.

    Args:
        link: The URL/link to encode in the QR code

    Returns:
        JSON with data_url (ready for HTML img src)
    """
    try:
        from app.services.QRService import QRService

        logger.info(f"Generating QR code for link: {link}")

        # Generate QR code as data URL (ready for frontend)
        data_url = QRService.generate_qr_code_data_url(link)

        return {
            "success": True,
            "link": link,
            "qr_code_data_url": data_url,
            "message": "QR code generated successfully"
        }

    except Exception as e:
        logger.error(f"Error generating QR code: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/qr/generate-base64")
async def generate_qr_code_base64(link: str):
    """
    Generate a QR code from a link and return as base64 string.

    Args:
        link: The URL/link to encode in the QR code

    Returns:
        JSON with base64 encoded image
    """
    try:
        from app.services.QRService import QRService

        logger.info(f"Generating QR code (base64) for link: {link}")

        # Generate QR code as base64
        base64_image = QRService.generate_qr_code_base64(link)

        return {
            "success": True,
            "link": link,
            "qr_code_base64": base64_image,
            "message": "QR code generated successfully"
        }

    except Exception as e:
        logger.error(f"Error generating QR code: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

