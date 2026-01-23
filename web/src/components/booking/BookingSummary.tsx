import { format, parseISO } from 'date-fns';
import { Calendar, Clock, MapPin, User, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import type { Service, StaffMember, Location, AvailabilitySlot } from '../../types';

interface BookingSummaryProps {
  service: Service | null;
  staffMember?: StaffMember | null;
  location?: Location | null;
  slot: AvailabilitySlot | null;
  businessName?: string;
}

export function BookingSummary({ service, staffMember, location, slot, businessName }: BookingSummaryProps) {
  if (!service) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Booking Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {businessName && (
          <div>
            <p className="text-sm text-muted-foreground">Business</p>
            <p className="font-medium">{businessName}</p>
          </div>
        )}

        <div className="flex items-start gap-3">
          <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="font-medium">{service.name}</p>
            <p className="text-sm text-muted-foreground">{service.duration_minutes} minutes</p>
          </div>
        </div>

        {staffMember && (
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">{staffMember.user.name}</p>
              {staffMember.title && (
                <p className="text-sm text-muted-foreground">{staffMember.title}</p>
              )}
            </div>
          </div>
        )}

        {location && (
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">{location.name}</p>
              {location.full_address && (
                <p className="text-sm text-muted-foreground">{location.full_address}</p>
              )}
            </div>
          </div>
        )}

        {slot && (
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">{format(parseISO(slot.date), 'EEEE, MMMM d, yyyy')}</p>
              <p className="text-sm text-muted-foreground">{slot.start_time} - {slot.end_time}</p>
            </div>
          </div>
        )}

        {service.price && (
          <>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Total</span>
              </div>
              <span className="text-lg font-bold">{service.price}</span>
            </div>
            {service.deposit_amount && (
              <p className="text-sm text-muted-foreground text-right">
                Deposit required: {service.deposit_amount}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
