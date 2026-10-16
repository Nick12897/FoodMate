import json
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, UserTasteProfile, Swipe, Match, Conversation
from ..schemas import SwipeRequest
from ..matching import calculate_haversine_distance, calculate_compatibility_score

router = APIRouter(prefix="/api/v1/discovery", tags=["Discovery & Swiping"])

@router.get("/feed")
def get_discovery_feed(
    latitude: float = Query(10.7769, description="Vĩ độ hiện tại"),
    longitude: float = Query(106.7009, description="Kinh độ hiện tại"),
    limit: int = 10,
    user_id: str = "user-me",
    db: Session = Depends(get_db)
):
    """
    Lấy danh sách các thẻ ứng viên tiềm năng phù hợp với khẩu vị và bán kính GPS.
    """
    me = db.query(User).filter(User.id == user_id).first()
    my_taste = me.taste_profile if me else None
    max_radius = my_taste.max_distance_km if my_taste else 15

    # Lấy danh sách ID đã quẹt
    swiped_ids = [s.to_user_id for s in db.query(Swipe).filter(Swipe.from_user_id == user_id).all()]
    swiped_ids.append(user_id) # Không hiển thị chính mình

    candidates = db.query(User).filter(~User.id.in_(swiped_ids), User.status == "active").all()
    cards = []

    for c in candidates:
        their_taste = c.taste_profile
        distance = calculate_haversine_distance(latitude, longitude, c.latitude, c.longitude)
        
        # Chỉ lấy trong bán kính cho phép
        if distance <= max_radius:
            score = calculate_compatibility_score(my_taste, their_taste)
            cards.append({
                "user_id": c.id,
                "full_name": c.full_name,
                "age": 24, # Tùy biến từ date_of_birth
                "gender": c.gender,
                "occupation": c.occupation,
                "avatar_url": c.avatar_url,
                "bio": c.bio,
                "distance_km": distance,
                "compatibility_score": score,
                "favorite_dish": their_taste.favorite_dish if their_taste else "Đồ ăn vặt",
                "cuisines": their_taste.cuisines if their_taste else [],
                "spicy_level": their_taste.spicy_level if their_taste else 1,
                "budget_tier": their_taste.budget_tier if their_taste else "BUDGET_T2",
                "connection_purpose": their_taste.connection_purpose if their_taste else "food_buddy",
                "is_verified": c.is_verified,
            })

    # Sắp xếp thẻ có độ tương hợp cao nhất lên đầu
    cards.sort(key=lambda x: x["compatibility_score"], reverse=True)

    return {
        "success": True,
        "data": {
            "cards": cards[:limit],
            "remaining_likes_today": 45
        }
    }

@router.post("/swipe")
def swipe_card(req: SwipeRequest, user_id: str = "user-me", db: Session = Depends(get_db)):
    """
    Gửi hành động quẹt thẻ (like / pass / super_like).
    Nếu 2 bên cùng like nhau -> Trả về is_match: True và tạo cuộc trò chuyện.
    """
    target = db.query(User).filter(User.id == req.target_user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng này")

    # Lưu swipe action
    swipe = Swipe(
        from_user_id=user_id,
        to_user_id=req.target_user_id,
        action=req.action,
        compatibility_score=85.0
    )
    db.add(swipe)
    db.commit()

    is_match = False
    match_data = None

    # Kiểm tra xem đối phương có Like mình không
    if req.action in ["like", "super_like"]:
        mutual = db.query(Swipe).filter(
            Swipe.from_user_id == req.target_user_id,
            Swipe.to_user_id == user_id,
            Swipe.action.in_(["like", "super_like"])
        ).first()

        # Giả lập: Nếu quẹt user-02 (Lê Mai Phương) thì luôn Match để test!
        if mutual or req.target_user_id == "user-02":
            is_match = True
            
            # Tạo hoặc lấy Match
            match = db.query(Match).filter(
                ((Match.user_a_id == user_id) & (Match.user_b_id == req.target_user_id)) |
                ((Match.user_a_id == req.target_user_id) & (Match.user_b_id == user_id))
            ).first()

            if not match:
                match = Match(user_a_id=user_id, user_b_id=req.target_user_id)
                db.add(match)
                db.commit()
                db.refresh(match)

                conv = Conversation(match_id=match.id, last_message_preview="Hai bạn vừa hợp gu ăn uống!")
                db.add(conv)
                db.commit()
                db.refresh(conv)
            else:
                conv = db.query(Conversation).filter(Conversation.match_id == match.id).first()

            match_data = {
                "match_id": match.id,
                "conversation_id": conv.id if conv else None,
                "matched_user": {
                    "id": target.id,
                    "full_name": target.full_name,
                    "avatar_url": target.avatar_url
                }
            }

    return {
        "success": True,
        "data": {
            "is_match": is_match,
            "match": match_data
        }
    }
