# ĐẶC TẢ GIAO DIỆN LẬP TRÌNH ỨNG DỤNG (API & WEBSOCKET SPECIFICATION)
## DỰ ÁN: FOODMATE
**Phiên bản:** 1.0  
**Giao thức:** RESTful (HTTP/2 over TLS 1.3) & WebSocket (WSS)  
**Định dạng dữ liệu:** JSON (`application/json; charset=utf-8`)  
**Chuẩn xác thực:** JWT Bearer Token (Authorization: Bearer `<access_token>`)

---

## 1. NGUYÊN TẮC THIẾT KẾ & ĐỊNH DẠNG CHUẨN

### 1.1 Cấu Trúc URL Chuẩn (Base URL)
- Môi trường Phát triển (Development): `https://dev-api.foodmate.vn/api/v1`
- Môi trường Thử nghiệm (Staging): `https://staging-api.foodmate.vn/api/v1`
- Môi trường Chính thức (Production): `https://api.foodmate.vn/api/v1`
- Cổng kết nối WebSocket: `wss://api.foodmate.vn/ws/chat`

### 1.2 Cấu Trúc Phản Hồi Tiêu Chuẩn (Standard Response Envelope)
Mọi phản hồi từ hệ thống RESTful API đều tuân thủ cấu trúc chuẩn thống nhất:

```json
{
  "success": true,
  "code": 200,
  "message": "Thao tác thành công",
  "data": {},
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "timestamp": "2026-10-16T14:00:00Z"
  }
}
```

Trường hợp xảy ra lỗi:
```json
{
  "success": false,
  "code": 400,
  "error_code": "INVALID_OTP_CODE",
  "message": "Mã xác thực OTP không chính xác hoặc đã hết hạn",
  "details": [
    {
      "field": "otp_code",
      "issue": "Mã phải gồm đúng 6 chữ số"
    }
  ],
  "timestamp": "2026-10-16T14:00:00Z"
}
```

---

## 2. DANH MỤC API ENDPOINTS CHI TIẾT

### 2.1 Module Xác Thực & Tài Khoản (Authentication & Account)

#### `POST /auth/otp/send`
- **Mục đích**: Gửi mã OTP 6 chữ số qua SMS đến số điện thoại.
- **Rate Limit**: Tối đa 5 lần/phút trên một IP/SĐT.
- **Request Body**:
```json
{
  "phone_number": "+84901234567"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Mã OTP đã được gửi thành công",
  "data": {
    "session_id": "otp_sess_9f8b2a3c",
    "expires_in_seconds": 120
  }
}
```

#### `POST /auth/otp/verify`
- **Mục đích**: Xác thực mã OTP và đăng nhập/tạo tài khoản.
- **Request Body**:
```json
{
  "phone_number": "+84901234567",
  "session_id": "otp_sess_9f8b2a3c",
  "otp_code": "582914"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "is_new_user": false,
    "access_token": "eyJhbGciOiJIUzI1Ni...",
    "refresh_token": "def50200...",
    "token_type": "Bearer",
    "expires_in": 7200,
    "user": {
      "id": "e6a2c2d4-1a2b-4c3d-8e9f-0123456789ab",
      "phone_number": "+84901234567",
      "full_name": "Nguyễn Minh Khoa",
      "avatar_url": "https://cdn.foodmate.vn/avatars/user1.webp",
      "is_verified": true,
      "role": "member"
    }
  }
}
```

#### `POST /auth/token/refresh`
- **Mục đích**: Cấp lại Access Token mới bằng Refresh Token xoay vòng.
- **Request Body**: `{ "refresh_token": "def50200..." }`

#### `POST /auth/social-login`
- **Mục đích**: Đăng nhập hoặc đăng ký an toàn bằng Google ID Token (OIDC) hoặc tài khoản mạng xã hội (Facebook/Apple).
- **Request Body**:
```json
{
  "provider": "google",
  "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6...",
  "full_name": "Nguyễn Minh Quân",
  "email": "minhquan.foodie@gmail.com",
  "avatar_url": "https://lh3.googleusercontent.com/a/...",
  "social_id": "108273648192837465"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Đăng nhập qua Google thành công!",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1Ni...",
    "token_type": "Bearer",
    "user": {
      "id": "user-google-108273",
      "phone_number": "+84_google_108273648",
      "full_name": "Nguyễn Minh Quân",
      "email": "minhquan.foodie@gmail.com",
      "avatar_url": "https://lh3.googleusercontent.com/a/...",
      "role": "member",
      "is_verified": true,
      "trust_score": 100,
      "taste_profile": {
        "cuisines": ["VN_TRAD", "HOTPOT"],
        "spicy_level": 2,
        "budget_tier": "BUDGET_T2",
        "favorite_dish": "Ẩm thực Việt & Lẩu",
        "connection_purpose": "food_buddy",
        "max_distance_km": 10
      }
    }
  }
}
```
*(Chi tiết hướng dẫn lấy OAuth Client ID và tích hợp xem tại `foodmate/docs/oauth_integration_guide.md`)*


