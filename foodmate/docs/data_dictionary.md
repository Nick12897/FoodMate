# TỪ ĐIỂN DỮ LIỆU DOANH NGHIỆP (ENTERPRISE RICH DATA DICTIONARY)
## DỰ ÁN: FOODMATE
**Phiên bản:** 1.0  
**Ngày phát hành:** 16/10/2026  
**Chuẩn thiết kế:** Enterprise Rich Schema (Bắt buộc tối thiểu 10–15 trường nghiệp vụ thực tế cho mỗi thực thể, hỗ trợ Audit Trail, Soft Delete, Extensibility JSON và PostGIS).

---

## DANH MỤC CÁC THỰC THỂ DỮ LIỆU (ENTITIES OVERVIEW)

1. **`users`**: Tài khoản người dùng gốc, trạng thái xác minh, thông tin bảo mật.
2. **`user_taste_profiles`**: Hồ sơ khẩu vị, dị ứng, mức cay, ngân sách, khung giờ rảnh.
3. **`swipes`**: Lịch sử quẹt thẻ (Like / Pass / SuperLike), ghi nhận thời gian và ngữ cảnh.
4. **`matches`**: Ghép đôi thành công hai chiều giữa hai người dùng, quản lý vòng đời match.
5. **`conversations`**: Phòng hội thoại trò chuyện 1-1 và tin nhắn nhóm (sau này).
6. **`messages`**: Tin nhắn chi tiết (text, image, restaurant card, recipe card, location).
7. **`restaurants`**: Danh bạ quán ăn, vị trí địa lý PostGIS, thông tin đối tác và giờ mở cửa.
8. **`restaurant_reviews`**: Đánh giá, chấm điểm và gắn tag phân loại quán ăn.
9. **`recipes`**: Công thức nấu ăn cộng đồng, khẩu phần, thời gian, độ khó.
10. **`recipe_ingredients`**: Chi tiết nguyên liệu định lượng của từng công thức.
11. **`recipe_steps`**: Các bước hướng dẫn nấu ăn tuần tự kèm hình ảnh/video.
12. **`meal_invites`**: Lời mời đi ăn chính thức, địa điểm, thời gian, hình thức chia tiền.
13. **`dining_reviews`**: Đánh giá bạn ăn sau buổi hẹn thực tế (đúng giờ, lịch sự, uy tín).
14. **`user_reports`**: Báo cáo vi phạm an toàn, quấy rối, gian lận kèm bằng chứng.
15. **`user_blocks`**: Quản lý quan hệ chặn hai chiều giữa các người dùng.
16. **`badges` & `user_badges`**: Hệ thống huy hiệu và hộ chiếu ẩm thực (Food Passport).
17. **`audit_logs`**: Nhật ký lưu vết truy vết mọi thao tác nhạy cảm trong hệ thống.

---

## CHI TIẾT TỪ ĐIỂN DỮ LIỆU TỪNG THỰC THỂ

### 1. Bảng: `users` (Tài Khoản & Thông Tin Cá Nhân Gốc)
Bảng lưu trữ thông tin định danh người dùng cốt lõi, phục vụ xác thực và phân quyền RBAC.

