import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ServiceSelector } from '../components/booking/ServiceSelector';
import { StaffSelector } from '../components/booking/StaffSelector';
import { DateTimePicker } from '../components/booking/DateTimePicker';
import { ClientInfoForm } from '../components/booking/ClientInfoForm';
import { BookingConfirmation } from '../components/booking/BookingConfirmation';
import { BookingSummary } from '../components/booking/BookingSummary';
import { publicApi } from '../services/api';
import { useBookingStore } from '../stores/bookingStore';
import type { Service, StaffMember, Booking } from '../types';

export function PublicBookingPage() {
  const { businessSlug } = useParams<{ businessSlug: string }>();
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const {
    selectedService,
    selectedStaffMember,
    selectedSlot,
    step,
    clientInfo,
    setSelectedService,
    setSelectedStaffMember,
    setSelectedSlot,
    setStep,
    setClientInfo,
    reset,
  } = useBookingStore();

  const { data: businessData, isLoading: isLoadingBusiness } = useQuery({
    queryKey: ['business', businessSlug],
    queryFn: () => publicApi.getBusinessBySlug(businessSlug!),
    enabled: !!businessSlug,
  });

  const business = businessData?.data;

  const { data: availabilityData, isLoading: isLoadingAvailability } = useQuery({
    queryKey: ['availability', businessSlug, selectedService?.id, selectedStaffMember?.id],
    queryFn: () =>
      publicApi.getAvailability(businessSlug!, selectedService!.id, {
        staff_member_id: selectedStaffMember?.id,
      }),
    enabled: !!businessSlug && !!selectedService,
  });

  const services = (availabilityData?.data as { service?: Service })?.service
    ? [availabilityData.data.service]
    : (business as { services?: Service[] })?.services || [];
  const staffMembers: StaffMember[] = [];
  const slots = availabilityData?.data?.slots || [];

  const createBookingMutation = useMutation({
    mutationFn: (data: Parameters<typeof publicApi.createBooking>[1]) =>
      publicApi.createBooking(businessSlug!, data),
    onSuccess: (response) => {
      if (response.success && response.data) {
        setConfirmedBooking(response.data);
        setStep(5);
      } else {
        setBookingError(response.error || 'Failed to create booking');
      }
    },
    onError: () => {
      setBookingError('Failed to create booking. Please try again.');
    },
  });

  useEffect(() => {
    return () => reset();
  }, [reset]);

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setSelectedStaffMember(null);
    setSelectedSlot(null);
  };

  const handleStaffSelect = (staff: StaffMember | null) => {
    setSelectedStaffMember(staff);
    setSelectedSlot(null);
  };

  const handleSubmitBooking = (info: typeof clientInfo) => {
    if (!selectedService || !selectedSlot) return;

    setClientInfo(info);
    setBookingError(null);

    createBookingMutation.mutate({
      service_id: selectedService.id,
      staff_member_id: selectedStaffMember?.id,
      start_at: `${selectedSlot.date}T${selectedSlot.start_time}`,
      client_email: info.email,
      client_first_name: info.firstName,
      client_last_name: info.lastName,
      client_phone: info.phone || undefined,
      notes: info.notes || undefined,
    });
  };

  const handleNewBooking = () => {
    reset();
    setConfirmedBooking(null);
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return !!selectedService;
      case 2:
        return true;
      case 3:
        return !!selectedSlot;
      default:
        return false;
    }
  };

  if (isLoadingBusiness) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Business Not Found</h1>
          <p className="text-muted-foreground">
            The booking page you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  if (confirmedBooking) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <BookingConfirmation booking={confirmedBooking} onNewBooking={handleNewBooking} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold">{business.name}</h1>
          <p className="text-muted-foreground">Book an appointment</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="mb-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                {['Service', 'Provider', 'Date & Time', 'Your Info'].map((label, index) => (
                  <div key={label} className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        step > index + 1
                          ? 'bg-primary text-primary-foreground'
                          : step === index + 1
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span className={step === index + 1 ? 'font-medium text-foreground' : ''}>
                      {label}
                    </span>
                    {index < 3 && <ArrowRight className="h-4 w-4" />}
                  </div>
                ))}
              </div>
            </div>

            {step === 1 && (
              <ServiceSelector
                services={services}
                selectedService={selectedService}
                onSelect={handleServiceSelect}
              />
            )}

            {step === 2 && (
              <StaffSelector
                staffMembers={staffMembers}
                selectedStaff={selectedStaffMember}
                onSelect={handleStaffSelect}
              />
            )}

            {step === 3 && (
              <DateTimePicker
                slots={slots}
                selectedSlot={selectedSlot}
                onSelect={setSelectedSlot}
                isLoading={isLoadingAvailability}
              />
            )}

            {step === 4 && (
              <ClientInfoForm
                initialData={clientInfo}
                onSubmit={handleSubmitBooking}
                isSubmitting={createBookingMutation.isPending}
                error={bookingError}
              />
            )}

            {step < 4 && (
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  disabled={step === 1}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button onClick={() => setStep(step + 1)} disabled={!canProceed()}>
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </div>

          <div className="lg:w-80">
            <div className="sticky top-8">
              <BookingSummary
                service={selectedService}
                staffMember={selectedStaffMember}
                slot={selectedSlot}
                businessName={business.name}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
