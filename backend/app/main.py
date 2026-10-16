from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, SessionLocal
from .seed_data import seed_initial_data
from .routers import auth, profile, discovery, restaurants, invites, chat

# Tự động tạo các bảng trong database SQLite nếu chưa có
Base.metadata.create_all(bind=engine)

# Nạp dữ liệu ban đầu
db = SessionLocal()
try:
    seed_initial_data(db)
finally:
    db.close()

app = FastAPI(
    title="🍜 FoodMate API (Python + SQLite)",
    description="Backend API cho nền tảng kết nối ẩm thực & hẹn ăn uống FoodMate",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Cấu hình CORS cho phép ReactJS Frontend kết nối
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Đăng ký các Router tính năng
app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(discovery.router)
app.include_router(restaurants.router)
app.include_router(invites.router)
app.include_router(chat.router)

@app.get("/")
def root():
    return {
        "app": "FoodMate Backend API",
        "status": "online",
        "database": "SQLite (foodmate.db)",
        "docs": "/docs"
    }