---

### 2.2 Module Hồ Sơ & Khẩu Vị (Profile & Taste Management)

#### `GET /profile/me`
- **Mục đích**: Lấy toàn bộ thông tin hồ sơ và khẩu vị của người dùng hiện tại.
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "e6a2c2d4-1a2b-4c3d-8e9f-0123456789ab",
    "full_name": "Nguyễn Minh Khoa",
    "gender": "male",
    "age": 25,
    "avatar_url": "https://cdn.foodmate.vn/avatars/user1.webp",
    "gallery": [
      "https://cdn.foodmate.vn/gallery/pic1.webp",
      "https://cdn.foodmate.vn/gallery/pic2.webp"
    ],
    "bio": "Mê lẩu nấm và đồ nướng Hàn Quốc, tìm bạn ăn chung mỗi tối cuối tuần quanh Q1!",
    "taste_profile": {
      "cuisines": ["VN_TRAD", "KOR_BBQ", "HOTPOT"],
      "spicy_level": 3,
      "taste_preferences": ["savory", "sour"],
      "dietary_restrictions": [],
      "allergies": ["ALGY_SHELL"],
      "budget_tier": "BUDGET_T3",
      "available_times": ["lunch", "dinner", "weekend"],
      "connection_purpose": "food_buddy",
      "favorite_dish": "Lẩu Nấm Bò Wagyu",
      "max_distance_km": 10
    },
    "trust_score": 98,
    "is_verified": true
  }
}
```

#### `PUT /profile/taste`
- **Mục đích**: Cập nhật thông số khẩu vị, dị ứng và ngân sách.
- **Request Body**:
```json
{
  "cuisines": ["VN_TRAD", "JPN_SUSHI", "VEG_PURE"],
  "spicy_level": 2,
  "dietary_restrictions": ["DIET_VEGET"],
  "allergies": ["ALGY_PNUT"],
  "budget_tier": "BUDGET_T2",
  "available_times": ["dinner", "weekend"],
  "connection_purpose": "friendship",
  "max_distance_km": 8
}
```

---

### 2.3 Module Khám Phá & Quẹt Thẻ (Discovery & Swiping)

#### `GET /discovery/feed`
- **Mục đích**: Lấy danh sách thẻ ứng viên tiềm năng phù hợp với khẩu vị và bán kính GPS của người dùng.
- **Query Params**:
  - `latitude`: `10.7769` (Bắt buộc)
  - `longitude`: `106.7009` (Bắt buộc)
  - `limit`: `10`
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "cards": [
      {
        "user_id": "c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f",
        "full_name": "Lê Mai Phương",
        "age": 24,
        "avatar_url": "https://cdn.foodmate.vn/avatars/user2.webp",
        "photos": ["https://cdn.foodmate.vn/gallery/user2_1.webp"],
        "distance_km": 2.4,
        "compatibility_score": 92.5,
        "favorite_dish": "Mì cay Seoul cấp độ 3",
        "cuisines": ["KOR_BBQ", "VN_STREET", "HOTPOT"],
        "spicy_level": 3,
        "budget_tier": "BUDGET_T2",
        "connection_purpose": "food_buddy",
        "is_verified": true
      }
    ],
    "remaining_likes_today": 42
  }
}
```

#### `POST /discovery/swipe`
- **Mục đích**: Gửi hành động quẹt thẻ (Like / Pass).
- **Request Body**:
```json
{
  "target_user_id": "c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f",
  "action": "like"
}
```
- **Response (200 OK - Trường hợp kích hoạt Mutual Match)**:
```json
{
  "success": true,
  "data": {
    "is_match": true,
    "match": {
      "match_id": "m1112223-4455-6677-8899-aabbccddeeff",
      "conversation_id": "c9988776-5544-3322-1100-ffeeddccbbaa",
      "matched_user": {
        "id": "c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f",
        "full_name": "Lê Mai Phương",
        "avatar_url": "https://cdn.foodmate.vn/avatars/user2.webp"
      },
      "matched_at": "2026-10-16T14:15:30Z"
    }
  }
}
```

