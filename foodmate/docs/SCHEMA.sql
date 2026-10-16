-- =================================================================================================
-- HỆ THỐNG CƠ SỞ DỮ LIỆU FOODMATE (POSTGRESQL 15+ WITH POSTGIS EXTENSION)
-- File: docs/SCHEMA.sql
-- Mô tả: DDL Script khởi tạo toàn bộ CSDL FoodMate chuẩn Production
-- Tiêu chuẩn: Enterprise Rich Schema, Spatial Geography, B-Tree & GiST Indexes, Triggers & Auditing
-- =================================================================================================

-- 1. KÍCH HOẠT CÁC EXTENSION CẦN THIẾT
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =================================================================================================
-- 2. TẠO CÁC BẢNG MASTER DATA & DANH MỤC
-- =================================================================================================

-- 2.1 Bảng Danh mục Ẩm thực (Cuisines)
CREATE TABLE IF NOT EXISTS master_cuisines (
    code VARCHAR(30) PRIMARY KEY,
    name_vi VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    category_group VARCHAR(50) NOT NULL,
    default_spicy_level SMALLINT DEFAULT 1 CHECK (default_spicy_level BETWEEN 1 AND 5),
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2 Bảng Danh mục Chế độ ăn & Dị ứng (Dietary & Allergy Rules)
CREATE TABLE IF NOT EXISTS master_dietary_rules (
    code VARCHAR(30) PRIMARY KEY,
    name_vi VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('diet', 'allergy')),
    severity_level VARCHAR(20) DEFAULT 'high' CHECK (severity_level IN ('critical', 'high', 'medium', 'low')),
    conflict_action VARCHAR(50) DEFAULT 'warning',
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.3 Bảng Danh mục Phân khúc Ngân sách (Budget Tiers)
CREATE TABLE IF NOT EXISTS master_budget_tiers (
    code VARCHAR(20) PRIMARY KEY,
    name_vi VARCHAR(100) NOT NULL,
    min_amount_vnd INT NOT NULL,
    max_amount_vnd INT,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =================================================================================================
-- 3. TẠO CÁC BẢNG NGHIỆP VỤ CỐT LÕI (CORE ENTITIES)
-- =================================================================================================

-- 3.1 Bảng Người dùng gốc (Users)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    full_name VARCHAR(100) NOT NULL,
    nickname VARCHAR(50),
    gender VARCHAR(20) NOT NULL CHECK (gender IN ('male', 'female', 'non_binary', 'other')),
    date_of_birth DATE NOT NULL,
    avatar_url VARCHAR(500) NOT NULL,
    gallery_json JSONB DEFAULT '[]'::jsonb,
    bio TEXT,
    occupation VARCHAR(100),
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('guest', 'member', 'partner', 'moderator', 'admin')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned', 'pending_deletion')),
    is_verified BOOLEAN DEFAULT FALSE,
    trust_score INT DEFAULT 100 CHECK (trust_score BETWEEN 0 AND 100),
    emergency_contact_phone VARCHAR(20),
    last_active_at TIMESTAMPTZ,
    last_known_location geography(Point, 4326),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE
);

-- 3.2 Bảng Hồ sơ khẩu vị ẩm thực (User Taste Profiles)
CREATE TABLE IF NOT EXISTS user_taste_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cuisines JSONB DEFAULT '[]'::jsonb,
    spicy_level SMALLINT DEFAULT 1 CHECK (spicy_level BETWEEN 1 AND 5),
    taste_preferences JSONB DEFAULT '[]'::jsonb,
    dietary_restrictions JSONB DEFAULT '[]'::jsonb,
    allergies JSONB DEFAULT '[]'::jsonb,
    budget_tier VARCHAR(20) DEFAULT 'BUDGET_T2' REFERENCES master_budget_tiers(code),
    available_times JSONB DEFAULT '[]'::jsonb,
    connection_purpose VARCHAR(30) DEFAULT 'food_buddy' CHECK (connection_purpose IN ('food_buddy', 'friendship', 'dating', 'networking')),
    favorite_dish VARCHAR(150),
    signature_restaurant_id UUID,
    max_distance_km INT DEFAULT 10 CHECK (max_distance_km BETWEEN 1 AND 50),
    hide_distance BOOLEAN DEFAULT FALSE,
    hide_age BOOLEAN DEFAULT FALSE,
    auto_filter_allergy_conflict BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.3 Bảng Danh bạ Quán ăn (Restaurants)
CREATE TABLE IF NOT EXISTS restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    google_place_id VARCHAR(255) UNIQUE,
    name VARCHAR(255) NOT NULL,
    alias_name VARCHAR(255),
    address_full VARCHAR(500) NOT NULL,
    ward VARCHAR(100),
    district VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    geo_point geography(Point, 4326) NOT NULL,
    phone_number VARCHAR(30),
    cuisine_code VARCHAR(30) REFERENCES master_cuisines(code),
    price_tier VARCHAR(20) DEFAULT 'BUDGET_T2' REFERENCES master_budget_tiers(code),
    opening_hours_json JSONB DEFAULT '{}'::jsonb,
    avatar_url VARCHAR(500) NOT NULL,
    photos_json JSONB DEFAULT '[]'::jsonb,
    tags_json JSONB DEFAULT '[]'::jsonb,
    avg_rating DECIMAL(3,2) DEFAULT 0.00 CHECK (avg_rating BETWEEN 0.00 AND 5.00),
    review_count INT DEFAULT 0,
    is_partner BOOLEAN DEFAULT FALSE,
    partner_discount_desc VARCHAR(255),
    created_by UUID REFERENCES users(id),
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bổ sung ràng buộc khóa ngoại cho signature_restaurant_id ở user_taste_profiles
ALTER TABLE user_taste_profiles 
ADD CONSTRAINT fk_taste_signature_restaurant 
FOREIGN KEY (signature_restaurant_id) REFERENCES restaurants(id) ON DELETE SET NULL;

-- 3.4 Bảng Đánh giá quán ăn (Restaurant Reviews)
CREATE TABLE IF NOT EXISTS restaurant_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating_overall SMALLINT NOT NULL CHECK (rating_overall BETWEEN 1 AND 5),
    rating_food SMALLINT CHECK (rating_food BETWEEN 1 AND 5),
    rating_space SMALLINT CHECK (rating_space BETWEEN 1 AND 5),
    rating_service SMALLINT CHECK (rating_service BETWEEN 1 AND 5),
    content TEXT,
    photos_json JSONB DEFAULT '[]'::jsonb,
    tags_json JSONB DEFAULT '[]'::jsonb,
    likes_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (restaurant_id, user_id)
);

