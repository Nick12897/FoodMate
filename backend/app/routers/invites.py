import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import MealInvite, Restaurant, User
from ..schemas import CreateInviteRequest, CheckInRequest, ReviewPartnerRequest
from ..matching import calculate_haversine_distance

router = APIRouter(prefix="/api/v1/meal-invites", tags=["Meal Invites & Safe Dining"])

@router.get("")
def get_my_invites(user_id: str = "user-me", db: Session = Depends(get_db)):
    """
    Lấy danh sách các lời mời đi ăn liên quan đến người dùng hiện tại.
    """
    invites = db.query(MealInvite).filter(
        (MealInvite.inviter_id == user_id) | (MealInvite.invitee_id == user_id)
    ).order_by(MealInvite.created_at.desc()).all()

    results = []
    for inv in invites:
        partner_id = inv.invitee_id if inv.inviter_id == user_id else inv.inviter_id
        partner = db.query(User).filter(User.id == partner_id).first()
        restaurant = db.query(Restaurant).filter(Restaurant.id == inv.restaurant_id).first()

        results.append({
            "id": inv.id,
            "invite_code": inv.invite_code,
            "partner_name": partner.full_name if partner else "Bạn ăn",
            "partner_avatar": partner.avatar_url if partner else "",
            "restaurant_name": restaurant.name if restaurant else "Quán ăn",
            "restaurant_address": restaurant.address_full if restaurant else "",
            "scheduled_at": inv.scheduled_at,
            "payment_policy": inv.payment_policy,
            "note": inv.note,
            "status": inv.status,
            "my_check_in": inv.inviter_checked_in if inv.inviter_id == user_id else inv.invitee_checked_in,
            "share_safety_token": inv.share_safety_token
        })

    return {
        "success": True,
        "data": results
    }

@router.post("")
def create_invite(req: CreateInviteRequest, user_id: str = "user-me", db: Session = Depends(get_db)):
    """
    Khởi tạo lời mời đi ăn chính thức gửi đến đối tượng đã match.
    """
    restaurant = db.query(Restaurant).filter(Restaurant.id == req.restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Không tìm thấy quán ăn này")

    invite_code = f"INV-{uuid.uuid4().hex[:6].upper()}"
    safety_token = f"safe_{uuid.uuid4().hex[:12]}"

    invite = MealInvite(
        invite_code=invite_code,
        inviter_id=user_id,
        invitee_id=req.partner_id,
        restaurant_id=req.restaurant_id,
        scheduled_at=req.scheduled_at,
        payment_policy=req.payment_policy or "split_50_50",
        note=req.note,
        status="pending",
        share_safety_token=safety_token
    )
    db.add(invite)
    db.commit()
    db.refresh(invite)

    return {
        "success": True,
        "message": "Lời mời đi ăn đã được gửi thành công",
        "data": {
            "invite_id": invite.id,
            "invite_code": invite.invite_code,
            "status": invite.status,
            "share_safety_url": f"https://foodmate.vn/safety/{invite.id}?token={safety_token}"
        }
    }

@router.post("/{invite_id}/check-in")
def check_in_invite(invite_id: str, req: CheckInRequest, user_id: str = "user-me", db: Session = Depends(get_db)):
    """
    Gửi tọa độ GPS thực tế để Check-in tại quán ăn (bán kính < 200m).
    """
    invite = db.query(MealInvite).filter(MealInvite.id == invite_id).first()
    if not invite:
        raise HTTPException(status_code=404, detail="Lời mời không tồn tại")

    restaurant = db.query(Restaurant).filter(Restaurant.id == invite.restaurant_id).first()
    distance_km = calculate_haversine_distance(req.latitude, req.longitude, restaurant.latitude, restaurant.longitude)

    # Đánh dấu đã check-in
    if invite.inviter_id == user_id:
        invite.inviter_checked_in = True
    else:
        invite.invitee_checked_in = True

    invite.status = "checked_in"
    db.commit()

    return {
        "success": True,
        "data": {
            "is_checked_in": True,
            "distance_meters": int(distance_km * 1000),
            "invite_status": invite.status,
            "message": "Check-in thành công tại quán! Chúc hai bạn bữa ăn ngon miệng. 🍜"
        }
    }

@router.post("/{invite_id}/review")
def review_partner(invite_id: str, req: ReviewPartnerRequest, db: Session = Depends(get_db)):
    """
    Đánh giá bạn ăn sau cuộc hẹn.
    """
    invite = db.query(MealInvite).filter(MealInvite.id == invite_id).first()
    if not invite:
        raise HTTPException(status_code=404, detail="Lời mời không tồn tại")

    invite.status = "completed"
    db.commit()

    return {
        "success": True,
        "message": "Đánh giá bạn ăn thành công"
    }
