import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  User,
  Business,
  Service,
  StaffMember,
  Booking,
  Location,
  AvailabilityResponse,
  Notification,
  Payment,
} from '../types';

const API_URL = process.env.API_URL || 'http://localhost:3000/api/v1';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use(async (config) => {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          await AsyncStorage.removeItem('auth_token');
        }
        return Promise.reject(error);
      }
    );
  }

    // Auth
    async signUp(data: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      phone?: string;
    }): Promise<{ user: User; token: string }> {
      const response = await this.client.post('/auth/sign_up', data);
      return response.data.data;
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
        }): Promise<{ user: User; business: Business; token: string }> {
          const response = await this.client.post('/auth/sign_up/business', data);
          return response.data.data;
        }

        async signUpClient(data: {
          email: string;
          password: string;
          password_confirmation: string;
          first_name: string;
          last_name: string;
          phone?: string;
          industry?: string;
        }): Promise<{ user: User; token: string }> {
          const response = await this.client.post('/auth/sign_up/client', data);
          return response.data.data;
        }

    async signIn(email: string, password: string): Promise<{ user: User; token: string }> {
      const response = await this.client.post('/auth/sign_in', { email, password });
      return response.data.data;
    }

  async signOut(): Promise<void> {
    await this.client.delete('/auth/sign_out');
  }

  async getMe(): Promise<User> {
    const response = await this.client.get('/auth/me');
    return response.data.data;
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await this.client.patch('/auth/profile', data);
    return response.data.data;
  }

  // Businesses
  async getBusinesses(): Promise<Business[]> {
    const response = await this.client.get('/businesses');
    return response.data.data;
  }

  async getBusiness(id: string): Promise<Business> {
    const response = await this.client.get(`/businesses/${id}`);
    return response.data.data;
  }

  async getBusinessBySlug(slug: string): Promise<Business> {
    const response = await this.client.get(`/public/businesses/${slug}`);
    return response.data.data;
  }

  // Services
  async getServices(businessId: string): Promise<Service[]> {
    const response = await this.client.get(`/businesses/${businessId}/services`);
    return response.data.data;
  }

  async getService(businessId: string, serviceId: string): Promise<Service> {
    const response = await this.client.get(`/businesses/${businessId}/services/${serviceId}`);
    return response.data.data;
  }

  // Staff
  async getStaffMembers(businessId: string): Promise<StaffMember[]> {
    const response = await this.client.get(`/businesses/${businessId}/staff_members`);
    return response.data.data;
  }

  async getStaffMember(businessId: string, staffId: string): Promise<StaffMember> {
    const response = await this.client.get(`/businesses/${businessId}/staff_members/${staffId}`);
    return response.data.data;
  }

  // Locations
  async getLocations(businessId: string): Promise<Location[]> {
    const response = await this.client.get(`/businesses/${businessId}/locations`);
    return response.data.data;
  }

  // Availability
  async getAvailability(
    businessSlug: string,
    params: {
      serviceId: string;
      staffMemberId?: string;
      locationId?: string;
      startDate: string;
      endDate: string;
    }
  ): Promise<AvailabilityResponse[]> {
    const response = await this.client.get(`/public/businesses/${businessSlug}/availability`, {
      params,
    });
    return response.data.data;
  }

  // Bookings
  async getBookings(params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Booking[]> {
    const response = await this.client.get('/bookings', { params });
    return response.data.data;
  }

  async getUpcomingBookings(): Promise<Booking[]> {
    const response = await this.client.get('/bookings/upcoming');
    return response.data.data;
  }

  async getPastBookings(): Promise<Booking[]> {
    const response = await this.client.get('/bookings/past');
    return response.data.data;
  }

  async getBooking(id: string): Promise<Booking> {
    const response = await this.client.get(`/bookings/${id}`);
    return response.data.data;
  }

  async createBooking(data: {
    businessId: string;
    serviceId: string;
    staffMemberId?: string;
    locationId?: string;
    startAt: string;
    clientInfo: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      notes?: string;
    };
  }): Promise<Booking> {
    const response = await this.client.post('/bookings', data);
    return response.data.data;
  }

  async createPublicBooking(
    businessSlug: string,
    data: {
      serviceId: string;
      staffMemberId?: string;
      locationId?: string;
      startAt: string;
      clientInfo: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        notes?: string;
      };
    }
  ): Promise<Booking> {
    const response = await this.client.post(`/public/businesses/${businessSlug}/bookings`, data);
    return response.data.data;
  }

  async cancelBooking(id: string, reason?: string): Promise<Booking> {
    const response = await this.client.post(`/bookings/${id}/cancel`, { reason });
    return response.data.data;
  }

  async rescheduleBooking(id: string, newStartAt: string): Promise<Booking> {
    const response = await this.client.post(`/bookings/${id}/reschedule`, {
      startAt: newStartAt,
    });
    return response.data.data;
  }

  async completeBooking(id: string): Promise<Booking> {
    const response = await this.client.post(`/bookings/${id}/complete`);
    return response.data.data;
  }

  async markNoShow(id: string): Promise<Booking> {
    const response = await this.client.post(`/bookings/${id}/no_show`);
    return response.data.data;
  }

  // Notifications
  async getNotifications(): Promise<Notification[]> {
    const response = await this.client.get('/notifications');
    return response.data.data;
  }

  async markNotificationRead(id: string): Promise<Notification> {
    const response = await this.client.post(`/notifications/${id}/mark_read`);
    return response.data.data;
  }

  async markAllNotificationsRead(): Promise<void> {
    await this.client.post('/notifications/mark_all_read');
  }

  async getUnreadCount(): Promise<number> {
    const response = await this.client.get('/notifications/unread_count');
    return response.data.data.count;
  }

  // Payments
  async getPayments(params?: { status?: string }): Promise<{ data: Payment[]; meta: { total: number } }> {
    const response = await this.client.get('/payments', { params });
    return response.data;
  }

  async getPayment(id: string): Promise<Payment> {
    const response = await this.client.get(`/payments/${id}`);
    return response.data.data;
  }

  async refundPayment(id: string, reason?: string): Promise<Payment> {
    const response = await this.client.post(`/payments/${id}/refund`, { reason });
    return response.data.data;
  }

  async createPaymentIntent(bookingId: string): Promise<{ clientSecret: string }> {
    const response = await this.client.post(`/bookings/${bookingId}/payments/intent`);
    return response.data.data;
  }

  // Clients
  async getClients(params?: { search?: string; status?: string; page?: number; per_page?: number }): Promise<{ data: User[]; meta: { total: number } }> {
    const response = await this.client.get('/clients', { params });
    return response.data;
  }

  async getClient(id: string): Promise<User> {
    const response = await this.client.get(`/clients/${id}`);
    return response.data.data;
  }

  async createClient(data: { email: string; first_name: string; last_name: string; phone?: string }): Promise<User> {
    const response = await this.client.post('/clients', data);
    return response.data.data;
  }

  async updateClient(id: string, data: Partial<User>): Promise<User> {
    const response = await this.client.patch(`/clients/${id}`, data);
    return response.data.data;
  }

  async deleteClient(id: string): Promise<void> {
    await this.client.delete(`/clients/${id}`);
  }

  // Services CRUD
  async createService(businessId: string, data: Partial<Service>): Promise<Service> {
    const response = await this.client.post(`/businesses/${businessId}/services`, data);
    return response.data.data;
  }

  async updateService(businessId: string, serviceId: string, data: Partial<Service>): Promise<Service> {
    const response = await this.client.patch(`/businesses/${businessId}/services/${serviceId}`, data);
    return response.data.data;
  }

  async deleteService(businessId: string, serviceId: string): Promise<void> {
    await this.client.delete(`/businesses/${businessId}/services/${serviceId}`);
  }

  // Staff CRUD
  async createStaffMember(businessId: string, data: Partial<StaffMember>): Promise<StaffMember> {
    const response = await this.client.post(`/businesses/${businessId}/staff_members`, data);
    return response.data.data;
  }

  async updateStaffMember(businessId: string, staffId: string, data: Partial<StaffMember>): Promise<StaffMember> {
    const response = await this.client.patch(`/businesses/${businessId}/staff_members/${staffId}`, data);
    return response.data.data;
  }

  async deleteStaffMember(businessId: string, staffId: string): Promise<void> {
    await this.client.delete(`/businesses/${businessId}/staff_members/${staffId}`);
  }

  // Business CRUD
  async updateBusiness(id: string, data: Partial<Business>): Promise<Business> {
    const response = await this.client.patch(`/businesses/${id}`, data);
    return response.data.data;
  }

  // Reports
  async getReportsDashboard(params?: { days?: number; start_date?: string; end_date?: string }): Promise<{
    stats: Array<{ label: string; value: string; change: string }>;
    bookings_by_day: Array<{ date: string; bookings: number; revenue: number }>;
    bookings_by_service: Array<{ name: string; value: number }>;
    bookings_by_status: Array<{ name: string; value: number; color: string }>;
    revenue_by_month: Array<{ month: string; revenue: number }>;
    top_staff: Array<{ name: string; bookings: number; revenue: number }>;
    peak_hours: Array<{ time: string; bookings: number; percentage: number }>;
    booking_sources: Array<{ source: string; count: number; percentage: number }>;
  }> {
    const response = await this.client.get('/reports/dashboard', { params });
    return response.data.data;
  }

  async getReportsBookings(params?: { days?: number; start_date?: string; end_date?: string }): Promise<unknown> {
    const response = await this.client.get('/reports/bookings', { params });
    return response.data.data;
  }

  async getReportsRevenue(params?: { days?: number; start_date?: string; end_date?: string }): Promise<unknown> {
    const response = await this.client.get('/reports/revenue', { params });
    return response.data.data;
  }

  async getReportsStaffPerformance(params?: { days?: number; start_date?: string; end_date?: string }): Promise<unknown> {
    const response = await this.client.get('/reports/staff_performance', { params });
    return response.data.data;
  }
}

export const api = new ApiService();
