from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum, Boolean
from sqlalchemy.orm import relationship
from database import Base
import enum

# ถ้าอยากใช้ ENUM แบบ Python
class ActivityType(str, enum.Enum):
    INDOOR = "INDOOR"
    OUTDOOR = "OUTDOOR"

class User(Base):
    __tablename__ = "User"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), nullable=False, unique=True)
    password = Column(String(255), nullable=False)
    stress_level = Column(Integer, nullable=True)
    xp = Column(Integer, default=0)
    level = Column(Integer, default=1)
    day_streak = Column(Integer, default=0)
    is_success = Column(Boolean, default=False)
    first_success = Column(DateTime, nullable=True)
    login_time = Column(DateTime, nullable=True)

    lifestyles = relationship("UserLifestyle", back_populates="user")
    activity_plans = relationship("ActivityPlan", back_populates="user")


class LifestyleCate(Base):
    __tablename__ = "Lifestyle_cate"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)

    users = relationship("UserLifestyle", back_populates="lifestyle")
    activities = relationship("ActivityStyle", back_populates="lifestyle")


class UserLifestyle(Base):
    __tablename__ = "User_lifestyle"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("User.id", ondelete="CASCADE"))
    lifestyle_id = Column(Integer, ForeignKey("Lifestyle_cate.id", ondelete="CASCADE"))

    user = relationship("User", back_populates="lifestyles")
    lifestyle = relationship("LifestyleCate", back_populates="users")


class Activity(Base):
    __tablename__ = "Activity"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    base_time = Column(Integer, nullable=True)
    base_xp = Column(Integer, nullable=True)
    activity_type = Column(Enum(ActivityType), nullable=True)
    description = Column(String(500), nullable=True)

    styles = relationship("ActivityStyle", back_populates="activity")
    activities_in_plan = relationship("ActivityInPlan", back_populates="activity")


class ActivityPlan(Base):
    __tablename__ = "Activity_plan"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("User.id", ondelete="CASCADE"))

    user = relationship("User", back_populates="activity_plans")
    activities_in_plan = relationship("ActivityInPlan", back_populates="plan")


class ActivityInPlan(Base):
    __tablename__ = "Activity_in_plan"

    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("Activity_plan.id", ondelete="CASCADE"))
    activity_id = Column(Integer, ForeignKey("Activity.id", ondelete="CASCADE"))
    success_count = Column(Integer, default=0)
    is_chose = Column(Boolean, default=False)

    plan = relationship("ActivityPlan", back_populates="activities_in_plan")
    activity = relationship("Activity", back_populates="activities_in_plan")


class ActivityStyle(Base):
    __tablename__ = "Activity_style"

    id = Column(Integer, primary_key=True, index=True)
    activity_id = Column(Integer, ForeignKey("Activity.id", ondelete="CASCADE"))
    lifestyle_id = Column(Integer, ForeignKey("Lifestyle_cate.id", ondelete="CASCADE"))

    activity = relationship("Activity", back_populates="styles")
    lifestyle = relationship("LifestyleCate", back_populates="activities")
