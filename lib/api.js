// API Configuration and Service
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = null;
  }

  setToken(token) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('api_token', token);
    }
  }

  getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('api_token') || this.token;
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('api_token');
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    // Check if body is FormData - if so, don't set Content-Type header (browser will set it with boundary)
    const isFormData = options.body instanceof FormData;
    
    const config = {
      ...options,
      headers: {
        ...(!isFormData && { 'Content-Type': 'application/json' }),
        'Accept': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    // If body is not FormData, stringify it
    if (!isFormData && options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);
      
      // Check if response has content before trying to parse JSON
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        const text = await response.text();
        try {
          data = text ? JSON.parse(text) : {};
        } catch (parseError) {
          console.error('JSON Parse Error:', parseError, 'Response text:', text);
          throw new Error('Invalid JSON response from server');
        }
      } else {
        const text = await response.text();
        data = { message: text || 'An error occurred' };
      }

      if (!response.ok) {
        if (response.status === 401) {
          this.clearToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          throw new Error('Unauthorized');
        }
        throw new Error(data.message || data.error || `Server error: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      // Re-throw with more context if it's a network error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server. Please check your connection.');
      }
      throw error;
    }
  }

  // Auth endpoints
  async login(email, password, twoFactorCode = null) {
    const body = { email, password };
    if (twoFactorCode) {
      body.two_factor_code = twoFactorCode;
    }
    const data = await this.request('/login', {
      method: 'POST',
      body: body, // Don't stringify here - request() method handles it
    });
    // Only set token if login was successful (no 2FA requirement)
    if (data.token && !data.requires_two_factor) {
      this.setToken(data.token);
    }
    return data;
  }

  async logout() {
    await this.request('/logout', { method: 'POST' });
    this.clearToken();
  }

  async getUser() {
    return this.request('/user');
  }

  async updateProfile(data) {
    return this.request('/user/profile', {
      method: 'PUT',
      body: data,
    });
  }

  async changePassword(data) {
    return this.request('/user/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Client endpoints
  async getClients(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/clients${queryString ? `?${queryString}` : ''}`);
  }

  async getClient(id) {
    return this.request(`/clients/${id}`);
  }

  async getClientDetails(id) {
    return this.request(`/clients/${id}/details`);
  }

  async createClient(data) {
    return this.request('/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateClient(id, data) {
    return this.request(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteClient(id) {
    return this.request(`/clients/${id}`, {
      method: 'DELETE',
    });
  }

  async getPendingMatches(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/pending-matches${queryString ? `?${queryString}` : ''}`);
  }

  async getPendingMatchesCount() {
    const data = await this.request('/pending-matches/count');
    return data.count || 0;
  }

  async assignMatch(data) {
    return this.request('/matches', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Training Counsellor endpoints
  async getTrainingCounsellors(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/training-counsellors${queryString ? `?${queryString}` : ''}`);
  }

  async getTrainingCounsellor(id) {
    return this.request(`/training-counsellors/${id}`);
  }

  async getTrainingCounsellorDetails(id) {
    return this.request(`/training-counsellors/${id}/details`);
  }

  async sendQualifiedFormEmail(id) {
    return this.request(`/training-counsellors/${id}/send-qualified-form-email`, {
      method: 'POST',
    });
  }

  async sendTrainingCounsellorEmail(id, subject, message) {
    return this.request(`/training-counsellors/${id}/send-email`, {
      method: 'POST',
      body: JSON.stringify({ subject, message }),
    });
  }

  async createTrainingCounsellor(data) {
    return this.request('/training-counsellors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTrainingCounsellor(id, data) {
    return this.request(`/training-counsellors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTrainingCounsellor(id) {
    return this.request(`/training-counsellors/${id}`, {
      method: 'DELETE',
    });
  }

  async transitionToQualified(id) {
    return this.request(`/training-counsellors/${id}/transition-to-qualified`, {
      method: 'POST',
    });
  }

  // Consultation endpoints
  async getConsultations(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/consultations${queryString ? `?${queryString}` : ''}`);
  }

  async getConsultationStats() {
    return this.request('/consultation-stats');
  }

  async createConsultation(data) {
    return this.request('/consultations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async completeConsultation(id, data) {
    return this.request(`/consultations/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async cancelConsultation(id, reason = null) {
    return this.request(`/consultations/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async rescheduleConsultation(id, data) {
    return this.request(`/consultations/${id}/reschedule`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteConsultation(id) {
    return this.request(`/consultations/${id}`, {
      method: 'DELETE',
    });
  }

  // Activity Log endpoints
  async getActivityLogs(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/activity-logs${queryString ? `?${queryString}` : ''}`);
  }

  // Intake Form endpoints
  async submitClientIntake(data) {
    return this.request('/client-intake', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async submitTcIntake(data) {
    // If data is FormData, pass it directly; otherwise stringify JSON
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return this.request('/tc-intake', {
      method: 'POST',
      body: body,
    });
  }

  // Payment endpoints
  async createPaymentIntent(clientId, amount, currency = 'gbp') {
    return this.request('/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify({
        client_id: clientId,
        amount: amount,
        currency: currency,
      }),
    });
  }

  async confirmPayment(paymentIntentId, clientId, consultationId = null) {
    return this.request('/payments/confirm', {
      method: 'POST',
      body: JSON.stringify({
        payment_intent_id: paymentIntentId,
        client_id: clientId,
        consultation_id: consultationId,
      }),
    });
  }

  // Client action endpoints
  async archiveClient(id) {
    return this.request(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'archived' }),
    });
  }

  async progressClientStage(id, stage) {
    return this.request(`/clients/${id}/progress-stage`, {
      method: 'POST',
      body: JSON.stringify({ stage }),
    });
  }

  async sendClientEmail(id, subject, message) {
    return this.request(`/clients/${id}/send-email`, {
      method: 'POST',
      body: JSON.stringify({ subject, message }),
    });
  }

  async sendFeedbackForm(id) {
    return this.request(`/clients/${id}/send-feedback-form`, {
      method: 'POST',
    });
  }

  async resendAgreement(id) {
    return this.request(`/clients/${id}/resend-agreement`, {
      method: 'POST',
    });
  }

  async updateSatisfactionScore(id, score) {
    return this.request(`/clients/${id}/update-satisfaction`, {
      method: 'POST',
      body: JSON.stringify({ satisfaction_score: score }),
    });
  }

  async getEligibleForFeedback(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/clients/eligible-for-feedback${queryString ? `?${queryString}` : ''}`);
  }

  // Activity log / Notes endpoints
  async createActivityLog(data) {
    return this.request('/activity-logs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateActivityLog(id, data) {
    return this.request(`/activity-logs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteActivityLog(id) {
    return this.request(`/activity-logs/${id}`, {
      method: 'DELETE',
    });
  }

  // Induction endpoints
  async getInductions(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/inductions${queryString ? `?${queryString}` : ''}`);
  }

  async getInduction(id) {
    return this.request(`/inductions/${id}`);
  }

  async createInduction(data) {
    return this.request('/inductions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateInduction(id, data) {
    return this.request(`/inductions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteInduction(id) {
    return this.request(`/inductions/${id}`, {
      method: 'DELETE',
    });
  }

  async addInductionAttendees(id, attendeeTcIds) {
    return this.request(`/inductions/${id}/add-attendees`, {
      method: 'POST',
      body: JSON.stringify({ attendee_tc_ids: attendeeTcIds }),
    });
  }

  async acceptInductionInvitation(token) {
    return this.request(`/induction/accept/${token}`, {
      method: 'POST',
    });
  }

  async declineInductionInvitation(token) {
    return this.request(`/induction/decline/${token}`, {
      method: 'POST',
    });
  }

  // 2FA endpoints
  async initiate2FASetup() {
    return this.request('/2fa/initiate', {
      method: 'POST',
    });
  }

  async verify2FASetup(code) {
    return this.request('/2fa/verify', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  async disable2FA() {
    return this.request('/2fa/disable', {
      method: 'POST',
    });
  }

  async regenerate2FACode() {
    return this.request('/2fa/regenerate', {
      method: 'POST',
    });
  }
}

export const apiService = new ApiService();
export default apiService;