---

### 2.4 Module Lời Mời Đi Ăn (Meal Invites & Safe Dining)

#### `POST /meal-invites`
- **Mục đích**: Khởi tạo lời mời đi ăn chính thức gửi đến đối tượng đã match.
- **Request Body**:
```json
{
  "conversation_id": "c9988776-5544-3322-1100-ffeeddccbbaa",
  "invitee_id": "c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f",
  "restaurant_id": "r7766554-3322-1100-9988-aabbccddeeff",
  "scheduled_at": "2026-10-18T19:00:00+07:00",
  "payment_policy": "split_50_50",
  "note": "Mình đi lẩu nấm nhé, quán này thanh đạm chuẩn gu cả 2 đứa luôn!"
}
```
- **Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "invite_id": "inv_123456",
    "invite_code": "INV-202610-8831",
    "status": "pending",
    "scheduled_at": "2026-10-18T19:00:00+07:00",
    "restaurant": {
      "name": "Lẩu Nấm An Nhiên",
      "address": "71 Mạc Đĩnh Chi, P. Đa Kao, Quận 1, TP.HCM"
    },
    "share_safety_url": "https://foodmate.vn/safety/inv_123456?token=sec_token_99182"
  }
}
```

#### `PUT /meal-invites/{id}/respond`
- **Mục đích**: Người nhận chấp thuận hoặc từ chối lời mời.
- **Request Body**:
```json
{
  "action": "accept"
}
```

#### `POST /meal-invites/{id}/check-in`
- **Mục đích**: Gửi tọa độ GPS thực tế để Check-in tại quán ăn.
- **Request Body**:
```json
{
  "latitude": 10.7831,
  "longitude": 106.6982
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "is_checked_in": true,
    "distance_to_restaurant_meters": 35,
    "partner_checked_in": true,
    "invite_status": "checked_in",
    "message": "Cả hai bạn đã có mặt tại quán! Chúc hai bạn bữa ăn ngon miệng."
  }
}
```

#### `POST /meal-invites/{id}/review-partner`
- **Mục đích**: Đánh giá chấm điểm bạn ăn sau bữa gặp.
- **Request Body**:
```json
{
  "punctuality_rating": 5,
  "politeness_rating": 5,
  "compatibility_rating": 4,
  "positive_tags": ["on_time", "polite", "good_humor", "split_fair"],
  "private_comment": "Bạn Phương rất hòa đồng và đúng giờ hẹn."
}
```

---

## 3. ĐẶC TẢ GIAO THỨC WEBSOCKET (REALTIME MESSAGING & EVENTS)

### 3.1 Thiết Lập Kết Nối & Xác Thực (Connection Handshake)
- **URL**: `wss://api.foodmate.vn/ws/chat?token=<jwt_access_token>`
- Khi client kết nối, máy chủ kiểm tra JWT. Nếu hợp lệ, máy chủ gán connection vào room tương ứng với `user_id` và trả sự kiện `connected`.

### 3.2 Khung Dữ Liệu Sự Kiện (Socket Event Frame)
Mọi bản tin socket có cấu trúc:
```json
{
  "event": "tên_sự_kiện",
  "payload": {}
}
```

### 3.3 Danh Mục Sự Kiện WebSocket Chính

| Tên Sự Kiện | Chiều Gửi | Mô Tả | Cấu Trúc Payload Mẫu |
| :--- | :---: | :--- | :--- |
| `send_message` | Client -> Server | Gửi một tin nhắn mới | `{"conversation_id": "...", "content": "Chào bạn!", "type": "text"}` |
| `new_message` | Server -> Client | Phân phối tin nhắn đến người nhận | `{"message_id": 1029, "sender_id": "...", "content": "Chào bạn!", "sent_at": "..."}` |
| `typing` | Client -> Server | Báo hiệu đang gõ phím | `{"conversation_id": "...", "is_typing": true}` |
| `user_typing` | Server -> Client | Thông báo cho đối phương đang gõ | `{"conversation_id": "...", "user_id": "...", "is_typing": true}` |
| `message_read` | Client -> Server | Đánh dấu đã đọc tin nhắn | `{"conversation_id": "...", "last_read_message_id": 1029}` |
| `meal_invite_updated` | Server -> Client | Thông báo trạng thái cuộc hẹn đổi | `{"invite_id": "...", "new_status": "accepted"}` |
| `emergency_sos` | Client -> Server | Kích hoạt cảnh báo nguy hiểm khẩn | `{"invite_id": "...", "latitude": 10.78, "longitude": 106.69}` |
