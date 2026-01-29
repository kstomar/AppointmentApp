import axios, { AxiosError, AxiosInstance } from 'axios';
import type { ApiResponse, User, Business, Location, Service, StaffMember, AvailabilitySlot, Booking, Notification, BookingFormData } from '../types';

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
      if (response.data.data?.token) {
        localStorage.setItem('auth_token', response.data.data.token);
      }
      return response.data;
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
      if (response.data.data?.token) {
        localStorage.setItem('auth_token', response.data.data.token);
      }
      return response.data;
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
      if (response.data.data?.token) {
        localStorage.setItem('auth_token', response.data.data.token);
      }
      return response.data;
    }

  async signIn(email: string, password: string) {
    const response = await this.client.post<ApiResponse<{ user: User; token: string }>>('/auth/sign_in', { email, password });
    if (response.data.data?.token) {
      localStorage.setItem('auth_token', response.data.data.token);
    }
    return response.data;
  }

  async signOut() {
    await this.client.delete('/auth/sign_out');
    localStorage.removeItem('auth_token');
  }

  async getCurrentUser() {
    const response = await this.client.get<ApiResponse<User>>('/auth/me');
    return response.data;
  }

  async getBusinesses() {
    const response = await this.client.get<ApiResponse<Business[]>>('/businesses');
    return response.data;
  }

  async getBusiness(id: string) {
    const response = await this.client.get<ApiResponse<Business>>(`/businesses/${id}`);
    return response.data;
  }

  async createBusiness(data: Partial<Business>) {
    const response = await this.client.post<ApiResponse<Business>>('/businesses', data);
    return response.data;
  }

  async updateBusiness(id: string, data: Partial<Business>) {
    const response = await this.client.patch<ApiResponse<Business>>(`/businesses/${id}`, data);
    return response.data;
  }

  async getLocations(businessId: string) {
    const response = await this.client.get<ApiResponse<Location[]>>(`/businesses/${businessId}/locations`);
    return response.data;
  }

  async getServices(businessId: string) {
    const response = await this.client.get<ApiResponse<Service[]>>(`/businesses/${businessId}/services`);
    return response.data;
  }

  async getStaffMembers(businessId: string) {
    const response = await this.client.get<ApiResponse<StaffMember[]>>(`/businesses/${businessId}/staff_members`);
    return response.data;
  }

  async getAvailability(businessId: string, serviceId: string, params?: { staff_member_id?: string; location_id?: string; start_date?: string; end_date?: string }) {
    const response = await this.client.get<ApiResponse<{ slots: AvailabilitySlot[] }>>(`/businesses/${businessId}/availability`, {
      params: { service_id: serviceId, ...params },
    });
    return response.data;
  }

  async getBookings(params?: { business_id?: string; status?: string; start_date?: string; end_date?: string }) {
    const response = await this.client.get<ApiResponse<Booking[]>>('/bookings', { params });
    return response.data;
  }

  async getBooking(id: string) {
    const response = await this.client.get<ApiResponse<Booking>>(`/bookings/${id}`);
    return response.data;
  }

  async createBooking(data: { business_id: string; service_id: string; start_at: string; staff_member_id?: string; location_id?: string; notes?: string }) {
    const response = await this.client.post<ApiResponse<Booking>>('/bookings', data);
    return response.data;
  }

  async cancelBooking(id: string, reason?: string) {
    const response = await this.client.post<ApiResponse<Booking>>(`/bookings/${id}/cancel`, { reason });
    return response.data;
  }

  async rescheduleBooking(id: string, newStartAt: string, reason?: string) {
    const response = await this.client.post<ApiResponse<Booking>>(`/bookings/${id}/reschedule`, { new_start_at: newStartAt, reason });
    return response.data;
  }

  async getNotifications() {
    const response = await this.client.get<ApiResponse<Notification[]>>('/notifications');
    return response.data;
  }

  async markNotificationRead(id: string) {
    const response = await this.client.post<ApiResponse<Notification>>(`/notifications/${id}/mark_read`);
    return response.data;
  }

  async getUnreadCount() {
    const response = await this.client.get<ApiResponse<{ count: number }>>('/notifications/unread_count');
    return response.data;
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
