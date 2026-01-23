import { create } from 'zustand';
import { Business, Service, StaffMember, Location, BookingState } from '../types';

interface BookingStore extends BookingState {
  setSelectedBusiness: (business: Business | null) => void;
  setSelectedService: (service: Service | null) => void;
  setSelectedStaff: (staff: StaffMember | null) => void;
  setSelectedDate: (date: string | null) => void;
  setSelectedTime: (time: string | null) => void;
  setSelectedLocation: (location: Location | null) => void;
  setClientInfo: (info: BookingState['clientInfo']) => void;
  resetBooking: () => void;
}

const initialState: BookingState = {
  selectedBusiness: null,
  selectedService: null,
  selectedStaff: null,
  selectedDate: null,
  selectedTime: null,
  selectedLocation: null,
  clientInfo: null,
};

export const useBookingStore = create<BookingStore>((set) => ({
  ...initialState,

  setSelectedBusiness: (business) => set({ selectedBusiness: business }),
  setSelectedService: (service) => set({ selectedService: service }),
  setSelectedStaff: (staff) => set({ selectedStaff: staff }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setSelectedTime: (time) => set({ selectedTime: time }),
  setSelectedLocation: (location) => set({ selectedLocation: location }),
  setClientInfo: (info) => set({ clientInfo: info }),
  resetBooking: () => set(initialState),
}));
