import math

def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Tính khoảng cách giữa 2 tọa độ GPS theo đường chim bay (đơn vị: km).
    Chuẩn công nghiệp thay thế cho PostGIS ST_Distance.
    """
    if None in (lat1, lon1, lat2, lon2):
        return 3.0 # Khoảng cách mặc định

    R = 6371.0 # Bán kính trái đất tính bằng km
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))

    distance = R * c
    return round(distance, 1)

def calculate_compatibility_score(my_taste, their_taste) -> float:
    """
    Tính điểm tương hợp ẩm thực (0.0 - 100.0) dựa trên:
    - Jaccard similarity trên tập danh mục món ăn (Cuisines) - trọng số 40%
    - Mức độ ăn cay (Spicy Level similarity) - trọng số 20%
    - Phân khúc ngân sách (Budget Tier match) - trọng số 20%
    - Mục đích kết nối (Connection Purpose) - trọng số 20%
    """
    if not my_taste or not their_taste:
        return 75.0

    # 1. Cuisines Jaccard Similarity (40%)
    set_a = set(my_taste.cuisines if hasattr(my_taste, 'cuisines') else [])
    set_b = set(their_taste.cuisines if hasattr(their_taste, 'cuisines') else [])
    
    union = set_a | set_b
    intersection = set_a & set_b
    cuisine_score = (len(intersection) / len(union)) if union else 0.5

    # 2. Spicy Level Difference (20%)
    my_spicy = getattr(my_taste, 'spicy_level', 1) or 1
    their_spicy = getattr(their_taste, 'spicy_level', 1) or 1
    spicy_diff = abs(my_spicy - their_spicy)
    spicy_score = max(0.0, 1.0 - (spicy_diff / 4.0))

    # 3. Budget Tier Similarity (20%)
    tier_map = {"BUDGET_T1": 1, "BUDGET_T2": 2, "BUDGET_T3": 3, "BUDGET_T4": 4, "BUDGET_T5": 5}
    my_tier = tier_map.get(getattr(my_taste, 'budget_tier', 'BUDGET_T2'), 2)
    their_tier = tier_map.get(getattr(their_taste, 'budget_tier', 'BUDGET_T2'), 2)
    tier_diff = abs(my_tier - their_tier)
    budget_score = 1.0 if tier_diff == 0 else (0.6 if tier_diff == 1 else 0.2)

    # 4. Connection Purpose (20%)
    my_purpose = getattr(my_taste, 'connection_purpose', 'food_buddy')
    their_purpose = getattr(their_taste, 'connection_purpose', 'food_buddy')
    purpose_score = 1.0 if my_purpose == their_purpose else 0.5

    total = (
        cuisine_score * 0.40 +
        spicy_score * 0.20 +
        budget_score * 0.20 +
        purpose_score * 0.20
    ) * 100.0

    return round(min(100.0, max(50.0, total)), 1)
