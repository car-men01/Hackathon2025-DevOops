from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.agents import AgentExecutor, create_structured_chat_agent
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.memory import ConversationBufferMemory
from langchain.tools import Tool
from langchain.schema import HumanMessage, SystemMessage
from app.core.config import settings
from typing import Dict, Optional
import logging

logger = logging.getLogger(__name__)


class GeminiAgent:
    """LangChain agent powered by Google Gemini."""

    def __init__(self, system_prompt: Optional[str] = None):
        """Initialize the Gemini agent with LangChain."""
        self.llm = ChatGoogleGenerativeAI(
            model=settings.GEMINI_MODEL,
            google_api_key=settings.GOOGLE_API_KEY,
            temperature=0.1,  # Low temperature for consistent responses
            convert_system_message_to_human=True
        )

        self.system_prompt = system_prompt or self._default_system_prompt()
        self.memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True
        )

    def _default_system_prompt(self) -> str:
        """Default system prompt for the 20 Questions game."""
        return """You are the strict Game Master of a "20 Questions" style word guessing game.

        Instructions:
        I will ask you questions. You must analyze my question and output ONLY one of the exact strings from the "Allowed Responses" list below. Do not add punctuation, explanations, pleasantries, or conversational filler. If I guess the word exactly (e.g., "Is the word X?"), you must output the "Win Condition" response.
        
        Allowed Responses:
        - "Yes" (Use if the answer is mostly true regarding the secret word)
        - "No" (Use if the answer is mostly false regarding the secret word)
        - "I don't know" (Use only if the answer cannot be objectively determined)
        - "Off-topic" (Use if the question is completely unrelated to identifying the word, e.g., asking about the weather or politics)
        - "Invalid question" (Use if the input is not a Yes/No question, is a statement, or is gibberish)
        - "CORRECT" (Use ONLY if the user explicitly guesses the secret word)
        
        Negative Constraints:
        - If I ask "Is it a fruit?", the answer is "No", not "Off-topic"
        - If I ask about spelling or letter count (e.g., "Does it have 5 letters?"), answer "Yes" or "No"
        
        You must ONLY respond with one of the allowed responses. Nothing else."""

    async def chat(self, user_message: str, secret_word: Optional[str] = None) -> str:
        """
        Send a message to the Gemini agent and get a response.

        Args:
            user_message: The user's question
            secret_word: The secret word for the game (optional)

        Returns:
            The agent's response (one of the allowed responses)
        """
        try:
            # Build the full prompt with secret word context
            system_context = self.system_prompt
            if secret_word:
                system_context += f"\n\nThe secret word is: {secret_word}"

            messages = [
                SystemMessage(content=system_context),
                HumanMessage(content=user_message)
            ]

            response = await self.llm.ainvoke(messages)

            # Extract and clean the response
            response_text = response.content.strip()

            # Validate response is one of the allowed responses
            allowed_responses = ["Yes", "No", "I don't know", "Off-topic", "Invalid question", "CORRECT"]

            # Clean up response (remove any extra punctuation or text)
            for allowed in allowed_responses:
                if allowed.lower() in response_text.lower():
                    return allowed

            # If no exact match, return the raw response (fallback)
            logger.warning(f"Agent returned non-standard response: {response_text}")
            return response_text

        except Exception as e:
            logger.error(f"Error in Gemini agent chat: {str(e)}")
            raise

    async def simple_chat(self, user_message: str, system_prompt: Optional[str] = None) -> str:
        """
        Simple chat without game rules - for general Gemini API usage.

        Args:
            user_message: The user's message
            system_prompt: Optional system prompt override

        Returns:
            The model's response
        """
        try:
            messages = [
                SystemMessage(content=system_prompt or "You are a helpful AI assistant."),
                HumanMessage(content=user_message)
            ]

            response = await self.llm.ainvoke(messages)
            return response.content.strip()

        except Exception as e:
            logger.error(f"Error in simple chat: {str(e)}")
            raise


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
            "max_questions": 20,
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


# Global instance
game_master = GameMasterAgent()

