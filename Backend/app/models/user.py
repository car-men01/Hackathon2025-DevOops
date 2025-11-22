from typing import Optional, Dict
import uuid
from .question import Question


class User:
    """Base user class for lobby participants."""
    
    def __init__(self, name: str, user_id: Optional[str] = None):
        self.user_id = user_id or str(uuid.uuid4())
        self.name = name
        self.questions: Dict[str, Question] = {}  # key: question_id, value: Question object
    
    def add_question(self, question: Question) -> None:
        """Add a question to the user's question list."""
        self.questions[question.question_id] = question
    
    def get_question(self, question_id: str) -> Optional[Question]:
        """Get a question by question_id."""
        return self.questions.get(question_id)
    
    def get_all_questions(self) -> list[Question]:
        """Get all questions as a list."""
        return list(self.questions.values())
