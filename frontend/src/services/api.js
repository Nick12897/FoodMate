const getApiBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return `http://${window.location.hostname}:8000/api/v1`;
    }
  }
  return 'http://127.0.0.1:8000/api/v1';
};
const API_BASE_URL = getApiBaseUrl();

export const api = {
  // 0. Auth
  async login(phoneNumber, password = '') {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: phoneNumber, password: password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || 'Đăng nhập không thành công');
      return json;
    } catch (e) {
      throw e;
    }
  },

  async register(registerData) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || 'Đăng ký không thành công');
      return json;
    } catch (e) {
      throw e;
    }
  },

  async socialLogin(provider, profile = {}) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/social-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          full_name: profile.fullName || `Thành viên ${provider.toUpperCase()}`,
          email: profile.email || `${provider}_member@foodmate.vn`,
          avatar_url: profile.avatarUrl || '',
          social_id: profile.socialId || `${provider}_${Date.now()}`
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || 'Đăng nhập không thành công');
      return json;
    } catch (e) {
      throw e;
    }
  },

  async getSampleUsers() {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/sample-users`);
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch (e) {
      return [];
    }
  },

  // 1. Profile
  async getMyProfile(userId = 'user-me') {
    try {
      const res = await fetch(`${API_BASE_URL}/profile/me?user_id=${userId}`);
      if (!res.ok) throw new Error('Network error');
      const json = await res.json();
      return json.data;
    } catch (e) {
      console.warn('Backend unavailable, using fallback mock data:', e);
      return null;
    }
  },

  async updateTasteProfile(data, userId = 'user-me') {
    try {
      const res = await fetch(`${API_BASE_URL}/profile/taste?user_id=${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  async updateUserProfile(data, userId = 'user-me') {
    try {
      const res = await fetch(`${API_BASE_URL}/profile/me?user_id=${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (e) {
      console.warn('Backend unavailable, profile saved locally:', e);
      return null;
    }
  },

  // 2. Discovery
  async getFeed(lat = 10.7769, lon = 106.7009, userId = 'user-me') {
    try {
      const res = await fetch(`${API_BASE_URL}/discovery/feed?latitude=${lat}&longitude=${lon}&user_id=${userId}`);
      if (!res.ok) throw new Error('Network error');
      const json = await res.json();
      return json.data.cards;
    } catch (e) {
      return null;
    }
  },

  async swipe(targetUserId, action, userId = 'user-me') {
    try {
      const res = await fetch(`${API_BASE_URL}/discovery/swipe?user_id=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_user_id: targetUserId, action }),
      });
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  // 3. Restaurants
  async getRestaurants(query = '') {
    try {
      const res = await fetch(`${API_BASE_URL}/restaurants/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('Network error');
      const json = await res.json();
      return json.data;
    } catch (e) {
      return null;
    }
  },

  // 4. Meal Invites
  async getInvites(userId = 'user-me') {
    try {
      const res = await fetch(`${API_BASE_URL}/meal-invites?user_id=${userId}`);
      if (!res.ok) throw new Error('Network error');
      const json = await res.json();
      return json.data;
    } catch (e) {
      return null;
    }
  },

  async checkIn(inviteId, lat = 10.7831, lon = 106.6982, userId = 'user-me') {
    try {
      const res = await fetch(`${API_BASE_URL}/meal-invites/${inviteId}/check-in?user_id=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: lat, longitude: lon }),
      });
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  // 5. Chat & Messaging
  async getConversations(userId = 'user-me') {
    try {
      const res = await fetch(`${API_BASE_URL}/chat/conversations?user_id=${userId}`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.data;
    } catch (e) {
      return null;
    }
  },

  async getMessages(convId, userId = 'user-me') {
    try {
      const res = await fetch(`${API_BASE_URL}/chat/conversations/${convId}/messages?user_id=${userId}`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.data;
    } catch (e) {
      return null;
    }
  },

  async sendMessage(convId, content, senderId = 'user-me', partnerId = null) {
    try {
      const res = await fetch(`${API_BASE_URL}/chat/messages?user_id=${senderId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: convId,
          content,
          sender_id: senderId,
          partner_id: partnerId
        }),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      return null;
    }
  },
};
