import uuid
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, UserTasteProfile
from ..schemas import SendOtpRequest, VerifyOtpRequest, RegisterRequest, LoginRequest

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])

DEFAULT_AVATARS = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80"
]

@router.post("/register")
def register_user(req: RegisterRequest, db: Session = Depends(get_db)):
    """
    Đăng ký tài khoản thành viên mới và khởi tạo hồ sơ khẩu vị ẩm thực ban đầu.
    """
    # 1. Kiểm tra số điện thoại đã tồn tại chưa
    existing = db.query(User).filter(User.phone_number == req.phone_number).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Số điện thoại này đã được đăng ký tài khoản FoodMate. Vui lòng đăng nhập."
        )

    # 2. Chọn avatar mặc định nếu không cung cấp
    avatar = req.avatar_url or DEFAULT_AVATARS[len(req.full_name) % len(DEFAULT_AVATARS)]

    # 3. Tạo User
    user_id = f"user-{uuid.uuid4().hex[:8]}"
    new_user = User(
        id=user_id,
        phone_number=req.phone_number,
        full_name=req.full_name,
        gender=req.gender or "other",
        date_of_birth="2000-01-01",
        avatar_url=avatar,
        bio=req.bio or f"Mê ẩm thực, thích {req.favorite_dish or 'ăn uống cùng bạn bè'}!",
        occupation=req.occupation or "Thành viên FoodMate",
        role="member",
        status="active",
        is_verified=True, # Xác thực đăng ký thành công
        trust_score=100,
        latitude=10.7769,
        longitude=106.7009
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # 4. Tạo UserTasteProfile ban đầu
    taste = UserTasteProfile(
        user_id=new_user.id,
        cuisines_json=json.dumps(req.cuisines or ["VN_TRAD", "HOTPOT"]),
        spicy_level=req.spicy_level or 2,
        budget_tier=req.budget_tier or "BUDGET_T2",
        connection_purpose=req.connection_purpose or "food_buddy",
        favorite_dish=req.favorite_dish or "Món Việt truyền thống",
        max_distance_km=10
    )
    db.add(taste)
    db.commit()

    return {
        "success": True,
        "message": "Đăng ký tài khoản FoodMate thành công!",
        "data": {
            "access_token": f"token_foodmate_{new_user.id}",
            "user": {
                "id": new_user.id,
                "phone_number": new_user.phone_number,
                "full_name": new_user.full_name,
                "age": req.age or 24,
                "gender": new_user.gender,
                "occupation": new_user.occupation,
                "bio": new_user.bio,
                "avatar_url": new_user.avatar_url,
                "trust_score": new_user.trust_score,
                "is_verified": new_user.is_verified,
                "taste_profile": {
                    "cuisines": taste.cuisines,
                    "spicy_level": taste.spicy_level,
                    "budget_tier": taste.budget_tier,
                    "favorite_dish": taste.favorite_dish,
                    "connection_purpose": taste.connection_purpose,
                    "max_distance_km": taste.max_distance_km
                }
            }
        }
    }

@router.post("/login")
def login_user(req: LoginRequest, db: Session = Depends(get_db)):
    """
    Đăng nhập vào hệ thống bằng số điện thoại.
    """
    phone = req.phone_number.strip()
    digits = ''.join(c for c in phone if c.isdigit())
    suffix = digits[-9:] if len(digits) >= 9 else digits
    user = db.query(User).filter(
        (User.phone_number == phone) |
        (User.phone_number.like(f"%{suffix}"))
    ).first()
    if not user:
        raise HTTPException(
            status_code=404,
            detail="Số điện thoại chưa được đăng ký. Vui lòng tạo tài khoản mới."
        )

    taste = user.taste_profile

    # Tính tuổi từ date_of_birth
    age = 24
    if user.date_of_birth and len(user.date_of_birth) >= 4 and user.date_of_birth[:4].isdigit():
        age = max(18, 2026 - int(user.date_of_birth[:4]))

    return {
        "success": True,
        "message": "Đăng nhập thành công!",
        "data": {
            "access_token": f"token_foodmate_{user.id}",
            "user": {
                "id": user.id,
                "phone_number": user.phone_number,
                "full_name": user.full_name,
                "age": age,
                "gender": user.gender,
                "occupation": user.occupation,
                "bio": user.bio,
                "avatar_url": user.avatar_url,
                "trust_score": user.trust_score,
                "is_verified": user.is_verified,
                "taste_profile": {
                    "cuisines": taste.cuisines if taste else ["VN_TRAD"],
                    "spicy_level": taste.spicy_level if taste else 1,
                    "budget_tier": taste.budget_tier if taste else "BUDGET_T2",
                    "favorite_dish": taste.favorite_dish if taste else "",
                    "connection_purpose": taste.connection_purpose if taste else "food_buddy",
                    "max_distance_km": taste.max_distance_km if taste else 10
                }
            }
        }
    }

from ..schemas import SendOtpRequest, VerifyOtpRequest, RegisterRequest, LoginRequest, SocialLoginRequest

@router.post("/social-login")
def social_login(req: SocialLoginRequest, db: Session = Depends(get_db)):
    """
    Đăng nhập hoặc đăng ký nhanh qua Google / Facebook / Apple.
    """
    social_phone = f"+84_{req.provider}_{req.social_id or uuid.uuid4().hex[:6]}"
    user = db.query(User).filter(User.phone_number == social_phone).first()

    if not user:
        user = User(
            id=f"user-{req.provider}-{uuid.uuid4().hex[:6]}",
            phone_number=social_phone,
            full_name=req.full_name or f"User {req.provider.capitalize()}",
            gender="other",
            avatar_url=req.avatar_url or DEFAULT_AVATARS[0],
            occupation=f"Tài khoản {req.provider.capitalize()}",
            bio=f"Đăng nhập qua {req.provider.capitalize()} FoodMate",
            role="member",
            is_verified=True,
            trust_score=100,
            latitude=10.7769,
            longitude=106.7009
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        taste = UserTasteProfile(
            user_id=user.id,
            cuisines_json=json.dumps(["VN_TRAD", "HOTPOT"]),
            spicy_level=2,
            budget_tier="BUDGET_T2",
            connection_purpose="food_buddy",
            favorite_dish="Ẩm thực Việt & Lẩu",
            max_distance_km=10
        )
        db.add(taste)
        db.commit()

    taste = user.taste_profile

    return {
        "success": True,
        "message": f"Đăng nhập qua {req.provider.capitalize()} thành công!",
        "data": {
            "access_token": f"token_foodmate_{user.id}",
            "user": {
                "id": user.id,
                "phone_number": user.phone_number,
                "full_name": user.full_name,
                "age": 24,
                "gender": user.gender,
                "occupation": user.occupation,
                "bio": user.bio,
                "avatar_url": user.avatar_url,
                "trust_score": user.trust_score,
                "is_verified": user.is_verified,
                "taste_profile": {
                    "cuisines": taste.cuisines if taste else ["VN_TRAD"],
                    "spicy_level": taste.spicy_level if taste else 2,
                    "budget_tier": taste.budget_tier if taste else "BUDGET_T2",
                    "favorite_dish": taste.favorite_dish if taste else "",
                    "connection_purpose": taste.connection_purpose if taste else "food_buddy",
                    "max_distance_km": taste.max_distance_km if taste else 10
                }
            }
        }
    }
def get_sample_users(db: Session = Depends(get_db)):
    """
    Danh sách tài khoản mẫu để đăng nhập nhanh khi thử nghiệm.
    """
    users = db.query(User).limit(5).all()
    samples = []
    for u in users:
        samples.append({
            "id": u.id,
            "phone_number": u.phone_number,
            "full_name": u.full_name,
            "avatar_url": u.avatar_url,
            "role": u.role,
            "occupation": u.occupation
        })
    return {
        "success": True,
        "data": samples
    }

@router.post("/otp/send")
def send_otp(req: SendOtpRequest):
    session_id = f"otp_sess_{uuid.uuid4().hex[:8]}"
    return {
        "success": True,
        "message": "Mã OTP đã được gửi thành công",
        "data": {
            "session_id": session_id,
            "expires_in_seconds": 120,
            "_dev_otp": "123456"
        }
    }

@router.post("/otp/verify")
def verify_otp(req: VerifyOtpRequest, db: Session = Depends(get_db)):
    if req.otp_code != "123456":
        raise HTTPException(status_code=400, detail="Mã OTP không chính xác hoặc đã hết hạn")

    user = db.query(User).filter(User.phone_number == req.phone_number).first()
    is_new = False

    if not user:
        is_new = True
        user = User(
            phone_number=req.phone_number,
            full_name=f"User {req.phone_number[-4:]}",
            avatar_url=DEFAULT_AVATARS[0],
            role="member"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        taste = UserTasteProfile(user_id=user.id)
        db.add(taste)
        db.commit()

    return {
        "success": True,
        "data": {
            "is_new_user": is_new,
            "access_token": f"jwt_token_foodmate_{user.id}",
            "token_type": "Bearer",
            "user": {
                "id": user.id,
                "phone_number": user.phone_number,
                "full_name": user.full_name,
                "avatar_url": user.avatar_url,
                "is_verified": user.is_verified,
                "role": user.role
            }
        }
    }
