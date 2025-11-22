from typing import Optional
import uuid


class User:
    """Base user class for lobby participants."""
    
    def __init__(self, name: str, user_id: Optional[str] = None):
        self.user_id = user_id or str(uuid.uuid4())
        self.name = name
