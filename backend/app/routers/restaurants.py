import json
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Restaurant
from ..matching import calculate_haversine_distance

router = APIRouter(prefix="/api/v1/restaurants", tags=["Restaurants"])

@router.get("/search")
def search_restaurants(
    q: str = Query("", description="Từ khóa tìm kiếm quán"),
    city: str = Query("Hồ Chí Minh"),
    db: Session = Depends(get_db)
):
    query = db.query(Restaurant).filter(Restaurant.is_verified == True)
    if q:
        query = query.filter(Restaurant.name.ilike(f"%{q}%"))
    
    restaurants = query.all()
    results = []
    for r in restaurants:
        results.append({
            "id": r.id,
            "name": r.name,
            "address": r.address_full,
            "district": r.district,
            "city": r.city,
            "cuisine": r.cuisine_code,
            "price_tier": r.price_tier,
            "avg_rating": r.avg_rating,
            "review_count": r.review_count,
            "avatar_url": r.avatar_url,
            "tags": json.loads(r.tags_json or "[]"),
            "is_partner": r.is_partner,
            "partner_discount": r.partner_discount_desc
        })

    return {
        "success": True,
        "data": results
    }

@router.get("/nearby")
def get_nearby_restaurants(
    latitude: float = Query(10.7769),
    longitude: float = Query(106.7009),
    radius_km: float = 10.0,
    db: Session = Depends(get_db)
):
    restaurants = db.query(Restaurant).filter(Restaurant.is_verified == True).all()
    nearby_list = []

    for r in restaurants:
        dist = calculate_haversine_distance(latitude, longitude, r.latitude, r.longitude)
        if dist <= radius_km:
            nearby_list.append({
                "id": r.id,
                "name": r.name,
                "address": r.address_full,
                "distance_km": dist,
                "price_tier": r.price_tier,
                "avg_rating": r.avg_rating,
                "avatar_url": r.avatar_url,
                "is_partner": r.is_partner,
                "partner_discount": r.partner_discount_desc
            })

    nearby_list.sort(key=lambda x: x["distance_km"])

    return {
        "success": True,
        "data": nearby_list
    }
