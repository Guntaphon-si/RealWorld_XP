from sqlalchemy.orm import Session
from model import Activity, ActivityPlan, ActivityInPlan
from typing import List, Dict, Any

class AllActivitiesService:
    """Service class for handling all activities business logic"""
    
    @staticmethod
    def get_all_activities_for_user(user_id: int, db: Session) -> List[Dict[str, Any]]:
        """
        Get all activities with indication of which ones the user has selected
        
        Args:
            user_id: The ID of the user
            db: Database session
            
        Returns:
            List of activities with selection status
        """
        # Get user's activity plan
        user_plan = db.query(ActivityPlan).filter(
            ActivityPlan.user_id == user_id
        ).first()
        
        # Get all activities
        all_activities = db.query(Activity).all()
        
        # If user doesn't have a plan yet, return all activities as unselected
        if not user_plan:
            result = []
            for activity in all_activities:
                result.append({
                    'activity_id': activity.id,
                    'activity_name': activity.name,
                    'base_time': activity.base_time,
                    'base_xp': activity.base_xp,
                    'activity_type': activity.activity_type.value if activity.activity_type else None,
                    'description': activity.description,
                    'is_chosen': False,
                    'in_plan_id': None
                })
            return result
        
        # Get activities in user's plan
        activities_in_plan = db.query(ActivityInPlan).filter(
            ActivityInPlan.plan_id == user_plan.id
        ).all()
        
        # Create a map of activity_id to ActivityInPlan for quick lookup
        plan_map = {aip.activity_id: aip for aip in activities_in_plan}
        
        # Build result with is_chosen flag
        result = []
        for activity in all_activities:
            in_plan = plan_map.get(activity.id)
            result.append({
                'activity_id': activity.id,
                'activity_name': activity.name,
                'base_time': activity.base_time,
                'base_xp': activity.base_xp,
                'activity_type': activity.activity_type.value if activity.activity_type else None,
                'description': activity.description,
                'is_chosen': in_plan.is_chose if in_plan else False,
                'in_plan_id': in_plan.id if in_plan else None
            })
        
        return result
    
    @staticmethod
    def update_user_activity_selection(
        user_id: int, 
        activity_ids: List[int], 
        db: Session
    ) -> Dict[str, Any]:
        """
        Update user's activity selection
        
        Args:
            user_id: The ID of the user
            activity_ids: List of selected activity IDs
            db: Database session
            
        Returns:
            Dictionary with success message and count
        """
        # Get or create user's activity plan
        user_plan = db.query(ActivityPlan).filter(
            ActivityPlan.user_id == user_id
        ).first()
        
        if not user_plan:
            # Create new plan for user
            user_plan = ActivityPlan(user_id=user_id)
            db.add(user_plan)
            db.commit()
            db.refresh(user_plan)
        
        # Get all activities in plan
        existing_activities = db.query(ActivityInPlan).filter(
            ActivityInPlan.plan_id == user_plan.id
        ).all()
        
        # Create a map of existing activities
        existing_map = {aip.activity_id: aip for aip in existing_activities}
        
        # Update or create activities
        for activity_id in activity_ids:
            if activity_id in existing_map:
                # Update existing entry
                existing_map[activity_id].is_chose = True
            else:
                # Create new entry
                new_activity = ActivityInPlan(
                    plan_id=user_plan.id,
                    activity_id=activity_id,
                    is_chose=True,
                    success_count=0
                )
                db.add(new_activity)
        
        # Set is_chose to False for activities not in selection
        for activity_id, aip in existing_map.items():
            if activity_id not in activity_ids:
                aip.is_chose = False
        
        db.commit()
        
        return {
            "message": "Activity selection updated successfully",
            "selected_count": len(activity_ids)
        }