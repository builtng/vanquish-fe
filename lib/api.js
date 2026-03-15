// API Configuration and Service
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://api.vqtmanagement.com/api"
    : "http://127.0.0.1:8000/api");

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
    this.response = { data }; // for backward compatibility with axios-style checks
  }
}

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.storageURL = API_BASE_URL.replace("/api", "") + "/storage";
    this.token = null;
  }

  getStorageUrl(path) {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    const cleanPath = path.startsWith("/") ? path.substring(1) : path;
    return `${this.storageURL}/${cleanPath}`;
  }

  setToken(token) {
    this.token = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("api_token", token);
    }
  }

  getToken() {
    if (typeof window !== "undefined") {
      return localStorage.getItem("api_token") || this.token;
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("api_token");
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();
    const maxRetries = options.retries !== undefined ? options.retries : 2;
    const retryDelay =
      options.retryDelay !== undefined ? options.retryDelay : 1000;

    // Check if body is FormData - if so, don't set Content-Type header (browser will set it with boundary)
    const isFormData = options.body instanceof FormData;

    const makeRequest = async (attempt = 0) => {
      const config = {
        ...options,
        headers: {
          ...(!isFormData && { "Content-Type": "application/json" }),
          Accept: "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
      };

      // Remove retry-specific options from config
      delete config.retries;
      delete config.retryDelay;

      // If body is not FormData, stringify it
      if (!isFormData && options.body && typeof options.body === "object") {
        config.body = JSON.stringify(options.body);
      }

      const response = await fetch(url, config);

      // Check if response has content before trying to parse JSON
      const contentType = response.headers.get("content-type");
      let data;

      if (contentType && contentType.includes("application/json")) {
        const text = await response.text();
        try {
          data = text ? JSON.parse(text) : {};
        } catch (parseError) {
          console.error(
            "JSON Parse Error:",
            parseError,
            "Response text:",
            text,
          );
          throw new ApiError(
            "Invalid JSON response from server",
            response.status,
            {},
          );
        }
      } else {
        const text = await response.text();
        data = { message: text || "An error occurred" };
      }

      if (!response.ok) {
        if (response.status === 401) {
          this.clearToken();
          if (typeof window !== "undefined" && !options.noRedirect) {
            window.location.href = "/login";
          }
          throw new ApiError("Unauthorized", 401, data);
        }

        // Handle rate limiting (429) with retry logic
        if (response.status === 429 && attempt < maxRetries) {
          const retryAfter = response.headers.get("Retry-After");
          const delay = retryAfter
            ? parseInt(retryAfter) * 1000
            : retryDelay * Math.pow(2, attempt);

          console.warn(
            `Rate limit hit. Retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`,
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          return makeRequest(attempt + 1);
        }

        // Provide user-friendly error message for rate limiting
        if (response.status === 429) {
          throw new ApiError(
            "Too many requests. Please wait a moment and try again.",
            429,
            data,
          );
        }

        throw new ApiError(
          data.message || data.error || `Server error: ${response.status}`,
          response.status,
          data,
        );
      }

      return data;
    };

    try {
      return await makeRequest(0);
    } catch (error) {
      // Only log unexpected errors to console to avoid Next.js error overlay for validation errors
      if (!(error instanceof ApiError) || error.status >= 500) {
        console.error("API Error:", error);
      }
      // Re-throw with more context if it's a network error
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new ApiError(
          "Network error: Unable to connect to server. Please check your connection.",
          0,
          {},
        );
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
    const data = await this.request("/login", {
      method: "POST",
      body: body, // Don't stringify here - request() method handles it
    });
    // Only set token if login was successful (no 2FA requirement)
    if (data.token && !data.requires_two_factor) {
      this.setToken(data.token);
    }
    return data;
  }

  async logout() {
    await this.request("/logout", { method: "POST" });
    this.clearToken();
  }

  async getUser() {
    return this.request("/user");
  }

  async updateProfile(data) {
    return this.request("/user/profile", {
      method: "PUT",
      body: data,
    });
  }

  async changePassword(data) {
    return this.request("/user/change-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Client endpoints
  async getClients(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/clients${queryString ? `?${queryString}` : ""}`);
  }

  async getClient(id) {
    return this.request(`/clients/${id}`);
  }

  async getClientDetails(id) {
    return this.request(`/clients/${id}/details`);
  }

  async downloadClientReport(id) {
    const token = this.getToken();
    const url = `${this.baseURL}/clients/${id}/download-report`;

    // Use fetch to download the PDF file
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/pdf",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to download report");
    }

    // Get the blob from the response
    const blob = await response.blob();

    // Create a download link and trigger it
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;

    // Extract filename from Content-Disposition header or use default
    const contentDisposition = response.headers.get("Content-Disposition");
    let filename = "Client_Report.pdf";
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }

    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);

    return { success: true, filename };
  }

  async createClient(data) {
    return this.request("/clients", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateClient(id, data) {
    return this.request(`/clients/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteClient(id) {
    return this.request(`/clients/${id}`, {
      method: "DELETE",
    });
  }

  async getPendingMatches(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(
      `/pending-matches${queryString ? `?${queryString}` : ""}`,
    );
  }

  async getPendingMatchesCount() {
    const data = await this.request("/pending-matches/count");
    return data.count || 0;
  }

  async assignMatch(data) {
    return this.request("/matches", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async unassignMatch(clientId) {
    return this.request("/unassign-match", {
      method: "POST",
      body: JSON.stringify({ client_id: clientId }),
    });
  }

  // Training Counsellor endpoints
  async getTrainingCounsellors(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(
      `/training-counsellors${queryString ? `?${queryString}` : ""}`,
    );
  }

  async getTrainingCounsellor(id) {
    return this.request(`/training-counsellors/${id}`);
  }

  async getTrainingCounsellorDetails(id) {
    return this.request(`/training-counsellors/${id}/details`);
  }

  async sendQualifiedFormEmail(id) {
    return this.request(
      `/training-counsellors/${id}/send-qualified-form-email`,
      {
        method: "POST",
      },
    );
  }

  async sendTrainingCounsellorEmail(id, subject, message) {
    return this.request(`/training-counsellors/${id}/send-email`, {
      method: "POST",
      body: JSON.stringify({ subject, message }),
    });
  }

  async createTrainingCounsellor(data) {
    return this.request("/training-counsellors", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateTrainingCounsellor(id, data) {
    return this.request(`/training-counsellors/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteTrainingCounsellor(id) {
    return this.request(`/training-counsellors/${id}`, {
      method: "DELETE",
    });
  }

  async transitionToQualified(id) {
    return this.request(`/training-counsellors/${id}/transition-to-qualified`, {
      method: "POST",
    });
  }

  async downloadTrainingCounsellorReport(id) {
    const token = this.getToken();
    const url = `${this.baseURL}/training-counsellors/${id}/download-report`;

    // Use fetch to download the PDF file
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/pdf",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to download report");
    }

    // Get the blob from the response
    const blob = await response.blob();

    // Create a download link and trigger it
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;

    // Extract filename from Content-Disposition header or use default
    const contentDisposition = response.headers.get("Content-Disposition");
    let filename = "TC_Report.pdf";
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }

    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);

    return { success: true, filename };
  }

  // Consultation endpoints
  async getConsultations(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(
      `/consultations${queryString ? `?${queryString}` : ""}`,
    );
  }

  async getConsultationStats() {
    return this.request("/consultation-stats");
  }

  async createConsultation(data) {
    return this.request("/consultations", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async completeConsultation(id, data) {
    return this.request(`/consultations/${id}/complete`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async cancelConsultation(id, reason = null) {
    return this.request(`/consultations/${id}/cancel`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  }

  async rescheduleConsultation(id, data) {
    return this.request(`/consultations/${id}/reschedule`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async deleteConsultation(id) {
    return this.request(`/consultations/${id}`, {
      method: "DELETE",
    });
  }

  // Activity Log endpoints
  async getActivityLogs(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(
      `/activity-logs${queryString ? `?${queryString}` : ""}`,
    );
  }

  // Intake Form endpoints
  async submitClientIntake(data) {
    return this.request("/client-intake", {
      method: "POST",
      body: JSON.stringify(data),
      noRedirect: true,
    });
  }

  async submitTcIntake(data) {
    // If data is FormData, pass it directly; otherwise stringify JSON
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return this.request("/tc-intake", {
      method: "POST",
      body: body,
      noRedirect: true,
    });
  }

  // Payment endpoints
  async createPaymentIntent(clientId, amount, currency = "gbp") {
    return this.request("/payments/create-intent", {
      method: "POST",
      body: JSON.stringify({
        client_id: clientId,
        amount: amount,
        currency: currency,
      }),
    });
  }

  async confirmPayment(paymentIntentId, clientId, consultationId = null) {
    return this.request("/payments/confirm", {
      method: "POST",
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
      method: "PUT",
      body: JSON.stringify({ status: "archived" }),
    });
  }

  async unarchiveClient(id) {
    return this.request(`/clients/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status: "active" }),
    });
  }

  async progressClientStage(id, stage) {
    return this.request(`/clients/${id}/progress-stage`, {
      method: "POST",
      body: JSON.stringify({ stage }),
    });
  }

  async sendClientEmail(id, subject, message) {
    return this.request(`/clients/${id}/send-email`, {
      method: "POST",
      body: JSON.stringify({ subject, message }),
    });
  }

  async sendFeedbackForm(id) {
    return this.request(`/clients/${id}/send-feedback-form`, {
      method: "POST",
    });
  }

  async resendAgreement(id) {
    return this.request(`/clients/${id}/resend-agreement`, {
      method: "POST",
    });
  }

  async updateSatisfactionScore(id, score) {
    return this.request(`/clients/${id}/update-satisfaction`, {
      method: "POST",
      body: JSON.stringify({ satisfaction_score: score }),
    });
  }

  async getEligibleForFeedback(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(
      `/clients/eligible-for-feedback${queryString ? `?${queryString}` : ""}`,
    );
  }

  // Activity log / Notes endpoints
  async createActivityLog(data) {
    return this.request("/activity-logs", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateActivityLog(id, data) {
    return this.request(`/activity-logs/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteActivityLog(id) {
    return this.request(`/activity-logs/${id}`, {
      method: "DELETE",
    });
  }

  // Induction endpoints
  async getInductions(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/inductions${queryString ? `?${queryString}` : ""}`);
  }

  async getInduction(id) {
    return this.request(`/inductions/${id}`);
  }

  async createInduction(data) {
    return this.request("/inductions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateInduction(id, data) {
    return this.request(`/inductions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteInduction(id) {
    return this.request(`/inductions/${id}`, {
      method: "DELETE",
    });
  }

  async addInductionAttendees(id, attendeeTcIds) {
    return this.request(`/inductions/${id}/add-attendees`, {
      method: "POST",
      body: JSON.stringify({ attendee_tc_ids: attendeeTcIds }),
    });
  }

  async acceptInductionInvitation(token) {
    return this.request(`/induction/accept/${token}`, {
      method: "POST",
    });
  }

  async declineInductionInvitation(token) {
    return this.request(`/induction/decline/${token}`, {
      method: "POST",
    });
  }

  // 2FA endpoints
  async initiate2FASetup() {
    return this.request("/2fa/initiate", {
      method: "POST",
    });
  }

  async verify2FASetup(code) {
    return this.request("/2fa/verify", {
      method: "POST",
      body: JSON.stringify({ code }),
    });
  }

  async disable2FA() {
    return this.request("/2fa/disable", {
      method: "POST",
    });
  }

  async regenerate2FACode() {
    return this.request("/2fa/regenerate", {
      method: "POST",
    });
  }

  // User Management endpoints (admin only)
  async getUsers() {
    return this.request("/users");
  }

  async getUserById(id) {
    return this.request(`/users/${id}`);
  }

  async createUser(data) {
    return this.request("/users", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateUser(id, data) {
    return this.request(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id) {
    return this.request(`/users/${id}`, {
      method: "DELETE",
    });
  }

  async getUserCount() {
    return this.request("/users-count");
  }

  async getUserList() {
    return this.request("/users-list");
  }

  // Photo upload endpoints (admin only)
  async uploadClientPhoto(clientId, photoFile) {
    const formData = new FormData();
    formData.append("photo", photoFile);
    return this.request(`/clients/${clientId}/upload-photo`, {
      method: "POST",
      body: formData,
    });
  }

  async deleteClientPhoto(clientId) {
    return this.request(`/clients/${clientId}/delete-photo`, {
      method: "DELETE",
    });
  }

  async uploadTcPhoto(tcId, photoFile) {
    const formData = new FormData();
    formData.append("photo", photoFile);
    return this.request(`/training-counsellors/${tcId}/upload-photo`, {
      method: "POST",
      body: formData,
    });
  }

  async deleteTcPhoto(tcId) {
    return this.request(`/training-counsellors/${tcId}/delete-photo`, {
      method: "DELETE",
    });
  }

  // Message endpoints
  async getMessages(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/messages${queryString ? `?${queryString}` : ""}`);
  }

  async getMessage(id) {
    return this.request(`/messages/${id}`);
  }

  async sendMessageToCounsellor(data) {
    return this.request("/messages/send-to-counsellor", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async sendMessageToStaff(data) {
    return this.request("/messages/send-to-staff", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async markMessageAsRead(id) {
    return this.request(`/messages/${id}/mark-read`, {
      method: "POST",
    });
  }

  async getUnreadMessageCount() {
    return this.request("/messages/unread-count");
  }

  // Counsellor portal endpoints
  async getCounsellorOwnData() {
    return this.request("/counsellor/my-data");
  }

  async getSharedDocuments() {
    return this.request("/shared-documents");
  }

  async downloadSharedDocument(id, filename) {
    const token = this.getToken();
    const url = `${this.baseURL}/shared-documents/${id}/download`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to download document");
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename || "document";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);

    return { success: true };
  }
  
  async uploadSharedDocument(formData) {
    return this.request("/shared-documents", {
      method: "POST",
      body: formData,
    });
  }

  async deleteSharedDocument(id) {
    return this.request(`/shared-documents/${id}`, {
      method: "DELETE",
    });
  }

  async submitPSGReflection(data) {
    return this.request("/psg-reflections", {
      method: "POST",
      body: data,
    });
  }

  async getSessionNotes() {
    return this.request("/session-notes");
  }

  async submitSessionNote(data) {
    return this.request("/session-notes", {
      method: "POST",
      body: data,
    });
  }

  // Client booking endpoints (public - no auth required)
  async authenticateClientBooking(email, clientUuid = null) {
    return this.requestPublic("/client-booking/authenticate", {
      method: "POST",
      body: JSON.stringify({ email, client_uuid: clientUuid }),
    });
  }

  async getClientBookingStatus(clientUuid) {
    return this.requestPublic(`/client-booking/${clientUuid}/status`);
  }

  async getAvailableSlots(clientUuid) {
    return this.requestPublic(`/client-booking/${clientUuid}/available-slots`);
  }

  async bookSession(data) {
    return this.requestPublic("/client-booking/book-session", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async bookBlock(data) {
    return this.requestPublic("/client-booking/book-block", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Service settings endpoints
  async checkIshCapacity() {
    return this.requestPublic("/services/ish-capacity");
  }

  async updateServiceCapacity(data) {
    return this.request("/services/update-capacity", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getAllServices() {
    return this.request("/services/all", { noRedirect: true });
  }

  // Coupon endpoints
  async getCoupons() {
    return this.request("/coupons");
  }

  async createCoupon(data) {
    return this.request("/coupons", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateCoupon(id, data) {
    return this.request(`/coupons/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteCoupon(id) {
    return this.request(`/coupons/${id}`, {
      method: "DELETE",
    });
  }

  async verifyCoupon(code) {
    return this.requestPublic("/coupons/verify", {
      method: "POST",
      body: JSON.stringify({ code }),
    });
  }

  // Email Template endpoints
  async getEmailTemplates() {
    return this.request("/email-templates");
  }

  async getEmailTemplate(type) {
    return this.request(`/email-templates/${type}`);
  }

  async updateEmailTemplate(type, data) {
    return this.request(`/email-templates/${type}`, {
      method: "PUT",
      body: data,
    });
  }

  async resetEmailTemplate(type) {
    return this.request(`/email-templates/${type}/reset`, {
      method: "POST",
    });
  }

  // Consultation Slot endpoints (Admin)
  async getConsultationSlots() {
    return this.request("/consultation-slots");
  }

  async createConsultationSlot(data) {
    return this.request("/consultation-slots", {
      method: "POST",
      body: data,
    });
  }

  async deleteConsultationSlot(id) {
    return this.request(`/consultation-slots/${id}`, {
      method: "DELETE",
    });
  }

  // Menu Privilege endpoints (Admin)
  async getMenuPrivileges() {
    return this.request("/menu-privileges");
  }

  async getMenuPrivilegesForRole(role) {
    return this.request(`/menu-privileges/for-role/${role}`);
  }

  async updateMenuPrivilege(data) {
    return this.request("/menu-privileges", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // Company Settings endpoints
  async getCompanySettings() {
    return this.request("/company-settings");
  }

  async updateCompanySettings(data) {
    return this.request("/company-settings", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async uploadLogo(formData) {
    return this.request("/company-settings/logo", {
      method: "POST",
      body: formData, // FormData handles its own content type
    });
  }

  async deleteLogo(type) {
    return this.request("/company-settings/logo", {
      method: "DELETE",
      body: JSON.stringify({ type }),
    });
  }

  // Staff Notes endpoints
  async storeStaffNote(data) {
    return this.request("/staff-notes", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getUnreadStaffNotes() {
    return this.request("/staff-notes/unread");
  }

  async getStaffNotes(type = "received") {
    return this.request(`/staff-notes?type=${type}`);
  }

  async markStaffNoteAsRead(id) {
    return this.request(`/staff-notes/${id}/read`, { method: "POST" });
  }

  // Consultation Slot endpoints (Public)
  async getAvailableConsultationSlots() {
    return this.requestPublic("/consultation-slots/available");
  }

  async bookConsultation(data) {
    return this.requestPublic("/client/book-consultation", {
      method: "POST",
      body: data,
    });
  }

  // Maintenance mode endpoints
  async checkMaintenance() {
    return this.requestPublic("/maintenance");
  }

  async updateMaintenance(data) {
    return this.request("/services/update-maintenance", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Trainee Application endpoints
  async getTraineeApplications(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/trainee-applications${queryString ? `?${queryString}` : ""}`);
  }

  async getTraineeApplicationsCount() {
    return this.request("/trainee-applications/count");
  }

  async getTraineeApplication(id) {
    return this.request(`/trainee-applications/${id}`);
  }

  async updateTraineeApplicationStatus(id, status, inductionDate = null) {
    return this.request(`/trainee-applications/${id}/status`, {
      method: "POST",
      body: { status, induction_date: inductionDate },
    });
  }

  async recordTraineeAttendance(id, attended, notes = null) {
    return this.request(`/trainee-applications/${id}/attendance`, {
      method: "POST",
      body: { attended, notes },
    });
  }

  async makeTraineeDecision(id, decision, inductionDate = null, notes = null) {
    return this.request(`/trainee-applications/${id}/decision`, {
      method: "POST",
      body: { decision, induction_date: inductionDate, notes },
    });
  }

  async sendTraineeInviteManual(id) {
    return this.request(`/trainee-applications/${id}/invite`, {
      method: "POST",
    });
  }

  async sendTraineeStageThreeInvite(id) {
    return this.request(`/trainee-applications/${id}/invite-stage-three`, {
      method: "POST",
    });
  }

  async updateTraineePaperwork(id, documentKey, status) {
    return this.request(`/trainee-applications/${id}/paperwork`, {
      method: "POST",
      body: { document_key: documentKey, status },
    });
  }

  async recordTraineeInductionAttendance(id, attended, notes = null) {
    return this.request(`/trainee-applications/${id}/induction-attendance`, {
      method: "POST",
      body: { attended, notes },
    });
  }

  async sendTraineePortalInvite(id) {
    return this.request(`/trainee-applications/${id}/portal-invite`, {
      method: "POST",
    });
  }

  async finalizeTraineePlacement(id) {
    return this.request(`/trainee-applications/${id}/finalize`, {
      method: "POST",
    });
  }

  async deleteTraineeApplication(id) {
    return this.request(`/trainee-applications/${id}`, {
      method: "DELETE",
    });
  }

  async getTraineeSettings() {
    return this.request("/trainee-applications-settings");
  }

  async updateTraineeSettings(data) {
    return this.request("/trainee-applications-settings", {
      method: "POST",
      body: data,
    });
  }

  // Generic methods to support axios-style usage
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "GET" });
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, { ...options, method: "POST", body: data });
  }

  async put(endpoint, data, options = {}) {
    return this.request(endpoint, { ...options, method: "PUT", body: data });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "DELETE" });
  }

  // Public request method (no auth token)
  async requestPublic(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options.headers,
      },
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Request failed");
    }

    return data;
  }
}

export const apiService = new ApiService();
export default apiService;
