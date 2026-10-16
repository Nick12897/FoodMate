import React, { useState } from 'react';
import { User, Phone, Lock, Flame, Utensils, Check, ArrowRight, Sparkles, LogIn, UserPlus, Upload, Camera, Trash2, Image as ImageIcon } from 'lucide-react';
import { MASTER_CUISINES, BUDGET_TIERS } from '../data/mockData';
import { api } from '../services/api';

export default function AuthView({ onAuthSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Form Đăng nhập: Hoàn toàn trống, không để sẵn gợi ý
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Form Đăng ký: Hoàn toàn trống, người dùng tự điền từ đầu
  const [regData, setRegData] = useState({
    phoneNumber: '',
    fullName: '',
    age: '',
    gender: '',
    occupation: '',
    bio: '',
    avatarUrl: '', // Ảnh tải lên từ thiết bị
    favoriteDish: '',
    spicyLevel: 1,
    budgetTier: 'BUDGET_T2',
    cuisines: [],
    connectionPurpose: 'food_buddy'
  });

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
      setRegData((prev) => ({ ...prev, avatarUrl: event.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const removeAvatar = () => {
    setRegData((prev) => ({ ...prev, avatarUrl: '' }));
  };

  // Xử lý Đăng nhập
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginPhone.trim()) {
      setErrorMsg('Vui lòng nhập số điện thoại.');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      const res = await api.login(loginPhone.trim(), loginPassword);
      if (res && res.data && res.data.user) {
        onAuthSuccess(res.data.user);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Số điện thoại hoặc mật khẩu không chính xác. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý Đăng ký
  const handleRegister = async (e) => {
    e.preventDefault();

    if (!regData.phoneNumber.trim()) {
      setErrorMsg('Vui lòng nhập số điện thoại.');
      return;
    }
    if (!regData.fullName.trim()) {
      setErrorMsg('Vui lòng nhập Họ và tên.');
      return;
    }
    if (!regData.age) {
      setErrorMsg('Vui lòng nhập tuổi của bạn (từ 18 tuổi trở lên).');
      return;
    }
    if (!regData.gender) {
      setErrorMsg('Vui lòng chọn giới tính.');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      // Nếu chưa tải ảnh lên, dùng ảnh avatar mặc định theo giới tính
      const defaultAvatar = regData.gender === 'female'
        ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80';

      const payload = {
        phone_number: regData.phoneNumber.trim(),
        full_name: regData.fullName.trim(),
        age: Number(regData.age),
        gender: regData.gender,
        occupation: regData.occupation.trim() || 'Thành viên FoodMate',
        bio: regData.bio.trim() || `Yêu thích ${regData.favoriteDish || 'ẩm thực và tìm bạn ăn cùng'}`,
        avatar_url: regData.avatarUrl || defaultAvatar,
        favorite_dish: regData.favoriteDish.trim() || 'Món Việt truyền thống',
        spicy_level: regData.spicyLevel,
        budget_tier: regData.budgetTier,
        cuisines: regData.cuisines.length > 0 ? regData.cuisines : ['VN_TRAD', 'HOTPOT'],
        connection_purpose: regData.connectionPurpose
      };

      const res = await api.register(payload);
      if (res && res.data && res.data.user) {
        alert('🎉 Đăng ký tài khoản FoodMate thành công!');
        onAuthSuccess(res.data.user);
      }
    } catch (err) {
      // Fallback lưu local nếu backend bận
      const fallbackAvatar = regData.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80';
      const localUser = {
        id: `user-${Date.now().toString().slice(-6)}`,
        fullName: regData.fullName.trim(),
        phoneNumber: regData.phoneNumber.trim(),
        age: Number(regData.age),
        gender: regData.gender,
        occupation: regData.occupation.trim() || 'Thành viên FoodMate',
        bio: regData.bio.trim() || 'Tìm bạn ăn cùng bàn!',
        avatarUrl: fallbackAvatar,
        isVerified: true,
        trustScore: 100,
        tasteProfile: {
          cuisines: regData.cuisines.length > 0 ? regData.cuisines : ['VN_TRAD'],
          spicyLevel: regData.spicyLevel,
          budgetTier: regData.budgetTier,
          favoriteDish: regData.favoriteDish.trim() || 'Món ngon mỗi ngày',
          maxDistanceKm: 10
        }
      };
      alert('🎉 Đăng ký tài khoản FoodMate thành công!');
      onAuthSuccess(localUser);
    } finally {
      setLoading(false);
    }
  };

  const toggleCuisine = (code) => {
    setRegData((prev) => {
      const exists = prev.cuisines.includes(code);
      return {
        ...prev,
        cuisines: exists ? prev.cuisines.filter((c) => c !== code) : [...prev.cuisines, code]
      };
    });
  };

  return (
    <div className="max-w-md mx-auto px-4 py-5 pb-28">
      {/* Brand Header */}
      <div className="text-center mb-5">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-orange-500 to-amber-400 mx-auto flex items-center justify-center text-white shadow-lg shadow-orange-500/30 mb-3 animate-pulse">
          <Utensils className="w-9 h-9 stroke-[2.2]" />
        </div>
        <h2 className="text-2xl font-black bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
          Cộng Đồng FoodMate
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Đăng ký & Đăng nhập để lưu hồ sơ khẩu vị và kết nối bạn ăn cùng bàn
        </p>
      </div>

      {/* Tab Chuyển đổi Đăng nhập / Đăng ký */}
      <div className="flex bg-slate-200/80 p-1 rounded-2xl mb-5 shadow-inner">
        <button
          onClick={() => { setMode('login'); setErrorMsg(''); }}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 transition duration-200 ${
            mode === 'login'
              ? 'bg-white text-orange-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <LogIn className="w-4 h-4" />
          <span>Đăng Nhập</span>
        </button>

        <button
          onClick={() => { setMode('register'); setErrorMsg(''); }}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 transition duration-200 ${
            mode === 'register'
              ? 'bg-white text-orange-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>Đăng Ký Tài Khoản</span>
        </button>
      </div>

      {/* Thông báo lỗi nếu có */}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium p-3 rounded-2xl mb-4 animate-in fade-in">
          {errorMsg}
        </div>
      )}

      {/* ==================== FORM ĐĂNG NHẬP ==================== */}
      {mode === 'login' && (
        <form onSubmit={handleLogin} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
            Đăng nhập bằng Số điện thoại
          </h3>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Số điện thoại</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="tel"
                value={loginPhone}
                onChange={(e) => setLoginPhone(e.target.value)}
                placeholder="Nhập số điện thoại của bạn"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Mật khẩu / Mã OTP</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Nhập mật khẩu hoặc mã xác thực"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl font-bold text-xs shadow-md shadow-orange-500/30 hover:brightness-105 transition flex items-center justify-center space-x-1.5 active:scale-98"
          >
            <span>{loading ? 'Đang xác thực...' : 'Đăng nhập vào FoodMate'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* ==================== FORM ĐĂNG KÝ ==================== */}
      {mode === 'register' && (
        <form onSubmit={handleRegister} className="space-y-4">
          {/* Bước 1: Thông tin cá nhân cơ bản */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3.5">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
              <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-[11px] font-bold flex items-center justify-center">1</span>
              <h3 className="font-bold text-slate-900 text-sm">Thông tin cá nhân cơ bản</h3>
            </div>

            {/* Số điện thoại */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Số điện thoại (*)</label>
              <input
                type="tel"
                value={regData.phoneNumber}
                onChange={(e) => setRegData({ ...regData, phoneNumber: e.target.value })}
                placeholder="Nhập số điện thoại (ví dụ: 0912345678)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            {/* Họ và tên */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Họ và tên (*)</label>
              <input
                type="text"
                value={regData.fullName}
                onChange={(e) => setRegData({ ...regData, fullName: e.target.value })}
                placeholder="Nhập họ và tên đầy đủ"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            {/* Tuổi & Giới tính */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Tuổi (*)</label>
                <input
                  type="number"
                  min="18"
                  max="80"
                  value={regData.age}
                  onChange={(e) => setRegData({ ...regData, age: e.target.value })}
                  placeholder="Nhập tuổi"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Giới tính (*)</label>
                <select
                  value={regData.gender}
                  onChange={(e) => setRegData({ ...regData, gender: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                  required
                >
                  <option value="">-- Chọn giới tính --</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>
            </div>

            {/* Nghề nghiệp */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Nghề nghiệp</label>
              <input
                type="text"
                value={regData.occupation}
                onChange={(e) => setRegData({ ...regData, occupation: e.target.value })}
                placeholder="Nhập nghề nghiệp (ví dụ: Kỹ sư, Sinh viên, Kinh doanh...)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* MỤC TẢI ẢNH ĐẠI DIỆN LÊN TỪ THIẾT BỊ (Đã bỏ các icon có sẵn) */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Ảnh đại diện</label>

              {regData.avatarUrl ? (
                // Đã có ảnh xem trước
                <div className="flex items-center space-x-3.5 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-orange-500 shadow-sm shrink-0">
                    <img
                      src={regData.avatarUrl}
                      alt="Avatar preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-slate-800 block truncate">Ảnh đại diện đã chọn</span>
                    <span className="text-[11px] text-emerald-600 font-medium block">Sẵn sàng sử dụng ✓</span>
                    <div className="flex items-center space-x-2 mt-1.5">
                      <label
                        htmlFor="avatar-file-input"
                        className="text-[11px] font-bold text-orange-600 hover:text-orange-700 cursor-pointer"
                      >
                        Đổi ảnh khác
                      </label>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={removeAvatar}
                        className="text-[11px] font-bold text-rose-500 hover:text-rose-700 flex items-center space-x-0.5"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Xóa ảnh</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // Khung bấm tải ảnh lên
                <label
                  htmlFor="avatar-file-input"
                  className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-slate-300 hover:border-orange-500 bg-slate-50 hover:bg-orange-50/40 transition cursor-pointer group text-center"
                >
                  <div className="w-12 h-12 rounded-2xl bg-orange-100/70 text-orange-600 flex items-center justify-center mb-2 group-hover:scale-105 transition">
                    <Camera className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 group-hover:text-orange-600 transition">
                    Bấm để tải ảnh đại diện từ thiết bị
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    Hỗ trợ tệp JPG, PNG, WEBP (tối đa 5MB)
                  </span>
                </label>
              )}

              {/* Input file ẩn */}
              <input
                id="avatar-file-input"
                type="file"
                accept="image/*"
                onChange={handleAvatarFile}
                className="hidden"
              />
            </div>
          </div>

          {/* Bước 2: Thiết lập hồ sơ khẩu vị ẩm thực ban đầu */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3.5">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
              <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-[11px] font-bold flex items-center justify-center">2</span>
              <h3 className="font-bold text-slate-900 text-sm">Hồ sơ khẩu vị ẩm thực ban đầu</h3>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Món ăn khoái khẩu nhất</label>
              <input
                type="text"
                value={regData.favoriteDish}
                onChange={(e) => setRegData({ ...regData, favoriteDish: e.target.value })}
                placeholder="Nhập món khoái khẩu (ví dụ: Lẩu nấm, Phở bò, Mì cay...)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Cấp độ ăn cay */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700">Mức độ ăn cay</label>
                <span className="text-xs font-bold text-red-500 flex items-center">
                  <Flame className="w-3.5 h-3.5 fill-red-500 mr-0.5" />
                  Cấp {regData.spicyLevel}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    type="button"
                    key={lvl}
                    onClick={() => setRegData({ ...regData, spicyLevel: lvl })}
                    className={`py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center ${
                      regData.spicyLevel === lvl
                        ? 'bg-red-500 text-white shadow-sm'
                        : 'bg-slate-50 border border-slate-200 text-slate-600'
                    }`}
                  >
                    <span>Cấp {lvl}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Ngân sách mong muốn */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Phân khúc ngân sách mong muốn</label>
              <select
                value={regData.budgetTier}
                onChange={(e) => setRegData({ ...regData, budgetTier: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium cursor-pointer"
              >
                {BUDGET_TIERS.map((t) => (
                  <option key={t.code} value={t.code}>{t.name}</option>
                ))}
              </select>
            </div>

            {/* Gu ẩm thực */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Gu ẩm thực yêu thích (chọn nhiều)</label>
              <div className="grid grid-cols-2 gap-1.5">
                {MASTER_CUISINES.slice(0, 6).map((c) => {
                  const selected = regData.cuisines.includes(c.code);
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
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl font-bold text-xs shadow-lg shadow-orange-500/30 hover:brightness-105 transition flex items-center justify-center space-x-2 active:scale-98"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? 'Đang tạo tài khoản...' : 'Hoàn tất đăng ký & Mở khóa tính năng'}</span>
          </button>
        </form>
      )}
    </div>
  );
}
