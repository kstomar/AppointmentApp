import { create } from 'zustand';
import type { Service, StaffMember, AvailabilitySlot, Location } from '../types';

interface BookingState {
  selectedService: Service | null;
  selectedStaffMember: StaffMember | null;
  selectedLocation: Location | null;
  selectedSlot: AvailabilitySlot | null;
  step: number;
  clientInfo: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    notes: string;
  };
  setSelectedService: (service: Service | null) => void;
  setSelectedStaffMember: (staff: StaffMember | null) => void;
  setSelectedLocation: (location: Location | null) => void;
  setSelectedSlot: (slot: AvailabilitySlot | null) => void;
  setStep: (step: number) => void;
  setClientInfo: (info: Partial<BookingState['clientInfo']>) => void;
  reset: () => void;
}

const initialClientInfo = {
  email: '',
  firstName: '',
  lastName: '',
  phone: '',
  notes: '',
};

export const useBookingStore = create<BookingState>((set) => ({
  selectedService: null,
  selectedStaffMember: null,
  selectedLocation: null,
  selectedSlot: null,
  step: 1,
  clientInfo: initialClientInfo,

  setSelectedService: (service) => set({ selectedService: service }),
  setSelectedStaffMember: (staff) => set({ selectedStaffMember: staff }),
  setSelectedLocation: (location) => set({ selectedLocation: location }),
  setSelectedSlot: (slot) => set({ selectedSlot: slot }),
  setStep: (step) => set({ step }),
  setClientInfo: (info) => set((state) => ({ clientInfo: { ...state.clientInfo, ...info } })),
  reset: () => set({
    selectedService: null,
    selectedStaffMember: null,
    selectedLocation: null,
    selectedSlot: null,
    step: 1,
    clientInfo: initialClientInfo,
  }),
}));
