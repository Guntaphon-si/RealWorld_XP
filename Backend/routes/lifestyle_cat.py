from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from model import LifestyleCate
from database import get_db

router = APIRouter()

@router.get("/lifestyle_cate")
def read_lifestyle_cate(db: Session = Depends(get_db)):
    return db.query(LifestyleCate).all()
