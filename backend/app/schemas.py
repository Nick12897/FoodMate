from typing import List, Optional
from pydantic import BaseModel, Field

# --- Auth Schemas ---
class SendOtpRequest(BaseModel):
    phone_number: str = Field(..., example="+84901234567")

class VerifyOtpRequest(BaseModel):
    phone_number: str = Field(..., example="+84901234567")
    session_id: str
    otp_code: str = Field(..., example="123456")

class RegisterRequest(BaseModel):
    phone_number: str = Field(..., example="+84901234567")
    full_name: str = Field(..., example="Nguyễn Văn A")
    password: Optional[str] = "123456"
    age: Optional[int] = 24
    gender: Optional[str] = "male" # 'male', 'female', 'other'
    occupation: Optional[str] = "Nhân viên văn phòng"
    bio: Optional[str] = "Tìm bạn ăn uống cuối tuần"
    avatar_url: Optional[str] = None
    
    # Gu ẩm thực ban đầu (Onboarding Taste Profile)
    favorite_dish: Optional[str] = "Lẩu Thái hải sản"
    spicy_level: Optional[int] = Field(2, ge=1, le=5)
    budget_tier: Optional[str] = "BUDGET_T2"
    cuisines: Optional[List[str]] = ["VN_TRAD", "HOTPOT"]
    connection_purpose: Optional[str] = "food_buddy"

class LoginRequest(BaseModel):
    phone_number: str = Field(..., example="+84901234567")
    password: Optional[str] = None

class SocialLoginRequest(BaseModel):
    provider: str = Field(..., example="google") # 'google', 'facebook', 'apple'
    full_name: Optional[str] = "Thành viên FoodMate"
    email: Optional[str] = None
    avatar_url: Optional[str] = None
    social_id: Optional[str] = None

class UserSummary(BaseModel):
    id: str
    phone_number: str
    full_name: str
    avatar_url: str
    is_verified: bool
    role: str

class TokenResponse(BaseModel):
    success: bool = True
    is_new_user: bool = False
    access_token: str
    token_type: str = "Bearer"
    user: UserSummary

# --- Taste Profile Schemas ---
class TasteProfileUpdate(BaseModel):
    cuisines: Optional[List[str]] = None
    spicy_level: Optional[int] = Field(None, ge=1, le=5)
    budget_tier: Optional[str] = None
    connection_purpose: Optional[str] = None
    favorite_dish: Optional[str] = None
    max_distance_km: Optional[int] = Field(None, ge=1, le=50)

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    occupation: Optional[str] = None
    taste_profile: Optional[TasteProfileUpdate] = None

# --- Discovery Schemas ---
class SwipeRequest(BaseModel):
    target_user_id: str
    action: str = Field(..., example="like") # 'like', 'pass', 'super_like'

class DiscoveryCardResponse(BaseModel):
    user_id: str
    full_name: str
    age: int
    gender: str
    occupation: Optional[str]
    avatar_url: str
    bio: Optional[str]
    distance_km: float
    compatibility_score: float
    favorite_dish: Optional[str]
    cuisines: List[str]
    spicy_level: int
    budget_tier: str
    connection_purpose: str
    is_verified: bool

# --- Meal Invite Schemas ---
class CreateInviteRequest(BaseModel):
    partner_id: str
    restaurant_id: str
    scheduled_at: str
    payment_policy: Optional[str] = "split_50_50"
    note: Optional[str] = None

class CheckInRequest(BaseModel):
    latitude: float
    longitude: float

class ReviewPartnerRequest(BaseModel):
    punctuality_rating: int = Field(5, ge=1, le=5)
    politeness_rating: int = Field(5, ge=1, le=5)
    compatibility_rating: int = Field(5, ge=1, le=5)
    comment: Optional[str] = None

# --- Chat Schemas ---
class SendMessageRequest(BaseModel):
    conversation_id: str
    content: str
    sender_id: Optional[str] = None
    partner_id: Optional[str] = None