| STT | Tên Trường (Field Name) | Kiểu Dữ Liệu | Bắt Buộc | Ràng Buộc / Giá Trị Mặc Định | Mô Tả Nghiệp Vụ |
| :---: | :--- | :--- | :---: | :--- | :--- |
| 1 | `id` | `UUID` | Có | PK, `gen_random_uuid()` | Định danh duy nhất toàn cầu của người dùng. |
| 2 | `phone_number` | `VARCHAR(20)` | Có | Unique, Chuẩn E.164 (+84...) | Số điện thoại dùng để đăng nhập và nhận mã OTP. |
| 3 | `email` | `VARCHAR(255)` | Không | Unique | Địa chỉ email liên hệ và nhận hóa đơn điện tử. |
| 4 | `password_hash` | `VARCHAR(255)` | Không | Hashed Argon2id/BCrypt | Mật khẩu tài khoản (nếu dùng đăng nhập mật khẩu). |
| 5 | `full_name` | `VARCHAR(100)` | Có | — | Họ tên hiển thị của người dùng trên ứng dụng. |
| 6 | `nickname` | `VARCHAR(50)` | Không | — | Biệt danh thân mật dùng trong chat. |
| 7 | `gender` | `VARCHAR(20)` | Có | Enum: `male`, `female`, `non_binary`, `other` | Giới tính phục vụ thuật toán lọc kết nối. |
| 8 | `date_of_birth` | `DATE` | Có | Tuổi $\ge 18$ tại thời điểm đăng ký | Ngày sinh (hệ thống tự động tính tuổi, không lưu tuổi cứng). |
| 9 | `avatar_url` | `VARCHAR(500)` | Có | URL hình ảnh hợp lệ | Đường dẫn ảnh đại diện chính hiển thị trên thẻ khám phá. |
| 10 | `gallery_json` | `JSONB` | Không | Default: `[]` | Danh sách các URL ảnh bổ sung (tối đa 5 ảnh). |
| 11 | `bio` | `TEXT` | Không | Tối đa 500 ký tự | Lời giới thiệu ngắn gọn về bản thân và phong cách sống. |
| 12 | `occupation` | `VARCHAR(100)` | Không | — | Nghề nghiệp / Công việc hiện tại (dân văn phòng, designer...). |
| 13 | `role` | `VARCHAR(20)` | Có | Default: `member` (`guest`, `member`, `partner`, `moderator`, `admin`) | Vai trò người dùng trong hệ thống (RBAC). |
| 14 | `status` | `VARCHAR(20)` | Có | Default: `active` (`active`, `suspended`, `banned`, `pending_deletion`) | Trạng thái tài khoản người dùng. |
| 15 | `is_verified` | `BOOLEAN` | Có | Default: `false` | Đánh dấu người dùng đã vượt qua xác thực eKYC (huy hiệu tích xanh). |
| 16 | `trust_score` | `INT` | Có | Default: `100`, Min: `0`, Max: `100` | Điểm số tin cậy cá nhân (bị trừ khi bùng hẹn/quấy rối). |
| 17 | `emergency_contact_phone` | `VARCHAR(20)` | Không | — | Số điện thoại người thân để gửi tín hiệu SOS khẩn cấp. |
| 18 | `last_active_at` | `TIMESTAMPTZ` | Không | — | Thời điểm hoạt động trực tuyến gần nhất. |
| 19 | `last_known_location` | `geography(Point, 4326)` | Không | SRID 4326 | Tọa độ GPS gần nhất (bảo mật, không public trực tiếp). |
| 20 | `created_at` | `TIMESTAMPTZ` | Có | Default: `NOW()` | Thời điểm tạo tài khoản ban đầu. |
| 21 | `updated_at` | `TIMESTAMPTZ` | Có | Default: `NOW()` | Thời điểm cập nhật thông tin hồ sơ gần nhất. |
| 22 | `is_deleted` | `BOOLEAN` | Có | Default: `false` | Cờ xóa mềm tài khoản (phục vụ lưu vết tuân thủ). |

---

### 2. Bảng: `user_taste_profiles` (Hồ Sơ Khẩu Vị Ẩm Thực Chuyên Sâu)
Bảng chứa dữ liệu khẩu vị độc quyền của FoodMate, là đầu vào cho thuật toán tính điểm ghép đôi (Match Engine).

