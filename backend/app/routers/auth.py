import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, UserTasteProfile
from ..schemas import SendOtpRequest, VerifyOtpRequest, TokenResponse, UserSummary

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])

@router.post("/otp/send")
def send_otp(req: SendOtpRequest):
    """
    Gửi mã OTP 6 chữ số qua SMS đến số điện thoại.
    Môi trường thử nghiệm: Trả về session_id và mã mẫu 123456.
    """
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
    """
    Xác thực OTP và đăng nhập / tạo tài khoản mới.
    """
    if req.otp_code != "123456":
        raise HTTPException(status_code=400, detail="Mã OTP không chính xác hoặc đã hết hạn")

    user = db.query(User).filter(User.phone_number == req.phone_number).first()
    is_new = False

    if not user:
        is_new = True
        user = User(
            phone_number=req.phone_number,
            full_name=f"User {req.phone_number[-4:]}",
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
            role="member"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        # Tạo Taste profile mặc định
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
                "avatar_url": user.avatarUrl if hasattr(user, 'avatarUrl') else user.avatar_url,
                "is_verified": user.is_verified,
                "role": user.role
            }
        }
    }
