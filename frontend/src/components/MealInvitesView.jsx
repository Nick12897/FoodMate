import React, { useState } from 'react';
import { Calendar, MapPin, CheckCircle2, ShieldCheck, Share2, Clock, DollarSign, Star, Navigation } from 'lucide-react';

export default function MealInvitesView({ invites = [], onCheckIn, onReviewPartner, onGoToRestaurants }) {
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'completed'
  const [checkInMsg, setCheckInMsg] = useState(null);
  const [reviewModal, setReviewModal] = useState(null);
  const [ratings, setRatings] = useState({ punctuality: 5, politeness: 5, compatibility: 5, comment: '' });

  const handleDoCheckIn = (inviteId) => {
    onCheckIn(inviteId);
    setCheckInMsg({
      inviteId,
      text: '📍 Bạn đã Check-in tại quán thành công! (Khoảng cách GPS: 35 mét).',
    });
    setTimeout(() => setCheckInMsg(null), 4000);
  };

  const handleShareSafety = (invite) => {
    const url = `https://foodmate.vn/safety/${invite.id}?token=${invite.shareSafetyToken}`;
    navigator.clipboard?.writeText(url);
    alert(`Đã sao chép liên kết an toàn gửi cho người thân:\n${url}\n\nNgười thân có thể theo dõi địa điểm quán và giờ hẹn của bạn.`);
  };

  const submitReview = () => {
    if (reviewModal) {
      onReviewPartner(reviewModal.id, ratings);
      setReviewModal(null);
      alert('Cảm ơn bạn đã gửi đánh giá bữa ăn! Điểm tin cậy của bạn và bạn ăn đã được cập nhật.');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-4 pb-28">
      {/* Tab Switcher */}
      <div className="flex bg-slate-100 p-1 rounded-2xl mb-4">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'upcoming'
              ? 'bg-white text-orange-600 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Lịch Hẹn Sắp Tới ({invites.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'completed'
              ? 'bg-white text-orange-600 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Lịch Sử Bàn Ăn (0)
        </button>
      </div>

      {/* Thông báo an toàn */}
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-3 flex items-start space-x-2.5 mb-4">
        <ShieldCheck className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
        <p className="text-xs text-orange-950 leading-relaxed">
          <strong className="font-bold">Ăn uống an toàn:</strong> FoodMate khuyến nghị luôn gặp gỡ tại các quán ăn công cộng đã xác thực và chia sẻ link lịch hẹn cho bạn bè/người thân.
        </p>
      </div>

      {/* Danh sách Invites */}
      <div className="space-y-4">
        {invites.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-100 text-center shadow-xs">
            <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-500 mx-auto flex items-center justify-center mb-3">
              <Calendar className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-slate-800 text-base mb-1">Chưa có lịch hẹn bàn ăn nào</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mb-5 leading-relaxed">
              Bạn chưa có cuộc hẹn ăn uống nào sắp tới. Hãy chọn một quán ngon hoặc rủ bạn ăn từ hộp thư để lên lịch ngay!
            </p>
            {onGoToRestaurants && (
              <button
                onClick={onGoToRestaurants}
                className="py-3 px-6 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl font-bold text-xs shadow-md shadow-orange-500/30 hover:brightness-105 transition"
              >
                🍽️ Khám phá quán ngon & Lên kèo
              </button>
            )}
          </div>
        ) : (
          invites.map((inv) => (
            <div
              key={inv.id}
            className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm relative overflow-hidden"
          >
            {/* Status Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <span className="text-xs font-bold text-slate-400 font-mono">{inv.inviteCode}</span>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center space-x-1 ${
                  inv.status === 'checked_in'
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                <span>{inv.status === 'checked_in' ? 'Đã có mặt tại quán' : 'Đã chốt lịch hẹn'}</span>
              </span>
            </div>

            {/* Partner Info */}
            <div className="flex items-center space-x-3 mb-3">
              <img
                src={inv.partnerAvatar}
                alt={inv.partnerName}
                className="w-12 h-12 rounded-full object-cover border border-slate-200"
              />
              <div>
                <span className="text-[11px] text-slate-400 font-medium">Bạn ăn cùng bàn</span>
                <h4 className="font-bold text-slate-900 text-base">{inv.partnerName}</h4>
              </div>
            </div>

            {/* Restaurant & Time info */}
            <div className="bg-slate-50 rounded-2xl p-3 space-y-2 text-xs mb-3">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold text-slate-800 block text-sm">{inv.restaurantName}</strong>
                  <span className="text-slate-500">{inv.restaurantAddress}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1 border-t border-slate-200/60">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-semibold text-slate-700">{inv.scheduledAt}</span>
              </div>

              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-slate-600">Thanh toán: <strong className="text-slate-800">{inv.paymentPolicy}</strong></span>
              </div>
            </div>

            {/* Check-in Message if active */}
            {checkInMsg && checkInMsg.inviteId === inv.id && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 rounded-xl text-xs font-semibold mb-3 animate-in fade-in">
                {checkInMsg.text}
              </div>
            )}

            {/* Actions: Check-in, Share, Review */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleDoCheckIn(inv.id)}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition active:scale-95 ${
                  inv.myCheckIn
                    ? 'bg-emerald-100 text-emerald-800 cursor-default'
                    : 'bg-orange-500 text-white shadow-md shadow-orange-500/20 hover:bg-orange-600'
                }`}
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>{inv.myCheckIn ? 'Đã Check-in ✓' : '📍 GPS Check-in'}</span>
              </button>

              <button
                onClick={() => handleShareSafety(inv)}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Chia sẻ lộ trình</span>
              </button>
            </div>

            {/* Nút đánh giá sau khi ăn */}
            <button
              onClick={() => setReviewModal(inv)}
              className="w-full mt-2 py-2 text-xs font-semibold text-slate-500 hover:text-orange-600 flex items-center justify-center space-x-1"
            >
              <Star className="w-3.5 h-3.5" />
              <span>Chấm điểm & đánh giá bạn ăn</span>
            </button>
          </div>
        ))
      )}
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4">
            <h3 className="font-bold text-lg text-slate-900 text-center">
              Đánh giá bạn ăn: {reviewModal.partnerName}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-semibold block mb-1">Mức độ đúng giờ</span>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      onClick={() => setRatings({ ...ratings, punctuality: s })}
                      className={`flex-1 py-1.5 rounded-lg font-bold ${
                        ratings.punctuality >= s ? 'bg-amber-400 text-white' : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      ★ {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-semibold block mb-1">Lịch sự & Văn minh</span>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      onClick={() => setRatings({ ...ratings, politeness: s })}
                      className={`flex-1 py-1.5 rounded-lg font-bold ${
                        ratings.politeness >= s ? 'bg-amber-400 text-white' : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      ★ {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-semibold block mb-1">Độ hợp gu ẩm thực</span>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      onClick={() => setRatings({ ...ratings, compatibility: s })}
                      className={`flex-1 py-1.5 rounded-lg font-bold ${
                        ratings.compatibility >= s ? 'bg-amber-400 text-white' : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      ★ {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-semibold block mb-1">Nhận xét thêm (riêng tư)</span>
                <textarea
                  rows="2"
                  value={ratings.comment}
                  onChange={(e) => setRatings({ ...ratings, comment: e.target.value })}
                  placeholder="Bạn ấy rất đúng giờ và vui vẻ..."
                  className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setReviewModal(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-semibold text-xs"
              >
                Đóng
              </button>
              <button
                onClick={submitReview}
                className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-xs shadow-md shadow-orange-500/20"
              >
                Gửi đánh giá
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
