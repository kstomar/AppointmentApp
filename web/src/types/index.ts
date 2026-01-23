export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone?: string;
  role: 'super_admin' | 'business_admin' | 'staff' | 'front_desk' | 'client';
  timezone?: string;
  locale?: string;
  avatar_url?: string;
  preferences?: Record<string, unknown>;
  tenant_id: string;
}

export interface Business {
  id: string;
  name: string;
  slug: string;
  description?: string;
  industry: string;
  status: string;
  phone?: string;
  email?: string;
  website?: string;
  timezone: string;
  currency: string;
  booking_lead_time_minutes: number;
  booking_window_days: number;
  cancellation_policy_hours: number;
  deposit_percentage?: number;
  booking_url: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  locations_count: number;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: string;
  business_id: string;
  name: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  full_address?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  timezone: string;
  is_primary: boolean;
  is_virtual: boolean;
  virtual_meeting_url?: string;
  status: string;
  operating_hours?: Record<string, { open: string; close: string }>;
}

export interface Service {
  id: string;
  business_id: string;
  name: string;
  slug: string;
  description?: string;
  service_type: string;
  category?: { id: string; name: string };
  duration_minutes: number;
  buffer_before_minutes: number;
  buffer_after_minutes: number;
  total_duration_minutes: number;
  price?: string;
  price_cents?: number;
  deposit_amount?: string;
  deposit_amount_cents?: number;
  max_attendees: number;
  min_attendees: number;
  is_public: boolean;
  allow_online_booking: boolean;
  requires_confirmation: boolean;
  status: string;
  staff_count: number;
}

export interface StaffMember {
  id: string;
  business_id: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
  };
  location?: { id: string; name: string };
  title?: string;
  bio?: string;
  status: string;
  role: string;
  skills: string[];
  is_bookable: boolean;
  accepts_new_clients: boolean;
  max_daily_bookings?: number;
  services: { id: string; name: string }[];
}

export interface AvailabilitySlot {
  date: string;
  start_time: string;
  end_time: string;
  staff_member_id: string;
  staff_member_name: string;
  service_id: string;
  duration_minutes: number;
  timezone: string;
  available: boolean;
}

export interface Booking {
  id: string;
  confirmation_code: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  booking_type: string;
  start_at: string;
  end_at: string;
  duration_minutes: number;
  service: { id: string; name: string };
  staff_member?: { id: string; name: string };
  client: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  location?: {
    id: string;
    name: string;
    address?: string;
  };
  business: { id: string; name: string };
  total_amount?: string;
  deposit_amount?: string;
  paid_amount?: string;
  payment_status: string;
  client_notes?: string;
  internal_notes?: string;
  source: string;
  attendee_count: number;
  can_cancel?: boolean;
  can_reschedule?: boolean;
}

export interface Notification {
  id: string;
  notification_type: string;
  channel: string;
  status: string;
  subject: string;
  body: string;
  read_at?: string;
  sent_at?: string;
  booking_id?: string;
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: string[];
  meta?: {
    current_page?: number;
    total_pages?: number;
    total_count?: number;
    per_page?: number;
  };
}

export interface BookingFormData {
  service_id: string;
  staff_member_id?: string;
  location_id?: string;
  start_at: string;
  client_email: string;
  client_first_name: string;
  client_last_name: string;
  client_phone?: string;
  notes?: string;
  intake_responses?: Record<string, unknown>;
}
