from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from all_activities_service import AllActivitiesService
from pydantic import BaseModel
from typing import List

router = APIRouter(
    tags=["activities"]
)

class ActivitySelectionUpdate(BaseModel):
    activity_ids: List[int]

@router.get("/user/{user_id}/all")
async def get_all_activities_for_user(user_id: int, db: Session = Depends(get_db)):
    """
    Get all activities with indication of which ones the user has selected
    
    Returns:
    - All activities from Activity table
    - is_chosen flag indicating if user has selected it
    - in_plan_id if activity is in user's plan
    """
    try:
        result = AllActivitiesService.get_all_activities_for_user(user_id, db)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching activities: {str(e)}")


@router.put("/user/{user_id}/selection")
async def update_user_activity_selection(
    user_id: int, 
    data: ActivitySelectionUpdate, 
    db: Session = Depends(get_db)
):
    """
    Update user's activity selection
    
    This will:
    1. Create ActivityPlan if doesn't exist
    2. Create ActivityInPlan entries for selected activities
    3. Update is_chose to True for selected activities
    4. Update is_chose to False for unselected activities
    """
    try:
        result = AllActivitiesService.update_user_activity_selection(
            user_id, 
            data.activity_ids, 
            db
        )
        return result
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating selection: {str(e)}")