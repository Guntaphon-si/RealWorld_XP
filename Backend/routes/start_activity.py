from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
import model

class ActivityCompletionRequest(BaseModel):
    activity_id: int

router = APIRouter()

@router.get("/user/{user_id}")
def get_user_data(user_id: int, db: Session = Depends(get_db)):

    user = db.query(model.User).filter(model.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "id": user.id,
        "level": user.level,
        "current_xp": user.xp,
        "xp_for_next_level": 100,
        "day_streak": user.day_streak,  
        "is_success": user.is_success,
        "first_success": user.first_success
    }

@router.get("/activity/{activity_id}")
def get_activity_data(activity_id: int, db: Session = Depends(get_db)):
    activity = db.query(model.Activity).filter(model.Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    
    return {
        "id": activity.id,
        "name": activity.name,
        "base_time": activity.base_time,
        "base_xp": activity.base_xp,
        "description": activity.description
    }

@router.post("/user/{user_id}/complete")
def complete_activity(user_id: int, request: ActivityCompletionRequest, db: Session = Depends(get_db)):
    """
    บันทึกการทำกิจกรรม, ตรวจสอบ Day Streak จาก Datetime, และอัปเดต XP
    """
    user = db.query(model.User).filter(model.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    activity = db.query(model.Activity).filter(model.Activity.id == request.activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")

    now = datetime.now()
    
    is_successful_for_streak = False

    if not user.first_success or user.first_success.date() != now.date():
        user.first_success = now      
        user.day_streak += 1        
        is_successful_for_streak = True 
    
    user.xp += activity.base_xp
    if user.xp >= 100: 
        user.level += 1
        user.xp -= 100
        
    db.commit()
    db.refresh(user)

    return {
        "id": user.id,
        "level": user.level,
        "current_xp": user.xp,
        "xp_for_next_level": 100,
        "day_streak": user.day_streak,
        "is_success": is_successful_for_streak 
    }