import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import Icon from 'react-native-vector-icons/Ionicons';
import { format } from 'date-fns';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { api } from '../../services/api';
import { useBookingStore } from '../../stores/bookingStore';

type Props = NativeStackScreenProps<RootStackParamList, 'BookingConfirmation'>;

export function BookingConfirmationScreen({ route, navigation }: Props) {
  const { bookingId } = route.params;
  const resetBooking = useBookingStore((state) => state.resetBooking);

  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => api.getBooking(bookingId),
  });

  useEffect(() => {
    return () => {
      resetBooking();
    };
  }, []);

  const handleGoHome = () => {
    resetBooking();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  };

  const handleViewBooking = () => {
    navigation.navigate('BookingDetail', { bookingId });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.successSection}>
        <View style={styles.successIcon}>
          <Icon name="checkmark-circle" size={80} color="#22c55e" />
        </View>
        <Text style={styles.successTitle}>Booking Confirmed!</Text>
        <Text style={styles.successSubtitle}>
          Your appointment has been successfully booked
        </Text>
      </View>

      <View style={styles.confirmationCard}>
        <View style={styles.confirmationHeader}>
          <Text style={styles.confirmationLabel}>Confirmation Code</Text>
          <Text style={styles.confirmationCode}>
            {booking?.confirmationCode}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <Icon name="briefcase-outline" size={20} color="#6b7280" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Service</Text>
              <Text style={styles.detailValue}>{booking?.service?.name}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Icon name="business-outline" size={20} color="#6b7280" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Business</Text>
              <Text style={styles.detailValue}>{booking?.business?.name}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Icon name="calendar-outline" size={20} color="#6b7280" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>
                {booking?.startAt &&
                  format(new Date(booking.startAt), 'EEEE, MMMM d, yyyy')}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Icon name="time-outline" size={20} color="#6b7280" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Time</Text>
              <Text style={styles.detailValue}>
                {booking?.startAt &&
                  format(new Date(booking.startAt), 'h:mm a')}{' '}
                -{' '}
                {booking?.endAt && format(new Date(booking.endAt), 'h:mm a')}
              </Text>
            </View>
          </View>

          {booking?.staffMember && (
            <View style={styles.detailRow}>
              <Icon name="person-outline" size={20} color="#6b7280" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Staff</Text>
                <Text style={styles.detailValue}>
                  {booking.staffMember.user?.firstName}{' '}
                  {booking.staffMember.user?.lastName}
                </Text>
              </View>
            </View>
          )}

          {booking?.location && (
            <View style={styles.detailRow}>
              <Icon name="location-outline" size={20} color="#6b7280" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue}>
                  {booking.location.name}
                  {booking.location.addressLine1 &&
                    `\n${booking.location.addressLine1}`}
                </Text>
              </View>
            </View>
          )}

          {booking?.totalAmountCents && (
            <View style={styles.detailRow}>
              <Icon name="card-outline" size={20} color="#6b7280" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Total</Text>
                <Text style={styles.detailValue}>
                  ${(booking.totalAmountCents / 100).toFixed(2)}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>

      <View style={styles.infoCard}>
        <Icon name="mail-outline" size={24} color="#3b82f6" />
        <Text style={styles.infoText}>
          A confirmation email has been sent to your email address with all the
          booking details.
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleViewBooking}
        >
          <Text style={styles.primaryButtonText}>View Booking Details</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={handleGoHome}>
          <Text style={styles.secondaryButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successSection: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#fff',
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  confirmationCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  confirmationHeader: {
    backgroundColor: '#f0fdf4',
    padding: 16,
    alignItems: 'center',
  },
  confirmationLabel: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  confirmationCode: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#22c55e',
    letterSpacing: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  detailsSection: {
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  detailContent: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    color: '#1f2937',
    fontWeight: '500',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
  actions: {
    padding: 16,
    gap: 12,
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
});
