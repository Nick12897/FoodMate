import React, { useState, useEffect } from 'react';
import { User, Flame, DollarSign, Utensils, ShieldCheck, Save, Sliders, Check, LogOut } from 'lucide-react';
import { MASTER_CUISINES, BUDGET_TIERS } from '../data/mockData';

export default function ProfileView({ profile, onUpdateProfile, onLogout }) {
  const [formData, setFormData] = useState({ ...profile });
  const [taste, setTaste] = useState({ ...profile.tasteProfile });
  const [isSaved, setIsSaved] = useState(false);

  // Đồng bộ lại khi đổi tài khoản đăng nhập
  useEffect(() => {
    setFormData({ ...profile });
    setTaste({ ...profile.tasteProfile });
  }, [profile]);

  const toggleCuisine = (code) => {
    setTaste((prev) => {
      const exists = prev.cuisines.includes(code);
      const newCuisines = exists
        ? prev.cuisines.filter((c) => c !== code)
        : [...prev.cuisines, code];
      return { ...prev, cuisines: newCuisines };
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    onUpdateProfile({ ...formData, tasteProfile: taste });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-4 pb-28">
      {/* User Header Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm mb-4 relative">

        <div className="flex items-center space-x-4">
          <div className="relative">
            <img
              src={formData.avatarUrl}
              alt={formData.fullName}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-orange-500 shadow-sm"
            />
            {formData.isVerified && (
              <div className="absolute -bottom-1 -right-1 bg-sky-500 text-white p-1 rounded-full shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h2 className="text-xl font-bold text-slate-900">{formData.fullName}</h2>
              <span className="text-slate-400 font-medium">({formData.age}t)</span>
            </div>
            <p className="text-xs text-slate-500">{formData.occupation}</p>
            <div className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Điểm tin cậy: {formData.trustScore || 100}/100
            </div>
          </div>
        </div>

        <div className="mt-3 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          <p className="italic">"{formData.bio}"</p>
        </div>
      </div>

      {/* Form chỉnh sửa Taste Profile */}
      <form onSubmit={handleSave} className="space-y-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Sliders className="w-5 h-5 text-orange-500" />
            <h3 className="font-bold text-slate-900 text-base">Hồ Sơ Khẩu Vị Ẩm Thực (Taste Profile)</h3>
          </div>

          {/* Món khoái khẩu */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Món ruột / Thèm nhất lúc này
            </label>
            <input
              type="text"
              value={taste.favoriteDish}
              onChange={(e) => setTaste({ ...taste, favoriteDish: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
              placeholder="VD: Lẩu nấm, Mì cay, Bún đậu..."
            />
          </div>

          {/* Mức độ ăn cay */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Cấp độ ăn cay (1 - 5)
              </label>
              <span className="text-xs font-black text-red-500 flex items-center">
                <Flame className="w-3.5 h-3.5 fill-red-500 mr-0.5" />
                Cấp {taste.spicyLevel}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  type="button"
                  key={lvl}
                  onClick={() => setTaste({ ...taste, spicyLevel: lvl })}
                  className={`py-2 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center ${
                    taste.spicyLevel === lvl
                      ? 'bg-red-500 text-white shadow-md shadow-red-500/30'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Flame className={`w-4 h-4 mb-0.5 ${taste.spicyLevel === lvl ? 'fill-white' : 'text-red-400'}`} />
                  Cấp {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Phân khúc ngân sách */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Phân khúc ngân sách mong muốn
            </label>
            <div className="space-y-1.5">
              {BUDGET_TIERS.map((tier) => (
                <button
                  type="button"
                  key={tier.code}
                  onClick={() => setTaste({ ...taste, budgetTier: tier.code })}
                  className={`w-full text-left p-2.5 rounded-xl text-xs transition border flex items-center justify-between ${
                    taste.budgetTier === tier.code
                      ? 'bg-orange-50 border-orange-400 text-orange-950 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div>
                    <span className="block font-semibold">{tier.name}</span>
                    <span className="text-[11px] text-slate-400 font-normal">{tier.desc}</span>
                  </div>
                  {taste.budgetTier === tier.code && <Check className="w-4 h-4 text-orange-600 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Phong cách ẩm thực yêu thích */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Gu ẩm thực yêu thích (chọn nhiều)
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {MASTER_CUISINES.map((c) => {
                const selected = taste.cuisines.includes(c.code);
                return (
                  <button
                    type="button"
                    key={c.code}
                    onClick={() => toggleCuisine(c.code)}
                    className={`p-2 rounded-xl text-xs text-left transition flex items-center space-x-2 border ${
                      selected
                        ? 'bg-orange-50 border-orange-400 text-orange-900 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-base">{c.icon}</span>
                    <span className="truncate">{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bán kính tối đa */}
          <div>
            <div className="flex justify-between items-center mb-1 text-xs">
              <label className="font-bold text-slate-700 uppercase tracking-wider">
                Bán kính tìm bạn ăn
              </label>
              <span className="font-black text-orange-600">{taste.maxDistanceKm} km</span>
            </div>
            <input
              type="range"
              min="2"
              max="30"
              step="1"
              value={taste.maxDistanceKm}
              onChange={(e) => setTaste({ ...taste, maxDistanceKm: Number(e.target.value) })}
              className="w-full accent-orange-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Nút lưu */}
        <button
          type="submit"
          className={`w-full py-3.5 rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-lg transition active:scale-98 ${
            isSaved
              ? 'bg-emerald-600 text-white shadow-emerald-600/30'
              : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-orange-500/30 hover:brightness-105'
          }`}
        >
          {isSaved ? (
            <>
              <Check className="w-5 h-5 stroke-[3]" />
              <span>Đã lưu thành công!</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>Cập nhật hồ sơ khẩu vị</span>
            </>
          )}
        </button>
      </form>

      {/* Khu vực Đăng xuất chuyên nghiệp đặt ở dưới cùng */}
      {onLogout && (
        <div className="mt-4 pt-2">
          <button
            type="button"
            onClick={onLogout}
            className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-rose-600 font-bold text-xs shadow-xs transition flex items-center justify-center space-x-2 active:scale-98"
          >
            <LogOut className="w-4 h-4 text-rose-500" />
            <span>Đăng xuất tài khoản</span>
          </button>
          <p className="text-center text-[11px] text-slate-400 mt-2.5">
            FoodMate v1.0 • Ứng dụng kết nối ẩm thực
          </p>
        </div>
      )}
    </div>
  );
}
