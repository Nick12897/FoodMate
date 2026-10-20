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
    if me:
        same_users = [u.id for u in db.query(User).filter((User.phone_number == me.phone_number) | (User.full_name == me.full_name)).all()]
        swiped_ids.extend(same_users)

    # Loại bỏ cả những người đã Match thành công (đang trong danh sách Trò chuyện)
    matches = db.query(Match).filter((Match.user_a_id == user_id) | (Match.user_b_id == user_id)).all()
    for m in matches:
        partner_id = m.user_b_id if m.user_a_id == user_id else m.user_a_id
        swiped_ids.append(partner_id)

    candidates = db.query(User).filter(~User.id.in_(swiped_ids), User.status == "active").all()

    cards = []
    DEFAULT_AVATARS = [
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80"
    ]

    for idx, c in enumerate(candidates):
        their_taste = c.taste_profile
        distance = calculate_haversine_distance(latitude, longitude, c.latitude, c.longitude)
        if distance < 0.3:
            distance = round(1.2 + (idx * 0.4), 1)
        
        # Lấy ứng viên và tính điểm tương hợp
        score = calculate_compatibility_score(my_taste, their_taste)
        fallback_avatar = DEFAULT_AVATARS[idx % len(DEFAULT_AVATARS)]
        actual_avatar = c.avatar_url if c.avatar_url and len(c.avatar_url) > 5 else fallback_avatar

        # Tính tuổi từ date_of_birth nếu có
        age = 24
        if c.date_of_birth and len(c.date_of_birth) >= 4 and c.date_of_birth[:4].isdigit():
            age = max(18, 2026 - int(c.date_of_birth[:4]))

        cards.append({
            "id": c.id,
            "user_id": c.id,
            "fullName": c.full_name or "Thành viên FoodMate",
            "full_name": c.full_name or "Thành viên FoodMate",
            "age": age,
            "gender": c.gender or "other",
            "occupation": c.occupation or "Thành viên FoodMate",
            "avatarUrl": actual_avatar,
            "avatar_url": actual_avatar,
            "bio": c.bio or "Yêu thích ẩm thực và tìm bạn ăn cùng bàn",
            "distanceKm": round(distance, 1),
            "distance_km": round(distance, 1),
            "compatibilityScore": int(score),
            "compatibility_score": int(score),
            "favoriteDish": their_taste.favorite_dish if their_taste and their_taste.favorite_dish else "Món ngon mỗi ngày",
            "favorite_dish": their_taste.favorite_dish if their_taste and their_taste.favorite_dish else "Món ngon mỗi ngày",
            "cuisines": their_taste.cuisines if their_taste and their_taste.cuisines else ["VN_TRAD", "HOTPOT"],
            "spicyLevel": their_taste.spicy_level if their_taste else 2,
            "spicy_level": their_taste.spicy_level if their_taste else 2,
            "budgetTier": their_taste.budget_tier if their_taste else "BUDGET_T2",
            "budget_tier": their_taste.budget_tier if their_taste else "BUDGET_T2",
            "connectionPurpose": their_taste.connection_purpose if their_taste else "food_buddy",
            "connection_purpose": their_taste.connection_purpose if their_taste else "food_buddy",
            "isVerified": c.is_verified if c.is_verified is not None else True,
            "is_verified": c.is_verified if c.is_verified is not None else True,
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
        # Nếu là tài khoản mẫu hoặc tài khoản từ bộ nhớ cục bộ, trả về thành công an toàn
        return {
            "success": True,
            "message": "Quẹt thẻ thành công!",
            "data": {
                "is_match": req.action in ["like", "super_like"],
                "target_user_id": req.target_user_id,
                "action": req.action
            }
        }

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
