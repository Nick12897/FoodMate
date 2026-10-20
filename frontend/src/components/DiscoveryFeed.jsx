import React, { useState } from 'react';
import { Heart, X, Star, MapPin, Flame, Utensils, Sparkles, ShieldCheck, RotateCcw, MessageCircle, Check, Users } from 'lucide-react';
import { MASTER_CUISINES } from '../data/mockData';

export default function DiscoveryFeed({
  cards = [],
  onSwipe,
  onOpenChatWith,
  myProfile,
  onReloadCards,
  onGoToChat,
  onResetSwipes,
  matchedCount = 0
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeAnim, setSwipeAnim] = useState(''); // 'like' | 'pass' | 'super'
  const [matchModal, setMatchModal] = useState(null);

  const currentCard = cards[currentIndex];

  const handleAction = (action) => {
    if (!currentCard) return;

    setSwipeAnim(action);

    setTimeout(() => {
      if (onSwipe) {
        onSwipe(currentCard, action);
      }

      // Giả lập tương hợp ẩm thực kiểu Tinder
      if (action === 'super' || (action === 'like' && (currentCard.compatibilityScore >= 75 || Math.random() > 0.3))) {
        setMatchModal(currentCard);
      }

      setSwipeAnim('');
      setCurrentIndex((prev) => prev + 1);
    }, 320);
  };

  const handleRewind = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const getCuisineName = (code) => {
    const found = MASTER_CUISINES.find((c) => c.code === code);
    return found ? `${found.icon} ${found.name}` : code;
  };

  const formatPurpose = (p) => {
    switch (p) {
      case 'food_buddy': return 'Tìm bạn ăn cùng bàn';
      case 'friendship': return 'Kết bạn bốn phương';
      case 'dating': return 'Hẹn hò ẩm thực';
      default: return p || 'Tìm bạn ăn cùng bàn';
    }
  };

  // Màn hình khi chưa có tài khoản nào đăng ký trên hệ thống hoặc đã quẹt/kết nối hết
  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] px-6 text-center max-w-md mx-auto animate-in fade-in duration-300">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-orange-100 to-amber-100 flex items-center justify-center text-orange-500 mb-4 shadow-sm border border-orange-200">
          <Utensils className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-black text-slate-800 mb-2">Đã xem hết bạn ăn quanh đây!</h3>
        <p className="text-xs text-slate-500 mb-6 max-w-xs leading-relaxed">
          {matchedCount > 0
            ? `Bạn đã quẹt qua tất cả hồ sơ trong khu vực. Bạn đang có ${matchedCount} người bạn tương hợp trong Hộp thư Trò chuyện!`
            : 'Hiện tại chưa có thêm hồ sơ thành viên mới trong khu vực. Khi có bạn bè mới đăng ký, hồ sơ sẽ xuất hiện tại đây ngay!'}
        </p>
        <div className="flex flex-col w-full max-w-xs space-y-2.5">
          {matchedCount > 0 && onGoToChat && (
            <button
              onClick={onGoToChat}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl font-bold text-xs shadow-md shadow-orange-500/30 hover:brightness-105 transition active:scale-98 flex items-center justify-center space-x-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>💬 Vào Hộp Thư Trò Chuyện Ngay</span>
            </button>
          )}
          <button
            onClick={() => {
              setCurrentIndex(0);
              if (onReloadCards) onReloadCards();
            }}
            className="w-full py-2.5 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-xs shadow-xs hover:bg-slate-50 transition active:scale-98 flex items-center justify-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Kiểm tra người dùng mới</span>
          </button>
          {onResetSwipes && (
            <button
              onClick={() => {
                setCurrentIndex(0);
                onResetSwipes();
              }}
              className="w-full py-2 text-orange-600 hover:text-orange-700 text-xs font-bold transition active:scale-98"
            >
              🔄 Khám phá lại từ đầu (Reset lượt quẹt)
            </button>
          )}
        </div>
      </div>
    );
  }

  // Màn hình khi đã quẹt hết thẻ trong danh sách hiện tại
  if (!currentCard || currentIndex >= cards.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] px-6 text-center max-w-md mx-auto animate-in fade-in duration-300">
        <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 mb-4 animate-bounce shadow-sm">
          <Utensils className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-black text-slate-800 mb-2">Đã xem hết bạn ăn quanh đây!</h3>
        <p className="text-xs text-slate-500 mb-6 max-w-xs leading-relaxed">
          Bạn đã quẹt qua tất cả hồ sơ thành viên trong khu vực. Bạn có thể trò chuyện với bạn ăn đã tương hợp hoặc bắt đầu lại!
        </p>
        <div className="flex flex-col w-full max-w-xs space-y-2.5">
          {matchedCount > 0 && onGoToChat && (
            <button
              onClick={onGoToChat}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl font-bold text-xs shadow-md shadow-orange-500/30 hover:brightness-105 transition active:scale-98 flex items-center justify-center space-x-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>💬 Vào Hộp Thư Trò Chuyện Ngay</span>
            </button>
          )}
          {onResetSwipes && (
            <button
              onClick={() => {
                setCurrentIndex(0);
                onResetSwipes();
              }}
              className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl font-bold text-xs shadow-md shadow-orange-500/30 hover:brightness-105 transition active:scale-98"
            >
              🔄 Bắt đầu lại vòng quẹt gu
            </button>
          )}
          {currentIndex > 0 && (
            <button
              onClick={handleRewind}
              className="w-full py-2 text-slate-600 hover:text-slate-800 rounded-2xl font-bold text-xs transition active:scale-98"
            >
              Xem lại người vừa quẹt
            </button>
          )}
        </div>
      </div>
    );
  }

  // Trích xuất an toàn mọi thuộc tính (phòng ngừa undefined)
  const fullName = currentCard.fullName || currentCard.full_name || 'Thành viên FoodMate';
  const age = currentCard.age || 24;
  const occupation = currentCard.occupation || 'Thành viên FoodMate';
  const bio = currentCard.bio || 'Yêu thích khám phá ẩm thực và tìm bạn bè cùng bàn ăn.';
  const defaultFallbackAvatar = 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80';
  const avatarUrl = currentCard.avatarUrl || currentCard.avatar_url || defaultFallbackAvatar;
  const distanceKm = currentCard.distanceKm ?? currentCard.distance_km ?? 1.5;
  const compatibilityScore = currentCard.compatibilityScore ?? currentCard.compatibility_score ?? 88;
  const favoriteDish = currentCard.favoriteDish || currentCard.favorite_dish || 'Món ngon mỗi ngày';
  const spicyLevel = currentCard.spicyLevel ?? currentCard.spicy_level ?? 2;
  const connectionPurpose = currentCard.connectionPurpose || currentCard.connection_purpose || 'food_buddy';
  const cuisines = currentCard.cuisines && currentCard.cuisines.length > 0 ? currentCard.cuisines : ['VN_TRAD', 'HOTPOT'];
  const isVerified = currentCard.isVerified ?? currentCard.is_verified ?? true;

  return (
    <div className="relative max-w-md mx-auto px-4 py-3 pb-28">
      {/* Compatibility Badge Top */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Hợp gu ẩm thực {compatibilityScore}%</span>
        </div>
        <div className="flex items-center text-xs font-semibold text-slate-600 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-xs">
          <MapPin className="w-3.5 h-3.5 text-orange-500 mr-1" />
          <span>Cách bạn {distanceKm} km</span>
        </div>
      </div>

      {/* Main Profile Card (Tinder Style) */}
      <div
        className={`relative bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-100 transition-all duration-300 ${
          swipeAnim === 'like'
            ? 'translate-x-32 rotate-12 opacity-0'
            : swipeAnim === 'pass'
            ? '-translate-x-32 -rotate-12 opacity-0'
            : swipeAnim === 'super'
            ? '-translate-y-32 scale-105 opacity-0'
            : ''
        }`}
      >
        {/* Photo Container */}
        <div className="relative h-[390px] w-full bg-slate-900 overflow-hidden">
          <img
            src={avatarUrl}
            alt={fullName}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = defaultFallbackAvatar;
            }}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

          {/* Quick info over photo */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl font-black drop-shadow-md">
                {fullName}, {age}
              </h2>
              {isVerified && (
                <ShieldCheck className="w-5 h-5 text-sky-400 fill-sky-400/20" title="Đã xác thực eKYC" />
              )}
            </div>
            <p className="text-xs text-slate-200 font-medium mt-0.5">{occupation}</p>
            <p className="text-xs text-orange-200 mt-1 line-clamp-2 leading-relaxed">{bio}</p>
          </div>
        </div>

        {/* Food Taste Profile Section */}
        <div className="p-4 space-y-3 bg-white">
          {/* Món khoái khẩu */}
          <div className="bg-amber-50/90 border border-amber-200/70 rounded-2xl p-3 flex items-start space-x-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">Món khoái khẩu nhất</span>
              <p className="text-sm font-bold text-slate-900">{favoriteDish}</p>
            </div>
          </div>

          {/* Cấp độ cay & Mục đích kết nối */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-slate-400 block mb-1">Độ ăn cay</span>
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Flame
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < spicyLevel ? 'text-red-500 fill-red-500' : 'text-slate-200'
                    }`}
                  />
                ))}
                <span className="font-bold text-slate-700 ml-1">Cấp {spicyLevel}</span>
              </div>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-slate-400 block mb-1">Mục đích kết nối</span>
              <span className="font-semibold text-orange-600 truncate block">
                {formatPurpose(connectionPurpose)}
              </span>
            </div>
          </div>

          {/* Gu ẩm thực tags */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Thể loại ẩm thực yêu thích
            </span>
            <div className="flex flex-wrap gap-1.5">
              {cuisines.map((cCode) => (
                <span
                  key={cCode}
                  className="bg-orange-50 text-orange-800 border border-orange-200/60 px-2.5 py-1 rounded-full text-xs font-semibold"
                >
                  {getCuisineName(cCode)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Swipe Action Floating Buttons - Phong cách chuẩn Tinder */}
      <div className="flex items-center justify-center space-x-4 mt-5">
        {/* Rewind Button */}
        <button
          onClick={handleRewind}
          disabled={currentIndex === 0}
          className={`w-11 h-11 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center transition active:scale-90 ${
            currentIndex === 0 ? 'opacity-40 cursor-not-allowed text-slate-300' : 'text-amber-500 hover:bg-amber-50'
          }`}
          title="Quay lại thẻ trước"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        {/* Pass Button (Bỏ qua) */}
        <button
          onClick={() => handleAction('pass')}
          className="w-14 h-14 rounded-full bg-white text-rose-500 hover:bg-rose-50 border-2 border-rose-200 shadow-md hover:shadow-lg flex items-center justify-center transition active:scale-90"
          title="Bỏ qua (Pass)"
        >
          <X className="w-7 h-7 stroke-[2.5]" />
        </button>

        {/* Super Like Button */}
        <button
          onClick={() => handleAction('super')}
          className="w-12 h-12 rounded-full bg-white text-sky-500 hover:bg-sky-50 border-2 border-sky-200 shadow-md hover:shadow-lg flex items-center justify-center transition active:scale-90"
          title="Siêu thích (Super Like)"
        >
          <Star className="w-6 h-6 fill-sky-400 stroke-sky-500" />
        </button>

        {/* Like Button (Thích - Rủ đi ăn) */}
        <button
          onClick={() => handleAction('like')}
          className="w-16 h-16 rounded-full bg-gradient-to-tr from-orange-500 to-rose-500 text-white shadow-lg shadow-orange-500/40 hover:brightness-110 flex items-center justify-center transition active:scale-90"
          title="Hợp gu - Thích (Like)"
        >
          <Heart className="w-8 h-8 fill-white stroke-white" />
        </button>
      </div>

      {/* MATCH MODAL POPUP - Tương hợp ẩm thực như Tinder */}
      {matchModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center animate-in fade-in zoom-in-95 duration-200 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-orange-500 to-rose-500 text-white mx-auto flex items-center justify-center shadow-lg shadow-orange-500/40 mb-3 animate-pulse">
              <Heart className="w-9 h-9 fill-white" />
            </div>

            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Tương Hợp Ẩm Thực! 🎉</h3>
            <p className="text-xs text-orange-600 font-bold uppercase tracking-wider mt-0.5">
              Hợp gu {matchModal.compatibilityScore ?? matchModal.compatibility_score ?? 88}% khẩu vị
            </p>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Bạn và <span className="font-bold text-slate-900">{matchModal.fullName || matchModal.full_name}</span> đều có chung niềm đam mê ẩm thực!
            </p>

            {/* Hai avatar kết nối cạnh nhau */}
            <div className="flex items-center justify-center space-x-3 my-5">
              <img
                src={myProfile?.avatarUrl || defaultFallbackAvatar}
                alt="Bạn"
                className="w-16 h-16 rounded-full object-cover border-3 border-orange-500 shadow-md"
              />
              <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-black text-sm">
                &
              </div>
              <img
                src={matchModal.avatarUrl || matchModal.avatar_url || defaultFallbackAvatar}
                alt={matchModal.fullName || matchModal.full_name}
                className="w-16 h-16 rounded-full object-cover border-3 border-rose-500 shadow-md"
              />
            </div>

            <div className="space-y-2 mt-4">
              <button
                onClick={() => {
                  const target = {
                    ...matchModal,
                    id: matchModal.id || matchModal.user_id,
                    fullName: matchModal.fullName || matchModal.full_name,
                    avatarUrl: matchModal.avatarUrl || matchModal.avatar_url || defaultFallbackAvatar
                  };
                  setMatchModal(null);
                  if (onOpenChatWith) onOpenChatWith(target);
                }}
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-2xl font-bold text-xs shadow-md shadow-orange-500/30 hover:opacity-95 transition flex items-center justify-center space-x-1.5 active:scale-98"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Nhắn tin rủ đi ăn ngay 🍜</span>
              </button>
              <button
                onClick={() => setMatchModal(null)}
                className="w-full py-2.5 bg-slate-100 text-slate-700 rounded-2xl font-semibold hover:bg-slate-200 transition text-xs active:scale-98"
              >
                Tiếp tục quẹt tìm bạn ăn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
