import React, { useState, useEffect } from 'react';
import { Send, Utensils, Calendar, MapPin, ArrowLeft, Sparkles, MessageCircle, Heart, CheckCircle2, Smile, X } from 'lucide-react';

export default function ChatView({
  chats = [],
  onSendMessage,
  onQuickInvite,
  activeChatId = null,
  onSelectChat,
  onGoToDiscovery
}) {
  const [selectedChatId, setSelectedChatId] = useState(activeChatId);
  const [inputText, setInputText] = useState('');
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiCategory, setEmojiCategory] = useState('food'); // 'food' | 'react'

  const FOOD_EMOJIS = ['🍜', '🍲', '🍕', '🍔', '🍗', '🍣', '🥩', '🧋', '☕', '🍻', '🍦', '🌶️', '🥢', '🍱', '🎂', '🍟', '🌮', '🥗', '🍩', '🥑', '🥟', '🍤', '🥞', '🥓'];
  const REACT_EMOJIS = ['😋', '🤤', '🥰', '😍', '👋', '❤️', '✨', '🔥', '👍', '🥳', '🤩', '💬', '💖', '🥂', '🎉', '💯', '😂', '🥺', '👌', '🤗', '🙏', '🙌', '🤤', '😘'];

  // Đồng bộ khi App.jsx truyền vào activeChatId mới (ví dụ khi người dùng click "Nhắn tin rủ đi ăn ngay" từ Match modal)
  useEffect(() => {
    setSelectedChatId(activeChatId);
  }, [activeChatId]);

  const currentChat = chats.find((c) => c.id === selectedChatId);

  const handleSelectChat = (chatId) => {
    setSelectedChatId(chatId);
    if (onSelectChat) onSelectChat(chatId);
  };

  const handleBackToList = () => {
    setSelectedChatId(null);
    if (onSelectChat) onSelectChat(null);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedChatId) return;

    onSendMessage(selectedChatId, inputText.trim());
    setInputText('');
  };

  const sendQuickPrompt = (text) => {
    if (!selectedChatId) return;
    onSendMessage(selectedChatId, text);
  };

  const defaultAvatar = 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80';

  return (
    <div className="max-w-md mx-auto px-4 py-3 pb-24">
      {/* ===================== CHẾ ĐỘ 1: DANH SÁCH BẠN ĂN ĐÃ QUẸT & TIN NHẮN (!selectedChatId) ===================== */}
      {!selectedChatId ? (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Hộp Thư Kết Nối</h2>
              <p className="text-xs text-slate-500 font-medium">Bạn bè đã tương hợp qua mục Quẹt Gu</p>
            </div>
            <div className="flex items-center space-x-1 px-2.5 py-1 bg-orange-50 border border-orange-200/80 rounded-full text-xs font-bold text-orange-600">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{chats.length} bạn ăn</span>
            </div>
          </div>

          {/* KHỐI 1: HÀNG TƯƠNG HỢP MỚI (NEW MATCHES CAROUSEL CHUẨN TINDER) */}
          {chats.length > 0 && (
            <div className="bg-white rounded-3xl p-3.5 border border-slate-100 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
                Bạn ăn tương hợp gần đây ({chats.length})
              </span>
              <div className="flex items-center space-x-3 overflow-x-auto no-scrollbar pb-1">
                {chats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => handleSelectChat(chat.id)}
                    className="flex flex-col items-center space-y-1 shrink-0 group focus:outline-none"
                  >
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-orange-500 to-rose-500 group-hover:scale-105 transition shadow-sm">
                        <img
                          src={chat.partnerAvatar || defaultAvatar}
                          alt={chat.partnerName}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = defaultAvatar;
                          }}
                          className="w-full h-full rounded-full object-cover border-2 border-white"
                        />
                      </div>
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-700 truncate max-w-[62px]">
                      {chat.partnerName?.split(' ').slice(-1)[0] || 'Bạn'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* KHỐI 2: DANH SÁCH CUỘC TRÒ CHUYỆN */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-1">
              Tin nhắn đang chờ ({chats.length})
            </span>

            {chats.length === 0 ? (
              /* Trạng thái chưa quẹt được ai */
              <div className="bg-white rounded-3xl p-8 border border-slate-100 text-center shadow-sm">
                <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-500 mx-auto flex items-center justify-center mb-3">
                  <Utensils className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-slate-800 text-base mb-1">Chưa có bạn ăn nào trong hộp thư</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mb-5 leading-relaxed">
                  Hãy sang mục <strong>Quẹt Gu</strong> và thả tim những người bạn có khẩu vị tương đồng để bắt đầu trò chuyện nhé!
                </p>
                {onGoToDiscovery && (
                  <button
                    onClick={onGoToDiscovery}
                    className="py-3 px-6 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl font-bold text-xs shadow-md shadow-orange-500/30 hover:brightness-105 transition"
                  >
                    👉 Khám phá & Quẹt gu ngay
                  </button>
                )}
              </div>
            ) : (
              /* Danh sách thẻ hội thoại */
              chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => handleSelectChat(chat.id)}
                  className="w-full bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs hover:border-orange-300 hover:shadow-sm transition flex items-center space-x-3 text-left active:scale-99"
                >
                  <div className="relative shrink-0 w-12 h-12">
                    <img
                      src={chat.partnerAvatar || defaultAvatar}
                      alt={chat.partnerName}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = defaultAvatar;
                      }}
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-100 shadow-xs"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center space-x-2 truncate">
                        <h4 className={`text-sm truncate ${chat.unreadCount > 0 ? 'font-black text-slate-900' : 'font-bold text-slate-800'}`}>
                          {chat.partnerName}
                        </h4>
                        {chat.unreadCount > 0 && (
                          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center space-x-1.5 shrink-0 ml-1">
                        <span className={`text-[11px] ${chat.unreadCount > 0 ? 'font-bold text-orange-600' : 'font-semibold text-slate-400'}`}>
                          {chat.lastMessageTime}
                        </span>
                        {chat.unreadCount > 0 && (
                          <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-xs">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Món khoái khẩu chung */}
                    {chat.favoriteDish && (
                      <div className="mb-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200/60">
                          🍜 Món ruột: {chat.favoriteDish}
                        </span>
                      </div>
                    )}

                    <p className={`text-xs truncate ${chat.unreadCount > 0 ? 'font-bold text-slate-900' : 'font-medium text-slate-500'}`}>
                      {chat.lastMessage}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      ) : (
        /* ===================== CHẾ ĐỘ 2: KHUNG CHAT CHI TIẾT (selectedChatId !== null) ===================== */
        currentChat && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[76vh] overflow-hidden animate-in fade-in duration-150">
            {/* Chat Header */}
            <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/90">
              <div className="flex items-center space-x-2.5">
                <button
                  onClick={handleBackToList}
                  className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition active:scale-95 shadow-2xs"
                  title="Quay lại danh sách trò chuyện"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div
                  onClick={() => setShowPartnerModal(true)}
                  className="flex items-center space-x-2.5 cursor-pointer p-1 -m-1 rounded-xl hover:bg-slate-100/70 transition group"
                  title="Nhấn để xem thông tin bạn ăn"
                >
                  <div className="relative">
                    <img
                      src={currentChat.partnerAvatar || defaultAvatar}
                      alt={currentChat.partnerName}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = defaultAvatar;
                      }}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200 group-hover:scale-105 transition"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border border-white rounded-full" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm truncate max-w-[140px] group-hover:text-orange-600 transition">
                      {currentChat.partnerName}
                    </h4>
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
                      Đang hoạt động
                    </span>
                  </div>
                </div>
              </div>

              {/* Nút Rủ đi ăn */}
              <button
                onClick={() => onQuickInvite(currentChat)}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold flex items-center space-x-1 shadow-sm hover:brightness-105 transition active:scale-95"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Rủ đi ăn</span>
              </button>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/40">
              {/* Thông báo tương hợp ban đầu */}
              <div className="text-center my-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-orange-100/70 text-orange-800 text-[11px] font-bold">
                  🎉 Hai bạn đã tương hợp gu ẩm thực thành công!
                </span>
              </div>

              {currentChat.messages.map((m) => {
                const isMe = m.sender === 'me';
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-xs font-medium ${
                        isMe
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-br-xs shadow-xs'
                          : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs shadow-xs'
                      }`}
                    >
                      {m.text}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 px-1">{m.time}</span>
                  </div>
                );
              })}
            </div>

            {/* Quick Prompts Gợi ý: Chỉ hiển thị khi mới match và chưa gửi tin nhắn nào */}
            {(!currentChat.messages || !currentChat.messages.some((m) => m.sender === 'me')) && (
              <div className="px-3 py-1.5 bg-orange-50/60 border-t border-orange-100/80 flex items-center space-x-1.5 overflow-x-auto no-scrollbar animate-in fade-in duration-200">
                <span className="text-[10px] text-orange-600 shrink-0 font-bold flex items-center">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Gợi ý mở lời:
                </span>
                {[
                  'Tối nay rảnh không bạn? 🍜',
                  'Quán này gần chỗ bạn nè!',
                  'Chia đôi 50/50 nhé!',
                  'Bạn ăn cay được cấp mấy? 🌶️',
                ].map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendQuickPrompt(p)}
                    className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white hover:bg-orange-100 hover:text-orange-700 text-slate-700 text-[11px] font-medium transition border border-orange-200/50 shadow-2xs active:scale-95"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            {/* Emoji & Sticker Picker */}
            {showEmojiPicker && (
              <div className="bg-white border-t border-slate-200 p-2.5 animate-in slide-in-from-bottom-2 duration-200 shadow-inner">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setEmojiCategory('food')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                        emojiCategory === 'food'
                          ? 'bg-orange-100 text-orange-600'
                          : 'text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      🍜 Món ngon & Đồ uống
                    </button>
                    <button
                      type="button"
                      onClick={() => setEmojiCategory('react')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                        emojiCategory === 'react'
                          ? 'bg-orange-100 text-orange-600'
                          : 'text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      🥰 Cảm xúc & Hẹn hò
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-8 gap-1.5 max-h-36 overflow-y-auto p-1">
                  {(emojiCategory === 'food' ? FOOD_EMOJIS : REACT_EMOJIS).map((emoji, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setInputText((prev) => prev + emoji);
                      }}
                      className="w-8 h-8 flex items-center justify-center text-lg hover:bg-orange-50 rounded-xl transition active:scale-125"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                handleSend(e);
                setShowEmojiPicker(false);
              }}
              className="p-2.5 bg-white border-t border-slate-100 flex items-center space-x-2"
            >
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`p-2 rounded-xl transition shrink-0 ${
                  showEmojiPicker
                    ? 'bg-orange-100 text-orange-600'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                }`}
                title="Chọn biểu tượng cảm xúc"
              >
                <Smile className="w-5 h-5" />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Nhắn tin về quán ăn, món ngon..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 font-medium"
              />

              {inputText.trim() ? (
                <button
                  type="submit"
                  className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white flex items-center justify-center transition shadow-xs active:scale-95 shrink-0"
                  title="Gửi tin nhắn"
                >
                  <Send className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onSendMessage(selectedChatId, '❤️')}
                  className="w-10 h-10 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-500 flex items-center justify-center transition shadow-xs active:scale-95 shrink-0"
                  title="Thả tim nhanh"
                >
                  <Heart className="w-5 h-5 fill-rose-500" />
                </button>
              )}
            </form>
          </div>
        )
      )}

      {/* MODAL THÔNG TIN CHI TIẾT BẠN ĂN KHI CHẠM VÀO AVATAR/TRẠNG THÁI */}
      {showPartnerModal && currentChat && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xs w-full p-5 text-center shadow-2xl animate-in zoom-in-95 border border-slate-100">
            <div className="relative w-24 h-24 mx-auto mb-3">
              <img
                src={currentChat.partnerAvatar || defaultAvatar}
                alt={currentChat.partnerName}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = defaultAvatar;
                }}
                className="w-24 h-24 rounded-full object-cover border-4 border-orange-500 shadow-md mx-auto"
              />
              <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center" />
            </div>

            <h3 className="text-lg font-black text-slate-900">{currentChat.partnerName}</h3>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold mt-1 mb-3 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Đang hoạt động trực tuyến</span>
            </div>

            <div className="bg-slate-50 rounded-2xl p-3.5 mb-4 text-left space-y-2 border border-slate-100 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">🍜 Món ăn ruột:</span>
                <span className="font-bold text-slate-800">{currentChat.favoriteDish || 'Món ngon mỗi ngày'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">🔥 Độ tương hợp:</span>
                <span className="font-bold text-orange-600">{currentChat.compatibilityScore || 88}% Hợp khẩu vị</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">💬 Trạng thái:</span>
                <span className="font-semibold text-slate-700">Sẵn sàng nhận lời mời đi ăn</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setShowPartnerModal(false);
                  onQuickInvite(currentChat);
                }}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-bold text-xs shadow-md shadow-orange-500/30 hover:brightness-105 transition flex items-center justify-center space-x-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Rủ bạn này đi ăn ngay</span>
              </button>
              <button
                onClick={() => setShowPartnerModal(false)}
                className="w-full py-2 text-slate-500 hover:text-slate-700 text-xs font-bold transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
