import uuid
import datetime
import json
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

def generate_uuid():
    return str(uuid.uuid4())

class MasterCuisine(Base):
    __tablename__ = "master_cuisines"

    code = Column(String(30), primary_key=True)
    name_vi = Column(String(100), nullable=False)
    name_en = Column(String(100), nullable=False)
    icon = Column(String(10), default="🍲")
    category_group = Column(String(50), nullable=False)
    default_spicy_level = Column(Integer, default=1)
    display_order = Column(Integer, default=0)

class MasterBudgetTier(Base):
    __tablename__ = "master_budget_tiers"

    code = Column(String(20), primary_key=True)
    name_vi = Column(String(100), nullable=False)
    min_amount_vnd = Column(Integer, nullable=False)
    max_amount_vnd = Column(Integer, nullable=True)
    display_order = Column(Integer, default=0)

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    phone_number = Column(String(20), unique=True, nullable=False)
    full_name = Column(String(100), nullable=False)
    gender = Column(String(20), default="other")
    date_of_birth = Column(String(10), default="2000-01-01")
    avatar_url = Column(String(500), nullable=False)
    gallery_json = Column(Text, default="[]")
    bio = Column(Text, nullable=True)
    occupation = Column(String(100), nullable=True)
    role = Column(String(20), default="member")
    status = Column(String(20), default="active")
    is_verified = Column(Boolean, default=False)
    trust_score = Column(Integer, default=100)
    
    # Tọa độ GPS gần nhất
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Quan hệ 1-1 với Taste Profile
    taste_profile = relationship("UserTasteProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")

class UserTasteProfile(Base):
    __tablename__ = "user_taste_profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), unique=True, nullable=False)
    
    cuisines_json = Column(Text, default='["VN_TRAD"]')
    spicy_level = Column(Integer, default=1)
    taste_preferences_json = Column(Text, default='[]')
    dietary_restrictions_json = Column(Text, default='[]')
    allergies_json = Column(Text, default='[]')
    budget_tier = Column(String(20), default="BUDGET_T2")
    available_times_json = Column(Text, default='["dinner", "weekend"]')
    connection_purpose = Column(String(50), default="food_buddy")
    favorite_dish = Column(String(150), nullable=True)
    max_distance_km = Column(Integer, default=10)
    
    user = relationship("User", back_populates="taste_profile")

    @property
    def cuisines(self):
        try:
            return json.loads(self.cuisines_json or "[]")
        except Exception:
            return []

    @cuisines.setter
    def cuisines(self, val):
        self.cuisines_json = json.dumps(val or [])

class Restaurant(Base):
    __tablename__ = "restaurants"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    alias_name = Column(String(255), nullable=True)
    address_full = Column(String(500), nullable=False)
    district = Column(String(100), nullable=False)
    city = Column(String(100), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    cuisine_code = Column(String(30), nullable=True)
    price_tier = Column(String(20), default="BUDGET_T2")
    avg_rating = Column(Float, default=4.5)
    review_count = Column(Integer, default=0)
    avatar_url = Column(String(500), nullable=False)
    tags_json = Column(Text, default="[]")
    is_partner = Column(Boolean, default=False)
    partner_discount_desc = Column(String(255), nullable=True)
    is_verified = Column(Boolean, default=True)

class Swipe(Base):
    __tablename__ = "swipes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    from_user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    to_user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    action = Column(String(20), nullable=False) # 'like', 'pass', 'super_like'
    compatibility_score = Column(Float, default=0.0)
    swiped_at = Column(DateTime, default=datetime.datetime.utcnow)

class Match(Base):
    __tablename__ = "matches"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_a_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    user_b_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    status = Column(String(20), default="matched")
    matched_at = Column(DateTime, default=datetime.datetime.utcnow)

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    match_id = Column(String(36), ForeignKey("matches.id"), unique=True, nullable=False)
    last_message_preview = Column(Text, nullable=True)
    last_message_at = Column(DateTime, default=datetime.datetime.utcnow)
    is_active = Column(Boolean, default=True)

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    conversation_id = Column(String(36), ForeignKey("conversations.id"), nullable=False)
    sender_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    message_type = Column(String(20), default="text")
    content = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    sent_at = Column(DateTime, default=datetime.datetime.utcnow)

class MealInvite(Base):
    __tablename__ = "meal_invites"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    invite_code = Column(String(30), unique=True, nullable=False)
    inviter_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    invitee_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    restaurant_id = Column(String(36), ForeignKey("restaurants.id"), nullable=False)
    scheduled_at = Column(String(50), nullable=False)
    payment_policy = Column(String(50), default="split_50_50")
    note = Column(Text, nullable=True)
    status = Column(String(30), default="pending") # 'pending', 'accepted', 'declined', 'checked_in', 'completed'
    inviter_checked_in = Column(Boolean, default=False)
    invitee_checked_in = Column(Boolean, default=False)
    share_safety_token = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
