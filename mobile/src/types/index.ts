export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'super_admin' | 'business_admin' | 'staff' | 'front_desk' | 'client';
  avatarUrl?: string;
  timezone?: string;
  locale?: string;
}

export interface Business {
  id: string;
  name: string;
  slug: string;
  description?: string;
  industry: string;
  status: 'active' | 'inactive' | 'suspended';
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  timezone: string;
  currency: string;
  bookingLeadTimeMinutes: number;
  bookingWindowDays: number;
  cancellationPolicyHours: number;
  depositPercentage?: number;
}

export interface Location {
  id: string;
  businessId: string;
  name: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  timezone: string;
  isPrimary: boolean;
  isVirtual: boolean;
  virtualMeetingUrl?: string;
  status: 'active' | 'inactive' | 'temporarily_closed';
}

export interface Service {
  id: string;
  businessId: string;
  categoryId?: string;
  name: string;
  slug: string;
  description?: string;
  serviceType: 'appointment' | 'class' | 'consultation' | 'home_visit' | 'virtual';
  durationMinutes: number;
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
  priceCents?: number;
  currency: string;
  depositAmountCents?: number;
  maxAttendees: number;
  minAttendees: number;
  isPublic: boolean;
  allowOnlineBooking: boolean;
  requiresConfirmation: boolean;
  status: 'active' | 'inactive' | 'archived';
}

export interface StaffMember {
  id: string;
  businessId: string;
  userId: string;
  locationId?: string;
  title?: string;
  bio?: string;
  status: 'active' | 'inactive' | 'on_leave' | 'terminated';
  role: 'owner' | 'manager' | 'provider' | 'assistant';
  isBookable: boolean;
  acceptsNewClients: boolean;
  maxDailyBookings?: number;
  user?: User;
}

export interface Booking {
  id: string;
  confirmationCode: string;
  businessId: string;
  serviceId: string;
  staffMemberId?: string;
  clientId: string;
  locationId?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  bookingType: 'standard' | 'recurring' | 'group' | 'waitlist';
  startAt: string;
  endAt: string;
  durationMinutes: number;
  totalAmountCents?: number;
  depositAmountCents?: number;
  paidAmountCents?: number;
  paymentStatus: 'pending' | 'partial' | 'paid' | 'refunded';
  clientNotes?: string;
  internalNotes?: string;
  source: 'web' | 'mobile' | 'admin' | 'api' | 'widget';
  service?: Service;
  staffMember?: StaffMember;
  client?: User;
  location?: Location;
  business?: Business;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
  staffMemberId?: string;
}

export interface AvailabilityResponse {
  date: string;
  slots: TimeSlot[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface BookingState {
  selectedBusiness: Business | null;
  selectedService: Service | null;
  selectedStaff: StaffMember | null;
  selectedDate: string | null;
  selectedTime: string | null;
  selectedLocation: Location | null;
  clientInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    notes?: string;
  } | null;
}

export interface Notification {
  id: string;
  userId: string;
  bookingId?: string;
  notificationType: 'booking_confirmation' | 'booking_reminder' | 'booking_cancelled' | 'booking_rescheduled' | 'payment_received' | 'review_request';
  channel: 'email' | 'sms' | 'push' | 'in_app';
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'read';
  title?: string;
  body?: string;
  sentAt?: string;
  readAt?: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  amountCents: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'partially_refunded';
  provider: 'stripe' | 'razorpay' | 'cash' | 'other';
  paymentType: 'deposit' | 'full_payment' | 'partial' | 'refund';
  providerPaymentId?: string;
  refundAmountCents?: number;
  refundReason?: string;
}
