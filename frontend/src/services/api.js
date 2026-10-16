const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export const api = {
  // 1. Profile
  async getMyProfile() {
    try {
      const res = await fetch(`${API_BASE_URL}/profile/me`);
      if (!res.ok) throw new Error('Network error');
      const json = await res.json();
      return json.data;
    } catch (e) {
      console.warn('Backend unavailable, using fallback mock data:', e);
      return null;
    }
  },

  async updateTasteProfile(data) {
    try {
      const res = await fetch(`${API_BASE_URL}/profile/taste`, {
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

  // 2. Discovery
  async getFeed(lat = 10.7769, lon = 106.7009) {
    try {
      const res = await fetch(`${API_BASE_URL}/discovery/feed?latitude=${lat}&longitude=${lon}`);
      if (!res.ok) throw new Error('Network error');
      const json = await res.json();
      return json.data.cards;
    } catch (e) {
      return null;
    }
  },

  async swipe(targetUserId, action) {
    try {
      const res = await fetch(`${API_BASE_URL}/discovery/swipe`, {
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
  async getInvites() {
    try {
      const res = await fetch(`${API_BASE_URL}/meal-invites`);
      if (!res.ok) throw new Error('Network error');
      const json = await res.json();
      return json.data;
    } catch (e) {
      return null;
    }
  },

  async checkIn(inviteId, lat = 10.7831, lon = 106.6982) {
    try {
      const res = await fetch(`${API_BASE_URL}/meal-invites/${inviteId}/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: lat, longitude: lon }),
      });
      return await res.json();
    } catch (e) {
      return null;
    }
  },
};
