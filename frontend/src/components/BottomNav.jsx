import React from 'react';
import { Flame, UtensilsCrossed, Calendar, MessageSquare, User } from 'lucide-react';

export default function BottomNav({ activeTab, setActiveTab, unreadChatCount = 0, pendingInvitesCount = 1 }) {
  const tabs = [
    { id: 'feed', label: 'Quẹt gu', icon: Flame },
    { id: 'restaurants', label: 'Quán ngon', icon: UtensilsCrossed },
    { id: 'invites', label: 'Bàn ăn', icon: Calendar, badge: pendingInvitesCount },
    { id: 'chat', label: 'Trò chuyện', icon: MessageSquare, badge: unreadChatCount },
    { id: 'profile', label: 'Hồ sơ gu', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-1.5 px-3 shadow-lg">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition duration-200 ${
                isActive ? 'text-orange-600 scale-105' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className="relative">
                <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {tab.badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-white">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[11px] mt-1 font-medium ${isActive ? 'font-bold' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
