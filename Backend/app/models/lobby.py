from datetime import datetime
from typing import Optional, Dict
import uuid
import random
import string
from .user import User


class Lobby:
    """Internal lobby model for managing lobby state."""
    
    @staticmethod
    def generate_pin() -> str:
        """Generate a 7-digit PIN for a lobby."""
        return ''.join(random.choices(string.digits, k=7))
    
    def __init__(self, pin: str, host: User, timelimit: int, secret_concept: str, topic: str, context: Optional[str] = None):
        self.pin = pin
        self.host = host
        self.secret_concept = secret_concept
        self.context = context
        self.topic = topic
        self.timelimit = timelimit
        self.participants: Dict[str, User] = {}  # key: user_id, value: User object
        self.start_time = datetime()
    
    def add_participant(self, participant: User) -> None:
        """Add a participant to the lobby."""
        # Check if name already exists
        if any(p.name == participant.name for p in self.participants.values()):
            raise ValueError("Participant name already exists in this lobby")
        if participant.name == self.host.name:
            raise ValueError("Cannot use the same name as the host")
        
        self.participants[participant.user_id] = participant
    
    def get_participant_names(self) -> list[str]:
        """Get list of all participant names."""
        return [p.name for p in self.participants.values()]
    
    def get_participant(self, user_id: str) -> Optional[User]:
        """Get a participant by user_id."""
        return self.participants.get(user_id)
    
    def start(self) -> None:
        """Start the lobby."""
        if self.start_time:
            raise ValueError("Lobby has already started")
        if len(self.participants) == 0:
            raise ValueError("Cannot start lobby without participants")
        self.start_time = True
        self.lobby_active = True
