from fastapi import APIRouter, Depends, Query,HTTPException, status
from sqlalchemy.orm import Session
from typing import List  # Import List for type hinting
from pydantic import BaseModel
from model import Activity, ActivityStyle,User,ActivityPlan,ActivityInPlan,UserLifestyle
from database import get_db
from typing import List
router = APIRouter()

@router.get("/activityByLifestyleId")
def get_activities_by_lifestyles(
    db: Session = Depends(get_db),
    # 1. รับค่า lifestyleId เป็น List ของ int จาก query string
    lifestyle_ids: List[int] = Query(..., alias="lifestyleId", description="List of lifestyle IDs to filter activities")
):
    """
    Fetches activities by joining with ActivityStyle and filtering by a list of lifestyle IDs.
    """
    # 2. สร้าง query โดย join ตาราง Activity กับ ActivityStyle
    # 3. Filter (where) เอาเฉพาะรายการที่ ActivityStyle.lifestyle_id อยู่ใน list ที่รับมา
    activities = db.query(Activity).join(ActivityStyle).filter(ActivityStyle.lifestyle_id.in_(lifestyle_ids)).all()
    
    return activities
@router.get("/userStressById")
def get_userlifeStyle_ById(db: Session = Depends(get_db),id:int = 0):
    userStress = db.query(User).filter(User.id == id).first()
    return userStress

class ActivityPlanCreate(BaseModel):
    user_id: int

class ActivityPlanResponse(BaseModel):
    id: int
    user_id: int

    class Config:
        from_attributes = True
@router.post("/createActivityPlan/", response_model=ActivityPlanResponse)
def create_activity_plan(plan: ActivityPlanCreate, db: Session = Depends(get_db)):
    new_plan = ActivityPlan(**plan.model_dump())
    db.add(new_plan)
    db.commit()
    db.refresh(new_plan)
    return new_plan


# Schema สำหรับแสดงข้อมูลที่สร้างเสร็จแล้ว (Response Body)
class ActivityInPlanRespond(BaseModel):
    id: int
    plan_id: int
    activity_id: int
    success_count: int
    is_chose: bool

    class Config:
        # สำหรับ Pydantic V2
        from_attributes = True
        # สำหรับ Pydantic V1 ให้ใช้ orm_mode = True
class ActivityInPlanBulkItem(BaseModel):
    activity_id: int
    is_chose: bool = False # สามารถส่งค่า true/false มาได้ หรือถ้าไม่ส่งจะ default เป็น false

# ✅ 2. สร้าง Schema สำหรับ Request Body หลัก
class ActivityInPlanBulkCreate(BaseModel):
    plan_id: int
    activities: List[ActivityInPlanBulkItem] # รับเป็น List ของ Schema ด้านบน

@router.post("/InsertActivityInPlan/", response_model=List[ActivityInPlanRespond])
def create_activity_in_plan(
    data: ActivityInPlanBulkCreate,
    db: Session = Depends(get_db)
):
    """
    สร้างรายการ Activity_in_plan ใหม่
    """
    new_activities_to_add = []

    # 1. วนลูปตาม list ของ activities ที่ส่งมา
    for activity_item in data.activities:
        new_activity_entry = ActivityInPlan(
            plan_id=data.plan_id,                 # ใช้ plan_id จาก body หลัก
            activity_id=activity_item.activity_id, # ใช้ activity_id จาก item ใน list
            is_chose=activity_item.is_chose,       # ใช้ is_chose จาก item ใน list
            success_count=0                      # สมมติว่า success_count เริ่มต้นที่ 0
        )
        new_activities_to_add.append(new_activity_entry)

    # 2. เพิ่มข้อมูลทั้งหมดเข้า session ทีเดียว
    db.add_all(new_activities_to_add)

    # 3. commit เพียงครั้งเดียวเพื่อบันทึกทั้งหมด
    db.commit()

    # 4. คืนค่าเป็น list ของข้อมูลที่เพิ่งสร้าง
    return new_activities_to_add

# Schema สำหรับรับข้อมูลตอนสร้าง (Request Body)
class UserLifestyleCreate(BaseModel):
    user_id: int
    lifestyle_ids: list[int]

# Schema สำหรับแสดงข้อมูลที่สร้างเสร็จแล้ว (Response Body)
class UserLifestyleRespond(BaseModel):
    id: int
    user_id: int
    lifestyle_id: int

    class Config:
        # สำหรับ Pydantic V2
        from_attributes = True