-- 3.5 Bảng Lịch sử quẹt thẻ (Swipes)
CREATE TABLE IF NOT EXISTS swipes (
    id BIGSERIAL PRIMARY KEY,
    from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(20) NOT NULL CHECK (action IN ('like', 'pass', 'super_like')),
    compatibility_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    swiped_at TIMESTAMPTZ DEFAULT NOW(),
    client_ip VARCHAR(45),
    user_agent VARCHAR(255),
    UNIQUE (from_user_id, to_user_id)
);

-- 3.6 Bảng Ghép đôi thành công (Matches)
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_a_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_b_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'matched' CHECK (status IN ('matched', 'unmatched', 'blocked')),
    matched_at TIMESTAMPTZ DEFAULT NOW(),
    unmatched_at TIMESTAMPTZ,
    unmatched_by UUID REFERENCES users(id),
    unmatch_reason VARCHAR(255),
    has_meal_invite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_user_order CHECK (user_a_id < user_b_id),
    UNIQUE (user_a_id, user_b_id)
);

-- 3.7 Bảng Phiên hội thoại Chat (Conversations)
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID UNIQUE NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    last_message_id BIGINT,
    last_message_preview TEXT,
    last_message_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.8 Bảng Tin nhắn chi tiết (Messages)
CREATE TABLE IF NOT EXISTS messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'restaurant_card', 'recipe_card', 'meal_invite_card', 'system')),
    content TEXT,
    attachment_urls JSONB DEFAULT '[]'::jsonb,
    metadata_json JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    is_flagged BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.9 Bảng Lời mời đi ăn chính thức (Meal Invites)
CREATE TABLE IF NOT EXISTS meal_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invite_code VARCHAR(30) UNIQUE NOT NULL,
    inviter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invitee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id),
    scheduled_at TIMESTAMPTZ NOT NULL,
    payment_policy VARCHAR(30) DEFAULT 'split_50_50' CHECK (payment_policy IN ('split_50_50', 'separate_bills', 'inviter_pays', 'invitee_pays')),
    note TEXT,
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled', 'checked_in', 'completed', 'expired')),
    inviter_checked_in_at TIMESTAMPTZ,
    invitee_checked_in_at TIMESTAMPTZ,
    check_in_distance_inviter_m INT,
    check_in_distance_invitee_m INT,
    share_safety_token VARCHAR(100) UNIQUE NOT NULL,
    cancelled_by UUID REFERENCES users(id),
    cancel_reason TEXT,
    is_inviter_reviewed BOOLEAN DEFAULT FALSE,
    is_invitee_reviewed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.10 Bảng Đánh giá bạn ăn (Dining Reviews)