| STT | Tên Trường (Field Name) | Kiểu Dữ Liệu | Bắt Buộc | Ràng Buộc / Giá Trị Mặc Định | Mô Tả Nghiệp Vụ |
| :---: | :--- | :--- | :---: | :--- | :--- |
| 1 | `id` | `UUID` | Có | PK, `gen_random_uuid()` | Khóa chính của hồ sơ khẩu vị. |
| 2 | `user_id` | `UUID` | Có | Unique, FK -> `users(id)` ON DELETE CASCADE | Tham chiếu đến người dùng sở hữu hồ sơ. |
| 3 | `cuisines` | `JSONB` | Có | Default: `[]` | Mảng mã ẩm thực ưa thích (vd: `["VN_TRAD", "KOR_BBQ", "HOTPOT"]`). |
| 4 | `spicy_level` | `SMALLINT` | Có | Default: `1`, Range: `1` đến `5` | Mức độ ăn cay (1: Không cay, 3: Vừa, 5: Thách thức cực độ). |
| 5 | `taste_preferences`| `JSONB` | Có | Default: `[]` | Đặc trưng vị giác (vd: `["sweet", "savory", "sour", "herb_rich"]`). |
| 6 | `dietary_restrictions`| `JSONB` | Có | Default: `[]` | Chế độ ăn kiêng (vd: `["DIET_VEGAN", "DIET_HALAL", "DIET_KETO"]`). |
| 7 | `allergies` | `JSONB` | Có | Default: `[]` | Cảnh báo dị ứng nghiêm ngặt (vd: `["ALGY_SHELL", "ALGY_PNUT"]`). |
| 8 | `budget_tier` | `VARCHAR(20)` | Có | Default: `BUDGET_T2` | Phân khúc ngân sách mỗi bữa ăn (`BUDGET_T1` đến `BUDGET_T5`). |
| 9 | `available_times` | `JSONB` | Có | Default: `[]` | Khung giờ rảnh thường xuyên đi ăn (`breakfast`, `lunch`, `dinner`, `late_night`). |
| 10 | `connection_purpose`| `VARCHAR(30)` | Có | Default: `food_buddy` | Mục đích kết nối: `food_buddy`, `friendship`, `dating`, `networking`. |
| 11 | `favorite_dish` | `VARCHAR(150)` | Không | — | Tên "món tủ" ghi điểm trên thẻ hồ sơ (vd: "Bún chả Obama"). |
| 12 | `signature_restaurant_id`| `UUID` | Không | FK -> `restaurants(id)` | Quán ăn ruột yêu thích nhất gắn lên hồ sơ. |
| 13 | `max_distance_km` | `INT` | Có | Default: `10`, Range: `1` đến `50` | Bán kính tìm kiếm bạn ăn tối đa mong muốn (km). |
| 14 | `hide_distance` | `BOOLEAN` | Có | Default: `false` | Cài đặt ẩn khoảng cách cụ thể trên giao diện người khác. |
| 15 | `hide_age` | `BOOLEAN` | Có | Default: `false` | Cài đặt ẩn số tuổi thực trên thẻ khám phá. |
| 16 | `auto_filter_allergy_conflict`| `BOOLEAN` | Có | Default: `true` | Tự động loại trừ người có xung đột dị ứng khi gợi ý quán. |
| 17 | `created_at` | `TIMESTAMPTZ` | Có | Default: `NOW()` | Thời gian tạo hồ sơ khẩu vị. |
| 18 | `updated_at` | `TIMESTAMPTZ` | Có | Default: `NOW()` | Thời gian cập nhật khẩu vị gần nhất. |

---

### 3. Bảng: `swipes` (Lịch Sử Quẹt Thẻ Khám Phá)
Lưu trữ hành vi tương tác quẹt thẻ của người dùng, làm căn cứ kích hoạt Match và kiểm soát giới hạn hằng ngày.

| STT | Tên Trường | Kiểu Dữ Liệu | Bắt Buộc | Ràng Buộc | Mô Tả Nghiệp Vụ |
| :---: | :--- | :--- | :---: | :--- | :--- |
| 1 | `id` | `BIGSERIAL` | Có | PK | Khóa chính tăng dần tự động. |
| 2 | `from_user_id` | `UUID` | Có | FK -> `users(id)` | Người thực hiện hành động quẹt thẻ. |
| 3 | `to_user_id` | `UUID` | Có | FK -> `users(id)` | Đối tượng xuất hiện trên thẻ được quẹt. |
| 4 | `action` | `VARCHAR(20)` | Có | Enum: `like`, `pass`, `super_like` | Hành động tương tác (Thích, Bỏ qua, Siêu thích). |
| 5 | `compatibility_score` | `DECIMAL(5,2)` | Có | 0.00 – 100.00 | Điểm số tương thích khẩu vị tại thời điểm quẹt. |
| 6 | `swiped_at` | `TIMESTAMPTZ` | Có | Default: `NOW()` | Thời điểm chính xác thực hiện vuốt thẻ. |
| 7 | `client_ip` | `VARCHAR(45)` | Không | — | Địa chỉ IP của thiết bị khi gửi request. |
| 8 | `user_agent` | `VARCHAR(255)` | Không | — | Thông tin phiên bản thiết bị di động / OS. |

*Unique Constraint: `(from_user_id, to_user_id)` nhằm tránh quẹt trùng lặp cùng một người trong một chu kỳ.*

---

### 4. Bảng: `matches` (Ghép Đôi Thành Công)
Quản lý trạng thái ghép đôi khi hai bên cùng thích nhau.

