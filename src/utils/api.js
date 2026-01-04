
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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

  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('token')
      : null;

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    console.log('API Request:', url);
    console.log('Using token:', token ? 'YES' : 'NO');

    const response = await fetch(url, config);
    const data = await response.json();

    console.log('API Response:', data);

    if (!response.ok) {
      throw new Error(data.error || data.message || 'Request failed');
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
            return this.request(`/admin/requests/${id}/action`, {
            method: 'POST',
            body: JSON.stringify({ action: 'approve' }), 
            headers: { 'Content-Type': 'application/json' }
            });
        }
        
        async rejectAdminRequest(id, notes = '') {
            return this.request(`/admin/requests/${id}/action`, {
            method: 'POST',
            body: JSON.stringify({ 
                action: 'reject', 
                notes: notes
            }),
            headers: { 'Content-Type': 'application/json' }
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
    // Filter out undefined and 'undefined' string values
    const filteredParams = {};
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== 'undefined' && value !== null && value !== '') {
        filteredParams[key] = value;
      }
    }    
    const query = new URLSearchParams(filteredParams).toString();
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

  // Admin dashboard endpoints
async getAdminDashboardStats() {
  return this.request('/admin/dashboard/stats');
}

// User dashboard endpoints  
async getUserDashboardStats() {
  return this.request('/users/stats');
}

// Admin dashboard endpoints
async getAdminDashboardOverview() {
  return this.request('/admin/dashboard/overview');
}

// User management endpoints
async getUserDetails(id) {
  return this.request(`/admin/users/${id}`);
}

async updateUser(id, data) {
  return this.request(`/admin/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

async deleteUser(id) {
  return this.request(`/admin/users/${id}`, {
    method: 'DELETE',
  });
}

async createUser(data) {
  return this.request('/admin/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Export functionality
async exportUsers(format = 'csv', filters = {}) {
  return this.request(`/admin/users/export?format=${format}&${new URLSearchParams(filters).toString()}`);
}


// Bulk operations
async bulkUpdateUsers(userIds, action, data = {}) {
  return this.request('/admin/users/bulk-update', {
    method: 'POST',
    body: JSON.stringify({ userIds, action, data }),
  });
}

// Export users
async exportUsers(format = 'csv', filters = {}) {
  const query = new URLSearchParams({ format, ...filters }).toString();
  return fetch(`${API_BASE_URL}/admin/users/export?${query}`, {
    headers: {
      'Authorization': `Bearer ${this.token}`,
    },
  }).then(response => {
    if (format === 'csv') {
      return response.blob();
    }
    return response.json();
  });
}

// Delete user
async deleteUser(id) {
  return this.request(`/admin/users/${id}`, {
    method: 'DELETE',
  });
}

// Create user (admin)
async createUser(data) {
  return this.request('/admin/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}


// Admin scheduled messages endpoints
async getAdminScheduledMessages(params = {}) {
  const query = new URLSearchParams(params).toString();
  return this.request(`/admin/scheduled-messages${query ? `?${query}` : ''}`);
}

async getAdminScheduledMessagesStats(params = {}) {
  const query = new URLSearchParams(params).toString();
  return this.request(`/admin/scheduled-messages/stats${query ? `?${query}` : ''}`);
}

async updateScheduledMessageStatus(id, status, notes = '') {
  return this.request(`/admin/scheduled-messages/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, notes }),
  });
}

async cancelScheduledMessage(id) {
  return this.request(`/admin/scheduled-messages/${id}`, {
    method: 'DELETE',
  });
}

// Export scheduled messages
async exportScheduledMessages(format = 'csv', filters = {}) {
  const query = new URLSearchParams({ format, ...filters }).toString();
  return fetch(`${API_BASE_URL}/admin/scheduled-messages/export?${query}`, {
    headers: {
      'Authorization': `Bearer ${this.token}`,
    },
  }).then(response => {
    if (format === 'csv') {
      return response.blob();
    }
    return response.json();
  });
}

// Add to your ApiClient class in utils/api.js
async getAdminLogs(params = {}) {
  const query = new URLSearchParams(params).toString();
  return this.request(`/admin/logs${query ? `?${query}` : ''}`);
}

// Add to your ApiClient class
async getAdminStorageStats() {
  return this.request('/admin/storage');
}

// Storage methods
async getBucketDetails(bucketName) {
  return this.request(`/admin/storage/bucket/${encodeURIComponent(bucketName)}`);
}

