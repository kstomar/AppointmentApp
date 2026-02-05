import axios, { AxiosError, AxiosInstance } from 'axios';
import type { ApiResponse, User, Business, Location, Service, StaffMember, AvailabilitySlot, Booking, Notification, BookingFormData, Client, Payment, ReportStats } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

    async signUp(data: { email: string; password: string; first_name: string; last_name: string; subdomain: string }) {
      const response = await this.client.post<ApiResponse<{ user: User; token: string }>>('/auth/sign_up', data);
      const result = response.data.data;
      if (result?.token) {
        localStorage.setItem('auth_token', result.token);
      }
      return result;
    }

        async signUpBusiness(data: {
          email: string;
          password: string;
          password_confirmation: string;
          first_name: string;
          last_name: string;
          phone?: string;
          business_name: string;
          industry?: string;
        }) {
      const response = await this.client.post<ApiResponse<{ user: User; business: Business; token: string }>>('/auth/sign_up/business', data);
      const result = response.data.data;
      if (result?.token) {
        localStorage.setItem('auth_token', result.token);
      }
      return result;
    }

        async signUpClient(data: {
          email: string;
          password: string;
          password_confirmation: string;
          first_name: string;
          last_name: string;
          phone?: string;
          subdomain?: string;
          industry?: string;
        }) {
      const response = await this.client.post<ApiResponse<{ user: User; token: string }>>('/auth/sign_up/client', data);
      const result = response.data.data;
      if (result?.token) {
        localStorage.setItem('auth_token', result.token);
      }
      return result;
    }

  async signIn(email: string, password: string) {
    const response = await this.client.post<ApiResponse<{ user: User; token: string }>>('/auth/sign_in', { email, password });
    const data = response.data.data;
    if (data?.token) {
      localStorage.setItem('auth_token', data.token);
    }
    return data;
  }

  async signOut() {
    await this.client.delete('/auth/sign_out');
    localStorage.removeItem('auth_token');
  }

  async getCurrentUser() {
    const response = await this.client.get<ApiResponse<User>>('/auth/me');
    return response.data.data;
  }

  async getBusinesses() {
    const response = await this.client.get<ApiResponse<Business[]>>('/businesses');
    return response.data.data;
  }

  async getBusiness(id: string) {
    const response = await this.client.get<ApiResponse<Business>>(`/businesses/${id}`);
    return response.data.data;
  }

  async createBusiness(data: Partial<Business>) {
    const response = await this.client.post<ApiResponse<Business>>('/businesses', data);
    return response.data.data;
  }

  async updateBusiness(id: string, data: Partial<Business>) {
    const response = await this.client.patch<ApiResponse<Business>>(`/businesses/${id}`, data);
    return response.data.data;
  }

  async getLocations(businessId: string) {
    const response = await this.client.get<ApiResponse<Location[]>>(`/businesses/${businessId}/locations`);
    return response.data.data;
  }

  async getServices(businessId: string) {
    const response = await this.client.get<ApiResponse<Service[]>>(`/businesses/${businessId}/services`);
    return response.data.data;
  }

  async getStaffMembers(businessId: string) {
    const response = await this.client.get<ApiResponse<StaffMember[]>>(`/businesses/${businessId}/staff_members`);
    return response.data.data;
  }

  async getAvailability(businessId: string, serviceId: string, params?: { staff_member_id?: string; location_id?: string; start_date?: string; end_date?: string }) {
    const response = await this.client.get<ApiResponse<{ slots: AvailabilitySlot[] }>>(`/businesses/${businessId}/availability`, {
      params: { service_id: serviceId, ...params },
    });
    return response.data.data;
  }

  async getBookings(params?: { business_id?: string; status?: string; start_date?: string; end_date?: string }) {
    const response = await this.client.get<ApiResponse<Booking[]>>('/bookings', { params });
    return response.data.data;
  }

  async getBooking(id: string) {
    const response = await this.client.get<ApiResponse<Booking>>(`/bookings/${id}`);
    return response.data.data;
  }

  async createBooking(data: { business_id: string; service_id: string; start_at: string; staff_member_id?: string; location_id?: string; notes?: string }) {
    const response = await this.client.post<ApiResponse<Booking>>('/bookings', data);
    return response.data.data;
  }

  async cancelBooking(id: string, reason?: string) {
    const response = await this.client.post<ApiResponse<Booking>>(`/bookings/${id}/cancel`, { reason });
    return response.data.data;
  }

  async rescheduleBooking(id: string, newStartAt: string, reason?: string) {
    const response = await this.client.post<ApiResponse<Booking>>(`/bookings/${id}/reschedule`, { new_start_at: newStartAt, reason });
    return response.data.data;
  }

  async getNotifications() {
    const response = await this.client.get<ApiResponse<Notification[]>>('/notifications');
    return response.data.data;
  }

  async markNotificationRead(id: string) {
    const response = await this.client.post<ApiResponse<Notification>>(`/notifications/${id}/mark_read`);
    return response.data.data;
  }

  async getUnreadCount() {
    const response = await this.client.get<ApiResponse<{ count: number }>>('/notifications/unread_count');
    return response.data.data;
  }

  // Clients
  async getClients(params?: { search?: string; status?: string; page?: number; per_page?: number }) {
    const response = await this.client.get<ApiResponse<Client[]>>('/clients', { params });
    return response.data;
  }

  async getClient(id: string) {
    const response = await this.client.get<ApiResponse<Client>>(`/clients/${id}`);
    return response.data.data;
  }

  async createClient(data: { email: string; first_name: string; last_name: string; phone?: string }) {
    const response = await this.client.post<ApiResponse<Client>>('/clients', data);
    return response.data.data;
  }

  async updateClient(id: string, data: Partial<Client>) {
    const response = await this.client.patch<ApiResponse<Client>>(`/clients/${id}`, data);
    return response.data.data;
  }

  async deleteClient(id: string) {
    const response = await this.client.delete<ApiResponse<void>>(`/clients/${id}`);
    return response.data;
  }

  // Services (standalone, not nested under business)
  async createService(businessId: string, data: Partial<Service>) {
    const response = await this.client.post<ApiResponse<Service>>(`/businesses/${businessId}/services`, data);
    return response.data.data;
  }

  async updateService(businessId: string, serviceId: string, data: Partial<Service>) {
    const response = await this.client.patch<ApiResponse<Service>>(`/businesses/${businessId}/services/${serviceId}`, data);
    return response.data.data;
  }

  async deleteService(businessId: string, serviceId: string) {
    const response = await this.client.delete<ApiResponse<void>>(`/businesses/${businessId}/services/${serviceId}`);
    return response.data;
  }

  // Staff Members
  async createStaffMember(businessId: string, data: Partial<StaffMember>) {
    const response = await this.client.post<ApiResponse<StaffMember>>(`/businesses/${businessId}/staff_members`, data);
    return response.data.data;
  }

  async updateStaffMember(businessId: string, staffId: string, data: Partial<StaffMember>) {
    const response = await this.client.patch<ApiResponse<StaffMember>>(`/businesses/${businessId}/staff_members/${staffId}`, data);
    return response.data.data;
  }

  async deleteStaffMember(businessId: string, staffId: string) {
    const response = await this.client.delete<ApiResponse<void>>(`/businesses/${businessId}/staff_members/${staffId}`);
    return response.data;
  }

  // Payments
  async getPayments(params?: { status?: string; start_date?: string; end_date?: string; page?: number }) {
    const response = await this.client.get<ApiResponse<Payment[]>>('/payments', { params });
    return response.data;
  }

  async getPayment(id: string) {
    const response = await this.client.get<ApiResponse<Payment>>(`/payments/${id}`);
    return response.data.data;
  }

  async refundPayment(id: string, reason?: string) {
    const response = await this.client.post<ApiResponse<Payment>>(`/payments/${id}/refund`, { reason });
    return response.data.data;
  }

  // Reports
  async getReportsDashboard(params?: { days?: number; start_date?: string; end_date?: string }) {
    const response = await this.client.get<ApiResponse<ReportStats>>('/reports/dashboard', { params });
    return response.data.data;
  }

  async getReportsBookings(params?: { days?: number; start_date?: string; end_date?: string }) {
    const response = await this.client.get<ApiResponse<any>>('/reports/bookings', { params });
    return response.data.data;
  }

  async getReportsRevenue(params?: { days?: number; start_date?: string; end_date?: string }) {
    const response = await this.client.get<ApiResponse<any>>('/reports/revenue', { params });
    return response.data.data;
  }

  async getReportsStaffPerformance(params?: { days?: number; start_date?: string; end_date?: string }) {
    const response = await this.client.get<ApiResponse<any>>('/reports/staff_performance', { params });
    return response.data.data;
  }

  // Booking actions
  async completeBooking(id: string) {
    const response = await this.client.post<ApiResponse<Booking>>(`/bookings/${id}/complete`);
    return response.data.data;
  }

  async noShowBooking(id: string) {
    const response = await this.client.post<ApiResponse<Booking>>(`/bookings/${id}/no_show`);
    return response.data.data;
  }
}