| STT | Tên Trường | Kiểu Dữ Liệu | Bắt Buộc | Ràng Buộc | Mô Tả Nghiệp Vụ |
| :---: | :--- | :--- | :---: | :--- | :--- |
| 1 | `id` | `UUID` | Có | PK, `gen_random_uuid()` | Định danh duy nhất của lượt ghép đôi. |
| 2 | `user_a_id` | `UUID` | Có | FK -> `users(id)` | Người dùng A (luôn lưu `user_a_id < user_b_id` để tránh trùng lặp). |
| 3 | `user_b_id` | `UUID` | Có | FK -> `users(id)` | Người dùng B trong phiên ghép đôi. |
| 4 | `status` | `VARCHAR(20)` | Có | Default: `matched` (`matched`, `unmatched`, `blocked`) | Trạng thái hiện tại của cặp ghép đôi. |
| 5 | `matched_at` | `TIMESTAMPTZ` | Có | Default: `NOW()` | Thời điểm hai bên chính thức tương hợp. |
| 6 | `unmatched_at` | `TIMESTAMPTZ` | Không | — | Thời điểm hủy tương hợp (nếu có). |
| 7 | `unmatched_by` | `UUID` | Không | FK -> `users(id)` | Người bấm nút hủy tương hợp. |
| 8 | `unmatch_reason` | `VARCHAR(255)` | Không | — | Lý do hủy ghép đôi (không hợp gu, spam, đổi ý...). |
| 9 | `has_meal_invite` | `BOOLEAN` | Có | Default: `false` | Cờ đánh dấu cặp đôi này đã từng tạo lời mời đi ăn chưa. |
| 10 | `created_at` | `TIMESTAMPTZ` | Có | Default: `NOW()` | Thời gian tạo bản ghi. |
| 11 | `updated_at` | `TIMESTAMPTZ` | Có | Default: `NOW()` | Thời gian cập nhật trạng thái gần nhất. |

---

### 5. Bảng: `conversations` & `messages` (Trò Chuyện Real-Time)

#### Bảng: `conversations`
| STT | Tên Trường | Kiểu Dữ Liệu | Bắt Buộc | Ràng Buộc | Mô Tả Nghiệp Vụ |
| :---: | :--- | :--- | :---: | :--- | :--- |
| 1 | `id` | `UUID` | Có | PK, `gen_random_uuid()` | Định danh phòng chat. |
| 2 | `match_id` | `UUID` | Có | Unique, FK -> `matches(id)` | Khóa ngoại gắn với cặp đôi tương ứng. |
| 3 | `last_message_id` | `BIGINT` | Không | — | ID tin nhắn mới nhất (phục vụ hiển thị danh sách hội thoại). |
| 4 | `last_message_preview`| `TEXT` | Không | — | Trích đoạn nội dung tin nhắn gần nhất. |
| 5 | `last_message_at` | `TIMESTAMPTZ` | Không | — | Thời điểm tin nhắn cuối cùng được gửi. |
| 6 | `is_active` | `BOOLEAN` | Có | Default: `true` | Phòng chat đang hoạt động hay bị khóa do hủy match/chặn. |
| 7 | `created_at` | `TIMESTAMPTZ` | Có | Default: `NOW()` | Thời điểm mở phòng chat. |

#### Bảng: `messages`
| STT | Tên Trường | Kiểu Dữ Liệu | Bắt Buộc | Ràng Buộc | Mô Tả Nghiệp Vụ |
| :---: | :--- | :--- | :---: | :--- | :--- |
| 1 | `id` | `BIGSERIAL` | Có | PK | Mã định danh tin nhắn tăng dần. |
| 2 | `conversation_id` | `UUID` | Có | FK -> `conversations(id)` | Thuộc về phòng chat nào. |
| 3 | `sender_id` | `UUID` | Có | FK -> `users(id)` | Người gửi tin nhắn. |
| 4 | `message_type` | `VARCHAR(20)` | Có | Enum: `text`, `image`, `restaurant_card`, `recipe_card`, `meal_invite_card`, `system` | Loại nội dung tin nhắn. |
| 5 | `content` | `TEXT` | Không | — | Nội dung văn bản của tin nhắn. |
| 6 | `attachment_urls` | `JSONB` | Không | Default: `[]` | Mảng chứa URL hình ảnh đính kèm. |
| 7 | `metadata_json` | `JSONB` | Không | Default: `{}` | Dữ liệu nhúng thẻ quán (`restaurant_id`), công thức (`recipe_id`), lời mời (`invite_id`). |
| 8 | `is_read` | `BOOLEAN` | Có | Default: `false` | Đánh dấu đối phương đã đọc tin nhắn chưa. |
| 9 | `read_at` | `TIMESTAMPTZ` | Không | — | Thời điểm đối phương xem tin nhắn. |
| 10 | `is_flagged` | `BOOLEAN` | Có | Default: `false` | Cờ tự động bật nếu chứa từ ngữ nhạy cảm cần kiểm duyệt. |
| 11 | `sent_at` | `TIMESTAMPTZ` | Có | Default: `NOW()` | Thời điểm máy chủ ghi nhận tin nhắn. |

