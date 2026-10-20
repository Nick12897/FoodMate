import json
from sqlalchemy.orm import Session
from .models import (
    MasterCuisine, MasterBudgetTier, User, UserTasteProfile,
    Restaurant, Match, Conversation, Message, MealInvite
)

def seed_initial_data(db: Session):
    # 1. Master Budget Tiers
    if not db.query(MasterBudgetTier).first():
        tiers = [
            MasterBudgetTier(code="BUDGET_T1", name_vi="Bình dân (< 50k)", min_amount_vnd=0, max_amount_vnd=50000, display_order=1),
            MasterBudgetTier(code="BUDGET_T2", name_vi="Phổ thông (50k - 150k)", min_amount_vnd=50000, max_amount_vnd=150000, display_order=2),
            MasterBudgetTier(code="BUDGET_T3", name_vi="Trung cấp (150k - 300k)", min_amount_vnd=150000, max_amount_vnd=300000, display_order=3),
            MasterBudgetTier(code="BUDGET_T4", name_vi="Tiệm cận cao cấp (300k - 500k)", min_amount_vnd=300000, max_amount_vnd=500000, display_order=4),
            MasterBudgetTier(code="BUDGET_T5", name_vi="Cao cấp (> 500k)", min_amount_vnd=500000, max_amount_vnd=2000000, display_order=5),
        ]
        db.add_all(tiers)

    # 2. Master Cuisines
    if not db.query(MasterCuisine).first():
        cuisines = [
            MasterCuisine(code="VN_TRAD", name_vi="Món Việt truyền thống", name_en="Traditional Vietnamese", icon="🍲", category_group="Bản địa", default_spicy_level=1, display_order=1),
            MasterCuisine(code="VN_STREET", name_vi="Ăn vặt / Đường phố", name_en="Street Food", icon="🍢", category_group="Ăn vặt", default_spicy_level=2, display_order=2),
            MasterCuisine(code="KOR_BBQ", name_vi="Món Hàn & BBQ", name_en="Korean BBQ", icon="🥩", category_group="Châu Á", default_spicy_level=3, display_order=3),
            MasterCuisine(code="JPN_SUSHI", name_vi="Món Nhật & Sushi", name_en="Japanese & Sushi", icon="🍣", category_group="Châu Á", default_spicy_level=1, display_order=4),
            MasterCuisine(code="CHN_DIM", name_vi="Món Hoa & Dimsum", name_en="Chinese & Dimsum", icon="🥟", category_group="Châu Á", default_spicy_level=2, display_order=5),
            MasterCuisine(code="THA_HOT", name_vi="Món Thái chua cay", name_en="Thai Spicy", icon="🌶️", category_group="Châu Á", default_spicy_level=4, display_order=6),
            MasterCuisine(code="WES_STEAK", name_vi="Món Âu & Steak", name_en="Western & Steak", icon="🍷", category_group="Âu Mỹ", default_spicy_level=1, display_order=7),
            MasterCuisine(code="HOTPOT", name_vi="Lẩu các loại", name_en="Hotpot", icon="🥘", category_group="Đi nhóm", default_spicy_level=2, display_order=8),
            MasterCuisine(code="VEG_PURE", name_vi="Món Chay & Healthy", name_en="Vegetarian & Healthy", icon="🥗", category_group="Healthy", default_spicy_level=1, display_order=9),
            MasterCuisine(code="CAFE_DES", name_vi="Cà phê & Tráng miệng", name_en="Coffee & Dessert", icon="☕", category_group="Thư giãn", default_spicy_level=1, display_order=10),
        ]
        db.add_all(cuisines)

    # 3. Restaurants
    if not db.query(Restaurant).first():
        restaurants = [
            Restaurant(
                id="rest-01",
                name="Lẩu Nấm An Nhiên",
                address_full="71 Mạc Đĩnh Chi, P. Đa Kao, Quận 1, TP.HCM",
                district="Quận 1",
                city="Hồ Chí Minh",
                latitude=10.7831,
                longitude=106.6982,
                cuisine_code="HOTPOT",
                price_tier="BUDGET_T3",
                avg_rating=4.8,
                review_count=142,
                avatar_url="https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=80",
                tags_json=json.dumps(["Thanh đạm", "Không gian ấm cúng", "Lẩu 2 người"]),
                is_partner=True,
                partner_discount_desc="Giảm 10% cho thành viên FoodMate Check-in",
            ),
            Restaurant(
                id="rest-02",
                name="Gyu-Kaku Japanese BBQ",
                address_full="15 Lê Thánh Tôn, Bến Nghé, Quận 1, TP.HCM",
                district="Quận 1",
                city="Hồ Chí Minh",
                latitude=10.7795,
                longitude=106.7038,
                cuisine_code="KOR_BBQ",
                price_tier="BUDGET_T4",
                avg_rating=4.7,
                review_count=289,
                avatar_url="https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
                tags_json=json.dumps(["Thịt bò hảo hạng", "Buffet nướng", "View đẹp"]),
                is_partner=True,
                partner_discount_desc="Tặng tráng miệng kem matcha",
            ),
            Restaurant(
                id="rest-03",
                name="Som Tum Thai Bistro",
                address_full="29 Lê Duẩn, Bến Nghé, Quận 1, TP.HCM",
                district="Quận 1",
                city="Hồ Chí Minh",
                latitude=10.7818,
                longitude=106.7001,
                cuisine_code="THA_HOT",
                price_tier="BUDGET_T3",
                avg_rating=4.6,
                review_count=110,
                avatar_url="https://images.unsplash.com/photo-1559847844-5315695dadae?w=600&auto=format&fit=crop&q=80",
                tags_json=json.dumps(["Cay nồng đúng điệu", "Gỏi đu đủ giòn", "Trà sữa Thái"]),
                is_partner=False,
            ),
            Restaurant(
                id="rest-04",
                name="Phở Thìn 13 Lò Đúc (Chi nhánh Sài Gòn)",
                address_full="110 Hai Bà Trưng, Đa Kao, Quận 1, TP.HCM",
                district="Quận 1",
                city="Hồ Chí Minh",
                latitude=10.7845,
                longitude=106.6970,
                cuisine_code="VN_TRAD",
                price_tier="BUDGET_T2",
                avg_rating=4.5,
                review_count=350,
                avatar_url="https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600&auto=format&fit=crop&q=80",
                tags_json=json.dumps(["Phở bò tái lăn", "Nước dùng đậm đà"]),
                is_partner=False,
            )
        ]
        db.add_all(restaurants)

    # 4. Users & Taste Profiles (2 Tài khoản thực tế của người dùng: Sang & Thy)
    # Tài khoản 1: Lương Đình Khánh Sang
    sang = db.query(User).filter((User.id == "user-f9e57803") | (User.full_name.like("%Khánh Sang%"))).first()
    if not sang:
        sang = User(
            id="user-f9e57803",
            phone_number="0969560183",
            full_name="Lương Đình Khánh Sang",
            gender="male",
            date_of_birth="1997-01-01",
            avatar_url="/FoodMate/sang_avatar.png",
            bio="Yêu thích Bún Đậu, và các món Chiên",
            occupation="IT",
            role="member",
            status="active",
            is_verified=True,
            trust_score=100,
            latitude=10.7769,
            longitude=106.7009
        )
        db.add(sang)
        db.commit()
        db.refresh(sang)

        sang_taste = UserTasteProfile(
            user_id=sang.id,
            cuisines_json=json.dumps(["VN_TRAD", "THA_HOT"]),
            spicy_level=2,
            budget_tier="BUDGET_T2",
            connection_purpose="food_buddy",
            favorite_dish="Bún Đậu & Món Chiên",
            max_distance_km=20
        )
        db.add(sang_taste)
        db.commit()

    # Tài khoản 2: Lê Thị Ngọc Thy
    thy = db.query(User).filter((User.id == "user-thy-01") | (User.full_name.like("%Ngọc Thy%"))).first()
    if not thy:
        thy = User(
            id="user-thy-01",
            phone_number="0901234568",
            full_name="Lê Thị Ngọc Thy",
            gender="female",
            date_of_birth="2004-05-10",
            avatar_url="/FoodMate/thy_avatar.png",
            bio="Tìm bạn ăn cùng bàn!",
            occupation="Dược Sĩ",
            role="member",
            status="active",
            is_verified=True,
            trust_score=100,
            latitude=10.7810,
            longitude=106.6980
        )
        db.add(thy)
        db.commit()
        db.refresh(thy)

        thy_taste = UserTasteProfile(
            user_id=thy.id,
            cuisines_json=json.dumps(["VN_STREET", "VN_TRAD", "KOR_BBQ"]),
            spicy_level=2,
            budget_tier="BUDGET_T2",
            connection_purpose="food_buddy",
            favorite_dish="Gà Rán Jollibee",
            max_distance_km=10
        )
        db.add(thy_taste)
        db.commit()

    # Xóa bất kỳ tài khoản demo cũ 'user-me' nếu còn sót lại
    db.query(UserTasteProfile).filter(UserTasteProfile.user_id == "user-me").delete()
    db.query(User).filter(User.id == "user-me").delete()
    db.commit()
