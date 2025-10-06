from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime
from zoneinfo import ZoneInfo

from database import get_db
import model
import schemas
import security

router = APIRouter()

@router.post("/signup", response_model=schemas.UserOut)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    db_user = db.query(model.User).filter(model.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    # passlib handles encoding, so we pass the raw string
    hashed_password = security.get_password_hash(user.password)
    
    # Create new user
    new_user = model.User(username=user.username, password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

@router.post("/token", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Find user
    user = db.query(model.User).filter(model.User.username == form_data.username).first()
    
    # Check user and password
    if not user or not security.verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # --- เพิ่ม Logic การตรวจสอบ Day Streak ---
    current_login_time = datetime.now(ZoneInfo("Asia/Bangkok"))

    # ตรวจสอบว่าเคยมีการทำกิจกรรมสำเร็จมาก่อนหรือไม่
    if user.first_success:
        # คำนวณความต่างของวัน (ไม่สนใจเวลา)
        days_difference = (current_login_time.date() - user.first_success.date()).days

        if days_difference == 1:
            # ถ้าห่างกัน 1 วันพอดี (เมื่อวานทำ วันนี้ล็อกอิน) ให้รีเซ็ตสถานะความสำเร็จของวัน
            user.is_success = 0
        elif days_difference >= 2:
            # ถ้าห่างกัน 2 วันขึ้นไป (ขาดการทำกิจกรรม) ให้รีเซ็ต Streak และสถานะ
            user.is_success = 0
            user.day_streak = 0

    # อัปเดตเวลาล็อกอินล่าสุดเป็นเวลาประเทศไทย
    user.login_time = current_login_time

    # Create access token
    access_token = security.create_access_token(data={"sub": user.username})

    db.commit()

    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.UserOut)
def read_users_me(current_user: model.User = Depends(security.get_current_user)):
    """
    Get current logged in user.
    """
    return current_user
