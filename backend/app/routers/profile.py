import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, UserTasteProfile
from ..schemas import TasteProfileUpdate

router = APIRouter(prefix="/api/v1/profile", tags=["Profile & Taste"])

@router.get("/me")
def get_my_profile(user_id: str = "user-me", db: Session = Depends(get_db)):
    """
    Lấy thông tin tài khoản và hồ sơ khẩu vị ẩm thực cá nhân.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")

    taste = user.taste_profile
    return {
        "success": True,
        "data": {
            "id": user.id,
            "full_name": user.full_name,
            "phone_number": user.phone_number,
            "gender": user.gender,
            "age": 25,
            "avatar_url": user.avatar_url,
            "bio": user.bio,
            "occupation": user.occupation,
            "trust_score": user.trust_score,
            "is_verified": user.is_verified,
            "taste_profile": {
                "cuisines": taste.cuisines if taste else [],
                "spicy_level": taste.spicy_level if taste else 1,
                "budget_tier": taste.budget_tier if taste else "BUDGET_T2",
                "connection_purpose": taste.connection_purpose if taste else "food_buddy",
                "favorite_dish": taste.favorite_dish if taste else "",
                "max_distance_km": taste.max_distance_km if taste else 10
            }
        }
    }

@router.put("/taste")
def update_taste_profile(body: TasteProfileUpdate, user_id: str = "user-me", db: Session = Depends(get_db)):
    """
    Cập nhật Taste Profile (khẩu vị, cấp độ cay, ngân sách, món ruột).
    """
    taste = db.query(UserTasteProfile).filter(UserTasteProfile.user_id == user_id).first()
    if not taste:
        taste = UserTasteProfile(user_id=user_id)
        db.add(taste)

    if body.cuisines is not None:
        taste.cuisines = body.cuisines
    if body.spicy_level is not None:
        taste.spicy_level = body.spicy_level
    if body.budget_tier is not None:
        taste.budget_tier = body.budget_tier
    if body.connection_purpose is not None:
        taste.connection_purpose = body.connection_purpose
    if body.favorite_dish is not None:
        taste.favorite_dish = body.favorite_dish
    if body.max_distance_km is not None:
        taste.max_distance_km = body.max_distance_km

    db.commit()
    db.refresh(taste)

    return {
        "success": True,
        "message": "Cập nhật khẩu vị thành công",
        "data": {
            "cuisines": taste.cuisines,
            "spicy_level": taste.spicy_level,
            "budget_tier": taste.budget_tier,
            "favorite_dish": taste.favorite_dish,
            "max_distance_km": taste.max_distance_km
        }
    }
