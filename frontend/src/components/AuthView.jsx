import React, { useState, useEffect } from 'react';
import { User, Phone, Lock, Flame, Utensils, Check, ArrowRight, Sparkles, ShieldCheck, LogIn, UserPlus } from 'lucide-react';
import { MASTER_CUISINES, BUDGET_TIERS } from '../data/mockData';
import { api } from '../services/api';

const SAMPLE_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80"
];

export default function AuthView({ onAuthSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [sampleUsers, setSampleUsers] = useState([]);

  // Form Đăng nhập
  const [loginPhone, setLoginPhone] = useState('+84901234567');
  const [loginPassword, setLoginPassword] = useState('123456');

  // Form Đăng ký
  const [regData, setRegData] = useState({
    phoneNumber: '+8498',
    fullName: '',
    age: 23,
    gender: 'female',
    occupation: 'Nhân viên văn phòng',
    bio: 'Mê ăn uống, thích tìm quán mới mỗi cuối tuần!',
    avatarUrl: SAMPLE_AVATARS[0],
    favoriteDish: 'Lẩu Thái hải sản',
    spicyLevel: 3,
    budgetTier: 'BUDGET_T2',
    cuisines: ['VN_TRAD', 'HOTPOT', 'THA_HOT'],
    connectionPurpose: 'food_buddy'
  });

  // Tải danh sách user mẫu khi mount
  useEffect(() => {
    async function loadSamples() {
      const samples = await api.getSampleUsers();
      if (samples && samples.length > 0) {
        setSampleUsers(samples);
      } else {
        // Fallback local sample users
        setSampleUsers([
          { id: 'user-me', full_name: 'Minh Khoa', phone_number: '+84901234567', avatar_url: SAMPLE_AVATARS[0], occupation: 'Software Engineer' },
          { id: 'user-02', full_name: 'Lê Mai Phương', phone_number: '+84901234568', avatar_url: SAMPLE_AVATARS[1], occupation: 'Content Creator' },
          { id: 'user-03', full_name: 'Hoàng Nam', phone_number: '+84901234569', avatar_url: SAMPLE_AVATARS[2], occupation: 'UX/UI Designer' }
        ]);
      }
    }
    loadSamples();
  }, []);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await api.login(loginPhone, loginPassword);
      if (res && res.data && res.data.user) {
        onAuthSuccess(res.data.user);
      }
    } catch (err) {
      // Nếu backend lỗi hoặc sđt chưa có trong db, giả lập đăng nhập local để trải nghiệm liền
      const foundSample = sampleUsers.find(s => s.phone_number === loginPhone);
      if (foundSample) {
        onAuthSuccess({
          id: foundSample.id,
          fullName: foundSample.full_name,
          phoneNumber: foundSample.phone_number,
          avatarUrl: foundSample.avatar_url,
          occupation: foundSample.occupation,
          isVerified: true,
          trustScore: 98,
          tasteProfile: {
            cuisines: ['VN_TRAD', 'HOTPOT'],
            spicyLevel: 3,
            budgetTier: 'BUDGET_T2',
            favoriteDish: 'Lẩu Nấm',
            maxDistanceKm: 10
          }
        });
      } else {
        setErrorMsg(err.message || 'Không thể đăng nhập. Vui lòng kiểm tra lại số điện thoại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (sample) => {
    setLoginPhone(sample.phone_number);
    onAuthSuccess({
      id: sample.id,
      fullName: sample.full_name,
      phoneNumber: sample.phone_number,
      avatarUrl: sample.avatar_url,
      occupation: sample.occupation,
      isVerified: true,
      trustScore: 98,
      tasteProfile: {
        cuisines: ['VN_TRAD', 'HOTPOT', 'KOR_BBQ'],
        spicyLevel: 3,
        budgetTier: 'BUDGET_T2',
        favoriteDish: 'Lẩu & Đồ nướng',
        maxDistanceKm: 10
      }
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regData.fullName.trim()) {
      setErrorMsg('Vui lòng nhập Họ và tên của bạn.');
      return;
    }
    if (!regData.phoneNumber.trim() || regData.phoneNumber.length < 9) {
      setErrorMsg('Vui lòng nhập số điện thoại hợp lệ.');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      const payload = {
        phone_number: regData.phoneNumber,
        full_name: regData.fullName,
        age: Number(regData.age),
        gender: regData.gender,
        occupation: regData.occupation,
        bio: regData.bio,
        avatar_url: regData.avatarUrl,
        favorite_dish: regData.favoriteDish,
        spicy_level: regData.spicyLevel,
        budget_tier: regData.budgetTier,
        cuisines: regData.cuisines,
        connection_purpose: regData.connectionPurpose
      };

      const res = await api.register(payload);
      if (res && res.data && res.data.user) {
        alert('🎉 Chúc mừng bạn đã đăng ký tài khoản FoodMate thành công!');
        onAuthSuccess(res.data.user);
      }
    } catch (err) {
      // Fallback local register
      const localUser = {
        id: `user-${Date.now().toString().slice(-5)}`,
        fullName: regData.fullName,
        phoneNumber: regData.phoneNumber,
        age: regData.age,
        gender: regData.gender,
        occupation: regData.occupation,
        bio: regData.bio,
        avatarUrl: regData.avatarUrl,
        isVerified: true,
        trustScore: 100,
        tasteProfile: {
          cuisines: regData.cuisines,
          spicyLevel: regData.spicyLevel,
          budgetTier: regData.budgetTier,
          favoriteDish: regData.favoriteDish,
          maxDistanceKm: 10
        }
      };
      alert('🎉 Đăng ký tài khoản thành công! Chào mừng bạn gia nhập cộng đồng FoodMate.');
      onAuthSuccess(localUser);
    } finally {
      setLoading(false);
    }
  };

  const toggleCuisine = (code) => {
    setRegData(prev => {
      const exists = prev.cuisines.includes(code);
      return {
        ...prev,
        cuisines: exists ? prev.cuisines.filter(c => c !== code) : [...prev.cuisines, code]
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

      {/* Tab Switcher: Đăng nhập vs Đăng ký */}
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

      {/* Error Banner */}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium p-3 rounded-2xl mb-4 animate-in fade-in">
          {errorMsg}
        </div>
      )}

      {/* FORM ĐĂNG NHẬP */}
      {mode === 'login' && (
        <div className="space-y-4">
          <form onSubmit={handleLogin} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3.5">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
              Đăng nhập bằng Số điện thoại
            </h3>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Số điện thoại</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                  placeholder="+84901234567"
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
                  placeholder="Mặc định: 123456"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl font-bold text-xs shadow-md shadow-orange-500/30 hover:brightness-105 transition flex items-center justify-center space-x-1.5 active:scale-98"
            >
              <span>{loading ? 'Đang xử lý...' : 'Đăng nhập vào FoodMate'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Logins */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
              Hoặc bấm đăng nhập nhanh bằng tài khoản mẫu:
            </span>
            <div className="space-y-2">
              {sampleUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleQuickLogin(u)}
                  className="w-full p-2.5 rounded-2xl bg-slate-50 hover:bg-orange-50 hover:border-orange-200 border border-slate-200/80 transition flex items-center justify-between text-left group"
                >
                  <div className="flex items-center space-x-2.5">
                    <img
                      src={u.avatar_url || SAMPLE_AVATARS[0]}
                      alt={u.full_name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs group-hover:text-orange-600 transition">
                        {u.full_name}
                      </h4>
                      <span className="text-[11px] text-slate-500">{u.occupation || u.phone_number}</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-orange-600 bg-orange-100/70 px-2.5 py-1 rounded-full group-hover:bg-orange-500 group-hover:text-white transition">
                    Đăng nhập →
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FORM ĐĂNG KÝ THÀNH VIÊN MỚI */}
      {mode === 'register' && (
        <form onSubmit={handleRegister} className="space-y-4">
          {/* Bước 1: Thông tin cá nhân */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3.5">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
              <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-[11px] font-bold flex items-center justify-center">1</span>
              <h3 className="font-bold text-slate-900 text-sm">Thông tin cá nhân cơ bản</h3>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Số điện thoại (*)</label>
              <input
                type="text"
                value={regData.phoneNumber}
                onChange={(e) => setRegData({ ...regData, phoneNumber: e.target.value })}
                placeholder="+84901234567"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Họ và tên (*)</label>
              <input
                type="text"
                value={regData.fullName}
                onChange={(e) => setRegData({ ...regData, fullName: e.target.value })}
                placeholder="VD: Nguyễn Nhật Minh"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Tuổi</label>
                <input
                  type="number"
                  min="18"
                  max="70"
                  value={regData.age}
                  onChange={(e) => setRegData({ ...regData, age: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Giới tính</label>
                <select
                  value={regData.gender}
                  onChange={(e) => setRegData({ ...regData, gender: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
                >
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Nghề nghiệp</label>
              <input
                type="text"
                value={regData.occupation}
                onChange={(e) => setRegData({ ...regData, occupation: e.target.value })}
                placeholder="VD: Sinh viên, Marketing, IT..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
              />
            </div>

            {/* Chọn Avatar */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Chọn ảnh đại diện</label>
              <div className="flex items-center space-x-2 overflow-x-auto pb-1">
                {SAMPLE_AVATARS.map((url, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setRegData({ ...regData, avatarUrl: url })}
                    className={`relative w-12 h-12 rounded-2xl overflow-hidden shrink-0 border-2 transition ${
                      regData.avatarUrl === url ? 'border-orange-500 scale-105' : 'border-slate-200 opacity-70'
                    }`}
                  >
                    <img src={url} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                    {regData.avatarUrl === url && (
                      <div className="absolute inset-0 bg-orange-500/20 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white stroke-[3]" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bước 2: Thiết lập hồ sơ khẩu vị ban đầu */}
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
                placeholder="VD: Lẩu Tomyum, Phở bò, Mì cay..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
              />
            </div>

            {/* Cấp độ ăn cay */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700">Mức độ ăn cay</label>
                <span className="text-xs font-bold text-red-500">Cấp {regData.spicyLevel}</span>
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
                    <Flame className="w-3 h-3 mr-0.5" />
                    <span>{lvl}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Ngân sách */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Phân khúc ngân sách</label>
              <select
                value={regData.budgetTier}
                onChange={(e) => setRegData({ ...regData, budgetTier: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
              >
                {BUDGET_TIERS.map(t => (
                  <option key={t.code} value={t.code}>{t.name}</option>
                ))}
              </select>
            </div>

            {/* Gu ẩm thực */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Gu ẩm thực yêu thích</label>
              <div className="grid grid-cols-2 gap-1.5">
                {MASTER_CUISINES.slice(0, 6).map(c => {
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