@router.post("/insertUserLifeStyle", response_model=list[UserLifestyleRespond])
def create_user_lifestyle(
    data: UserLifestyleCreate,
    db: Session = Depends(get_db)
):
    """
    สร้างรายการ User_Lifestyle ใหม่
    """
    # 1. สร้าง SQLAlchemy object จากข้อมูลที่รับมา
    created_lifestyles = []
    # 1. วนลูปตาม lifestyle_id ที่ส่งมา
    for lifestyle_id in data.lifestyle_ids:
        new_entry = UserLifestyle(
            user_id=data.user_id,
            lifestyle_id=lifestyle_id
        )
        created_lifestyles.append(new_entry)

    # 2. ใช้ db.add_all() เพื่อเพิ่มข้อมูลทั้งหมดใน session ทีเดียว (ประสิทธิภาพดีกว่า)
    db.add_all(created_lifestyles)

    # 3. commit เพียงครั้งเดียว! เพื่อบันทึกข้อมูลทั้งหมดลงฐานข้อมูล
    db.commit()

    # 4. ไม่ต้องใช้ db.refresh() เพราะเมื่อ commit แล้ว SQLAlchemy จะอัปเดต id
    #    ให้กับ object ใน list `created_lifestyles` โดยอัตโนมัติ

    # 5. คืนค่าเป็น list ของข้อมูลที่เพิ่งสร้าง
    return created_lifestyles

@router.get("/userPlanId")
def get_userPlan_ById(db: Session = Depends(get_db),id:int = 0):
    planId = db.query(ActivityPlan).filter(ActivityPlan.user_id == id).first()
    return planId


@router.delete("/deleteActivityInPlan")
def delete_activities_by_plan_id(plan_id: int, db: Session = Depends(get_db)):
    """
    ลบรายการ Activity_in_plan ทั้งหมดที่เกี่ยวข้องกับ plan_id ที่ระบุ
    """
    # 1. Query เพื่อหา object ที่ต้องการลบ
    # เราใช้ .first() เพื่อตรวจสอบก่อนว่ามีข้อมูลอยู่จริงหรือไม่
    plan_to_check = db.query(ActivityInPlan).filter(ActivityInPlan.plan_id == plan_id).first()

    # 2. ตรวจสอบว่ามีข้อมูลให้ลบหรือไม่
    if not plan_to_check:
        # ถ้าไม่พบข้อมูลของ plan_id นี้เลย ให้ส่ง 404 Not Found กลับไป
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"No activities found for plan_id {plan_id}")

    # 3. สั่งลบข้อมูลทั้งหมดที่ตรงเงื่อนไข (synchronize_session=False เป็น option ที่แนะนำ)
    num_rows_deleted = db.query(ActivityInPlan).filter(
        ActivityInPlan.plan_id == plan_id
    ).delete(synchronize_session=False)

    # 4. commit เพื่อยืนยันการลบ
    db.commit()

    # 5. คืนค่าเป็นข้อความยืนยัน
    return {"detail": f"Successfully deleted {num_rows_deleted} activities for plan_id {plan_id}"}

@router.delete("/deleteUserLifeStyle")
def delete_lifestyles_by_user_id(user_id: int, db: Session = Depends(get_db)):
    """
    ลบรายการ User_Lifestyle ทั้งหมดที่เกี่ยวข้องกับ user_id ที่ระบุ
    """
    # 1. ตรวจสอบก่อนว่ามีข้อมูลของ user_id นี้อยู่จริงหรือไม่
    lifestyle_to_check = db.query(UserLifestyle).filter(UserLifestyle.user_id == user_id).first()

    if not lifestyle_to_check:
        # ถ้าไม่พบ ให้ส่ง 404 Not Found
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"No lifestyles found for user_id {user_id}")

    # 2. สั่งลบข้อมูลทั้งหมดที่ตรงเงื่อนไข
    num_rows_deleted = db.query(UserLifestyle).filter(
        UserLifestyle.user_id == user_id
    ).delete(synchronize_session=False)

    # 3. commit เพื่อยืนยันการลบ
    db.commit()

    # 4. คืนค่าเป็นข้อความยืนยัน
    return {"detail": f"Successfully deleted {num_rows_deleted} lifestyles for user_id {user_id}"}