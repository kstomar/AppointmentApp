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
      subdomain: string;
      industry?: string;
    }): Promise<{ user: User; business: Business; token: string }> {
      const response = await this.client.post('/auth/sign_up/business', data);
      return response.data;
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
          return response.data;
        }

    async signIn(email: string, password: string): Promise<{ user: User; token: string }> {
      const response = await this.client.post('/auth/sign_in', { email, password });
      return response.data;
    }

  async signOut(): Promise<void> {
    await this.client.delete('/auth/sign_out');
  }

  async getMe(): Promise<User> {
    const response = await this.client.get('/auth/me');
    return response.data;
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await this.client.patch('/auth/profile', data);
    return response.data;
  }

  // Businesses
  async getBusinesses(): Promise<Business[]> {
    const response = await this.client.get('/businesses');
    return response.data;
  }

  async getBusiness(id: string): Promise<Business> {
    const response = await this.client.get(`/businesses/${id}`);
    return response.data;
  }

  async getBusinessBySlug(slug: string): Promise<Business> {
    const response = await this.client.get(`/public/businesses/${slug}`);
    return response.data;
  }

  // Services
  async getServices(businessId: string): Promise<Service[]> {
    const response = await this.client.get(`/businesses/${businessId}/services`);
    return response.data;
  }

  async getService(businessId: string, serviceId: string): Promise<Service> {
    const response = await this.client.get(`/businesses/${businessId}/services/${serviceId}`);
    return response.data;
  }

  // Staff
  async getStaffMembers(businessId: string): Promise<StaffMember[]> {
    const response = await this.client.get(`/businesses/${businessId}/staff_members`);
    return response.data;
  }

  async getStaffMember(businessId: string, staffId: string): Promise<StaffMember> {
    const response = await this.client.get(`/businesses/${businessId}/staff_members/${staffId}`);
    return response.data;
  }

  // Locations
  async getLocations(businessId: string): Promise<Location[]> {
    const response = await this.client.get(`/businesses/${businessId}/locations`);
    return response.data;
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
    return response.data;
  }

  // Bookings
  async getBookings(params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Booking[]> {
    const response = await this.client.get('/bookings', { params });
    return response.data;
  }

  async getUpcomingBookings(): Promise<Booking[]> {
    const response = await this.client.get('/bookings/upcoming');
    return response.data;
  }

  async getPastBookings(): Promise<Booking[]> {
    const response = await this.client.get('/bookings/past');
    return response.data;
  }

  async getBooking(id: string): Promise<Booking> {
    const response = await this.client.get(`/bookings/${id}`);
    return response.data;
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
    return response.data;
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
    return response.data;
  }

  async cancelBooking(id: string, reason?: string): Promise<Booking> {
    const response = await this.client.post(`/bookings/${id}/cancel`, { reason });
    return response.data;
  }

  async rescheduleBooking(id: string, newStartAt: string): Promise<Booking> {
    const response = await this.client.post(`/bookings/${id}/reschedule`, {
      startAt: newStartAt,
    });
    return response.data;
  }

  async completeBooking(id: string): Promise<Booking> {
    const response = await this.client.post(`/bookings/${id}/complete`);
    return response.data;
  }

  async markNoShow(id: string): Promise<Booking> {
    const response = await this.client.post(`/bookings/${id}/no_show`);
    return response.data;
  }

  // Notifications
  async getNotifications(): Promise<Notification[]> {
    const response = await this.client.get('/notifications');
    return response.data;
  }

  async markNotificationRead(id: string): Promise<Notification> {
    const response = await this.client.post(`/notifications/${id}/mark_read`);
    return response.data;
  }

  async markAllNotificationsRead(): Promise<void> {
    await this.client.post('/notifications/mark_all_read');
  }

  async getUnreadCount(): Promise<number> {
    const response = await this.client.get('/notifications/unread_count');
    return response.data.count;
  }

  // Payments
  async getPayments(): Promise<Payment[]> {
    const response = await this.client.get('/payments');
    return response.data;
  }

  async createPaymentIntent(bookingId: string): Promise<{ clientSecret: string }> {
    const response = await this.client.post(`/bookings/${bookingId}/payments/intent`);
    return response.data;
  }
}

export const api = new ApiService();
