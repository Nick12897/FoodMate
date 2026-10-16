import React, { useState } from 'react';
import { Search, Star, MapPin, Tag, Sparkles, PlusCircle } from 'lucide-react';

export default function RestaurantsView({ restaurants, onInviteAtRestaurant }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('ALL');

  const filtered = restaurants.filter((r) => {
    const matchName = r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      r.cuisine.toLowerCase().includes(searchTerm.toLowerCase());
    return matchName;
  });

  return (
    <div className="max-w-md mx-auto px-4 py-4 pb-28">
      {/* Search Header */}
      <div className="relative mb-4">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm quán ăn, lẩu nấm, BBQ nướng..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-xs"
        />
      </div>

      {/* Title */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-slate-900 text-sm">Địa Điểm Ẩm Thực Được Xác Thực ({filtered.length})</h3>
        <span className="text-xs text-orange-600 font-semibold flex items-center">
          <Sparkles className="w-3.5 h-3.5 mr-0.5" /> Quán công cộng an toàn
        </span>
      </div>

      {/* Restaurant Cards */}
      <div className="space-y-4">
        {filtered.map((r) => (
          <div
            key={r.id}
            className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition"
          >
            {/* Image */}
            <div className="relative h-40 w-full bg-slate-100">
              <img
                src={r.imageUrl}
                alt={r.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-slate-800 flex items-center shadow-xs">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 mr-1" />
                <span>{r.rating} ({r.reviewsCount})</span>
              </div>
              {r.isPartner && (
                <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                  Đối tác FoodMate
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-4 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-base">{r.name}</h4>
                  <span className="text-xs text-orange-600 font-semibold">{r.cuisine}</span>
                </div>
                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
                  {r.priceTier}
                </span>
              </div>

              <div className="flex items-center text-xs text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-orange-500 mr-1 shrink-0" />
                <span className="truncate">{r.address}</span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 pt-1">
                {r.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium"
                  >
                    #{t}
                  </span>
                ))}
              </div>

              {/* Discount if partner */}
              {r.discount && (
                <div className="bg-orange-50 border border-orange-200/80 rounded-xl p-2 text-xs text-orange-800 font-medium flex items-center space-x-1.5">
                  <Tag className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                  <span>{r.discount}</span>
                </div>
              )}

              {/* Rủ đi ăn nút */}
              <button
                onClick={() => onInviteAtRestaurant(r)}
                className="w-full mt-2 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 shadow-xs"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Chọn quán này để rủ bạn ăn</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
