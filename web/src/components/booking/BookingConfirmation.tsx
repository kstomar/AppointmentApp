import { format, parseISO } from 'date-fns';
import { CheckCircle, Calendar, Clock, MapPin, User, Mail, Phone, Copy, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { useToast } from '../../hooks/use-toast';
import type { Booking } from '../../types';

interface BookingConfirmationProps {
  booking: Booking;
  onNewBooking?: () => void;
}

export function BookingConfirmation({ booking, onNewBooking }: BookingConfirmationProps) {
  const { toast } = useToast();

  const copyConfirmationCode = () => {
    navigator.clipboard.writeText(booking.confirmation_code);
    toast({
      title: 'Copied!',
      description: 'Confirmation code copied to clipboard.',
    });
  };

  const addToCalendar = () => {
    const startDate = parseISO(booking.start_at);
    const endDate = parseISO(booking.end_at);
    
    const googleCalendarUrl = new URL('https://calendar.google.com/calendar/render');
    googleCalendarUrl.searchParams.set('action', 'TEMPLATE');
    googleCalendarUrl.searchParams.set('text', `${booking.service.name} at ${booking.business.name}`);
    googleCalendarUrl.searchParams.set('dates', `${format(startDate, "yyyyMMdd'T'HHmmss")}/${format(endDate, "yyyyMMdd'T'HHmmss")}`);
    if (booking.location?.address) {
      googleCalendarUrl.searchParams.set('location', booking.location.address);
    }
    
    window.open(googleCalendarUrl.toString(), '_blank');
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold">Booking Confirmed!</h1>
        <p className="text-muted-foreground mt-2">
          Your appointment has been successfully booked.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Confirmation Code</CardTitle>
              <CardDescription>Save this code for your records</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={copyConfirmationCode}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-mono font-bold tracking-wider text-center py-2 bg-muted rounded-lg">
            {booking.confirmation_code}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Appointment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">{format(parseISO(booking.start_at), 'EEEE, MMMM d, yyyy')}</p>
              <p className="text-sm text-muted-foreground">
                {format(parseISO(booking.start_at), 'h:mm a')} - {format(parseISO(booking.end_at), 'h:mm a')}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">{booking.service.name}</p>
              <p className="text-sm text-muted-foreground">{booking.duration_minutes} minutes</p>
            </div>
          </div>

          {booking.staff_member && (
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">{booking.staff_member.name}</p>
                <p className="text-sm text-muted-foreground">Provider</p>
              </div>
            </div>
          )}

          {booking.location && (
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">{booking.location.name}</p>
                {booking.location.address && (
                  <p className="text-sm text-muted-foreground">{booking.location.address}</p>
                )}
              </div>
            </div>
          )}

          <Separator />

          <div className="space-y-2">
            <h4 className="font-medium text-sm">Contact Information</h4>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{booking.client.email}</span>
            </div>
            {booking.client.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{booking.client.phone}</span>
              </div>
            )}
          </div>

          {booking.total_amount && (
            <>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="font-medium">Total</span>
                <span className="text-lg font-bold">{booking.total_amount}</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="outline" className="flex-1" onClick={addToCalendar}>
          <ExternalLink className="h-4 w-4 mr-2" />
          Add to Calendar
        </Button>
        {onNewBooking && (
          <Button className="flex-1" onClick={onNewBooking}>
            Book Another
          </Button>
        )}
      </div>

      <p className="text-center text-sm text-muted-foreground">
        A confirmation email has been sent to {booking.client.email}
      </p>
    </div>
  );
}
