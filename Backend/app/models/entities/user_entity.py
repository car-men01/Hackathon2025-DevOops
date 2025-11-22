from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from ..base import Base


class UserEntity(Base):
    """Database entity for users."""
    
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, unique=True, nullable=False)
    lobby_id = Column(String, ForeignKey("lobbies.pin"), nullable=True)
    
    # Relationships
    lobby = relationship("LobbyEntity", back_populates="users", foreign_keys=[lobby_id])
    questions = relationship("QuestionEntity", back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<UserEntity(id={self.id}, name={self.name}, lobby_id={self.lobby_id})>"
