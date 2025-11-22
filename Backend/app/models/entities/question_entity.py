from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from ..base import Base


class QuestionEntity(Base):
    """Database entity for questions."""
    
    __tablename__ = "questions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    message = Column(String, nullable=False)
    answer = Column(String, nullable=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Relationship back to User
    user = relationship("UserEntity", back_populates="questions")
    
    def __repr__(self):
        return f"<QuestionEntity(id={self.id}, user_id={self.user_id})>"
