from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.schema import HumanMessage, SystemMessage
from app.core.config import settings
from app.GeminiUtils import PromptsEngineering
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

        self.system_prompt = PromptsEngineering.default_system_prompt()

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






