// C:\Users\SMC\Documents\GitHub\AWS-Suretalk-2.0-fRONTEND\suretalk-web\utils\api.js
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

class ApiClient {
  constructor() {
    this.token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  }

  setToken(token) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  removeToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  // In utils/api.js, update the request function to log responses:
async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
  
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
  
    const config = {
      ...options,
      headers,
    };
  
    try {
      console.log(`API Request: ${url}`);
      const response = await fetch(url, config);
      const data = await response.json();
      
      console.log(`API Response for ${url}:`, data);
  
      if (!response.ok) {        
        if (data.errors && Array.isArray(data.errors)) {
          throw new Error(data.errors.map(err => err.msg || err.message).join(', '));
        }
        
        throw new Error(data.error || data.message || 'Something went wrong');
      }
  
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async register(data) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.data.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  async logout() {
    await this.request('/auth/logout', { method: 'POST' });
    this.removeToken();
  }

  async getProfile() {
    return this.request('/auth/profile');
  }
  
    // Add these methods to the ApiClient class:
    async getPendingRequests() {
        return this.request('/admin/pending-requests');
    }
    
    async approveAdminRequest(id) {
        return this.request(`/admin/requests/${id}/approve`, {
        method: 'POST',
        });
    }
    
    async rejectAdminRequest(id) {
        return this.request(`/admin/requests/${id}/reject`, {
        method: 'POST',
        });
    }

  // Voice notes endpoints
  async getVoiceNotes(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/voice-notes${query ? `?${query}` : ''}`);
  }

  async getVoiceNote(id) {
    return this.request(`/voice-notes/${id}`);
  }

  async createVoiceNote(data) {
    return this.request('/voice-notes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateVoiceNote(id, data) {
    return this.request(`/voice-notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteVoiceNote(id) {
    return this.request(`/voice-notes/${id}`, {
      method: 'DELETE',
    });
  }

  async getVoiceNoteDownloadUrl(id) {
    return this.request(`/voice-notes/${id}/download`);
  }

  // Contacts endpoints
  async getContacts(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/contacts${query ? `?${query}` : ''}`);
  }

  async createContact(data) {
    return this.request('/contacts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateContact(id, data) {
    return this.request(`/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteContact(id) {
    return this.request(`/contacts/${id}`, {
      method: 'DELETE',
    });
  }

  // Vault endpoints (premium only)
  async getVaultItems(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/vault${query ? `?${query}` : ''}`);
  }

  async createVoiceWill(data) {
    return this.request('/vault/wills', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getVoiceWills() {
    return this.request('/vault/wills');
  }

  // Scheduled messages endpoints
  async getScheduledMessages(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/scheduled${query ? `?${query}` : ''}`);
  }

  async scheduleMessage(data) {
    return this.request('/scheduled', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async cancelScheduledMessage(id) {
    return this.request(`/scheduled/${id}`, {
      method: 'DELETE',
    });
  }

  // Billing endpoints
  async getPlans() {
    return this.request('/billing/plans');
  }

  async getSubscription() {
    return this.request('/billing/subscription');
  }

  async createCheckoutSession(priceId, successUrl, cancelUrl) {
    return this.request('/billing/create-checkout', {
      method: 'POST',
      body: JSON.stringify({ priceId, successUrl, cancelUrl }),
    });
  }

  // Storage endpoints
  async getUploadUrl(fileName, fileType, type = 'voice-note') {
    const endpoint = type === 'vault' ? '/storage/upload-url/vault' : '/storage/upload-url/voice-note';
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify({ fileName, fileType }),
    });
  }

  async getDownloadUrl(key, bucket, expiresIn = 3600) {
    return this.request('/storage/download-url', {
      method: 'POST',
      body: JSON.stringify({ key, bucket, expiresIn }),
    });
  }

  // Admin endpoints
  async getAdminOverview() {
    return this.request('/admin/overview');
  }

  async getAdminUsers(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/admin/users${query ? `?${query}` : ''}`);
  }

  async getAdminWills(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/admin/wills${query ? `?${query}` : ''}`);
  }

  async releaseVoiceWill(id, releaseNotes) {
    return this.request(`/admin/wills/${id}/release`, {
      method: 'POST',
      body: JSON.stringify({ releaseNotes }),
    });
  }
}

export const api = new ApiClient();