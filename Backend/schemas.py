from pydantic import BaseModel
from typing import Optional

class UserCreate(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str

    class Config:
        from_attributes = True # orm_mode = True for Pydantic v1

class Token(BaseModel):
    access_token: str
    token_type: str