CREATE TABLE IF NOT EXISTS dining_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invite_id UUID NOT NULL REFERENCES meal_invites(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reviewee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    punctuality_rating SMALLINT NOT NULL CHECK (punctuality_rating BETWEEN 1 AND 5),
    politeness_rating SMALLINT NOT NULL CHECK (politeness_rating BETWEEN 1 AND 5),
    compatibility_rating SMALLINT NOT NULL CHECK (compatibility_rating BETWEEN 1 AND 5),
    positive_tags_json JSONB DEFAULT '[]'::jsonb,
    private_comment TEXT,
    is_no_show BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (invite_id, reviewer_id)
);

-- 3.11 Bảng Công thức nấu ăn (Recipes)
CREATE TABLE IF NOT EXISTS recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    cover_image_url VARCHAR(500) NOT NULL,
    video_url VARCHAR(500),
    cuisine_code VARCHAR(30) REFERENCES master_cuisines(code),
    dietary_tags_json JSONB DEFAULT '[]'::jsonb,
    difficulty_level VARCHAR(20) DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    prep_time_minutes INT DEFAULT 15 CHECK (prep_time_minutes >= 0),
    cook_time_minutes INT DEFAULT 30 CHECK (cook_time_minutes >= 0),
    serving_size INT DEFAULT 2 CHECK (serving_size > 0),
    status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived', 'hidden')),
    likes_count INT DEFAULT 0,
    bookmarks_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.12 Bảng Chi tiết nguyên liệu công thức (Recipe Ingredients)
CREATE TABLE IF NOT EXISTS recipe_ingredients (
    id BIGSERIAL PRIMARY KEY,
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    ingredient_name VARCHAR(150) NOT NULL,
    amount VARCHAR(50) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    note VARCHAR(255),
    display_order INT DEFAULT 0
);

-- 3.13 Bảng Các bước nấu ăn (Recipe Steps)
CREATE TABLE IF NOT EXISTS recipe_steps (
    id BIGSERIAL PRIMARY KEY,
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    step_number INT NOT NULL,
    instruction TEXT NOT NULL,
    media_url VARCHAR(500),
    tips TEXT,
    UNIQUE (recipe_id, step_number)
);

-- 3.14 Bảng Báo cáo vi phạm (User Reports)
CREATE TABLE IF NOT EXISTS user_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_code VARCHAR(30) UNIQUE NOT NULL,
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_type VARCHAR(30) NOT NULL CHECK (target_type IN ('user', 'message', 'recipe', 'restaurant', 'review')),
    target_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    target_item_id VARCHAR(100),
    reason_category VARCHAR(50) NOT NULL CHECK (reason_category IN ('harassment', 'scam', 'fake_profile', 'nudity', 'violence', 'no_show', 'spam')),
    description TEXT,
    evidence_urls_json JSONB DEFAULT '[]'::jsonb,
    urgency_level VARCHAR(20) DEFAULT 'medium' CHECK (urgency_level IN ('high', 'medium', 'low')),
    status VARCHAR(30) DEFAULT 'submitted' CHECK (status IN ('submitted', 'in_review', 'resolved_action_taken', 'resolved_dismissed')),
    assigned_moderator_id UUID REFERENCES users(id),
    resolution_action VARCHAR(50) CHECK (resolution_action IN ('warning_issued', 'avatar_removed', 'temporary_suspend', 'permanent_ban', 'none')),
    resolution_note TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.15 Bảng Chặn người dùng (User Blocks)
CREATE TABLE IF NOT EXISTS user_blocks (
    id BIGSERIAL PRIMARY KEY,
    blocker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (blocker_id, blocked_id)
);

-- 3.16 Bảng Nhật ký lưu vết truy vết (Audit Logs)
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    actor_role VARCHAR(20) NOT NULL,
    action VARCHAR(50) NOT NULL,
    entity_name VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    old_values_json JSONB,
    new_values_json JSONB,
    ip_address VARCHAR(45),
    user_agent VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =================================================================================================
-- 4. TỐI ƯU HÓA CHỈ MỤC (INDEXING STRATEGY)
-- =================================================================================================

-- 4.1 Chỉ mục GiST cho truy vấn địa không gian (Spatial Indexes)
CREATE INDEX IF NOT EXISTS idx_users_location ON users USING GIST (last_known_location);
CREATE INDEX IF NOT EXISTS idx_restaurants_geo ON restaurants USING GIST (geo_point);

