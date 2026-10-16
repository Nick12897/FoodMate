import React, { useState } from 'react';
import { Heart, X, Star, MapPin, Flame, Utensils, Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { MASTER_CUISINES } from '../data/mockData';

export default function DiscoveryFeed({ cards, onSwipe, onOpenChatWith }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeAnim, setSwipeAnim] = useState(''); // 'like' | 'pass' | 'super'
  const [matchModal, setMatchModal] = useState(null);

  const currentCard = cards[currentIndex];

  const handleAction = (action) => {
    if (!currentCard) return;

    setSwipeAnim(action);

    setTimeout(() => {
      onSwipe(currentCard.id, action);

      // Giả lập tỉ lệ match cao khi Like
      if (action === 'like' || action === 'super') {
        if (currentCard.compatibilityScore >= 85) {
          setMatchModal(currentCard);
        }
      }

      setSwipeAnim('');
      setCurrentIndex((prev) => prev + 1);
    }, 300);
  };

  const getCuisineName = (code) => {
    const found = MASTER_CUISINES.find((c) => c.code === code);
    return found ? `${found.icon} ${found.name}` : code;
  };

  if (!currentCard || currentIndex >= cards.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 mb-4 animate-bounce">
          <Utensils className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">Hết bạn ăn quanh đây rồi!</h3>
        <p className="text-sm text-slate-500 mb-6 max-w-xs">
          Bạn đã quẹt hết các hồ sơ ẩm thực phù hợp trong bán kính 10km. Hãy mở rộng bán kính hoặc quay lại sau nhé!
        </p>
        <button
          onClick={() => setCurrentIndex(0)}
          className="px-6 py-2.5 bg-orange-500 text-white rounded-full font-semibold shadow-md shadow-orange-500/30 hover:bg-orange-600 transition"
        >
          Tải lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="relative max-w-md mx-auto px-4 py-3 pb-24">
      {/* Compatibility Badge Top */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Hợp gu ẩm thực {currentCard.compatibilityScore}%</span>
        </div>
        <div className="flex items-center text-xs text-slate-500 bg-white px-2.5 py-1 rounded-full border border-slate-200">
          <MapPin className="w-3 h-3 text-orange-500 mr-1" />
          <span>Cách bạn {currentCard.distanceKm} km</span>
        </div>
      </div>

      {/* Main Profile Card */}
      <div
        className={`relative bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-100 transition-all duration-300 ${
          swipeAnim === 'like' ? 'card-swipe-like' : swipeAnim === 'pass' ? 'card-swipe-pass' : ''
        }`}
      >
        {/* Photo Container */}
        <div className="relative h-[380px] w-full bg-slate-900">
          <img
            src={currentCard.avatarUrl}
            alt={currentCard.fullName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

          {/* Quick info over photo */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl font-black drop-shadow-md">
                {currentCard.fullName}, {currentCard.age}
              </h2>
              {currentCard.isVerified && (
                <ShieldCheck className="w-5 h-5 text-sky-400 fill-sky-400/20" title="Đã xác thực eKYC" />
              )}
            </div>
            <p className="text-xs text-slate-200 font-medium mt-0.5">{currentCard.occupation}</p>
            <p className="text-xs text-orange-200 mt-1 line-clamp-2">{currentCard.bio}</p>
          </div>
        </div>

        {/* Food Taste Profile Section */}
        <div className="p-4 space-y-3 bg-white">
          {/* Món khoái khẩu */}
          <div className="bg-amber-50/80 border border-amber-100 rounded-2xl p-3 flex items-start space-x-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">Món khoái khẩu nhất</span>
              <p className="text-sm font-semibold text-slate-800">{currentCard.favoriteDish}</p>
            </div>
          </div>

          {/* Cấp độ cay & Mục đích */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-slate-400 block mb-1">Độ ăn cay</span>
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Flame
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < currentCard.spicyLevel ? 'text-red-500 fill-red-500' : 'text-slate-200'
                    }`}
                  />
                ))}
                <span className="font-bold text-slate-700 ml-1">Cấp {currentCard.spicyLevel}</span>
              </div>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-slate-400 block mb-1">Mục đích kết nối</span>
              <span className="font-semibold text-orange-600 truncate block">
                {currentCard.connectionPurpose}
              </span>
            </div>
          </div>

          {/* Gu ẩm thực tags */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Thể loại ẩm thực yêu thích
            </span>
            <div className="flex flex-wrap gap-1.5">
              {currentCard.cuisines.map((cCode) => (
                <span
                  key={cCode}
                  className="bg-orange-50 text-orange-800 border border-orange-200/60 px-2.5 py-1 rounded-full text-xs font-medium"
                >
                  {getCuisineName(cCode)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Swipe Action Floating Buttons */}
      <div className="flex items-center justify-center space-x-6 mt-5">
        {/* Pass Button */}
        <button
          onClick={() => handleAction('pass')}
          className="w-14 h-14 rounded-full bg-white text-slate-400 hover:text-rose-500 border border-slate-200 shadow-md hover:shadow-lg flex items-center justify-center transition active:scale-90"
          title="Bỏ qua"
        >
          <X className="w-7 h-7 stroke-[2.5]" />
        </button>

        {/* Super Like Button */}
        <button
          onClick={() => handleAction('super')}
          className="w-12 h-12 rounded-full bg-white text-amber-500 border border-amber-200 shadow-md hover:shadow-lg flex items-center justify-center transition active:scale-90"
          title="Super Like rủ ăn ngay"
        >
          <Star className="w-6 h-6 fill-amber-400 stroke-amber-500" />
        </button>

        {/* Like Button */}
        <button
          onClick={() => handleAction('like')}
          className="w-16 h-16 rounded-full bg-gradient-to-tr from-orange-500 to-rose-500 text-white shadow-lg shadow-orange-500/40 hover:brightness-110 flex items-center justify-center transition active:scale-90"
          title="Hợp gu - Rủ đi ăn"
        >
          <Heart className="w-8 h-8 fill-white stroke-white" />
        </button>
      </div>

      {/* MATCH MODAL POPUP */}
      {matchModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center animate-in fade-in zoom-in-95 duration-200 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-orange-500 to-rose-500 text-white mx-auto flex items-center justify-center shadow-lg shadow-orange-500/40 mb-3 animate-pulse">
              <Heart className="w-9 h-9 fill-white" />
            </div>

            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Hợp Gu Ăn Ý!</h3>
            <p className="text-xs text-orange-600 font-bold uppercase tracking-wider mt-0.5">
              Tương đồng {matchModal.compatibilityScore}% khẩu vị
            </p>
            <p className="text-sm text-slate-600 mt-2">
              Bạn và <span className="font-bold text-slate-900">{matchModal.fullName}</span> đều mê mẩn{' '}
              <span className="font-semibold text-orange-600">{matchModal.favoriteDish}</span>!
            </p>

            <div className="flex items-center justify-center space-x-3 my-4">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
                alt="Me"
                className="w-16 h-16 rounded-full object-cover border-3 border-orange-500 shadow-md"
              />
              <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-black text-sm">
                &
              </div>
              <img
                src={matchModal.avatarUrl}
                alt={matchModal.fullName}
                className="w-16 h-16 rounded-full object-cover border-3 border-rose-500 shadow-md"
              />
            </div>

            <div className="space-y-2 mt-4">
              <button
                onClick={() => {
                  setMatchModal(null);
                  onOpenChatWith(matchModal);
                }}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-bold shadow-md shadow-orange-500/30 hover:opacity-95 transition"
              >
                Nhắn tin rủ đi ăn ngay 🍜
              </button>
              <button
                onClick={() => setMatchModal(null)}
                className="w-full py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition text-sm"
              >
                Tiếp tục quẹt thẻ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
