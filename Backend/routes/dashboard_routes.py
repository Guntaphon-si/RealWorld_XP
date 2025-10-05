from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from dashboard_service import DashboardService
from typing import Dict, List

router = APIRouter(
    tags=["dashboard"]
)

@router.get("/{user_id}", response_model=Dict)
async def get_dashboard(user_id: int, db: Session = Depends(get_db)):
    """
    Get dashboard data for a specific user
    
    This endpoint returns:
    - User information (id, username, xp, level, streak, etc.)
    - All chosen activities (where is_chose = 1)
    - Activity count
    
    The query flow:
    User -> Activity_plan -> Activity_in_plan (is_chose=1) -> Activity
    """
    try:
        dashboard_data = DashboardService.get_dashboard_data(db, user_id)
        
        if not dashboard_data['user']:
            raise HTTPException(status_code=404, detail="User not found")
        
        return dashboard_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching dashboard data: {str(e)}")


@router.get("/{user_id}/activities", response_model=List[Dict])
async def get_user_activities(user_id: int, db: Session = Depends(get_db)):
    """
    Get all chosen activities for a user
    """
    try:
        activities = DashboardService.get_user_activities(db, user_id)
        return activities
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching activities: {str(e)}")


@router.get("/{user_id}/user-info", response_model=Dict)
async def get_user_info(user_id: int, db: Session = Depends(get_db)):
    """
    Get user information only
    """
    try:
        user = DashboardService.get_user_by_id(db, user_id)
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {
            'id': user.id,
            'username': user.username,
            'stress_level': user.stress_level,
            'xp': user.xp,
            'level': user.level,
            'day_streak': user.day_streak,
            'is_success': user.is_success,
            'first_success': user.first_success,
            'login_time': user.login_time.isoformat() if user.login_time else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching user info: {str(e)}")


@router.put("/{user_id}/activity/{activity_id}/toggle")
async def toggle_activity_choice(
    user_id: int,
    activity_id: int,
    is_chose: int,
    db: Session = Depends(get_db)
):
    """
    Toggle whether an activity is chosen (0 or 1)
    """
    try:
        # Get user's plan
        plan = DashboardService.get_activity_plan(db, user_id)
        if not plan:
            raise HTTPException(status_code=404, detail="Activity plan not found")
        
        # Update activity choice
        success = DashboardService.update_activity_choice(db, plan.id, activity_id, is_chose)
        
        if not success:
            raise HTTPException(status_code=404, detail="Activity not found in plan")
        
        return {"message": "Activity choice updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating activity choice: {str(e)}")


@router.post("/{user_id}/activity/{activity_id}/complete")
async def complete_activity(
    user_id: int,
    activity_id: int,
    db: Session = Depends(get_db)
):
    """
    Mark an activity as completed
    - Increments success count
    - Awards XP to user
    """
    try:
        # Get user's plan
        plan = DashboardService.get_activity_plan(db, user_id)
        if not plan:
            raise HTTPException(status_code=404, detail="Activity plan not found")
        
        # Get activity details
        activity = DashboardService.get_activity_details(db, activity_id)
        if not activity:
            raise HTTPException(status_code=404, detail="Activity not found")
        
        # Increment success count
        success_updated = DashboardService.increment_activity_success(db, plan.id, activity_id)
        if not success_updated:
            raise HTTPException(status_code=404, detail="Could not update activity success")
        
        # Award XP
        xp_updated = DashboardService.update_user_xp(db, user_id, activity.base_xp)
        if not xp_updated:
            raise HTTPException(status_code=404, detail="Could not update user XP")
        
        return {
            "message": "Activity completed successfully",
            "xp_gained": activity.base_xp
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error completing activity: {str(e)}")


@router.get("/plan/{plan_id}/activities")
async def get_activities_in_plan(
    plan_id: int,
    chosen_only: bool = True,
    db: Session = Depends(get_db)
):
    """
    Get all activities in a specific plan
    """
    try:
        activities = DashboardService.get_activities_in_plan(db, plan_id, chosen_only)
        return activities
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching plan activities: {str(e)}")


@router.post("/{user_id}/streak/increment")
async def increment_streak(user_id: int, db: Session = Depends(get_db)):
    """
    Increment user's day streak
    """
    try:
        success = DashboardService.update_user_streak(db, user_id, increment=True)
        if not success:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {"message": "Streak incremented successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating streak: {str(e)}")


@router.post("/{user_id}/streak/reset")
async def reset_streak(user_id: int, db: Session = Depends(get_db)):
    """
    Reset user's day streak to 0
    """
    try:
        success = DashboardService.update_user_streak(db, user_id, increment=False)
        if not success:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {"message": "Streak reset successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error resetting streak: {str(e)}")