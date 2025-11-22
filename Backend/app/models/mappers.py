"""Mappers to convert between database entities and business logic models."""
from typing import Dict
from app.models import User, Lobby, Question
from app.models.entities import UserEntity, LobbyEntity, QuestionEntity


class QuestionMapper:
    """Maps between QuestionEntity and Question."""
    
    @staticmethod
    def to_model(entity: QuestionEntity) -> Question:
        """Convert QuestionEntity to Question model."""
        return Question(
            message=entity.message,
            user_id=str(entity.user_id),
            answer=entity.answer,
            question_id=str(entity.id)
        )
    
    @staticmethod
    def to_entity(model: Question, user_id: str) -> QuestionEntity:
        """Convert Question model to QuestionEntity."""
        return QuestionEntity(
            id=model.question_id,
            message=model.message,
            answer=model.answer,
            user_id=user_id
        )


class UserMapper:
    """Maps between UserEntity and User."""
    
    @staticmethod
    def to_model(entity: UserEntity) -> User:
        """Convert UserEntity to User model with questions."""
        user = User(name=entity.name, user_id=str(entity.id))
        
        # Map all questions
        for question_entity in entity.questions:
            question = QuestionMapper.to_model(question_entity)
            user.add_question(question)
        
        return user
    
    @staticmethod
    def to_entity(model: User, lobby_id: str = None) -> UserEntity:
        """Convert User model to UserEntity (without questions)."""
        return UserEntity(
            id=model.user_id,
            name=model.name,
            lobby_id=lobby_id
        )


class LobbyMapper:
    """Maps between LobbyEntity and Lobby."""
    
    @staticmethod
    def to_model(entity: LobbyEntity) -> Lobby:
        """Convert LobbyEntity to Lobby model with users."""
        # Convert host
        host = UserMapper.to_model(entity.host)
        
        # Create lobby
        lobby = Lobby(
            pin=entity.pin,
            host=host,
            timelimit=entity.timelimit,
            secret_concept=entity.secret_concept,
            topic=entity.topic,
            context=entity.context
        )
        lobby.start_time = entity.start_time
        
        # Add all participants (users)
        for user_entity in entity.users:
            user = UserMapper.to_model(user_entity)
            lobby.participants[user.user_id] = user
        
        return lobby
    
    @staticmethod
    def to_entity(model: Lobby) -> LobbyEntity:
        """Convert Lobby model to LobbyEntity (without users)."""
        return LobbyEntity(
            pin=model.pin,
            context=model.context,
            topic=model.topic,
            secret_concept=model.secret_concept,
            start_time=model.start_time,
            timelimit=model.timelimit,
            host_id=model.host.user_id
        )
