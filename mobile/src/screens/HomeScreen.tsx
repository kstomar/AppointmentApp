import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import Icon from 'react-native-vector-icons/Ionicons';
import { format } from 'date-fns';
import { useAuthStore } from '../stores/authStore';
import { api } from '../services/api';
import { Booking } from '../types';

export function HomeScreen({ navigation }: any) {
  const user = useAuthStore((state) => state.user);

  const {
    data: upcomingBookings,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['upcomingBookings'],
    queryFn: () => api.getUpcomingBookings(),
  });

  const { data: unreadCount } = useQuery({
    queryKey: ['unreadNotifications'],
    queryFn: () => api.getUnreadCount(),
  });

  const renderBookingCard = (booking: Booking) => (
    <TouchableOpacity
      key={booking.id}
      style={styles.bookingCard}
      onPress={() => navigation.navigate('BookingDetail', { bookingId: booking.id })}
    >
      <View style={styles.bookingHeader}>
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceName}>{booking.service?.name}</Text>
          <Text style={styles.businessName}>{booking.business?.name}</Text>
        </View>
        <View style={[styles.statusBadge, styles[`status_${booking.status}`]]}>
          <Text style={styles.statusText}>{booking.status}</Text>
        </View>
      </View>
      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <Icon name="calendar-outline" size={16} color="#6b7280" />
          <Text style={styles.detailText}>
            {format(new Date(booking.startAt), 'EEEE, MMMM d, yyyy')}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="time-outline" size={16} color="#6b7280" />
          <Text style={styles.detailText}>
            {format(new Date(booking.startAt), 'h:mm a')} - {format(new Date(booking.endAt), 'h:mm a')}
          </Text>
        </View>
        {booking.staffMember && (
          <View style={styles.detailRow}>
            <Icon name="person-outline" size={16} color="#6b7280" />
            <Text style={styles.detailText}>
              {booking.staffMember.user?.firstName} {booking.staffMember.user?.lastName}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refetch} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.firstName}!</Text>
          <Text style={styles.subGreeting}>Welcome back</Text>
        </View>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Icon name="notifications-outline" size={24} color="#1f2937" />
          {unreadCount && unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionCard}>
            <View style={[styles.actionIcon, { backgroundColor: '#dbeafe' }]}>
              <Icon name="add-circle-outline" size={24} color="#3b82f6" />
            </View>
            <Text style={styles.actionText}>New Booking</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Bookings')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#dcfce7' }]}>
              <Icon name="calendar-outline" size={24} color="#22c55e" />
            </View>
            <Text style={styles.actionText}>My Bookings</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Profile')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#fef3c7' }]}>
              <Icon name="person-outline" size={24} color="#f59e0b" />
            </View>
            <Text style={styles.actionText}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Settings')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#fce7f3' }]}>
              <Icon name="settings-outline" size={24} color="#ec4899" />
            </View>
            <Text style={styles.actionText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Business Management Section */}
      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Business Management</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Clients')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#e0e7ff' }]}>
              <Icon name="people-outline" size={24} color="#6366f1" />
            </View>
            <Text style={styles.actionText}>Clients</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Services')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#d1fae5' }]}>
              <Icon name="briefcase-outline" size={24} color="#10b981" />
            </View>
            <Text style={styles.actionText}>Services</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Staff')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#fef3c7' }]}>
              <Icon name="people-circle-outline" size={24} color="#f59e0b" />
            </View>
            <Text style={styles.actionText}>Staff</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Payments')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#fce7f3' }]}>
              <Icon name="card-outline" size={24} color="#ec4899" />
            </View>
            <Text style={styles.actionText}>Payments</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Reports')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#dbeafe' }]}>
              <Icon name="bar-chart-outline" size={24} color="#3b82f6" />
            </View>
            <Text style={styles.actionText}>Reports</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.upcomingSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Bookings')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Loading...</Text>
          </View>
        ) : upcomingBookings && upcomingBookings.length > 0 ? (
          upcomingBookings.slice(0, 3).map(renderBookingCard)
        ) : (
          <View style={styles.emptyState}>
            <Icon name="calendar-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>No upcoming appointments</Text>
            <TouchableOpacity style={styles.bookNowButton}>
              <Text style={styles.bookNowText}>Book Now</Text>
            </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subGreeting: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  quickActions: {
    padding: 24,
    backgroundColor: '#fff',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  upcomingSection: {
    padding: 24,
    backgroundColor: '#fff',
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '500',
  },
  bookingCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  businessName: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  status_pending: {
    backgroundColor: '#fef3c7',
  },
  status_confirmed: {
    backgroundColor: '#dcfce7',
  },
  status_completed: {
    backgroundColor: '#dbeafe',
  },
  status_cancelled: {
    backgroundColor: '#fee2e2',
  },
  status_no_show: {
    backgroundColor: '#f3f4f6',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  bookingDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
  },
  bookNowButton: {
    marginTop: 16,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  bookNowText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
