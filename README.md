# 🍜 FoodMate – Nền Tảng Kết Nối Ẩm Thực & Hẹn Ăn Uống Theo Gu

> *"Ăn ngon hơn khi có bạn cùng bàn"*

---

## 📌 Giới Thiệu
**FoodMate** là nền tảng kết nối xã hội chuyên sâu qua lăng kính ẩm thực, đưa người dùng từ **khẩu vị tương đồng trực tuyến (online Taste Profile)** đến **trải nghiệm bàn ăn thực tế (offline dining experience)** an toàn và tin cậy.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

- **Frontend**: ReactJS 18, Vite, Tailwind CSS, Lucide Icons
- **Backend**: Python 3.11, FastAPI, SQLAlchemy, Pydantic, Uvicorn
- **Database**: SQLite 3 (lưu trữ cục bộ, dễ triển khai)
- **Tài liệu đặc tả**: IEEE/ISO/IEC 29148:2018 (SRS, API Spec, Data Dictionary, DB Schema)

---

## 📁 Cấu Trúc Dự Án

```
foodmate/
├── backend/                  # Mã nguồn Backend (Python + FastAPI + SQLite)
│   ├── app/
│   │   ├── database.py       # Cấu hình SQLite engine & session
│   │   ├── models.py         # SQLAlchemy ORM models
│   │   ├── schemas.py        # Pydantic schemas (DTO)
│   │   ├── matching.py       # Thuật toán Haversine & Jaccard Food Compatibility
│   │   ├── seed_data.py      # Dữ liệu khởi tạo (Cuisines, Budget tiers, Restaurants, Users)
│   │   ├── main.py           # FastAPI entrypoint
│   │   └── routers/          # API endpoints (auth, profile, discovery, restaurants, invites, chat)
│   └── requirements.txt      # Python dependencies
│
├── frontend/                 # Mã nguồn Frontend (ReactJS + Tailwind CSS)
│   ├── src/
│   │   ├── components/       # Các component UI (Discovery, Profile, Invites, Chat, Restaurants)
│   │   ├── services/         # API service kết nối với Backend
│   │   ├── data/             # Mock data mẫu
│   │   ├── App.jsx           # Component trung tâm điều phối
│   │   └── main.jsx          # Entrypoint React
│   └── package.json
│
└── foodmate/docs/            # Tài liệu đặc tả kỹ thuật chi tiết
    ├── SRS.md                # Software Requirements Specification
    ├── api_specification.md  # Đặc tả RESTful API & WebSocket
    ├── database_design.md    # Thiết kế cơ sở dữ liệu
    ├── data_dictionary.md    # Từ điển dữ liệu
    └── SCHEMA.sql            # Schema SQL chuẩn
```

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Ứng Dụng

### 1. Khởi chạy Backend (Python + FastAPI)

```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- API Base URL: `http://127.0.0.1:8000`
- Swagger API Docs: `http://127.0.0.1:8000/docs`

### 2. Khởi chạy Frontend (ReactJS)

```bash
cd frontend
npm install
npm run dev
```
- Truy cập ứng dụng: `http://localhost:5173`

---

## 🌟 Tính Năng Chính
- **Quẹt Gu Ẩm Thực (Swipe Discovery)**: Thuật toán đo % hợp khẩu vị (Jaccard similarity) và khoảng cách GPS (Haversine).
- **Hồ Sơ Khẩu Vị (Taste Profile)**: Thể loại món yêu thích, mức độ ăn cay, ngân sách bữa ăn.
- **Lời Mời Bàn Ăn (Meal Invites)**: Chọn quán ăn, quy tắc chia tiền, GPS Check-in an toàn (< 200m).
- **Trò Chuyện Thời Gian Thực (Chat)**: Nhắn tin 1-1, rủ đi ăn nhanh.
- **Danh Bạ Quán Ăn (Restaurants)**: Quán ăn xác thực với ưu đãi đối tác FoodMate.
- **Trung Tâm An Toàn (SOS)**: Hỗ trợ khẩn cấp và chia sẻ lộ trình cho người thân.
