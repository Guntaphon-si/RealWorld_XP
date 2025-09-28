from fastapi import APIRouter
import torch
from ml_model import predict_with_both

router = APIRouter()

@router.post('/predictLifeStyle')
async def predict(features:dict):
    x_num = torch.tensor([features["numeric"]],dtype=torch.float32)
    x_cat = torch.tensor([features["categorical"]],dtype=torch.long)

    probs = predict_with_both(x_num,x_cat)
    return probs