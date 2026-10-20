import sqlite3
import datetime

conn = sqlite3.connect('C:/Users/Smollan BI team/Pictures/foodmate/backend/foodmate.db')
cur = conn.cursor()

# 1. Clean up duplicate matches & conversations
cur.execute("DELETE FROM messages")
cur.execute("DELETE FROM conversations")
cur.execute("DELETE FROM matches")

# 2. Insert or update user-thy-01
cur.execute("SELECT id FROM users WHERE id = 'user-thy-01'")
if not cur.fetchone():
    cur.execute("""
        INSERT INTO users (id, phone_number, password, full_name, gender, date_of_birth, avatar_url, bio, occupation, role, status, is_verified, trust_score, latitude, longitude, created_at)
        VALUES ('user-thy-01', '0901234568', '123456', 'Lê Thị Ngọc Thy', 'female', '2004-01-01', './thy_avatar.png', 'Tìm bạn ăn cùng bàn!', 'Dược Sĩ', 'member', 'active', 1, 100, 10.7769, 106.7009, ?)
    """, (datetime.datetime.utcnow(),))
    
    cur.execute("""
        INSERT INTO user_taste_profiles (id, user_id, cuisines_json, spicy_level, budget_tier, connection_purpose, favorite_dish, max_distance_km)
        VALUES ('taste_thy_01', 'user-thy-01', '["VN_STREET", "VN_TRAD", "KOR_BBQ"]', 2, 'BUDGET_T2', 'food_buddy', 'Gà Rán Jollibee', 10)
    """)

# Ensure Sang has avatar ./sang_avatar.png
cur.execute("UPDATE users SET avatar_url = './sang_avatar.png' WHERE id = 'user-f9e57803'")

# 3. Create SINGLE unified match & conversation between Sang and Thy
canonical_conv_id = "chat_user-f9e57803_user-thy-01"
match_id = "match_sang_thy"
cur.execute("""
    INSERT INTO matches (id, user_a_id, user_b_id, status, matched_at)
    VALUES (?, 'user-f9e57803', 'user-thy-01', 'matched', ?)
""", (match_id, datetime.datetime.utcnow()))

cur.execute("""
    INSERT INTO conversations (id, match_id, last_message_preview, last_message_at, is_active)
    VALUES (?, ?, 'Chào bạn! Mình thấy bạn cũng thích Bún Đậu! Rất vui được kết nối nhé 🍜', ?, 1)
""", (canonical_conv_id, match_id, datetime.datetime.utcnow()))

# Add initial welcome message
cur.execute("""
    INSERT INTO messages (conversation_id, sender_id, content, sent_at, is_read)
    VALUES (?, 'user-f9e57803', 'Chào bạn! Mình thấy bạn cũng thích Bún Đậu! Rất vui được kết nối nhé 🍜', ?, 1)
""", (canonical_conv_id, datetime.datetime.utcnow()))

conn.commit()
print("Initialized clean SQLite match and conversation between Sang and Thy!")
conn.close()
