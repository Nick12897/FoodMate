import React, { useState } from 'react';
import { Send, Utensils, Calendar, MapPin, ArrowLeft } from 'lucide-react';

export default function ChatView({ chats, onSendMessage, onQuickInvite }) {
  const [selectedChatId, setSelectedChatId] = useState(chats[0]?.id || null);
  const [inputText, setInputText] = useState('');

  const currentChat = chats.find((c) => c.id === selectedChatId);

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

  return (
    <div className="max-w-md mx-auto px-4 py-4 pb-24">
      {/* List hoặc Khung Chat */}
      {!selectedChatId ? (
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-800 mb-3">Hộp thư trò chuyện</h2>
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => setSelectedChatId(chat.id)}
              className="w-full bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs hover:border-orange-200 transition flex items-center space-x-3 text-left"
            >
              <img
                src={chat.partnerAvatar}
                alt={chat.partnerName}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <h4 className="font-bold text-slate-900 text-sm truncate">{chat.partnerName}</h4>
                  <span className="text-[11px] text-slate-400">{chat.lastMessageTime}</span>
                </div>
                <p className="text-xs text-slate-500 truncate">{chat.lastMessage}</p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[74vh] overflow-hidden">
          {/* Chat Header */}
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
            <div className="flex items-center space-x-2.5">
              <button
                onClick={() => setSelectedChatId(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <img
                src={currentChat.partnerAvatar}
                alt={currentChat.partnerName}
                className="w-9 h-9 rounded-full object-cover"
              />
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{currentChat.partnerName}</h4>
                <span className="text-[10px] text-emerald-600 font-medium flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
                  Đang hoạt động
                </span>
              </div>
            </div>

            <button
              onClick={() => onQuickInvite(currentChat)}
              className="px-2.5 py-1.5 rounded-xl bg-orange-500 text-white text-xs font-bold flex items-center space-x-1 shadow-xs hover:bg-orange-600 transition"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Rủ đi ăn</span>
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/40">
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

          {/* Quick Prompts */}
          <div className="px-3 py-1.5 bg-white border-t border-slate-100 flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[10px] text-slate-400 shrink-0 font-medium">Gợi ý:</span>
            {[
              'Tối nay rảnh không bạn? 🍜',
              'Quán lẩu này gần chỗ bạn nè!',
              'Chia 50/50 nhé!',
            ].map((p, idx) => (
              <button
                key={idx}
                onClick={() => sendQuickPrompt(p)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 hover:bg-orange-50 hover:text-orange-600 text-slate-600 text-[11px] font-medium transition"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={handleSend}
            className="p-2.5 bg-white border-t border-slate-100 flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Nhắn tin về quán ăn, món ngon..."
              className="flex-1 px-3.5 py-2 rounded-xl bg-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 font-medium"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center disabled:opacity-40 transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
