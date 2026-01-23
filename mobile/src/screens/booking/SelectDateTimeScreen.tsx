import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Calendar, DateData } from 'react-native-calendars';
import { format, addDays, parseISO } from 'date-fns';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { api } from '../../services/api';
import { useBookingStore } from '../../stores/bookingStore';

type Props = NativeStackScreenProps<RootStackParamList, 'SelectDateTime'>;

export function SelectDateTimeScreen({ route, navigation }: Props) {
  const { businessSlug } = route.params;
  const {
    selectedBusiness,
    selectedService,
    selectedStaff,
    selectedDate,
    setSelectedDate,
    setSelectedTime,
  } = useBookingStore();

  const [localSelectedDate, setLocalSelectedDate] = useState<string>(
    selectedDate || format(new Date(), 'yyyy-MM-dd')
  );

  const startDate = format(new Date(), 'yyyy-MM-dd');
  const endDate = format(
    addDays(new Date(), selectedBusiness?.bookingWindowDays || 30),
    'yyyy-MM-dd'
  );

  const { data: availability, isLoading } = useQuery({
    queryKey: [
      'availability',
      businessSlug,
      selectedService?.id,
      selectedStaff?.id,
      startDate,
      endDate,
    ],
    queryFn: () =>
      api.getAvailability(businessSlug, {
        serviceId: selectedService!.id,
        staffMemberId: selectedStaff?.id,
        startDate,
        endDate,
      }),
    enabled: !!selectedService?.id,
  });

  const markedDates = useMemo(() => {
    const marks: { [key: string]: any } = {};
    availability?.forEach((day) => {
      const hasAvailableSlots = day.slots.some((slot) => slot.available);
      marks[day.date] = {
        disabled: !hasAvailableSlots,
        disableTouchEvent: !hasAvailableSlots,
      };
    });
    marks[localSelectedDate] = {
      ...marks[localSelectedDate],
      selected: true,
      selectedColor: '#3b82f6',
    };
    return marks;
  }, [availability, localSelectedDate]);

  const selectedDaySlots = useMemo(() => {
    const dayData = availability?.find((d) => d.date === localSelectedDate);
    return dayData?.slots.filter((slot) => slot.available) || [];
  }, [availability, localSelectedDate]);

  const handleDateSelect = (day: DateData) => {
    setLocalSelectedDate(day.dateString);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedDate(localSelectedDate);
    setSelectedTime(time);
    navigation.navigate('ClientInfo', { businessSlug });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select Date & Time</Text>
        <Text style={styles.subtitle}>
          Choose when you'd like your appointment
        </Text>
      </View>

      <View style={styles.calendarContainer}>
        <Calendar
          current={localSelectedDate}
          minDate={startDate}
          maxDate={endDate}
          onDayPress={handleDateSelect}
          markedDates={markedDates}
          theme={{
            backgroundColor: '#ffffff',
            calendarBackground: '#ffffff',
            textSectionTitleColor: '#6b7280',
            selectedDayBackgroundColor: '#3b82f6',
            selectedDayTextColor: '#ffffff',
            todayTextColor: '#3b82f6',
            dayTextColor: '#1f2937',
            textDisabledColor: '#d1d5db',
            arrowColor: '#3b82f6',
            monthTextColor: '#1f2937',
            textDayFontWeight: '500',
            textMonthFontWeight: '600',
            textDayHeaderFontWeight: '500',
          }}
        />
      </View>

      <View style={styles.timeSlotsSection}>
        <Text style={styles.sectionTitle}>
          Available Times for {format(parseISO(localSelectedDate), 'MMMM d, yyyy')}
        </Text>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#3b82f6" />
          </View>
        ) : selectedDaySlots.length > 0 ? (
          <View style={styles.timeSlotsGrid}>
            {selectedDaySlots.map((slot, index) => (
              <TouchableOpacity
                key={index}
                style={styles.timeSlot}
                onPress={() => handleTimeSelect(slot.startTime)}
              >
                <Text style={styles.timeSlotText}>
                  {format(parseISO(slot.startTime), 'h:mm a')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.noSlotsContainer}>
            <Text style={styles.noSlotsText}>
              No available times for this date. Please select another date.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  calendarContainer: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  timeSlotsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlot: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: '30%',
    alignItems: 'center',
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  noSlotsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  noSlotsText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});
