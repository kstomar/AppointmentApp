import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Icon from 'react-native-vector-icons/Ionicons';
import { format } from 'date-fns';
import { api } from '../services/api';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'BookingDetail'>;

export function BookingDetailScreen({ route, navigation }: Props) {
  const { bookingId } = route.params;
  const queryClient = useQueryClient();
  const [isCancelling, setIsCancelling] = useState(false);

  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => api.getBooking(bookingId),
  });

  const cancelMutation = useMutation({
    mutationFn: (reason?: string) => api.cancelBooking(bookingId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking', bookingId] });
      queryClient.invalidateQueries({ queryKey: ['upcomingBookings'] });
      Alert.alert('Success', 'Booking cancelled successfully');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Failed to cancel booking');
    },
  });

  const handleCancel = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            setIsCancelling(true);
            cancelMutation.mutate(undefined, {
              onSettled: () => setIsCancelling(false),
            });
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#22c55e';
      case 'pending':
        return '#f59e0b';
      case 'completed':
        return '#3b82f6';
      case 'cancelled':
        return '#ef4444';
      case 'no_show':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Booking not found</Text>
      </View>
    );
  }

  const canCancel = ['pending', 'confirmed'].includes(booking.status);
  const canReschedule = ['pending', 'confirmed'].includes(booking.status);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.confirmationCode}>
          <Text style={styles.confirmationLabel}>Confirmation Code</Text>
          <Text style={styles.confirmationValue}>{booking.confirmationCode}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: `${getStatusColor(booking.status)}20` },
          ]}
        >
          <View
            style={[styles.statusDot, { backgroundColor: getStatusColor(booking.status) }]}
          />
          <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
            {booking.status}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Service Details</Text>
        <View style={styles.card}>
          <Text style={styles.serviceName}>{booking.service?.name}</Text>
          <Text style={styles.businessName}>{booking.business?.name}</Text>
          <View style={styles.detailRow}>
            <Icon name="time-outline" size={18} color="#6b7280" />
            <Text style={styles.detailText}>{booking.durationMinutes} minutes</Text>
          </View>
          {booking.totalAmountCents && (
            <View style={styles.detailRow}>
              <Icon name="card-outline" size={18} color="#6b7280" />
              <Text style={styles.detailText}>
                ${(booking.totalAmountCents / 100).toFixed(2)}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Date & Time</Text>
        <View style={styles.card}>
          <View style={styles.detailRow}>
            <Icon name="calendar-outline" size={18} color="#6b7280" />
            <Text style={styles.detailText}>
              {format(new Date(booking.startAt), 'EEEE, MMMM d, yyyy')}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="time-outline" size={18} color="#6b7280" />
            <Text style={styles.detailText}>
              {format(new Date(booking.startAt), 'h:mm a')} -{' '}
              {format(new Date(booking.endAt), 'h:mm a')}
            </Text>
          </View>
        </View>
      </View>

      {booking.staffMember && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Staff Member</Text>
          <View style={styles.card}>
            <View style={styles.staffInfo}>
              <View style={styles.staffAvatar}>
                <Icon name="person" size={24} color="#6b7280" />
              </View>
              <View>
                <Text style={styles.staffName}>
                  {booking.staffMember.user?.firstName} {booking.staffMember.user?.lastName}
                </Text>
                {booking.staffMember.title && (
                  <Text style={styles.staffTitle}>{booking.staffMember.title}</Text>
                )}
              </View>
            </View>
          </View>
        </View>
      )}

      {booking.location && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.card}>
            <View style={styles.detailRow}>
              <Icon name="location-outline" size={18} color="#6b7280" />
              <View style={styles.locationInfo}>
                <Text style={styles.locationName}>{booking.location.name}</Text>
                {booking.location.addressLine1 && (
                  <Text style={styles.locationAddress}>
                    {booking.location.addressLine1}
                    {booking.location.city && `, ${booking.location.city}`}
                    {booking.location.state && `, ${booking.location.state}`}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>
      )}

      {booking.clientNotes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <View style={styles.card}>
            <Text style={styles.notesText}>{booking.clientNotes}</Text>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment</Text>
        <View style={styles.card}>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Status</Text>
            <Text style={styles.paymentValue}>{booking.paymentStatus}</Text>
          </View>
          {booking.totalAmountCents && (
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Total</Text>
              <Text style={styles.paymentValue}>
                ${(booking.totalAmountCents / 100).toFixed(2)}
              </Text>
            </View>
          )}
          {booking.paidAmountCents && booking.paidAmountCents > 0 && (
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Paid</Text>
              <Text style={styles.paymentValue}>
                ${(booking.paidAmountCents / 100).toFixed(2)}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        {canReschedule && (
          <TouchableOpacity style={styles.rescheduleButton}>
            <Icon name="calendar-outline" size={20} color="#3b82f6" />
            <Text style={styles.rescheduleButtonText}>Reschedule</Text>
          </TouchableOpacity>
        )}
        {canCancel && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            disabled={isCancelling}
          >
            {isCancelling ? (
              <ActivityIndicator size="small" color="#ef4444" />
            ) : (
              <>
                <Icon name="close-circle-outline" size={20} color="#ef4444" />
                <Text style={styles.cancelButtonText}>Cancel Booking</Text>
              </>
            )}
          </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  confirmationCode: {},
  confirmationLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  confirmationValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  businessName: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  detailText: {
    fontSize: 15,
    color: '#374151',
  },
  staffInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  staffAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  staffName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  staffTitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1f2937',
  },
  locationAddress: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  notesText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  paymentLabel: {
    fontSize: 15,
    color: '#6b7280',
  },
  paymentValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1f2937',
    textTransform: 'capitalize',
  },
  actions: {
    padding: 16,
    marginTop: 8,
    marginBottom: 32,
    gap: 12,
  },
  rescheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#3b82f6',
    borderRadius: 8,
    padding: 16,
  },
  rescheduleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 8,
    padding: 16,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
});
