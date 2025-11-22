from app.services.GeminiAgent import GeminiAgent
from app.models.lobby import Lobby
from app.models.question import Question
from typing import Dict, Optional

class GameMasterAgent:
    """Specialized agent for the Questions game with state management."""

    def __init__(self):
        self.lobbies: Dict[str, Lobby] = {}
        self.agent = GeminiAgent()

    def create_lobby(self, lobby: Lobby) -> Lobby:
        """Create a new lobby and add it to the lobbies dict."""
        self.lobbies[lobby.pin] = lobby
        return lobby

    def get_lobby(self, pin: str) -> Optional[Lobby]:
        """Get an existing lobby by PIN."""
        return self.lobbies.get(pin)

    def get_user(self, pin: str, user_id: str) -> Optional[dict]:
        """
        Get a user with all their questions from a lobby.

        Args:
            pin: Lobby PIN
            user_id: User ID

        Returns:
            Dict with user info and all their questions, or None if not found
        """
        lobby = self.get_lobby(pin)
        if not lobby:
            return None

        # Check if user is a participant
        user = lobby.get_participant(user_id)
        
        # If not a participant, check if they're the host
        if not user and lobby.host.user_id == user_id:
            user = lobby.host
        
        if not user:
            return None

        return {
            "user_id": user.user_id,
            "name": user.name,
            "questions": [
                {
                    "question_id": q.question_id,
                    "message": q.message,
                    "answer": q.answer
                }
                for q in user.get_all_questions()
            ]
        }

    async def process_question(self, pin: str, user_id: str, question_text: str) -> dict:
        """
        Process a question in the game for a specific user in a lobby.

        Args:
            pin: Lobby PIN
            user_id: User ID of the person asking the question
            question_text: The question text

        Returns:
            Dict with response and question details
        """
        lobby = self.get_lobby(pin)
        if not lobby:
            raise ValueError("Invalid lobby PIN")

        # Get the user (participant or host)
        user = lobby.get_participant(user_id)
        if not user and lobby.host.user_id == user_id:
            user = lobby.host
        
        if not user:
            raise ValueError("User not found in lobby")

        # Create a new question object
        question = Question(
            message=question_text,
            user_id=user_id
        )

        # Get response from agent using the lobby's secret concept
        response = await self.agent.chat(question_text, lobby.secret_concept)

        # Set the answer
        question.set_answer(response)

        # Add question to user's question list
        user.add_question(question)

        return {
            "question_id": question.question_id,
            "response": response,
            "message": question_text
        }

    def get_leaderboard(self, pin: str) -> Optional[list[dict]]:
        """
        Get the leaderboard for a lobby.
        
        Sorting logic:
        1. Users who guessed CORRECT (sorted by total questions ascending)
        2. Other users (sorted by number of "Yes" answers descending)
        
        Returns top 10 users maximum.

        Args:
            pin: Lobby PIN

        Returns:
            List of user dictionaries with name and question count, or None if lobby not found
        """
        lobby = self.get_lobby(pin)
        if not lobby:
            return None

        # Collect all users (host + participants)
        all_users = [lobby.host] + list(lobby.participants.values())

        winners = []
        others = []

        for user in all_users:
            questions = user.get_all_questions()
            has_correct = any(q.answer == "CORRECT" for q in questions)
            total_questions = len(questions)
            
            entry = {
                "user_id": user.user_id,
                "name": user.name,
                "question_count": total_questions,
                "guessed_correct": has_correct
            }
            
            if has_correct:
                winners.append(entry)
            else:
                yes_count = sum(1 for q in questions if q.answer == "Yes")
                # Store tuple for sorting: (yes_count, entry)
                others.append((yes_count, entry))

        # Sort winners by total questions ascending
        winners.sort(key=lambda x: x["question_count"])
        
        # Sort others by yes_count descending
        others.sort(key=lambda x: x[0], reverse=True)
        
        # Extract entries from others
        sorted_others = [x[1] for x in others]
        
        # Combine and take top 10
        leaderboard = (winners + sorted_others)[:10]
        
        return leaderboard


# Global instance - import this in your routes
game_master = GameMasterAgent()