async addLifecycleRule(data) {
  return this.request('/admin/storage/lifecycle-rules', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

async getLifecycleRules(params = {}) {
  const query = new URLSearchParams(params).toString();
  return this.request(`/admin/storage/lifecycle-rules${query ? `?${query}` : ''}`);
}

async updateStorageConfig(data) {
  return this.request('/admin/storage/config', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

async uploadStorageReport(formData) {
  // Note: This needs special handling for file upload
  const url = `${API_BASE_URL}/admin/storage/upload-report`;
  const token = localStorage.getItem('token');
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || data.message || 'Upload failed');
  }
  return data;
}

// Admin request statistics
async getAdminRequestStats() {
  return this.request('/admin/requests/stats');
}

// Bulk approve pending requests
async bulkApproveRequests() {
  return this.request('/admin/requests/bulk-approve', {
    method: 'POST',
  });
}

// Export requests (already in your backend)
async exportAdminRequests(format = 'csv', filters = {}) {
  const query = new URLSearchParams({ format, ...filters }).toString();
  return fetch(`${API_BASE_URL}/admin/users/export?${query}`, {
    headers: {
      'Authorization': `Bearer ${this.token}`,
    },
  }).then(response => {
    if (format === 'csv') {
      return response.blob();
    }
    return response.json();
  });
}

// Log statistics
async getLogStats() {
  return this.request('/admin/logs/stats');
}

// Clear old logs
async clearOldLogs(days = 30) {
  return this.request('/admin/logs/clear-old', {
    method: 'POST',
    body: JSON.stringify({ days }),
  });
}

// Run log analysis (if you implement this later)
async runLogAnalysis() {
  return this.request('/admin/logs/analyze', {
    method: 'POST',
  });
}

// Settings methods
async getSettings() {
  return this.request('/admin/settings');
}

async updateSetting(category, key, value) {
  return this.request('/admin/settings', {
    method: 'PUT',
    body: JSON.stringify({ category, key, value }),
  });
}

async bulkUpdateSettings(updates) {
  return this.request('/admin/settings/bulk', {
    method: 'PUT',
    body: JSON.stringify({ updates }),
  });
}

async resetSettings() {
  return this.request('/admin/settings/reset', {
    method: 'POST',
  });
}

async getServiceStatus() {
  return this.request('/admin/settings/service-status');
}


// Support methods
async createSupportTicket(data) {
  return this.request('/users/support/tickets', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

async getUserTickets(params = {}) {
  const query = new URLSearchParams(params).toString();
  return this.request(`/users/support/tickets${query ? `?${query}` : ''}`);
}

async getTicketDetails(id) {
  return this.request(`/users/support/tickets/${id}`);
}

async respondToTicket(id, message) {
  return this.request(`/users/support/tickets/${id}/respond`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
}

async getKnowledgeBase(params = {}) {
  const query = new URLSearchParams(params).toString();
  return this.request(`/users/support/knowledge-base${query ? `?${query}` : ''}`);
}

async voteOnArticle(id, helpful) {
  return this.request(`/users/support/knowledge-base/${id}/vote`, {
    method: 'POST',
    body: JSON.stringify({ helpful }),
  });
}

// Admin support methods
async getAdminSupportTickets(params = {}) {
  const query = new URLSearchParams(params).toString();
  return this.request(`/admin/support/tickets${query ? `?${query}` : ''}`);
}

async getAdminTicketDetails(id) {
  return this.request(`/admin/support/tickets/${id}`);
}

async adminRespondToTicket(id, message, isInternal = false) {
  return this.request(`/admin/support/tickets/${id}/respond`, {
    method: 'POST',
    body: JSON.stringify({ message, isInternal }),
  });
}

async updateTicketStatus(id, status) {
  return this.request(`/admin/support/tickets/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

async assignTicket(id, adminId = null) {
  return this.request(`/admin/support/tickets/${id}/assign`, {
    method: 'PUT',
    body: JSON.stringify({ adminId }),
  });
}

async getSupportStats() {
  return this.request('/admin/support/stats');
}

async getAdminKnowledgeBase(params = {}) {
  const query = new URLSearchParams(params).toString();
  return this.request(`/admin/support/knowledge-base${query ? `?${query}` : ''}`);
}

async createArticle(data) {
  return this.request('/admin/support/knowledge-base', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

async updateArticle(id, data) {
  return this.request(`/admin/support/knowledge-base/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

async deleteArticle(id) {
  return this.request(`/admin/support/knowledge-base/${id}`, {
    method: 'DELETE',
  });
}

async getKBStats() {
  return this.request('/admin/support/knowledge-base/stats');
}

// Get storage usage
async getStorageUsage() {
  return this.request('/storage/usage');
}

// Get scheduled messages count for dashboard
async getScheduledMessagesCount() {
  return this.request('/scheduled/stats');
}

// Get voice note statistics
async getVoiceNotesStats() {
  return this.request('/voice-notes/stats');
}

// Get user limits
async getUserLimits() {
  return this.request('/users/limits');
}

// Get contact statistics
async getContactStats() {
  return this.request('/contacts/stats');
}

// Get vault statistics
async getVaultStats() {
  return this.request('/vault/stats');
}

// Analytics endpoints
async getActivityAnalytics(period = 'week', timezone = 'UTC') {
  return this.request(`/users/activity?period=${period}&timezone=${timezone}`);
}

async recordAnalyticsEvent(eventData) {
  return this.request('/users/event', {
    method: 'POST',
    body: JSON.stringify(eventData),
  });
}

async getAnalyticsStats(startDate = null, endDate = null) {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  const query = params.toString();
  return this.request(`/users/stats${query ? `?${query}` : ''}`);
}

// Schedule message with contacts
async scheduleMessageWithContacts(data) {
  return this.request('/scheduled/schedule-with-contacts', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Send test message
async sendTestMessage(data) {
  return this.request('/scheduled/send-test', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Get scheduled messages with contacts
async getScheduledMessagesWithContacts(params = {}) {
  const query = new URLSearchParams(params).toString();
  return this.request(`/scheduled/with-contacts${query ? `?${query}` : ''}`);
}

// Cancel scheduled message
async cancelScheduledMessage(id) {
  return this.request(`/scheduled/${id}/cancel`, {
    method: 'PUT',
  });
}


async deleteContact(id) {
  return this.request(`/contacts/${id}`, {
    method: 'DELETE',
  });
}

async getContact(id) {
  return this.request(`/contacts/${id}`);
}







// In your utils/api.js, add these methods to the ApiClient class:

// Mark voice note as permanent
async markAsPermanent(voiceNoteId) {
  return this.request(`/vault/${voiceNoteId}/mark-permanent`, {
    method: 'POST',
  });
}

// Generate vault upload URL
async getVaultUploadUrl(fileName, fileType, isWill = false) {
  return this.request('/vault/upload-url', {
    method: 'POST',
    body: JSON.stringify({ fileName, fileType, isWill }),
  });
}



// Add these methods to your ApiClient class:

// Settings endpoints
async getSettings() {
  return this.request('/users/settings');
}

async updateSettings(category, key, value) {
  return this.request('/users/settings', {
    method: 'PUT',
    body: JSON.stringify({ category, key, value }),
  });
}

async updateAllSettings(settings) {
  return this.request('/users/settings/all', {
    method: 'PUT',
    body: JSON.stringify({ settings }),
  });
}

// Devices endpoints
async getConnectedDevices() {
  return this.request('/users/devices');
}

async revokeDevice(deviceId) {
  return this.request(`/users/devices/${deviceId}`, {
    method: 'DELETE',
  });
}

async revokeAllDevices() {
  return this.request('/users/devices/revoke-all', {
    method: 'POST',
  });
}

// Backup endpoints
async getBackupSettings() {
  return this.request('/users/settings/backup');
}

async updateBackupSettings(settings) {
  return this.request('/users/settings/backup', {
    method: 'PUT',
    body: JSON.stringify({ settings }),
  });
}

async createBackup(options = {}) {
  return this.request('/users/backup/create', {
    method: 'POST',
    body: JSON.stringify(options),
  });
}

async getBackupStatus(backupId) {
  return this.request(`/users/backup/status/${backupId}`);
}

async getBackupList(params = {}) {
  const query = new URLSearchParams(params).toString();
  return this.request(`/users/backup/list${query ? `?${query}` : ''}`);
}

// Export data
async exportData(options = {}) {
  return this.request('/users/settings/export', {
    method: 'POST',
    body: JSON.stringify(options),
  });
}

// Delete account
async deleteAccount(confirmation, reason = '') {
  return this.request('/users/settings/account', {
    method: 'DELETE',
    body: JSON.stringify({ confirmation, reason }),
  });
}

// Profile management
async updateProfile(data) {
  return this.request('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

async changePassword(currentPassword, newPassword) {
  return this.request('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

// Two-factor authentication
async setupTwoFactor() {
  return this.request('/auth/2fa/setup');
}

async verifyTwoFactor(token) {
  return this.request('/auth/2fa/verify', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}

async disableTwoFactor() {
  return this.request('/auth/2fa/disable', {
    method: 'POST',
  });
}


// In utils/api.js, add these methods:

// Notifications endpoints
async getNotifications(params = {}) {
  const query = new URLSearchParams(params).toString();
  return this.request(`/notifications${query ? `?${query}` : ''}`);
}

async markNotificationAsRead(id) {
  return this.request(`/notifications/${id}/read`, {
    method: 'POST'
  });
}

async markAllNotificationsAsRead() {
  return this.request('/notifications/mark-all-read', {
    method: 'POST'
  });
}

async deleteNotification(id) {
  return this.request(`/notifications/${id}`, {
    method: 'DELETE'
  });
}

async clearAllNotifications() {
  return this.request('/notifications', {
    method: 'DELETE'
  });
}

async getNotificationStats() {
  return this.request('/notifications/stats');
}

async subscribeToPushNotifications(subscriptionData) {
  return this.request('/notifications/subscribe', {
    method: 'POST',
    body: JSON.stringify(subscriptionData)
  });
}


// In your api.js, add:
async getAdminProfile  () {
  return this.request('/auth/admin-profile');
};


}
export const api = new ApiClient();