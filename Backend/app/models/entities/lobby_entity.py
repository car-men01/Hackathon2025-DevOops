from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from ..base import Base


class LobbyEntity(Base):
    """Database entity for lobbies."""
    
    __tablename__ = "lobbies"
    
    pin = Column(String, primary_key=True)
    context = Column(String, nullable=True)
    topic = Column(String, nullable=False)
    secret_concept = Column(String, nullable=False)
    start_time = Column(DateTime, nullable=True)
    timelimit = Column(Integer, nullable=False)
    host_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Relationships
    host = relationship("UserEntity", foreign_keys=[host_id])
    users = relationship("UserEntity", back_populates="lobby", foreign_keys="[UserEntity.lobby_id]")
    
    def __repr__(self):
        return f"<LobbyEntity(pin={self.pin}, topic={self.topic}, host_id={self.host_id})>"
