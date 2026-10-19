import React, { useState, useEffect } from 'react';
import { User, Flame, DollarSign, Utensils, ShieldCheck, Save, Sliders, Check, LogOut, Camera, Edit3, Sparkles } from 'lucide-react';
import { MASTER_CUISINES, BUDGET_TIERS } from '../data/mockData';

export default function ProfileView({ profile, onUpdateProfile, onLogout }) {
  const [formData, setFormData] = useState({
    fullName: profile?.fullName || '',
    age: profile?.age || 24,
    gender: profile?.gender || 'other',
    occupation: profile?.occupation || '',
    bio: profile?.bio || '',
    avatarUrl: profile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
    trustScore: profile?.trustScore || 100,
    isVerified: profile?.isVerified ?? true
  });

  const [taste, setTaste] = useState({
    favoriteDish: profile?.tasteProfile?.favoriteDish || '',
    spicyLevel: profile?.tasteProfile?.spicyLevel || 2,
    budgetTier: profile?.tasteProfile?.budgetTier || 'BUDGET_T2',
    connectionPurpose: profile?.tasteProfile?.connectionPurpose || 'food_buddy',
    cuisines: profile?.tasteProfile?.cuisines || ['VN_TRAD', 'HOTPOT'],
    maxDistanceKm: profile?.tasteProfile?.maxDistanceKm || 10
  });

  const [isSaved, setIsSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Đồng bộ lại khi đổi tài khoản đăng nhập hoặc cập nhật profile
  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        age: profile.age || 24,
        gender: profile.gender || 'other',
        occupation: profile.occupation || '',
        bio: profile.bio || '',
        avatarUrl: profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
        trustScore: profile.trustScore || 100,
        isVerified: profile.isVerified ?? true
      });
      if (profile.tasteProfile) {
        setTaste({
          favoriteDish: profile.tasteProfile.favoriteDish || '',
          spicyLevel: profile.tasteProfile.spicyLevel || 2,
          budgetTier: profile.tasteProfile.budgetTier || 'BUDGET_T2',
          connectionPurpose: profile.tasteProfile.connectionPurpose || 'food_buddy',
          cuisines: profile.tasteProfile.cuisines || ['VN_TRAD', 'HOTPOT'],
          maxDistanceKm: profile.tasteProfile.maxDistanceKm || 10
        });
      }
    }
  }, [profile]);

  // Xử lý tải ảnh đại diện từ thiết bị
  const handleAvatarFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Vui lòng chỉ chọn tệp hình ảnh (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Dung lượng ảnh vượt quá 5MB. Vui lòng chọn ảnh nhẹ hơn.');
      return;
    }

    setErrorMsg('');
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData((prev) => ({ ...prev, avatarUrl: event.target.result }));
    };
    reader.readAsDataURL(file);
  };

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

    if (!formData.fullName.trim()) {
      setErrorMsg('Vui lòng nhập Họ và tên.');
      return;
    }

    setErrorMsg('');
    const updatedUser = {
      ...profile,
      ...formData,
      fullName: formData.fullName.trim(),
      occupation: formData.occupation.trim(),
      bio: formData.bio.trim(),
      age: Number(formData.age),
      tasteProfile: {
        ...taste,
        favoriteDish: taste.favoriteDish.trim()
      }
    };

    onUpdateProfile(updatedUser);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-4 pb-28">
      {/* Thông báo lỗi nếu có */}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold p-3 rounded-2xl mb-4 animate-in fade-in">
          {errorMsg}
        </div>
      )}

      {/* User Header Preview Card (Xem trước thẻ cá nhân) */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm mb-4 relative">
        <div className="flex items-center space-x-4">
          {/* Avatar kèm nút đổi ảnh trực tiếp */}
          <div className="relative group">
            <img
              src={formData.avatarUrl}
              alt={formData.fullName}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-orange-500 shadow-md transition group-hover:brightness-90"
            />
            {formData.isVerified && (
              <div className="absolute -bottom-1 -left-1 bg-sky-500 text-white p-1 rounded-full shadow-xs" title="Đã xác thực eKYC">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            )}
            {/* Nút Upload Đổi ảnh đại diện */}
            <label
              title="Đổi ảnh đại diện từ thiết bị"
              className="absolute -bottom-1.5 -right-1.5 bg-gradient-to-tr from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white p-1.5 rounded-full shadow-md cursor-pointer transition active:scale-90 flex items-center justify-center border-2 border-white"
            >
              <Camera className="w-3.5 h-3.5" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarFile}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1.5">
              <h2 className="text-lg font-black text-slate-900 truncate">{formData.fullName || 'Chưa đặt tên'}</h2>
              <span className="text-slate-400 font-semibold text-sm">({formData.age}t)</span>
            </div>
            <p className="text-xs text-slate-500 font-medium truncate mt-0.5">{formData.occupation || 'Thành viên FoodMate'}</p>
            <div className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Điểm tin cậy: {formData.trustScore || 100}/100
            </div>
          </div>
        </div>

        <div className="mt-3 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          <p className="italic leading-relaxed">"{formData.bio || 'Chưa có lời giới thiệu bản thân'}"</p>
        </div>
      </div>

      {/* FORM CHỈNH SỬA TOÀN DIỆN */}
      <form onSubmit={handleSave} className="space-y-4">
        {/* PHẦN 1: THÔNG TIN CÁ NHÂN CƠ BẢN */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-orange-500" />
              <h3 className="font-bold text-slate-900 text-sm">Thông tin cá nhân & Tài khoản</h3>
            </div>
            <label className="text-[11px] font-bold text-orange-600 cursor-pointer hover:underline flex items-center space-x-1">
              <Camera className="w-3 h-3" />
              <span>Đổi ảnh đại diện</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarFile}
                className="hidden"
              />
            </label>
          </div>

          {/* Họ và tên */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Họ và tên hiển thị</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Nhập họ và tên đầy đủ"
              required
            />
          </div>

          {/* Tuổi & Giới tính */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Số tuổi</label>
              <input
                type="number"
                min="18"
                max="90"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="VD: 25"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Giới tính</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>
          </div>

          {/* Nghề nghiệp */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Nghề nghiệp / Lĩnh vực</label>
            <input
              type="text"
              value={formData.occupation}
              onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="VD: Kỹ sư phần mềm, Marketing, Sinh viên..."
            />
          </div>

          {/* Tiểu sử / Bio */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Tiểu sử / Lời chào giới thiệu</label>
            <textarea
              rows={2}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Chia sẻ sở thích ăn uống hoặc tính cách của bạn..."
            />
          </div>
        </div>

        {/* PHẦN 2: HỒ SƠ KHẨU VỊ ẨM THỰC (TASTE PROFILE) */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Sliders className="w-4 h-4 text-orange-500" />
            <h3 className="font-bold text-slate-900 text-sm">Hồ Sơ Khẩu Vị Ẩm Thực (Taste Profile)</h3>
          </div>

          {/* Món khoái khẩu */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Món ruột / Thèm nhất lúc này
            </label>
            <input
              type="text"
              value={taste.favoriteDish}
              onChange={(e) => setTaste({ ...taste, favoriteDish: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="VD: Bún đậu mắm tôm, Lẩu nấm, Mì cay, Đồ nướng..."
            />
          </div>

          {/* Mức độ ăn cay */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-700">
                Cấp độ ăn cay (1 - 5)
              </label>
              <span className="text-xs font-black text-red-500 flex items-center">
                <Flame className="w-3.5 h-3.5 fill-red-500 mr-0.5" />
                Cấp {taste.spicyLevel}
              </span>
            </div>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  type="button"
                  key={lvl}
                  onClick={() => setTaste({ ...taste, spicyLevel: lvl })}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                    taste.spicyLevel === lvl
                      ? 'bg-red-500 text-white border-red-500 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Phân khúc ngân sách */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Mức chi trả quen thuộc cho mỗi bữa ăn
            </label>
            <select
              value={taste.budgetTier}
              onChange={(e) => setTaste({ ...taste, budgetTier: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {BUDGET_TIERS.map((tier) => (
                <option key={tier.code} value={tier.code}>
                  {tier.name} — {tier.desc}
                </option>
              ))}
            </select>
          </div>

          {/* Mục đích kết nối */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Mục đích kết nối</label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { code: 'food_buddy', label: 'Tìm bạn ăn' },
                { code: 'friendship', label: 'Giao lưu' },
                { code: 'dating', label: 'Hẹn hò' }
              ].map((p) => (
                <button
                  type="button"
                  key={p.code}
                  onClick={() => setTaste({ ...taste, connectionPurpose: p.code })}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition ${
                    taste.connectionPurpose === p.code
                      ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Gu ẩm thực */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
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
                    className={`p-2 rounded-xl text-xs text-left transition flex items-center space-x-1.5 border ${
                      selected
                        ? 'bg-orange-50 border-orange-400 text-orange-950 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <span>{c.icon}</span>
                    <span className="truncate">{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bán kính tối đa */}
          <div>
            <div className="flex justify-between items-center mb-1 text-xs">
              <label className="font-bold text-slate-700">
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

        {/* Nút lưu tất cả thay đổi */}
        <button
          type="submit"
          className={`w-full py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 shadow-lg transition active:scale-98 ${
            isSaved
              ? 'bg-emerald-600 text-white shadow-emerald-600/30'
              : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-orange-500/30 hover:brightness-105'
          }`}
        >
          {isSaved ? (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Đã lưu thành công thông tin & khẩu vị!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Lưu Cập Nhật Hồ Sơ & Khẩu Vị</span>
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
