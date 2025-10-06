from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Dict, Optional
from model import User, ActivityPlan, ActivityInPlan, Activity

class DashboardService:
    """Service class for dashboard data operations using SQLAlchemy"""
    
    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
        """
        Get user information by user ID
        
        Args:
            db: Database session
            user_id: User ID
            
        Returns:
            User object or None
        """
        return db.query(User).filter(User.id == user_id).first()
    
    @staticmethod
    def get_user_activities(db: Session, user_id: int) -> List[Dict]:
        """
        Get all chosen activities for a user
        
        This method performs a JOIN across:
        User -> Activity_plan -> Activity_in_plan -> Activity
        
        Args:
            db: Database session
            user_id: User ID
            
        Returns:
            List of dictionaries containing activity information
        """
        results = db.query(
            Activity.id.label('activity_id'),
            Activity.name.label('activity_name'),
            Activity.base_time,
            Activity.base_xp,
            Activity.activity_type,
            Activity.description,
            ActivityInPlan.success_count,
            ActivityInPlan.is_chose,
            ActivityPlan.id.label('plan_id'),
            ActivityPlan.user_id
        ).select_from(User).join(  # ADD .select_from(User) here
            ActivityPlan, User.id == ActivityPlan.user_id
        ).join(
            ActivityInPlan, ActivityPlan.id == ActivityInPlan.plan_id
        ).join(
            Activity, ActivityInPlan.activity_id == Activity.id
        ).filter(
            and_(
                User.id == user_id,
                ActivityInPlan.is_chose == True  # Changed from == 1
            )
        ).order_by(Activity.id).all()
        
        # Convert to list of dictionaries
        activities = []
        for row in results:
            activities.append({
                'activity_id': row.activity_id,
                'activity_name': row.activity_name,
                'base_time': row.base_time,
                'base_xp': row.base_xp,
                'activity_type': row.activity_type.value if row.activity_type else None,  # Handle Enum
                'description': row.description,
                'success_count': row.success_count,
                'is_chose': row.is_chose,
                'plan_id': row.plan_id,
                'user_id': row.user_id
            })
        
        return activities
    
    @staticmethod
    def get_activity_plan(db: Session, user_id: int) -> Optional[ActivityPlan]:
        """
        Get activity plan for a user
        
        Args:
            db: Database session
            user_id: User ID
            
        Returns:
            ActivityPlan object or None
        """
        return db.query(ActivityPlan).filter(
            ActivityPlan.user_id == user_id
        ).first()
    
    @staticmethod
    def get_activities_in_plan(db: Session, plan_id: int, chosen_only: bool = True) -> List[Dict]:
        """
        Get activities in a specific plan
        
        Args:
            db: Database session
            plan_id: Activity plan ID
            chosen_only: If True, only return activities where is_chose = 1
            
        Returns:
            List of dictionaries containing activity plan details
        """
        query = db.query(
            ActivityInPlan.id,
            ActivityInPlan.plan_id,
            ActivityInPlan.activity_id,
            ActivityInPlan.success_count,
            ActivityInPlan.is_chose,
            Activity.name.label('activity_name'),
            Activity.base_time,
            Activity.base_xp,
            Activity.activity_type,
            Activity.description
        ).join(
            Activity, ActivityInPlan.activity_id == Activity.id
        ).filter(
            ActivityInPlan.plan_id == plan_id
        )
        
        if chosen_only:
            query = query.filter(ActivityInPlan.is_chose == 1)
        
        results = query.all()
        
        # Convert to list of dictionaries
        activities = []
        for row in results:
            activities.append({
                'id': row.id,
                'plan_id': row.plan_id,
                'activity_id': row.activity_id,
                'success_count': row.success_count,
                'is_chose': row.is_chose,
                'activity_name': row.activity_name,
                'base_time': row.base_time,
                'base_xp': row.base_xp,
                'activity_type': row.activity_type,
                'description': row.description
            })
        
        return activities
    
    @staticmethod
    def get_activity_details(db: Session, activity_id: int) -> Optional[Activity]:
        """
        Get detailed information about a specific activity
        
        Args:
            db: Database session
            activity_id: Activity ID
            
        Returns:
            Activity object or None
        """
        return db.query(Activity).filter(Activity.id == activity_id).first()
    
    @staticmethod
    def get_dashboard_data(db: Session, user_id: int) -> Dict:
        """
        Get all dashboard data for a user in one call
        
        Args:
            db: Database session
            user_id: User ID
            
        Returns:
            Dictionary containing user info and chosen activities
        """
        user = DashboardService.get_user_by_id(db, user_id)
        activities = DashboardService.get_user_activities(db, user_id)
        
        user_dict = None
        if user:
            user_dict = {
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
        
        return {
            'user': user_dict,
            'activities': activities,
            'activity_count': len(activities)
        }
    
    @staticmethod
    def update_activity_choice(db: Session, plan_id: int, activity_id: int, is_chose: int) -> bool:
        """
        Update whether an activity is chosen in a plan
        
        Args:
            db: Database session
            plan_id: Activity plan ID
            activity_id: Activity ID
            is_chose: 1 if chosen, 0 if not
            
        Returns:
            True if successful, False otherwise
        """
        try:
            activity_in_plan = db.query(ActivityInPlan).filter(
                and_(
                    ActivityInPlan.plan_id == plan_id,
                    ActivityInPlan.activity_id == activity_id
                )
            ).first()
            
            if activity_in_plan:
                activity_in_plan.is_chose = is_chose
                db.commit()
                return True
            return False
        except Exception as e:
            db.rollback()
            print(f"Error updating activity choice: {e}")
            return False
    
    @staticmethod
    def update_user_xp(db: Session, user_id: int, xp_gained: int) -> bool:
        """
        Update user XP and potentially level
        
        Args:
            db: Database session
            user_id: User ID
            xp_gained: Amount of XP to add
            
        Returns:
            True if successful, False otherwise
        """
        try:
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                return False
            
            new_xp = user.xp + xp_gained
            new_level = user.level
            
            # Simple level calculation (100 XP per level)
            if new_xp >= 100:
                new_level = new_xp // 100
                new_xp = new_xp % 100
            
            user.xp = new_xp
            user.level = new_level
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            print(f"Error updating user XP: {e}")
            return False
    
    @staticmethod
    def increment_activity_success(db: Session, plan_id: int, activity_id: int) -> bool:
        """
        Increment success count for an activity in a plan
        
        Args:
            db: Database session
            plan_id: Activity plan ID
            activity_id: Activity ID
            
        Returns:
            True if successful, False otherwise
        """
        try:
            activity_in_plan = db.query(ActivityInPlan).filter(
                and_(
                    ActivityInPlan.plan_id == plan_id,
                    ActivityInPlan.activity_id == activity_id
                )
            ).first()
            
            if activity_in_plan:
                activity_in_plan.success_count += 1
                db.commit()
                return True
            return False
        except Exception as e:
            db.rollback()
            print(f"Error incrementing success count: {e}")
            return False
    
    @staticmethod
    def update_user_streak(db: Session, user_id: int, increment: bool = True) -> bool:
        """
        Update user's day streak
        
        Args:
            db: Database session
            user_id: User ID
            increment: True to increment, False to reset
            
        Returns:
            True if successful, False otherwise
        """
        try:
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                return False
            
            if increment:
                user.day_streak += 1
            else:
                user.day_streak = 0
            
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            print(f"Error updating user streak: {e}")
            return False