---

### 6. Bảng: `restaurants` (Danh Bạ Địa Điểm Quán Ăn)
Lưu trữ thông tin chi tiết nhà hàng, quán ăn, tọa độ địa không gian PostGIS.

| STT | Tên Trường | Kiểu Dữ Liệu | Bắt Buộc | Ràng Buộc | Mô Tả Nghiệp Vụ |
| :---: | :--- | :--- | :---: | :--- | :--- |
| 1 | `id` | `UUID` | Có | PK, `gen_random_uuid()` | Định danh quán ăn. |
| 2 | `google_place_id`| `VARCHAR(255)` | Không | Unique | ID địa điểm từ Google Maps/Places API (nếu đồng bộ). |
| 3 | `name` | `VARCHAR(255)` | Có | — | Tên đầy đủ của quán ăn / nhà hàng. |
| 4 | `alias_name` | `VARCHAR(255)` | Không | — | Tên gọi dân dã hoặc tên tiếng Anh. |
| 5 | `address_full` | `VARCHAR(500)` | Có | — | Địa chỉ số nhà, tên đường chi tiết. |
| 6 | `ward` | `VARCHAR(100)` | Không | — | Phường / Xã. |
| 7 | `district` | `VARCHAR(100)` | Có | — | Quận / Huyện. |
| 8 | `city` | `VARCHAR(100)` | Có | — | Tỉnh / Thành phố (TP.HCM, Hà Nội...). |
| 9 | `geo_point` | `geography(Point, 4326)` | Có | SRID 4326 | Tọa độ GPS chính xác (Kinh độ, Vĩ độ) để tính bán kính. |
| 10 | `phone_number` | `VARCHAR(30)` | Không | — | Số điện thoại đặt bàn của quán. |
| 11 | `cuisine_code` | `VARCHAR(30)` | Có | — | Loại hình ẩm thực chính (tham chiếu Master Data). |
| 12 | `price_tier` | `VARCHAR(20)` | Có | Default: `BUDGET_T2` | Phân khúc giá trung bình của quán. |
| 13 | `opening_hours_json`| `JSONB` | Không | Default: `{}` | Khung giờ mở cửa các ngày trong tuần (vd: `{ "mon": "08:00-22:00" }`). |
| 14 | `avatar_url` | `VARCHAR(500)` | Có | — | Ảnh đại diện mặt tiền của quán. |
| 15 | `photos_json` | `JSONB` | Không | Default: `[]` | Mảng chứa ảnh không gian quán và các món ăn. |
| 16 | `tags_json` | `JSONB` | Không | Default: `[]` | Thuộc tính (vd: `["view_dep", "hop_hen_dau", "co_cho_oto", "co_mon_chay"]`). |
| 17 | `avg_rating` | `DECIMAL(3,2)` | Có | Default: `0.00` | Điểm đánh giá trung bình của cộng đồng (1.00 đến 5.00 sao). |
| 18 | `review_count` | `INT` | Có | Default: `0` | Tổng số lượt nhận xét từ người dùng FoodMate. |
| 19 | `is_partner` | `BOOLEAN` | Có | Default: `false` | Đánh dấu quán đã ký kết hợp tác chính thức với FoodMate. |
| 20 | `partner_discount_desc`| `VARCHAR(255)`| Không | — | Mô tả ưu đãi dành riêng cho nhóm FoodMate (vd: Giảm 10% tổng bill). |
| 21 | `created_by` | `UUID` | Không | FK -> `users(id)` | Người dùng đóng góp thông tin quán mới ban đầu. |
| 22 | `is_verified` | `BOOLEAN` | Có | Default: `true` | Đã được kiểm duyệt thông tin địa chỉ chính xác. |
| 23 | `created_at` | `TIMESTAMPTZ` | Có | Default: `NOW()` | Thời gian tạo bản ghi quán ăn. |
| 24 | `updated_at` | `TIMESTAMPTZ` | Có | Default: `NOW()` | Thời gian cập nhật thông tin quán. |

---

### 7. Bảng: `meal_invites` (Lời Mời Đi Ăn Chính Thức)
Thực thể trung tâm đưa người dùng từ ứng dụng ra đời thực, quản lý vòng đời cuộc hẹn và check-in GPS.

