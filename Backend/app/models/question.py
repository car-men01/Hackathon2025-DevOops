from typing import Optional
import uuid
from datetime import datetime


class Question:
    """Question model for storing user questions."""
    
    def __init__(self, message: str, user_id: str, answer: Optional[str] = None, question_id: Optional[str] = None, timestamp: Optional[datetime] = None):
        self.question_id = question_id or str(uuid.uuid4())
        self.message = message
        self.answer = answer
        self.timestamp = timestamp or datetime.now()
    
    def set_answer(self, answer: str) -> None:
        """Set the answer for this question."""
        self.answer = answer