export const publicApi = {
  async getBusinessBySlug(slug: string) {
    const response = await axios.get<ApiResponse<Business>>(`${API_BASE_URL}/public/businesses/${slug}`);
    return response.data;
  },

  async getAvailability(businessSlug: string, serviceId: string, params?: { staff_member_id?: string; start_date?: string; end_date?: string }) {
    const response = await axios.get<ApiResponse<{ slots: AvailabilitySlot[]; service: Service; business: Business }>>(`${API_BASE_URL}/public/businesses/${businessSlug}/availability`, {
      params: { service_id: serviceId, ...params },
    });
    return response.data;
  },

  async createBooking(businessSlug: string, data: BookingFormData) {
    const response = await axios.post<ApiResponse<Booking>>(`${API_BASE_URL}/public/businesses/${businessSlug}/bookings`, data);
    return response.data;
  },

  async getBookingByCode(confirmationCode: string) {
    const response = await axios.get<ApiResponse<Booking>>(`${API_BASE_URL}/public/bookings/${confirmationCode}`);
    return response.data;
  },

  async cancelBooking(confirmationCode: string, reason?: string) {
    const response = await axios.post<ApiResponse<Booking>>(`${API_BASE_URL}/public/bookings/${confirmationCode}/cancel`, { reason });
    return response.data;
  },

  async rescheduleBooking(confirmationCode: string, newStartAt: string, reason?: string) {
    const response = await axios.post<ApiResponse<Booking>>(`${API_BASE_URL}/public/bookings/${confirmationCode}/reschedule`, { new_start_at: newStartAt, reason });
    return response.data;
  },
};

export const api = new ApiService();
export default api;