| STT | Tên Trường | Kiểu Dữ Liệu | Bắt Buộc | Ràng Buộc | Mô Tả Nghiệp Vụ |
| :---: | :--- | :--- | :---: | :--- | :--- |
| 1 | `id` | `UUID` | Có | PK, `gen_random_uuid()` | Định danh duy nhất của cuộc hẹn. |
| 2 | `invite_code` | `VARCHAR(30)` | Có | Unique, vd: `INV-202610-XXXX` | Mã số lời mời tiện cho tra cứu và chia sẻ. |
| 3 | `inviter_id` | `UUID` | Có | FK -> `users(id)` | Người khởi xướng tạo lời mời đi ăn. |
| 4 | `invitee_id` | `UUID` | Có | FK -> `users(id)` | Người nhận lời mời. |
| 5 | `conversation_id` | `UUID` | Có | FK -> `conversations(id)`| Thuộc phiên hội thoại nào. |
| 6 | `restaurant_id` | `UUID` | Có | FK -> `restaurants(id)` | Địa điểm quán ăn công cộng được lựa chọn. |
| 7 | `scheduled_at` | `TIMESTAMPTZ` | Có | Phải lớn hơn thời điểm tạo | Ngày và giờ chính xác diễn ra cuộc hẹn. |
| 8 | `payment_policy` | `VARCHAR(30)` | Có | Default: `split_50_50` | Cách chia tiền: `split_50_50`, `separate_bills`, `inviter_pays`, `invitee_pays`. |
| 9 | `note` | `TEXT` | Không | — | Lời nhắn gửi kèm theo lời mời. |
| 10 | `status` | `VARCHAR(30)` | Có | Default: `pending` | Trạng thái: `pending`, `accepted`, `declined`, `cancelled`, `checked_in`, `completed`, `expired`. |
| 11 | `inviter_checked_in_at`| `TIMESTAMPTZ`| Không | — | Thời điểm người mời bấm check-in tại quán. |
| 12 | `invitee_checked_in_at`| `TIMESTAMPTZ`| Không | — | Thời điểm người nhận bấm check-in tại quán. |
| 13 | `check_in_distance_inviter_m`| `INT` | Không | — | Khoảng cách từ vị trí GPS của người mời đến tâm quán lúc check-in (m). |
| 14 | `check_in_distance_invitee_m`| `INT` | Không | — | Khoảng cách từ vị trí GPS của người nhận đến tâm quán lúc check-in (m). |
| 15 | `share_safety_token`| `VARCHAR(100)` | Có | Unique | Mã Token sinh đường link chia sẻ an toàn cho người thân. |
| 16 | `cancelled_by` | `UUID` | Không | FK -> `users(id)` | Người bấm hủy cuộc hẹn (nếu có). |
| 17 | `cancel_reason` | `TEXT` | Không | — | Lý do hủy hẹn. |
| 18 | `is_inviter_reviewed`| `BOOLEAN` | Có | Default: `false` | Người mời đã hoàn tất đánh giá đối phương chưa. |
| 19 | `is_invitee_reviewed`| `BOOLEAN` | Có | Default: `false` | Người nhận đã hoàn tất đánh giá đối phương chưa. |
| 20 | `created_at` | `TIMESTAMPTZ` | Có | Default: `NOW()` | Thời gian tạo lời mời. |
| 21 | `updated_at` | `TIMESTAMPTZ` | Có | Default: `NOW()` | Thời gian cập nhật trạng thái gần nhất. |

---

### 8. Bảng: `dining_reviews` (Đánh Giá Bạn Ăn Sau Cuộc Hẹn)
Bảng ghi nhận điểm uy tín của thành viên sau khi kết thúc buổi ăn thực tế.

