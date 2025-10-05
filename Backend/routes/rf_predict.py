from fastapi import APIRouter
from pydantic import BaseModel
from rf_model import predict_rf

router = APIRouter()

class RFInput(BaseModel):
    screen_time_hours: float
    social_media_platforms_used: int
    hours_on_TikTok: float
    sleep_hours: float
    mood_score: int

@router.post("/predict_rf")
def predict_rf_route(data: RFInput):
    features = [
        data.screen_time_hours,
        data.social_media_platforms_used,
        data.hours_on_TikTok,
        data.sleep_hours,
        data.mood_score
    ]
    result = predict_rf(features)
    return {"stress_level_class": result}
