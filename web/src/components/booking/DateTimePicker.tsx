import { useState, useMemo } from 'react';
import { format, parseISO, startOfDay, addDays, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { cn } from '../../lib/utils';
import type { AvailabilitySlot } from '../../types';

interface DateTimePickerProps {
  slots: AvailabilitySlot[];
  selectedSlot: AvailabilitySlot | null;
  onSelect: (slot: AvailabilitySlot) => void;
  isLoading?: boolean;
}

export function DateTimePicker({ slots, selectedSlot, onSelect, isLoading }: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    if (slots.length > 0) {
      return parseISO(slots[0].date);
    }
    return startOfDay(new Date());
  });

  const [weekOffset, setWeekOffset] = useState(0);

  const weekDays = useMemo(() => {
    const start = addDays(startOfDay(new Date()), weekOffset * 7);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [weekOffset]);

  const availableDates = useMemo(() => {
    const dates = new Set<string>();
    slots.forEach((slot) => {
      if (slot.available) {
        dates.add(slot.date);
      }
    });
    return dates;
  }, [slots]);

  const timeSlotsForDate = useMemo(() => {
    return slots.filter(
      (slot) => slot.available && isSameDay(parseISO(slot.date), selectedDate)
    );
  }, [slots, selectedDate]);

  const hasAvailability = (date: Date) => {
    return availableDates.has(format(date, 'yyyy-MM-dd'));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No available time slots. Please try a different service or provider.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Select Date & Time</h2>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setWeekOffset((w) => w - 1)}
              disabled={weekOffset === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-base">
              {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d, yyyy')}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setWeekOffset((w) => w + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-4">
            {weekDays.map((day) => {
              const isAvailable = hasAvailability(day);
              const isSelected = isSameDay(day, selectedDate);
              const isPast = day < startOfDay(new Date());

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => isAvailable && !isPast && setSelectedDate(day)}
                  disabled={!isAvailable || isPast}
                  className={cn(
                    'flex flex-col items-center p-2 rounded-lg transition-colors',
                    isSelected && 'bg-primary text-primary-foreground',
                    !isSelected && isAvailable && !isPast && 'hover:bg-muted',
                    (!isAvailable || isPast) && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <span className="text-xs font-medium">{format(day, 'EEE')}</span>
                  <span className="text-lg font-semibold">{format(day, 'd')}</span>
                </button>
              );
            })}
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Available Times for {format(selectedDate, 'EEEE, MMMM d')}
            </h3>
            {timeSlotsForDate.length === 0 ? (
              <p className="text-sm text-muted-foreground">No available times for this date.</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {timeSlotsForDate.map((slot) => {
                  const isSelected = selectedSlot?.start_time === slot.start_time && 
                                     selectedSlot?.date === slot.date;
                  return (
                    <Button
                      key={`${slot.date}-${slot.start_time}`}
                      variant={isSelected ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onSelect(slot)}
                      className="text-sm"
                    >
                      {slot.start_time}
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
