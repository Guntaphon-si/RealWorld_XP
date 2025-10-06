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

    if not user.is_success and user.first_success.date() != user.login_time:
        user.first_success = now      
        user.day_streak += 1        
        user.is_success = 1 
    
    user.xp += activity.base_xp
    if user.xp >= 100: 
        # เก็บ level เดิมไว้ก่อนเพื่อเปรียบเทียบ
        original_level = user.level 
        
        # คำนวณ level ที่เพิ่มขึ้นทั้งหมด
        levels_gained = user.xp // 100
        user.level += levels_gained
        user.xp %= 100 # เอาแค่เศษ xp ที่เหลือ

        # --- ✅ เพิ่ม Logic การลด Stress Level ---
        # คำนวณว่าข้ามผ่าน "หลัก 100" ไปกี่ครั้ง
        milestone_crossings = (user.level // 100) - (original_level // 100)
        
        if milestone_crossings > 0:
            # ลด stress_level ตามจำนวนครั้งที่ข้ามหลัก 100
            for _ in range(milestone_crossings):
                if user.stress_level > 1:
                    user.stress_level -= 1
                else:
                    # ถ้าเหลือ 1 แล้วก็ไม่ต้องลดอีก
                    break
        
    db.commit()
    db.refresh(user)

    return {
        "id": user.id,
        "level": user.level,
        "current_xp": user.xp,
        "xp_for_next_level": 100,
        "day_streak": user.day_streak,
        "is_success": user.is_success
    }