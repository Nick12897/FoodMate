import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import DiscoveryFeed from './components/DiscoveryFeed';
import ProfileView from './components/ProfileView';
import AuthView from './components/AuthView';
import MealInvitesView from './components/MealInvitesView';
import ChatView from './components/ChatView';
import RestaurantsView from './components/RestaurantsView';
import {
  INITIAL_MY_PROFILE,
  MOCK_DISCOVERY_CARDS,
  MOCK_RESTAURANTS,
  MOCK_INVITES,
  MOCK_CHATS,
} from './data/mockData';
import { api } from './services/api';
import { AlertTriangle, PhoneCall, X, Calendar, MapPin, Send } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('profile'); // Mặc định mở tab profile/auth để người dùng thấy ngay luồng Đăng ký & Đăng nhập
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register' riêng biệt

  // Quản lý trạng thái đăng nhập
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem('foodmate_user');
  });

  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('foodmate_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_MY_PROFILE;
      }
    }
    return INITIAL_MY_PROFILE;
  });

  const [cards, setCards] = useState(MOCK_DISCOVERY_CARDS);
  const [invites, setInvites] = useState(MOCK_INVITES);
  const [chats, setChats] = useState(MOCK_CHATS);

  // Chuẩn hóa và phòng vệ dữ liệu thẻ thành viên
  const normalizeCard = (c) => {
    const defaultAvatar = 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80';
    const taste = c.tasteProfile || c.taste_profile || {};
    return {
      id: c.id || c.user_id || `user-${Math.random().toString().slice(-6)}`,
      fullName: c.fullName || c.full_name || 'Thành viên FoodMate',
      phoneNumber: c.phoneNumber || c.phone_number || '',
      age: c.age || 24,
      gender: c.gender || 'other',
      occupation: c.occupation || 'Thành viên FoodMate',
      bio: c.bio || 'Yêu thích ẩm thực và tìm bạn bè cùng bàn ăn.',
      avatarUrl: c.avatarUrl || c.avatar_url || defaultAvatar,
      distanceKm: typeof c.distanceKm === 'number' ? c.distanceKm : (typeof c.distance_km === 'number' ? c.distance_km : 1.8),
      compatibilityScore: Math.round(c.compatibilityScore ?? c.compatibility_score ?? 88),
      favoriteDish: c.favoriteDish || c.favorite_dish || taste.favorite_dish || taste.favoriteDish || 'Món ngon mỗi ngày',
      spicyLevel: c.spicyLevel ?? c.spicy_level ?? taste.spicy_level ?? taste.spicyLevel ?? 2,
      budgetTier: c.budgetTier || c.budget_tier || taste.budget_tier || taste.budgetTier || 'BUDGET_T2',
      connectionPurpose: c.connectionPurpose || c.connection_purpose || taste.connection_purpose || taste.connectionPurpose || 'food_buddy',
      cuisines: (c.cuisines && c.cuisines.length > 0) ? c.cuisines : (taste.cuisines || ['VN_TRAD', 'HOTPOT']),
      isVerified: c.isVerified ?? c.is_verified ?? true,
      trustScore: c.trustScore ?? c.trust_score ?? 100,
    };
  };

  // Nạp dữ liệu thực từ Backend Python + SQLite và danh sách thành viên cộng đồng đã đăng ký
  const reloadDiscoveryCards = async () => {
    const currentUserId = profile?.id || 'user-me';
    const currentUserPhone = profile?.phoneNumber || '';

    let liveCards = [];
    try {
      const res = await api.getFeed(10.7769, 106.7009, currentUserId);
      if (res && res.length > 0) {
        liveCards = res;
      }
    } catch (e) {
      console.warn('Backend unavailable, fallback to community users:', e);
    }

    let communityUsers = [];
    try {
      communityUsers = JSON.parse(localStorage.getItem('foodmate_community_users') || '[]');
    } catch (e) {}

    // Kết hợp tất cả nguồn người dùng: Backend SQLite + LocalStorage Community + Mẫu ban đầu
    const allPool = [...liveCards, ...communityUsers, ...MOCK_DISCOVERY_CARDS];

    const seenIds = new Set();
    const finalCards = [];

    for (const raw of allPool) {
      const card = normalizeCard(raw);
      // Không hiển thị chính tài khoản của mình
      if (
        card.id === currentUserId ||
        (currentUserPhone && card.phoneNumber && card.phoneNumber === currentUserPhone) ||
        seenIds.has(card.id)
      ) {
        continue;
      }
      seenIds.add(card.id);
      finalCards.push(card);
    }

    finalCards.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    setCards(finalCards);
  };

  useEffect(() => {
    reloadDiscoveryCards();

    async function loadInvites() {
      const currentUserId = profile?.id || 'user-me';
      const liveInvites = await api.getInvites(currentUserId);
      if (liveInvites && liveInvites.length > 0) {
        setInvites(liveInvites);
      }
    }
    loadInvites();
  }, [profile?.id, profile?.phoneNumber]);

  // Xử lý Đăng nhập / Đăng ký thành công
  const handleAuthSuccess = (userData) => {
    const formattedUser = {
      id: userData.id,
      fullName: userData.full_name || userData.fullName || 'Thành viên FoodMate',
      phoneNumber: userData.phone_number || userData.phoneNumber || '',
      age: userData.age || 24,
      gender: userData.gender || 'other',
      occupation: userData.occupation || 'Thành viên FoodMate',
      bio: userData.bio || 'Yêu thích ẩm thực và tìm bạn ăn cùng bàn',
      avatarUrl: userData.avatar_url || userData.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
      trustScore: userData.trust_score || userData.trustScore || 100,
      isVerified: userData.is_verified ?? true,
      tasteProfile: userData.taste_profile || userData.tasteProfile || {
        cuisines: ['VN_TRAD', 'HOTPOT'],
        spicyLevel: 2,
        budgetTier: 'BUDGET_T2',
        favoriteDish: 'Lẩu nấm & đồ nướng',
        connectionPurpose: 'food_buddy',
        maxDistanceKm: 10,
      }
    };

    setProfile(formattedUser);
    setIsLoggedIn(true);
    localStorage.setItem('foodmate_user', JSON.stringify(formattedUser));

    // Đồng thời lưu vào danh sách thành viên cộng đồng để mọi người khác cùng quẹt thấy!
    try {
      const communityUsers = JSON.parse(localStorage.getItem('foodmate_community_users') || '[]');
      const existsIndex = communityUsers.findIndex(u => u.id === formattedUser.id || (u.phoneNumber && u.phoneNumber === formattedUser.phoneNumber));
      if (existsIndex >= 0) {
        communityUsers[existsIndex] = formattedUser;
      } else {
        communityUsers.unshift(formattedUser);
      }
      localStorage.setItem('foodmate_community_users', JSON.stringify(communityUsers));
    } catch (e) {
      console.error(e);
    }

    setActiveTab('profile'); // Hiển thị hồ sơ vừa đăng nhập
  };

  // Xử lý Đăng xuất
  const handleLogout = () => {
    localStorage.removeItem('foodmate_user');
    setIsLoggedIn(false);
  };

  // Modals
  const [sosModal, setSosModal] = useState(false);
  const [inviteModalData, setInviteModalData] = useState(null);
  const [inviteForm, setInviteForm] = useState({
    scheduledAt: '19:00 - Tối Thứ Bảy này',
    paymentPolicy: 'Chia đôi hóa đơn (50/50)',
    note: '',
  });

  // Handler Swipe
  const handleSwipe = (cardId, action) => {
    console.log(`Swiped ${action} on ${cardId}`);
    api.swipe(cardId, action, profile?.id || 'user-me');
  };

  // Mở Chat từ Match Modal
  const handleOpenChatWith = (targetUser) => {
    const existing = chats.find((c) => c.partnerId === targetUser.id);
    if (!existing) {
      const newChat = {
        id: `chat-${Date.now()}`,
        partnerId: targetUser.id,
        partnerName: targetUser.fullName,
        partnerAvatar: targetUser.avatarUrl,
        lastMessage: 'Hai bạn vừa hợp gu ăn uống! Hãy chào nhau nhé.',
        lastMessageTime: 'Vừa xong',
        unreadCount: 0,
        messages: [
          {
            id: Date.now(),
            sender: 'them',
            text: `Chào bạn! Mình thấy bạn cũng thích ${targetUser.favoriteDish}! Rất vui được kết nối nhé 🍜`,
            time: 'Vừa xong',
          },
        ],
      };
      setChats([newChat, ...chats]);
    }
    setActiveTab('chat');
  };

  // Handler Gửi tin nhắn
  const handleSendMessage = (chatId, text) => {
    setChats((prev) =>
      prev.map((c) => {
        if (c.id === chatId) {
          const newMsg = {
            id: Date.now(),
            sender: 'me',
            text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          return {
            ...c,
            lastMessage: text,
            lastMessageTime: newMsg.time,
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );
  };

  // Handler Check-in
  const handleCheckIn = (inviteId) => {
    api.checkIn(inviteId, 10.7831, 106.6982, profile?.id || 'user-me');
    setInvites((prev) =>
      prev.map((inv) =>
        inv.id === inviteId
          ? { ...inv, myCheckIn: true, status: 'checked_in' }
          : inv
      )
    );
  };

  // Handler Review
  const handleReviewPartner = (inviteId, ratings) => {
    setInvites((prev) =>
      prev.map((inv) =>
        inv.id === inviteId ? { ...inv, status: 'completed' } : inv
      )
    );
  };

  // Mở modal tạo lời mời từ quán ăn hoặc từ chat
  const handleInviteAtRestaurant = (restaurant) => {
    setInviteModalData({
      restaurantName: restaurant.name,
      restaurantAddress: restaurant.address,
      partnerName: 'Lê Mai Phương',
    });
  };

  const handleQuickInviteFromChat = (chat) => {
    setInviteModalData({
      restaurantName: 'Lẩu Nấm An Nhiên',
      restaurantAddress: '71 Mạc Đĩnh Chi, P. Đa Kao, Quận 1',
      partnerName: chat.partnerName,
    });
  };

  // Xác nhận tạo cuộc hẹn
  const submitCreateInvite = () => {
    if (!inviteModalData) return;

    const newInvite = {
      id: `inv-${Date.now()}`,
      inviteCode: `INV-${Date.now().toString().slice(-4)}`,
      partnerName: inviteModalData.partnerName,
      partnerAvatar:
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80',
      restaurantName: inviteModalData.restaurantName,
      restaurantAddress: inviteModalData.restaurantAddress,
      scheduledAt: inviteForm.scheduledAt,
      paymentPolicy: inviteForm.paymentPolicy,
      note: inviteForm.note || 'Cùng đi ăn nhé bạn ơi!',
      status: 'pending',
      myCheckIn: false,
      partnerCheckIn: false,
      shareSafetyToken: `sec_${Date.now()}`,
    };

    setInvites([newInvite, ...invites]);
    setInviteModalData(null);
    setActiveTab('invites');
    alert('Lời mời đi ăn đã được gửi thành công! Chờ đối phương xác nhận.');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center selection:bg-orange-500 selection:text-white">
      {/* Khung mô phỏng kích thước Mobile App hiện đại */}
      <div className="w-full max-w-md bg-slate-50 min-h-screen relative shadow-2xl flex flex-col">
        {/* Header trên cùng */}
        <Header 
          onSosClick={() => setSosModal(true)} 
          isLoggedIn={isLoggedIn}
        />

        {/* Nội dung chính theo Tab */}
        <main className="flex-1">
          {activeTab === 'feed' && (
            <DiscoveryFeed
              cards={cards}
              onSwipe={handleSwipe}
              onOpenChatWith={handleOpenChatWith}
              myProfile={profile}
              onReloadCards={reloadDiscoveryCards}
            />
          )}

          {activeTab === 'restaurants' && (
            <RestaurantsView
              restaurants={MOCK_RESTAURANTS}
              onInviteAtRestaurant={handleInviteAtRestaurant}
            />
          )}

          {activeTab === 'invites' && (
            <MealInvitesView
              invites={invites}
              onCheckIn={handleCheckIn}
              onReviewPartner={handleReviewPartner}
            />
          )}

          {activeTab === 'chat' && (
            <ChatView
              chats={chats}
              onSendMessage={handleSendMessage}
              onQuickInvite={handleQuickInviteFromChat}
            />
          )}

          {activeTab === 'profile' && (
            isLoggedIn ? (
              <ProfileView
                profile={profile}
                onUpdateProfile={(updated) => {
                  setProfile(updated);
                  localStorage.setItem('foodmate_user', JSON.stringify(updated));

                  // Cập nhật ngay vào danh sách cộng đồng để các thành viên khác thấy ngay ảnh & tên mới
                  try {
                    const communityUsers = JSON.parse(localStorage.getItem('foodmate_community_users') || '[]');
                    const existsIndex = communityUsers.findIndex(u => u.id === updated.id || (u.phoneNumber && u.phoneNumber === updated.phoneNumber));
                    if (existsIndex >= 0) {
                      communityUsers[existsIndex] = updated;
                    } else {
                      communityUsers.unshift(updated);
                    }
                    localStorage.setItem('foodmate_community_users', JSON.stringify(communityUsers));
                  } catch (e) {}

                  // Gọi API backend cập nhật toàn bộ thông tin tài khoản
                  api.updateUserProfile({
                    full_name: updated.fullName,
                    age: Number(updated.age),
                    gender: updated.gender,
                    avatar_url: updated.avatarUrl,
                    bio: updated.bio,
                    occupation: updated.occupation,
                    taste_profile: {
                      cuisines: updated.tasteProfile.cuisines,
                      spicy_level: updated.tasteProfile.spicyLevel,
                      budget_tier: updated.tasteProfile.budgetTier,
                      connection_purpose: updated.tasteProfile.connectionPurpose,
                      favorite_dish: updated.tasteProfile.favoriteDish,
                      max_distance_km: updated.tasteProfile.maxDistanceKm,
                    }
                  }, updated.id);
                }}
                onLogout={handleLogout}
              />
            ) : (
              <AuthView 
                authMode={authMode}
                onChangeAuthMode={(newMode) => setAuthMode(newMode)}
                onAuthSuccess={handleAuthSuccess} 
              />
            )
          )}
        </main>

        {/* Bottom Navigation */}
        <BottomNav
          activeTab={activeTab}
          setActiveTab={(tab) => {
            if (tab === 'profile' && !isLoggedIn) {
              setAuthMode('login');
            }
            setActiveTab(tab);
          }}
          unreadChatCount={0}
          pendingInvitesCount={invites.filter((i) => i.status === 'pending').length}
          isLoggedIn={isLoggedIn}
        />

        {/* MODAL SOS KHẨN CẤP */}
        {sosModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full p-5 text-center shadow-2xl animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center mb-3">
                <AlertTriangle className="w-8 h-8 animate-bounce" />
              </div>

              <h3 className="text-xl font-black text-slate-900">Trung Tâm Trợ Giúp Khẩn Cấp</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">
                Nếu bạn cảm thấy không an toàn tại buổi gặp mặt, vui lòng liên hệ ngay đội hỗ trợ hoặc cơ quan chức năng:
              </p>

              <div className="space-y-2 mb-4">
                <a
                  href="tel:113"
                  className="w-full py-3 bg-red-600 text-white rounded-xl font-bold flex items-center justify-center space-x-2 shadow-md hover:bg-red-700 transition"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Gọi Cảnh Sát 113 Ngay</span>
                </a>
                <button
                  onClick={() => {
                    alert('Đã gửi thông báo tọa độ GPS và thông tin bạn cùng bàn tới số liên hệ khẩn cấp của bạn!');
                    setSosModal(false);
                  }}
                  className="w-full py-2.5 bg-orange-100 text-orange-800 rounded-xl font-bold text-xs hover:bg-orange-200 transition"
                >
                  Gửi Tọa Độ Cho Người Thân
                </button>
              </div>

              <button
                onClick={() => setSosModal(false)}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600"
              >
                Đóng thông báo
              </button>
            </div>
          </div>
        )}

        {/* MODAL TẠO LỜI MỜI ĐI ĂN (MEAL INVITE) */}
        {inviteModalData && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-orange-500" />
                  <h3 className="font-bold text-slate-900 text-base">Rủ Đi Ăn Cùng Bàn</h3>
                </div>
                <button
                  onClick={() => setInviteModalData(null)}
                  className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Thông tin đối tác & quán */}
              <div className="bg-orange-50/80 p-3 rounded-2xl border border-orange-100 text-xs space-y-1">
                <div>
                  <span className="text-slate-500">Mời bạn: </span>
                  <strong className="text-slate-900 font-bold">{inviteModalData.partnerName}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Tại quán: </span>
                  <strong className="text-orange-700 font-bold">{inviteModalData.restaurantName}</strong>
                </div>
                <div className="text-[11px] text-slate-400 truncate">{inviteModalData.restaurantAddress}</div>
              </div>

              {/* Form chọn giờ & chia tiền */}
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Thời gian dự kiến</label>
                  <input
                    type="text"
                    value={inviteForm.scheduledAt}
                    onChange={(e) => setInviteForm({ ...inviteForm, scheduledAt: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Chính sách thanh toán hóa đơn</label>
                  <select
                    value={inviteForm.paymentPolicy}
                    onChange={(e) => setInviteForm({ ...inviteForm, paymentPolicy: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium cursor-pointer"
                  >
                    <option value="Chia đôi hóa đơn (50/50)">Chia đôi hóa đơn (50/50)</option>
                    <option value="Tôi bao bữa ăn này">Tôi xin phép bao bữa ăn này</option>
                    <option value="Campuchia riêng phần ai nấy trả">Campuchia riêng phần ai nấy trả</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ghi chú / Lời nhắn thân thiện</label>
                  <textarea
                    rows="2"
                    value={inviteForm.note}
                    onChange={(e) => setInviteForm({ ...inviteForm, note: e.target.value })}
                    placeholder="Quán này gần trung tâm, đồ ăn thanh đạm chuẩn gu nè bạn ơi!"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:ring-1 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex space-x-2 pt-2">
                <button
                  onClick={() => setInviteModalData(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-semibold text-xs"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={submitCreateInvite}
                  className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-xs shadow-md shadow-orange-500/20 hover:bg-orange-600 transition"
                >
                  Gửi lời mời ngay
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
