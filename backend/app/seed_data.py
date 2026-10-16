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

    # 4. Users & Taste Profiles
    if not db.query(User).filter(User.id == "user-me").first():
        # User hiện tại: Minh Khoa
        me = User(
            id="user-me",
            phone_number="+84901234567",
            full_name="Minh Khoa",
            gender="male",
            date_of_birth="2001-05-15",
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
            bio="Mê lẩu nấm & đồ nướng Hàn Quốc, tìm bạn ăn chung mỗi tối cuối tuần quanh Q1 & Bình Thạnh!",
            occupation="Software Engineer",
            is_verified=True,
            trust_score=98,
            latitude=10.7769,
            longitude=106.7009
        )
        me_taste = UserTasteProfile(
            user_id="user-me",
            cuisines_json=json.dumps(["VN_TRAD", "KOR_BBQ", "HOTPOT"]),
            spicy_level=3,
            budget_tier="BUDGET_T3",
            connection_purpose="food_buddy",
            favorite_dish="Lẩu Nấm Bò Wagyu",
            max_distance_km=10
        )
        db.add(me)
        db.add(me_taste)

        # Candidate 1: Lê Mai Phương (Cực kỳ hợp gu)
        u1 = User(
            id="user-02",
            phone_number="+84901234568",
            full_name="Lê Mai Phương",
            gender="female",
            date_of_birth="2002-08-20",
            avatar_url="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80",
            bio="Đam mê đồ cay cấp 3 trở lên! Cuối tuần thích lang thang hàng quán hoặc ghé quán nướng thơm nức.",
            occupation="Content Creator",
            is_verified=True,
            trust_score=96,
            latitude=10.7800,
            longitude=106.7020
        )
        u1_taste = UserTasteProfile(
            user_id="user-02",
            cuisines_json=json.dumps(["THA_HOT", "KOR_BBQ", "HOTPOT"]),
            spicy_level=4,
            budget_tier="BUDGET_T2",
            connection_purpose="food_buddy",
            favorite_dish="Mì cay hải sản & Lẩu Tomyum",
            max_distance_km=10
        )
        db.add(u1)
        db.add(u1_taste)

        # Candidate 2: Hoàng Nam
        u2 = User(
            id="user-03",
            phone_number="+84901234569",
            full_name="Hoàng Nam",
            gender="male",
            date_of_birth="2000-02-10",
            avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80",
            bio="Thích khám phá các quán cà phê specialty yên tĩnh và quán Nhật tinh tế. Ăn thanh đạm, ít dầu mỡ.",
            occupation="UX/UI Designer",
            is_verified=True,
            trust_score=94,
            latitude=10.7950,
            longitude=106.7150
        )
        u2_taste = UserTasteProfile(
            user_id="user-03",
            cuisines_json=json.dumps(["JPN_SUSHI", "CAFE_DES", "VN_TRAD"]),
            spicy_level=1,
            budget_tier="BUDGET_T3",
            connection_purpose="friendship",
            favorite_dish="Sashimi Cá Hồi & Matcha Latte",
            max_distance_km=15
        )
        db.add(u2)
        db.add(u2_taste)

        # Candidate 3: Khánh Linh
        u3 = User(
            id="user-04",
            phone_number="+84901234570",
            full_name="Khánh Linh",
            gender="female",
            date_of_birth="2003-11-05",
            avatar_url="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop&q=80",
            bio="Team mê món cuốn và ăn vặt Sài Gòn. Ai biết quán ốc nào tươi ngon kéo mình đi với nha!",
            occupation="Marketing Specialist",
            is_verified=False,
            trust_score=90,
            latitude=10.7740,
            longitude=106.6900
        )
        u3_taste = UserTasteProfile(
            user_id="user-04",
            cuisines_json=json.dumps(["VN_STREET", "VN_TRAD", "HOTPOT"]),
            spicy_level=2,
            budget_tier="BUDGET_T2",
            connection_purpose="food_buddy",
            favorite_dish="Bánh tráng cuốn thịt heo & Ốc bươu",
            max_distance_km=8
        )
        db.add(u3)
        db.add(u3_taste)

        # 5. Khởi tạo 1 Match & 1 Cuộc hội thoại sẵn có giữa Minh Khoa và Mai Phương
        match = Match(
            id="match-01",
            user_a_id="user-me",
            user_b_id="user-02",
            status="matched"
        )
        db.add(match)

        conv = Conversation(
            id="conv-01",
            match_id="match-01",
            last_message_preview="Ok chốt lịch 19h tối Thứ Bảy nhé Khoa ơi! 🎉",
        )
        db.add(conv)

        # Lịch sử chat mẫu
        msgs = [
            Message(conversation_id="conv-01", sender_id="user-02", content="Chào Khoa! Thấy bạn cũng mê lẩu với đồ nướng cay hả? 😋"),
            Message(conversation_id="conv-01", sender_id="user-me", content="Đúng rồi nè Phương! Mình ăn được cay mức 3 á, cuối tuần này bạn có rảnh đi ăn không?"),
            Message(conversation_id="conv-01", sender_id="user-02", content="Trùng hợp ghê, cuối tuần này mình đang thèm lẩu nấm hoặc lẩu Thái nè!"),
            Message(conversation_id="conv-01", sender_id="user-me", content="Mình mới gửi lời mời qua quán Lẩu Nấm An Nhiên nè, bạn xem thử nhé!"),
            Message(conversation_id="conv-01", sender_id="user-02", content="Ok chốt lịch 19h tối Thứ Bảy nhé Khoa ơi! 🎉"),
        ]
        db.add_all(msgs)

        # 6. Khởi tạo 1 Cuộc hẹn ăn uống chính thức
        invite = MealInvite(
            id="inv-101",
            invite_code="INV-202610-8831",
            inviter_id="user-me",
            invitee_id="user-02",
            restaurant_id="rest-01",
            scheduled_at="19:00 - Tối Thứ Bảy này",
            payment_policy="Chia đôi hóa đơn (50/50)",
            note="Mình đi lẩu nấm nhé, quán này thanh đạm chuẩn gu cả 2 đứa luôn!",
            status="accepted",
            inviter_checked_in=True,
            invitee_checked_in=False,
            share_safety_token="sec_safe_token_88992"
        )
        db.add(invite)

    db.commit()