-- 4.2 Chỉ mục B-Tree & Filtered Indexes cho hiệu năng quẹt thẻ & tìm kiếm
CREATE INDEX IF NOT EXISTS idx_swipes_from_user ON swipes (from_user_id, swiped_at DESC);
CREATE INDEX IF NOT EXISTS idx_swipes_to_user ON swipes (to_user_id);
CREATE INDEX IF NOT EXISTS idx_matches_users ON matches (user_a_id, user_b_id) WHERE status = 'matched';
CREATE INDEX IF NOT EXISTS idx_messages_convo ON messages (conversation_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_meal_invites_status ON meal_invites (status, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_restaurants_cuisine_city ON restaurants (city, district, cuisine_code);
CREATE INDEX IF NOT EXISTS idx_reports_queue ON user_reports (status, urgency_level, created_at) WHERE status IN ('submitted', 'in_review');

-- =================================================================================================
-- 5. DỮ LIỆU MẪU BAN ĐẦU (SEED DATA CHO MASTER DATA)
-- =================================================================================================

INSERT INTO master_budget_tiers (code, name_vi, min_amount_vnd, max_amount_vnd, display_order)
VALUES 
    ('BUDGET_T1', 'Bình dân (< 50k)', 0, 50000, 1),
    ('BUDGET_T2', 'Phổ thông (50k - 150k)', 50000, 150000, 2),
    ('BUDGET_T3', 'Trung cấp (150k - 300k)', 150000, 300000, 3),
    ('BUDGET_T4', 'Tiệm cận cao cấp (300k - 500k)', 300000, 500000, 4),
    ('BUDGET_T5', 'Cao cấp (> 500k)', 500000, 2000000, 5)
ON CONFLICT (code) DO NOTHING;

INSERT INTO master_cuisines (code, name_vi, name_en, category_group, default_spicy_level, display_order)
VALUES 
    ('VN_TRAD', 'Món Việt truyền thống', 'Traditional Vietnamese', 'Bản địa', 1, 1),
    ('VN_STREET', 'Ăn vặt / Đường phố', 'Street Food', 'Ăn vặt', 2, 2),
    ('KOR_BBQ', 'Món Hàn & BBQ', 'Korean BBQ', 'Châu Á', 3, 3),
    ('JPN_SUSHI', 'Món Nhật & Sushi', 'Japanese & Sushi', 'Châu Á', 1, 4),
    ('CHN_DIM', 'Món Hoa & Dimsum', 'Chinese & Dimsum', 'Châu Á', 2, 5),
    ('THA_HOT', 'Món Thái chua cay', 'Thai Spicy', 'Châu Á', 4, 6),
    ('WES_STEAK', 'Món Âu & Steak', 'Western & Steak', 'Âu Mỹ', 1, 7),
    ('HOTPOT', 'Lẩu các loại', 'Hotpot', 'Đi nhóm', 2, 8),
    ('VEG_PURE', 'Món Chay & Thuần chay', 'Vegetarian & Vegan', 'Healthy', 1, 9),
    ('CAFE_DES', 'Cà phê & Tráng miệng', 'Coffee & Dessert', 'Thư giãn', 1, 10)
ON CONFLICT (code) DO NOTHING;

INSERT INTO master_dietary_rules (code, name_vi, name_en, type, severity_level, display_order)
VALUES 
    ('DIET_VEGAN', 'Thuần chay (Vegan)', 'Vegan', 'diet', 'critical', 1),
    ('DIET_VEGET', 'Ăn chay (Vegetarian)', 'Vegetarian', 'diet', 'high', 2),
    ('DIET_HALAL', 'Chuẩn Hồi giáo (Halal)', 'Halal', 'diet', 'critical', 3),
    ('DIET_KETO', 'Keto / Low-carb', 'Keto / Low-carb', 'diet', 'medium', 4),
    ('ALGY_SHELL', 'Dị ứng hải sản có vỏ', 'Shellfish Allergy', 'allergy', 'critical', 5),
    ('ALGY_PNUT', 'Dị ứng đậu phộng', 'Peanut Allergy', 'allergy', 'critical', 6),
    ('ALGY_EGG', 'Dị ứng trứng gà', 'Egg Allergy', 'allergy', 'high', 7),
    ('ALGY_LACT', 'Không dung nạp Lactose', 'Lactose Intolerant', 'allergy', 'medium', 8)
ON CONFLICT (code) DO NOTHING;
