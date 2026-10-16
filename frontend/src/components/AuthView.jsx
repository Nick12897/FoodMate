import React, { useState } from 'react';
import { User, Phone, Lock, Flame, Utensils, Check, ArrowRight, Sparkles, LogIn, UserPlus, Camera, Trash2 } from 'lucide-react';
import { MASTER_CUISINES, BUDGET_TIERS } from '../data/mockData';
import { api } from '../services/api';

export default function AuthView({ authMode = 'login', onChangeAuthMode, onAuthSuccess }) {
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

  // Xử lý Đăng nhập qua Mạng Xã Hội (Google, Facebook, Apple)
  const handleSocialLogin = async (provider) => {
    setErrorMsg('');
    setLoading(true);

    const providerProfiles = {
      google: {
        name: 'Nguyễn Minh Quân (Google)',
        email: 'minhquan.foodie@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500&auto=format&fit=crop&q=80',
        socialId: 'google_108273648'
      },
      facebook: {
        name: 'Trần Thảo Ly (Facebook)',
        email: 'thaoly.foodie@facebook.com',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=80',
        socialId: 'fb_983742189'
      },
      apple: {
        name: 'Lê Hoàng Nam (Apple)',
        email: 'hoangnam.apple@privaterelay.appleid.com',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=500&auto=format&fit=crop&q=80',
        socialId: 'apple_839201948'
      }
    };

    const mockProfile = providerProfiles[provider] || {
      name: `Thành viên ${provider.toUpperCase()}`,
      email: `${provider}@foodmate.vn`,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
      socialId: `${provider}_${Date.now()}`
    };

    try {
      const res = await api.socialLogin(provider, {
        fullName: mockProfile.name,
        email: mockProfile.email,
        avatarUrl: mockProfile.avatar,
        socialId: mockProfile.socialId
      });
      if (res && res.data && res.data.user) {
        onAuthSuccess(res.data.user);
        return;
      }
    } catch (err) {
      console.warn('Backend unavailable, fallback social login profile:', err);
      const fallbackUser = {
        id: `user-${provider}-${Date.now().toString().slice(-4)}`,
        fullName: mockProfile.name,
        phoneNumber: `+84_${provider}`,
        age: 24,
        gender: provider === 'facebook' ? 'female' : 'male',
        occupation: `Thành viên FoodMate (${provider.toUpperCase()})`,
        bio: `Chào cả nhà! Mình đăng nhập bằng ${provider.toUpperCase()} và rất thích kết nối bạn ăn cùng gu ẩm thực.`,
        avatarUrl: mockProfile.avatar,
        isVerified: true,
        trustScore: 98,
        tasteProfile: {
          cuisines: ['VN_TRAD', 'BBQ', 'HOTPOT'],
          spicyLevel: 2,
          budgetTier: 'BUDGET_T2',
          favoriteDish: 'Bún chả Hà Nội & Lẩu Thái',
          connectionPurpose: 'food_buddy',
          maxDistanceKm: 10
        }
      };
      onAuthSuccess(fallbackUser);
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
    <div className="max-w-md mx-auto px-4 py-4 pb-28">
      {/* Brand Header: Hiển thị đúng tiêu đề của chức năng đang chọn */}
      <div className="text-center mb-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 mx-auto flex items-center justify-center text-white shadow-md shadow-orange-500/25 mb-2">
          {authMode === 'login' ? <LogIn className="w-7 h-7" /> : <UserPlus className="w-7 h-7" />}
        </div>
        <h2 className="text-xl font-black bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
          {authMode === 'login' ? 'Đăng Nhập Tài Khoản' : 'Đăng Ký Thành Viên Mới'}
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5 max-w-xs mx-auto">
          {authMode === 'login'
            ? 'Đăng nhập để xem gợi ý món ngon và kết nối bạn ăn cùng bàn'
            : 'Tạo tài khoản và thiết lập gu ẩm thực để tìm bạn ăn ưng ý nhất'}
        </p>
      </div>

      {/* Thông báo lỗi nếu có */}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium p-3 rounded-2xl mb-4 animate-in fade-in">
          {errorMsg}
        </div>
      )}

      {/* ==================== MÀN HÌNH ĐĂNG NHẬP RIÊNG BIỆT ==================== */}
      {authMode === 'login' && (
        <form onSubmit={handleLogin} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-900 text-sm">Thông tin đăng nhập</h3>
            <span className="text-[11px] text-slate-400">Sử dụng số điện thoại của bạn</span>
          </div>

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

          {/* Phân cách tiếp tục với mạng xã hội */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Hoặc tiếp tục với
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* 3 Nút Đăng nhập Nhanh Google - Facebook - Apple */}
          <div className="grid grid-cols-3 gap-2">
            {/* Google */}
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSocialLogin('google')}
              className="flex items-center justify-center space-x-1.5 py-2.5 px-2 bg-white hover:bg-slate-50 active:scale-95 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 shadow-sm transition"
              title="Đăng nhập bằng Google"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Google</span>
            </button>

            {/* Facebook */}
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSocialLogin('facebook')}
              className="flex items-center justify-center space-x-1.5 py-2.5 px-2 bg-[#1877F2]/5 hover:bg-[#1877F2]/10 active:scale-95 border border-[#1877F2]/20 rounded-2xl text-xs font-bold text-[#1877F2] shadow-sm transition"
              title="Đăng nhập bằng Facebook"
            >
              <svg className="w-4 h-4 shrink-0 fill-current text-[#1877F2]" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Facebook</span>
            </button>

            {/* Apple */}
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSocialLogin('apple')}
              className="flex items-center justify-center space-x-1.5 py-2.5 px-2 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white border border-slate-900 rounded-2xl text-xs font-bold shadow-sm transition"
              title="Đăng nhập bằng Apple"
            >
              <svg className="w-4 h-4 shrink-0 fill-current text-white" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 1.01-2.87-.96.04-2.14.65-2.79 1.4-.56.65-1.05 1.7-1 2.76 1.08.08 2.16-.54 2.78-1.29z"/>
              </svg>
              <span>Apple</span>
            </button>
          </div>

          {/* Chuyển sang Đăng ký nếu chưa có tài khoản */}
          <div className="text-center pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-500">Chưa có tài khoản FoodMate? </span>
            <button
              type="button"
              onClick={() => { setErrorMsg(''); onChangeAuthMode('register'); }}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline"
            >
              Đăng ký ngay
            </button>
          </div>
        </form>
      )}

      {/* ==================== MÀN HÌNH ĐĂNG KÝ RIÊNG BIỆT ==================== */}
      {authMode === 'register' && (
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

            {/* MỤC TẢI ẢNH ĐẠI DIỆN LÊN TỪ THIẾT BỊ */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Ảnh đại diện</label>

              {regData.avatarUrl ? (
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

          {/* Phân cách hoặc đăng ký nhanh qua mạng xã hội */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Hoặc đăng ký nhanh với
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* 3 Nút Đăng ký Nhanh */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSocialLogin('google')}
              className="flex items-center justify-center space-x-1.5 py-2.5 px-2 bg-white hover:bg-slate-50 active:scale-95 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 shadow-sm transition"
              title="Đăng ký bằng Google"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Google</span>
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSocialLogin('facebook')}
              className="flex items-center justify-center space-x-1.5 py-2.5 px-2 bg-[#1877F2]/5 hover:bg-[#1877F2]/10 active:scale-95 border border-[#1877F2]/20 rounded-2xl text-xs font-bold text-[#1877F2] shadow-sm transition"
              title="Đăng ký bằng Facebook"
            >
              <svg className="w-4 h-4 shrink-0 fill-current text-[#1877F2]" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Facebook</span>
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSocialLogin('apple')}
              className="flex items-center justify-center space-x-1.5 py-2.5 px-2 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white border border-slate-900 rounded-2xl text-xs font-bold shadow-sm transition"
              title="Đăng ký bằng Apple"
            >
              <svg className="w-4 h-4 shrink-0 fill-current text-white" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 1.01-2.87-.96.04-2.14.65-2.79 1.4-.56.65-1.05 1.7-1 2.76 1.08.08 2.16-.54 2.78-1.29z"/>
              </svg>
              <span>Apple</span>
            </button>
          </div>

          {/* Chuyển sang Đăng nhập nếu đã có tài khoản */}
          <div className="text-center pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-500">Đã có tài khoản FoodMate? </span>
            <button
              type="button"
              onClick={() => { setErrorMsg(''); onChangeAuthMode('login'); }}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline"
            >
              Đăng nhập tại đây
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
