const getApiBase = () => {
  const envUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE;
  if (envUrl) {
    const cleanUrl = envUrl.trim().replace(/\/+$/, '');
    return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
  }
  return import.meta.env.PROD ? '/api' : 'http://localhost:5000/api';
};

const API_BASE = getApiBase();

// Helper for authorized headers
function getHeaders(token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Auth
  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    return data;
  },

  async register(studentData) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    return data;
  },

  async getMe(token) {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(token)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch user');
    return data;
  },

  // Events
  async getEvents(params = {}) {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.search) query.append('search', params.search);
    if (params.featured) query.append('featured', 'true');

    const res = await fetch(`${API_BASE}/events?${query.toString()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch events');
    return data.events || [];
  },

  async getEventById(id) {
    const res = await fetch(`${API_BASE}/events/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Event not found');
    return data.event;
  },

  async createEvent(eventData, token) {
    const res = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(eventData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create event');
    return data;
  },

  async updateEvent(id, eventData, token) {
    const res = await fetch(`${API_BASE}/events/${id}`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(eventData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update event');
    return data;
  },

  async deleteEvent(id, token) {
    const res = await fetch(`${API_BASE}/events/${id}`, {
      method: 'DELETE',
      headers: getHeaders(token)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete event');
    return data;
  },

  // Registrations (Student)
  async registerForEvent(eventId, token) {
    const res = await fetch(`${API_BASE}/registrations/register`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ eventId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    return data;
  },

  async getMyRegistrations(token) {
    const res = await fetch(`${API_BASE}/registrations/my`, {
      headers: getHeaders(token)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to load tickets');
    return data.registrations || [];
  },

  async cancelRegistration(id, token) {
    const res = await fetch(`${API_BASE}/registrations/cancel/${id}`, {
      method: 'DELETE',
      headers: getHeaders(token)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to cancel registration');
    return data;
  },

  // Admin APIs
  async getAdminStats(token) {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: getHeaders(token)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to load stats');
    return data;
  },

  async getAttendees(params = {}, token) {
    const query = new URLSearchParams();
    if (params.eventId) query.append('eventId', params.eventId);
    if (params.status) query.append('status', params.status);
    if (params.search) query.append('search', params.search);

    const res = await fetch(`${API_BASE}/admin/attendees?${query.toString()}`, {
      headers: getHeaders(token)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch attendees');
    return data.attendees || [];
  },

  async checkInTicket(code, token) {
    const res = await fetch(`${API_BASE}/admin/check-in`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ code })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Check-in validation failed');
    return data;
  },

  async updateAttendeeStatus(id, status, token) {
    const res = await fetch(`${API_BASE}/admin/attendees/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(token),
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update status');
    return data;
  },

  // Volunteer APIs
  async getVolunteerDuty(token) {
    const res = await fetch(`${API_BASE}/volunteer/duty`, {
      headers: getHeaders(token)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to load volunteer duty');
    return data;
  },

  // Announcements
  async getAnnouncements() {
    const res = await fetch(`${API_BASE}/announcements`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to load announcements');
    return data.announcements || [];
  },

  async createAnnouncement(announcementData, token) {
    const res = await fetch(`${API_BASE}/announcements`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(announcementData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to post announcement');
    return data;
  },

  async deleteAnnouncement(id, token) {
    const res = await fetch(`${API_BASE}/announcements/${id}`, {
      method: 'DELETE',
      headers: getHeaders(token)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete announcement');
    return data;
  }
};
