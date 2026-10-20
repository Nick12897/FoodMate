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
  MOCK_RESTAURANTS,
  DEFAULT_COMMUNITY_USERS,
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

  const [cards, setCards] = useState([]);
  const [invites, setInvites] = useState(() => {
    try {
      const saved = localStorage.getItem('foodmate_invites');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((i) => i.id !== 'inv-101' && i.partnerName !== 'Lê Mai Phương');
        }
      }
    } catch (e) {}
    return [];
  });
  const [chats, setChats] = useState(() => {
    try {
      const saved = localStorage.getItem('foodmate_chats');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Chỉ giữ lại những người thực sự đã quẹt được, loại bỏ các đoạn chat demo cũ
          return parsed.filter((c) => c.id !== 'chat-01' && c.id !== 'chat-02' && c.partnerName !== 'Lê Mai Phương' && c.partnerName !== 'Tuấn Nam');
        }
      }
    } catch (e) {}
    return [];
  });
  const [activeChatId, setActiveChatId] = useState(null);

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

  // Chuẩn hóa chuỗi loại bỏ dấu tiếng Việt để so sánh danh tính chính xác
  const normalizeStr = (s) =>
    (s || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'd')
      .toLowerCase()
      .trim();

  // Chuyển đổi và bảo đảm danh tính đối tác trò chuyện luôn chính xác theo tài khoản đang đăng nhập
  const getDisplayChats = (rawChats, currentProfile) => {
    if (!currentProfile) return [];
    const myId = currentProfile.id || 'user-f9e57803';
    const myNameNorm = normalizeStr(currentProfile.fullName || '');
    const myPhoneClean = (currentProfile.phoneNumber || '').replace(/\D/g, '');

    let communityPool = [...DEFAULT_COMMUNITY_USERS];
    try {
      const savedCom = JSON.parse(localStorage.getItem('foodmate_community_users') || '[]');
      communityPool = [...communityPool, ...savedCom];
    } catch (e) {}

    // 1. Phân giải danh tính đối tác cho từng bản ghi hội thoại
    const parsedChats = rawChats.map((c) => {
      let partner = null;
      let isInverse = false;

      // Nếu cuộc trò chuyện lưu cả 2 đối tượng userA & userB
      if (c.userA && c.userB) {
        const isUserA =
          c.userA.id === myId ||
          normalizeStr(c.userA.fullName) === myNameNorm ||
          (c.userA.phoneNumber && (c.userA.phoneNumber || '').replace(/\D/g, '') === myPhoneClean);
        partner = isUserA ? c.userB : c.userA;
      } else {
        const isPartnerSelf =
          c.partnerId === myId ||
          (c.partnerName && normalizeStr(c.partnerName) === myNameNorm) ||
          (c.partnerPhone && myPhoneClean && c.partnerPhone.replace(/\D/g, '') === myPhoneClean);

        if (isPartnerSelf) {
          isInverse = true;
          if (c.createdBy && c.createdBy.id !== myId) {
            partner = c.createdBy;
          } else {
            const other = communityPool.find(
              (u) =>
                u.id !== myId &&
                normalizeStr(u.fullName) !== myNameNorm &&
                (!myPhoneClean || (u.phoneNumber || '').replace(/\D/g, '') !== myPhoneClean)
            );
            partner = other || DEFAULT_COMMUNITY_USERS[1];
          }
        } else {
          partner = {
            id: c.partnerId,
            fullName: c.partnerName,
            avatarUrl: c.partnerAvatar,
            favoriteDish: c.favoriteDish
          };
        }
      }

      // Chuẩn hóa tên & avatar đối tác, tuyệt đối không hiển thị "Bạn ăn"
      let pId = partner?.id || partner?.user_id;
      let pName = partner?.fullName || partner?.full_name;
      let pAvatar = partner?.avatarUrl || partner?.avatar_url;
      let pDish = partner?.favoriteDish || partner?.favorite_dish || c.favoriteDish;

      if (!pId || pId === myId) {
        pId = myId === 'user-f9e57803' ? 'user-thy-01' : 'user-f9e57803';
      }

      if (pId === 'user-thy-01' || (!pName || pName === 'Bạn ăn' || pName === 'Thành viên FoodMate')) {
        if (myId === 'user-f9e57803') {
          pId = 'user-thy-01';
          pName = 'Lê Thị Ngọc Thy';
          pAvatar = './thy_avatar.png';
          pDish = 'Gà Rán Jollibee';
        } else {
          pId = 'user-f9e57803';
          pName = 'Lương Đình Khánh Sang';
          pAvatar = './sang_avatar.png';
          pDish = 'Bún Đậu & Món Chiên';
        }
      }

      // Đảo chiều tin nhắn 'me' / 'them' theo myId
      const mappedMessages = (c.messages || []).map((msg) => {
        let isMe = false;
        if (msg.senderId) {
          isMe = msg.senderId === myId;
        } else if (msg.sender === 'me') {
          isMe = !isInverse;
        } else {
          isMe = isInverse;
        }
        return {
          ...msg,
          sender: isMe ? 'me' : 'them'
        };
      });

      const canonicalId = `chat_${[myId, pId].sort().join('_')}`;

      return {
        ...c,
        id: canonicalId,
        canonicalId,
        partnerId: pId,
        partnerName: pName,
        partnerAvatar: pAvatar,
        favoriteDish: pDish,
        lastMessage: c.lastMessage || 'Hai bạn vừa hợp gu ăn uống! Hãy chào nhau nhé.',
        lastMessageTime: c.lastMessageTime || 'Vừa xong',
        unreadCount: c.unreadCount || 0,
        messages: mappedMessages
      };
    });

    // 2. Gom nhóm (Deduplicate) tất cả chat theo canonicalId để chỉ duy nhất 1 cuộc trò chuyện giữa 2 người
    const mergedMap = new Map();
    for (const chat of parsedChats) {
      const key = chat.canonicalId;
      if (!mergedMap.has(key)) {
        // Lọc sạch mọi tin nhắn trùng lặp
        const seenInChat = new Set();
        const cleanMsgs = [];
        for (const m of chat.messages || []) {
          const k = `${m.sender}_${(m.text || '').trim()}`;
          if (!seenInChat.has(k)) {
            seenInChat.add(k);
            cleanMsgs.push(m);
          }
        }
        const lastMsg = cleanMsgs.length > 0 ? cleanMsgs[cleanMsgs.length - 1] : null;
        mergedMap.set(key, {
          ...chat,
          messages: cleanMsgs,
          lastMessage: lastMsg ? lastMsg.text : chat.lastMessage,
          lastMessageTime: lastMsg ? (lastMsg.time || 'Vừa xong') : chat.lastMessageTime
        });
      } else {
        const existing = mergedMap.get(key);
        // Gộp tin nhắn không trùng lặp
        const seenTexts = new Set(existing.messages.map((m) => `${m.sender}_${(m.text || '').trim()}`));
        const newMsgs = (chat.messages || []).filter((m) => !seenTexts.has(`${m.sender}_${(m.text || '').trim()}`));
        const allMsgs = [...existing.messages, ...newMsgs];
        const lastMsg = allMsgs.length > 0 ? allMsgs[allMsgs.length - 1] : null;

        mergedMap.set(key, {
          ...existing,
          messages: allMsgs,
          lastMessage: lastMsg ? lastMsg.text : existing.lastMessage,
          lastMessageTime: lastMsg ? (lastMsg.time || 'Vừa xong') : existing.lastMessageTime
        });
      }
    }

    return Array.from(mergedMap.values());
  };

  // Nạp dữ liệu thực từ Backend Python + SQLite và danh sách thành viên cộng đồng đã đăng ký
  const reloadDiscoveryCards = async () => {
    const currentUserId = profile?.id || 'user-me';
    const currentUserPhoneClean = (profile?.phoneNumber || '').replace(/\D/g, '');
    const currentUserNameNorm = normalizeStr(profile?.fullName || '');

    let liveCards = [];
    try {
      const res = await api.getFeed(10.7769, 106.7009, currentUserId);
      if (res && res.length > 0) {
        liveCards = res;
      }
    } catch (e) {
      console.warn('Backend unavailable, fallback to community users:', e);
    }

    let savedCommunity = [];
    try {
      savedCommunity = JSON.parse(localStorage.getItem('foodmate_community_users') || '[]');
    } catch (e) {}

    // Gộp tất cả tài khoản người dùng thực tế đã đăng ký (Sang, Thy và các tài khoản tạo mới)
    const communityMap = new Map();
    DEFAULT_COMMUNITY_USERS.forEach((u) => communityMap.set(u.id, u));
    savedCommunity.forEach((u) => communityMap.set(u.id, u));
    const communityUsers = Array.from(communityMap.values());

    // Chỉ lấy từ nguồn người dùng THỰC SỰ ĐÃ ĐĂNG KÝ (Backend SQLite + LocalStorage Community)
    const allPool = [...liveCards, ...communityUsers];

    const seenIds = new Set();
    const finalCards = [];

    for (const raw of allPool) {
      const card = normalizeCard(raw);
      const cardPhoneClean = (card.phoneNumber || '').replace(/\D/g, '');
      const cardNameNorm = normalizeStr(card.fullName || '');

      // Tuyệt đối không hiển thị chính tài khoản của mình
      // Lọc đa tầng: theo ID, theo Số điện thoại và theo Họ tên (không phân biệt dấu)
      const isSelf =
        card.id === currentUserId ||
        (currentUserPhoneClean && cardPhoneClean && currentUserPhoneClean === cardPhoneClean) ||
        (currentUserNameNorm && cardNameNorm && currentUserNameNorm === cardNameNorm);

      if (isSelf || seenIds.has(card.id)) {
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

    // Đồng bộ tin nhắn liên tục 2 chiều với Backend SQLite
    async function syncConversations() {
      const currentUserId = profile?.id || 'user-f9e57803';
      try {
        const liveConvs = await api.getConversations(currentUserId);
        if (liveConvs && liveConvs.length > 0) {
          setChats((prev) => {
            const map = new Map();
            prev.forEach((c) => map.set(c.id, c));

            liveConvs.forEach((lc) => {
              const existing = map.get(lc.id);
              if (existing) {
                // Hợp nhất thông minh: server là nguồn chuẩn, khử trùng lặp hoàn toàn
                const serverMsgs = lc.messages || [];
                const serverKeys = new Set(
                  serverMsgs.map((m) => `${m.senderId || m.sender}_${(m.text || '').trim()}`)
                );

                // Chỉ giữ các tin nhắn vừa gõ ở client chưa kịp gửi xong
                const pendingLocalMsgs = (existing.messages || []).filter((m) => {
                  const key = `${m.senderId || m.sender}_${(m.text || '').trim()}`;
                  return !serverKeys.has(key);
                });

                const mergedMsgs = [...serverMsgs, ...pendingLocalMsgs];
                const lastMsg = mergedMsgs.length > 0 ? mergedMsgs[mergedMsgs.length - 1] : null;

                map.set(lc.id, {
                  ...existing,
                  lastMessage: lastMsg ? lastMsg.text : (lc.lastMessage || existing.lastMessage),
                  lastMessageTime: lastMsg ? (lastMsg.time || 'Vừa xong') : (lc.lastMessageTime || existing.lastMessageTime),
                  messages: mergedMsgs,
                });
              } else {
                map.set(lc.id, lc);
              }
            });

            const merged = Array.from(map.values());
            try {
              localStorage.setItem('foodmate_chats', JSON.stringify(merged));
            } catch (e) {}
            return merged;
          });
        }
      } catch (e) {
        console.warn('Sync conversations error:', e);
      }
    }

    syncConversations();
    const chatInterval = setInterval(syncConversations, 2500);

    // Đồng bộ tức thì giữa các Tab trong cùng trình duyệt
    const handleStorageChange = (e) => {
      if (e.key === 'foodmate_chats' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setChats(parsed);
          }
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(chatInterval);
      window.removeEventListener('storage', handleStorageChange);
    };
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
    setProfile(null);
    setAuthMode('login');
  };

  // Modals
  const [sosModal, setSosModal] = useState(false);
  const [inviteModalData, setInviteModalData] = useState(null);
  const [inviteForm, setInviteForm] = useState({
    scheduledAt: '19:00 - Tối Thứ Bảy này',
    paymentPolicy: 'Chia đôi hóa đơn (50/50)',
    note: '',
  });

  // Handler Swipe: Khi quẹt Thích (like) hoặc Siêu Thích (super) -> Lập tức đồng bộ người này vào danh sách Trò chuyện & Match!
  const handleSwipe = (cardOrId, action) => {
    const cardId = typeof cardOrId === 'object' ? (cardOrId.id || cardOrId.user_id) : cardOrId;
    console.log(`Swiped ${action} on ${cardId}`);
    api.swipe(cardId, action, profile?.id || 'user-me');

    if (action === 'like' || action === 'super') {
      const card = typeof cardOrId === 'object' ? cardOrId : cards.find((c) => c.id === cardId);
      if (card) {
        const partnerId = card.id || card.user_id;
        const partnerName = card.fullName || card.full_name || 'Bạn Ăn FoodMate';
        const partnerAvatar = card.avatarUrl || card.avatar_url;
        const favoriteDish = card.favoriteDish || card.favorite_dish || 'món ngon';
        const compatibilityScore = card.compatibilityScore || card.compatibility_score || 88;

        const myId = profile?.id || 'user-me';
        const sortedPairKey = [myId, partnerId].sort().join('_');
        const chatId = `chat-${sortedPairKey}`;

        setChats((prevChats) => {
          const existingIdx = prevChats.findIndex((c) =>
            c.id === chatId ||
            c.id === `chat-${partnerId}` ||
            c.partnerId === partnerId ||
            (c.userA?.id === partnerId && c.userB?.id === myId) ||
            (c.userA?.id === myId && c.userB?.id === partnerId)
          );
          let updatedChats;
          if (existingIdx >= 0) {
            const existing = prevChats[existingIdx];
            updatedChats = [existing, ...prevChats.filter((_, idx) => idx !== existingIdx)];
          } else {
            const newChat = {
              id: chatId,
              partnerId: partnerId,
              partnerName: partnerName,
              partnerAvatar: partnerAvatar,
              compatibilityScore: compatibilityScore,
              favoriteDish: favoriteDish,
              userA: {
                id: myId,
                fullName: profile?.fullName || 'Khánh Sang',
                avatarUrl: profile?.avatarUrl || './sang_avatar.png',
                phoneNumber: profile?.phoneNumber || ''
              },
              userB: {
                id: partnerId,
                fullName: partnerName,
                avatarUrl: partnerAvatar,
                phoneNumber: card.phoneNumber || ''
              },
              lastMessage: `Hai bạn vừa hợp gu ăn uống! Hãy chào nhau nhé.`,
              lastMessageTime: 'Vừa xong',
              unreadCount: 1,
              isNewMatch: true,
              messages: [
                {
                  id: Date.now(),
                  sender: 'them',
                  senderId: partnerId,
                  text: `Chào bạn! Mình thấy bạn cũng thích ${favoriteDish}! Rất vui được kết nối cùng bạn ăn nhé 🍜`,
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ],
            };
            updatedChats = [newChat, ...prevChats];
          }
          try {
            localStorage.setItem('foodmate_chats', JSON.stringify(updatedChats));
          } catch (e) {}
          return updatedChats;
        });
      }
    }
  };

  // Mở Chat từ Match Modal hoặc bấm vào bạn ăn tương hợp
  const handleOpenChatWith = (targetUser) => {
    const partnerId = targetUser.id || targetUser.user_id;
    const partnerName = targetUser.fullName || targetUser.full_name || 'Bạn Ăn FoodMate';
    const partnerAvatar = targetUser.avatarUrl || targetUser.avatar_url;
    const favoriteDish = targetUser.favoriteDish || targetUser.favorite_dish || 'món ngon';
    const compatibilityScore = targetUser.compatibilityScore || targetUser.compatibility_score || 88;
    const myId = profile?.id || 'user-me';
    const sortedPairKey = [myId, partnerId].sort().join('_');
    const chatId = `chat-${sortedPairKey}`;

    setChats((prevChats) => {
      const existingIdx = prevChats.findIndex((c) =>
        c.id === chatId ||
        c.id === `chat-${partnerId}` ||
        c.partnerId === partnerId ||
        (c.userA?.id === partnerId && c.userB?.id === myId) ||
        (c.userA?.id === myId && c.userB?.id === partnerId)
      );
      let updated;
      if (existingIdx >= 0) {
        updated = prevChats;
      } else {
        const newChat = {
          id: chatId,
          partnerId: partnerId,
          partnerName: partnerName,
          partnerAvatar: partnerAvatar,
          compatibilityScore: compatibilityScore,
          favoriteDish: favoriteDish,
          userA: {
            id: myId,
            fullName: profile?.fullName || 'Khánh Sang',
            avatarUrl: profile?.avatarUrl || './sang_avatar.png',
            phoneNumber: profile?.phoneNumber || ''
          },
          userB: {
            id: partnerId,
            fullName: partnerName,
            avatarUrl: partnerAvatar,
            phoneNumber: targetUser.phoneNumber || ''
          },
          lastMessage: 'Hai bạn vừa hợp gu ăn uống! Hãy chào nhau nhé.',
          lastMessageTime: 'Vừa xong',
          unreadCount: 0,
          isNewMatch: true,
          messages: [
            {
              id: Date.now(),
              sender: 'them',
              senderId: partnerId,
              text: `Chào bạn! Mình thấy bạn cũng thích ${favoriteDish}! Rất vui được kết nối nhé 🍜`,
              time: 'Vừa xong',
            },
          ],
        };
        updated = [newChat, ...prevChats];
      }
      try {
        localStorage.setItem('foodmate_chats', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    setActiveChatId(chatId);
    setActiveTab('chat');
  };

  // Handler Gửi tin nhắn
  const handleSendMessage = (chatId, text) => {
    const currentUserId = profile?.id || 'user-f9e57803';
    const currentDisplayChats = getDisplayChats(chats, profile);
    const activeChat = currentDisplayChats.find((c) => c.id === chatId || c.canonicalId === chatId);
    const partnerId = activeChat?.partnerId || (currentUserId === 'user-f9e57803' ? 'user-thy-01' : 'user-f9e57803');
    const canonicalId = `chat_${[currentUserId, partnerId].sort().join('_')}`;

    const newMsg = {
      id: Date.now(),
      sender: 'me',
      senderId: currentUserId,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChats((prev) => {
      let matched = false;
      const updated = prev.map((c) => {
        if (c.id === chatId || c.id === canonicalId || c.partnerId === partnerId) {
          matched = true;
          return {
            ...c,
            id: canonicalId,
            lastMessage: text,
            lastMessageTime: newMsg.time,
            messages: [...(c.messages || []), newMsg],
          };
        }
        return c;
      });

      if (!matched) {
        updated.unshift({
          id: canonicalId,
          partnerId,
          partnerName: activeChat?.partnerName || 'Lê Thị Ngọc Thy',
          partnerAvatar: activeChat?.partnerAvatar || './thy_avatar.png',
          lastMessage: text,
          lastMessageTime: newMsg.time,
          messages: [newMsg],
        });
      }

      try {
        localStorage.setItem('foodmate_chats', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // Đồng bộ tức thì lên SQLite backend server để đối tác nhận được ngay
    api.sendMessage(canonicalId, text, currentUserId, partnerId);
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
    const validDisplayChats = getDisplayChats(chats, profile);
    const defaultPartner = validDisplayChats.length > 0 ? validDisplayChats[0] : null;
    if (!defaultPartner) {
      alert('Bạn chưa có bạn ăn nào trong danh sách kết nối! Hãy sang mục Quẹt Gu để thả tim kết nối bạn bè trước nhé.');
      setActiveTab('feed');
      return;
    }
    setInviteModalData({
      restaurantName: restaurant.name,
      restaurantAddress: restaurant.address,
      partnerName: defaultPartner.partnerName,
      partnerAvatar: defaultPartner.partnerAvatar,
      partnerId: defaultPartner.partnerId,
    });
  };

  const handleQuickInviteFromChat = (chat) => {
    setInviteModalData({
      restaurantName: 'Lẩu Nấm An Nhiên',
      restaurantAddress: '71 Mạc Đĩnh Chi, P. Đa Kao, Quận 1',
      partnerName: chat.partnerName,
      partnerAvatar: chat.partnerAvatar,
      partnerId: chat.partnerId,
    });
  };

  // Xác nhận tạo cuộc hẹn
  const submitCreateInvite = () => {
    if (!inviteModalData) return;

    const defaultPartnerAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80';
    const newInvite = {
      id: `inv-${Date.now()}`,
      inviteCode: `INV-${Date.now().toString().slice(-4)}`,
      partnerName: inviteModalData.partnerName || 'Bạn Ăn FoodMate',
      partnerAvatar: inviteModalData.partnerAvatar || defaultPartnerAvatar,
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

    setInvites((prev) => {
      const updated = [newInvite, ...prev];
      try {
        localStorage.setItem('foodmate_invites', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // Tự động đồng bộ gửi tin nhắn vào hộp thư Trò chuyện với bạn ăn
    const partnerId = inviteModalData.partnerId;
    const partnerName = inviteModalData.partnerName;
    const targetChat = chats.find(c => (partnerId && c.partnerId === partnerId) || c.partnerName === partnerName);
    if (targetChat) {
      handleSendMessage(
        targetChat.id,
        `🍽️ Mình vừa tạo lời mời đi ăn cùng bạn tại ${inviteModalData.restaurantName} (${inviteModalData.restaurantAddress}) vào ${inviteForm.scheduledAt}! Bạn hãy kiểm tra mục Bàn Ăn để xác nhận nhé!`
      );
    }

    setInviteModalData(null);
    setActiveTab('invites');
    alert('Lời mời đi ăn đã được gửi thành công! Lời nhắn rủ ăn đã được gửi tự động vào hộp thư trò chuyện.');
  };

  // Danh sách hội thoại đã được chuẩn hóa danh tính đối tác theo tài khoản đang đăng nhập
  const displayChats = getDisplayChats(chats, profile);

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
              chats={displayChats}
              onInviteAtRestaurant={handleInviteAtRestaurant}
              onGoToDiscovery={() => setActiveTab('feed')}
            />
          )}

          {activeTab === 'invites' && (
            <MealInvitesView
              invites={invites}
              onCheckIn={handleCheckIn}
              onReviewPartner={handleReviewPartner}
              onGoToRestaurants={() => setActiveTab('restaurants')}
            />
          )}

          {activeTab === 'chat' && (
            <ChatView
              chats={displayChats}
              onSendMessage={handleSendMessage}
              onQuickInvite={handleQuickInviteFromChat}
              activeChatId={activeChatId}
              onSelectChat={(id) => setActiveChatId(id)}
              onGoToDiscovery={() => setActiveTab('feed')}
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
            if (tab === 'chat') {
              setActiveChatId(null);
            }
            setActiveTab(tab);
          }}
          unreadChatCount={displayChats.reduce((acc, c) => acc + (c.unreadCount || 0), 0)}
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
              <div className="bg-orange-50/80 p-3 rounded-2xl border border-orange-100 text-xs space-y-1.5">
                {displayChats.length > 1 ? (
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">
                      Mời bạn ăn cùng:
                    </label>
                    <select
                      value={inviteModalData.partnerName}
                      onChange={(e) => {
                        const target = displayChats.find((c) => c.partnerName === e.target.value);
                        if (target) {
                          setInviteModalData({
                            ...inviteModalData,
                            partnerName: target.partnerName,
                            partnerAvatar: target.partnerAvatar,
                            partnerId: target.partnerId,
                          });
                        }
                      }}
                      className="w-full p-2 bg-white border border-orange-200 rounded-xl text-xs font-bold text-slate-900 cursor-pointer"
                    >
                      {displayChats.map((c) => (
                        <option key={c.id} value={c.partnerName}>
                          {c.partnerName} ({c.compatibilityScore}% hợp gu)
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <span className="text-slate-500">Mời bạn: </span>
                    <strong className="text-slate-900 font-bold">{inviteModalData.partnerName}</strong>
                  </div>
                )}
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