| STT | Tên Trường | Kiểu Dữ Liệu | Bắt Buộc | Ràng Buộc | Mô Tả Nghiệp Vụ |
| :---: | :--- | :--- | :---: | :--- | :--- |
| 1 | `id` | `UUID` | Có | PK, `gen_random_uuid()` | Khóa chính đánh giá. |
| 2 | `invite_id` | `UUID` | Có | FK -> `meal_invites(id)` | Thuộc về cuộc hẹn đi ăn nào. |
| 3 | `reviewer_id` | `UUID` | Có | FK -> `users(id)` | Người thực hiện chấm điểm. |
| 4 | `reviewee_id` | `UUID` | Có | FK -> `users(id)` | Người được nhận đánh giá. |
| 5 | `punctuality_rating`| `SMALLINT`| Có | Thang điểm 1 đến 5 sao | Đánh giá mức độ đúng giờ hẹn. |
| 6 | `politeness_rating` | `SMALLINT`| Có | Thang điểm 1 đến 5 sao | Đánh giá thái độ lịch sự, tôn trọng trong giao tiếp. |
| 7 | `compatibility_rating`| `SMALLINT`| Có | Thang điểm 1 đến 5 sao | Đánh giá độ hợp gu nói chuyện và sở thích ăn uống. |
| 8 | `positive_tags_json`| `JSONB` | Không | Default: `[]` | Huy hiệu khen ngợi (vd: `["on_time", "polite", "good_humor", "split_fair"]`). |
| 9 | `private_comment` | `TEXT` | Không | — | Phản hồi kín gửi riêng cho đội ngũ Quản trị an toàn (nếu có vấn đề). |
| 10 | `is_no_show` | `BOOLEAN` | Có | Default: `false` | Đánh dấu đối phương hoàn toàn không xuất hiện (bùng kèo). |
| 11 | `created_at` | `TIMESTAMPTZ` | Có | Default: `NOW()` | Thời gian tạo đánh giá. |

---

### 9. Bảng: `recipes` (Công Thức Nấu Ăn Cộng Đồng)
Quản lý các công thức món ăn do người dùng chia sẻ lên nền tảng.

| STT | Tên Trường | Kiểu Dữ Liệu | Bắt Buộc | Ràng Buộc | Mô Tả Nghiệp Vụ |
| :---: | :--- | :--- | :---: | :--- | :--- |
| 1 | `id` | `UUID` | Có | PK, `gen_random_uuid()` | Định danh công thức. |
| 2 | `author_id` | `UUID` | Có | FK -> `users(id)` | Tác giả công thức. |
| 3 | `title` | `VARCHAR(255)` | Có | — | Tên món ăn (vd: "Phở bò sốt vang gia truyền"). |
| 4 | `summary` | `TEXT` | Không | — | Lời tựa ngắn gọn giới thiệu hương vị món ăn. |
| 5 | `cover_image_url` | `VARCHAR(500)` | Có | — | Ảnh bìa đại diện của món ăn sau khi hoàn thành. |
| 6 | `video_url` | `VARCHAR(500)` | Không | — | Đường dẫn video hướng dẫn (Youtube, TikTok, S3). |
| 7 | `cuisine_code` | `VARCHAR(30)` | Có | — | Phân loại ẩm thực của món ăn. |
| 8 | `dietary_tags_json`| `JSONB` | Không | Default: `[]` | Nhãn chế độ ăn (Món chay, Keto, Không gluten...). |
| 9 | `difficulty_level` | `VARCHAR(20)` | Có | Default: `medium` (`easy`, `medium`, `hard`) | Độ khó khi thực hiện món ăn. |
| 10 | `prep_time_minutes`| `INT` | Có | Min: 0 | Thời gian chuẩn bị nguyên liệu (phút). |
| 11 | `cook_time_minutes`| `INT` | Có | Min: 0 | Thời gian nấu nướng thực tế (phút). |
| 12 | `serving_size` | `INT` | Có | Default: 2 | Khẩu phần ăn chuẩn dành cho mấy người. |
| 13 | `status` | `VARCHAR(20)` | Có | Default: `published` (`draft`, `published`, `archived`, `hidden`) | Trạng thái hiển thị của công thức. |
| 14 | `likes_count` | `INT` | Có | Default: 0 | Tổng số lượt bấm thích của cộng đồng. |
| 15 | `bookmarks_count` | `INT` | Có | Default: 0 | Tổng số lượt lưu vào sổ tay ẩm thực. |
| 16 | `created_at` | `TIMESTAMPTZ` | Có | Default: `NOW()` | Thời điểm đăng công thức. |
| 17 | `updated_at` | `TIMESTAMPTZ` | Có | Default: `NOW()` | Thời điểm chỉnh sửa công thức gần nhất. |

---

### 10. Bảng: `user_reports` (Báo Cáo Vi Phạm An Toàn & Kiểm Duyệt)
Quản lý toàn bộ khiếu nại, phản ánh vi phạm an toàn từ cộng đồng.

