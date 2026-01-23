import { Clock, DollarSign, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import type { Service } from '../../types';

interface ServiceSelectorProps {
  services: Service[];
  selectedService: Service | null;
  onSelect: (service: Service) => void;
}

export function ServiceSelector({ services, selectedService, onSelect }: ServiceSelectorProps) {
  if (services.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No services available for booking at this time.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Select a Service</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {services.map((service) => (
          <Card
            key={service.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedService?.id === service.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onSelect(service)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{service.name}</CardTitle>
              {service.description && (
                <CardDescription className="line-clamp-2">{service.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{service.duration_minutes} min</span>
                </div>
                {service.price && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    <span>{service.price}</span>
                  </div>
                )}
                {service.max_attendees > 1 && (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>Up to {service.max_attendees}</span>
                  </div>
                )}
              </div>
              {selectedService?.id === service.id && (
                <Button className="mt-4 w-full" size="sm">
                  Selected
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
