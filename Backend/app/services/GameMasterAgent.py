from app.services import GeminiAgent
from typing import Dict, Optional

class GameMasterAgent:
    """Specialized agent for the Questions game with state management."""

    def __init__(self):
        self.sessions: Dict[str, dict] = {}
        self.agent = GeminiAgent()

    def create_session(self, session_id: str, secret_word: str) -> dict:
        """Create a new game session."""
        self.sessions[session_id] = {
            "secret_word": secret_word,
            "questions_asked": 0,
            "max_questions": 30,
            "game_active": True,
            "history": []
        }
        return self.sessions[session_id]

    def get_session(self, session_id: str) -> Optional[dict]:
        """Get an existing game session."""
        return self.sessions.get(session_id)

    async def process_question(self, session_id: str, question: str) -> dict:
        """
        Process a question in the game.

        Returns:
            Dict with response, questions_remaining, and game_active status
        """
        session = self.get_session(session_id)
        if not session:
            raise ValueError("Invalid session ID")

        if not session["game_active"]:
            return {
                "response": "Game already ended",
                "questions_remaining": 0,
                "game_active": False
            }

        # Increment question count
        session["questions_asked"] += 1

        # Get response from agent
        response = await self.agent.chat(question, session["secret_word"])

        # Add to history
        session["history"].append({
            "question": question,
            "response": response,
            "question_number": session["questions_asked"]
        })

        # Check game ending conditions
        questions_remaining = session["max_questions"] - session["questions_asked"]

        if response == "CORRECT":
            session["game_active"] = False
            questions_remaining = 0
        elif questions_remaining <= 0:
            session["game_active"] = False

        return {
            "response": response,
            "questions_remaining": questions_remaining,
            "game_active": session["game_active"]
        }