| STT | Tên Trường | Kiểu Dữ Liệu | Bắt Buộc | Ràng Buộc | Mô Tả Nghiệp Vụ |
| :---: | :--- | :--- | :---: | :--- | :--- |
| 1 | `id` | `UUID` | Có | PK, `gen_random_uuid()` | Mã báo cáo duy nhất. |
| 2 | `ticket_code` | `VARCHAR(30)` | Có | Unique, vd: `REP-202610-XXXX` | Mã Ticket hỗ trợ hiển thị trên Admin Portal. |
| 3 | `reporter_id` | `UUID` | Có | FK -> `users(id)` | Người gửi báo cáo vi phạm. |
| 4 | `target_type` | `VARCHAR(30)` | Có | Enum: `user`, `message`, `recipe`, `restaurant`, `review` | Loại đối tượng bị khiếu nại. |
| 5 | `target_user_id` | `UUID` | Không | FK -> `users(id)` | Người dùng bị khiếu nại trực tiếp (nếu có). |
| 6 | `target_item_id` | `VARCHAR(100)` | Không | — | ID của tin nhắn, ảnh, công thức bị tố cáo. |
| 7 | `reason_category` | `VARCHAR(50)` | Có | Enum: `harassment`, `scam`, `fake_profile`, `nudity`, `violence`, `no_show`, `spam` | Phân loại lý do vi phạm. |
| 8 | `description` | `TEXT` | Không | — | Lời tường thuật chi tiết của người báo cáo. |
| 9 | `evidence_urls_json`| `JSONB` | Không | Default: `[]` | Mảng chứa URL ảnh chụp màn hình bằng chứng. |
| 10 | `urgency_level` | `VARCHAR(20)` | Có | Default: `medium` (`high`, `medium`, `low`) | Mức độ ưu tiên xử lý trong hàng đợi kiểm duyệt. |
| 11 | `status` | `VARCHAR(30)` | Có | Default: `submitted` (`submitted`, `in_review`, `resolved_action_taken`, `resolved_dismissed`) | Trạng thái xử lý vụ việc. |
| 12 | `assigned_moderator_id`| `UUID` | Không | FK -> `users(id)` | Kiểm duyệt viên được phân công giải quyết. |
| 13 | `resolution_action` | `VARCHAR(50)` | Không | Enum: `warning_issued`, `avatar_removed`, `temporary_suspend`, `permanent_ban`, `none` | Hành động kỷ luật được áp dụng. |
| 14 | `resolution_note` | `TEXT` | Không | — | Ghi chú giải trình nội bộ của kiểm duyệt viên. |
| 15 | `resolved_at` | `TIMESTAMPTZ` | Không | — | Thời điểm đóng hồ sơ khiếu nại. |
| 16 | `created_at` | `TIMESTAMPTZ` | Có | Default: `NOW()` | Thời gian gửi báo cáo. |

---

### 11. Bảng: `audit_logs` (Nhật Ký Lưu Vết Hệ Thống)
Bắt buộc tuân thủ an toàn thông tin và Nghị định 13/2023/NĐ-CP, ghi nhận mọi hành động nhạy cảm của người dùng và quản trị viên.

| STT | Tên Trường | Kiểu Dữ Liệu | Bắt Buộc | Ràng Buộc | Mô Tả Nghiệp Vụ |
| :---: | :--- | :--- | :---: | :--- | :--- |
| 1 | `id` | `BIGSERIAL` | Có | PK | Khóa tự tăng. |
| 2 | `actor_id` | `UUID` | Không | FK -> `users(id)` | Ai thực hiện hành động (null nếu là tác vụ ngầm hệ thống). |
| 3 | `actor_role` | `VARCHAR(20)` | Có | — | Vai trò của người thực hiện tại thời điểm đó (`admin`, `member`...). |
| 4 | `action` | `VARCHAR(50)` | Có | — | Tên hành động (vd: `USER_SUSPENDED`, `PROFILE_DELETED`, `EKYC_APPROVED`). |
| 5 | `entity_name` | `VARCHAR(50)` | Có | — | Bảng/Thực thể chịu tác động (`users`, `meal_invites`...). |
| 6 | `entity_id` | `VARCHAR(100)` | Có | — | Khóa định danh của đối tượng chịu tác động. |
| 7 | `old_values_json` | `JSONB` | Không | — | Trạng thái dữ liệu trước khi thay đổi (diff tracking). |
| 8 | `new_values_json` | `JSONB` | Không | — | Trạng thái dữ liệu sau khi thay đổi. |
| 9 | `ip_address` | `VARCHAR(45)` | Không | — | Địa chỉ IP gửi yêu cầu. |
| 10 | `user_agent` | `VARCHAR(255)` | Không | — | Thông tin trình duyệt / thiết bị di động. |
| 11 | `created_at` | `TIMESTAMPTZ` | Có | Default: `NOW()` | Thời điểm chính xác phát sinh hành động. |
