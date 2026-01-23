import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import Icon from 'react-native-vector-icons/Ionicons';
import { format } from 'date-fns';
import { api } from '../services/api';
import { Booking } from '../types';

type TabType = 'upcoming' | 'past';

export function BookingsScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');

  const {
    data: upcomingBookings,
    isLoading: isLoadingUpcoming,
    refetch: refetchUpcoming,
  } = useQuery({
    queryKey: ['upcomingBookings'],
    queryFn: () => api.getUpcomingBookings(),
  });

  const {
    data: pastBookings,
    isLoading: isLoadingPast,
    refetch: refetchPast,
  } = useQuery({
    queryKey: ['pastBookings'],
    queryFn: () => api.getPastBookings(),
  });

  const bookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;
  const isLoading = activeTab === 'upcoming' ? isLoadingUpcoming : isLoadingPast;
  const refetch = activeTab === 'upcoming' ? refetchUpcoming : refetchPast;

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

  const renderBookingItem = ({ item }: { item: Booking }) => (
    <TouchableOpacity
      style={styles.bookingCard}
      onPress={() => navigation.navigate('BookingDetail', { bookingId: item.id })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.dateContainer}>
          <Text style={styles.dateDay}>{format(new Date(item.startAt), 'd')}</Text>
          <Text style={styles.dateMonth}>{format(new Date(item.startAt), 'MMM')}</Text>
        </View>
        <View style={styles.bookingInfo}>
          <Text style={styles.serviceName}>{item.service?.name}</Text>
          <Text style={styles.businessName}>{item.business?.name}</Text>
          <View style={styles.timeRow}>
            <Icon name="time-outline" size={14} color="#6b7280" />
            <Text style={styles.timeText}>
              {format(new Date(item.startAt), 'h:mm a')} - {format(new Date(item.endAt), 'h:mm a')}
            </Text>
          </View>
          {item.staffMember && (
            <View style={styles.staffRow}>
              <Icon name="person-outline" size={14} color="#6b7280" />
              <Text style={styles.staffText}>
                {item.staffMember.user?.firstName} {item.staffMember.user?.lastName}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          />
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
      </View>
      {item.totalAmountCents && (
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Total</Text>
          <Text style={styles.priceValue}>
            ${(item.totalAmountCents / 100).toFixed(2)}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon
        name={activeTab === 'upcoming' ? 'calendar-outline' : 'time-outline'}
        size={64}
        color="#d1d5db"
      />
      <Text style={styles.emptyTitle}>
        No {activeTab === 'upcoming' ? 'Upcoming' : 'Past'} Bookings
      </Text>
      <Text style={styles.emptySubtitle}>
        {activeTab === 'upcoming'
          ? 'Book an appointment to get started'
          : 'Your completed bookings will appear here'}
      </Text>
      {activeTab === 'upcoming' && (
        <TouchableOpacity style={styles.bookButton}>
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Bookings</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'upcoming' && styles.activeTabText,
            ]}
          >
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'past' && styles.activeTab]}
          onPress={() => setActiveTab('past')}
        >
          <Text
            style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}
          >
            Past
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={bookings}
        renderItem={renderBookingItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#3b82f6',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#3b82f6',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  dateContainer: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    minWidth: 48,
  },
  dateDay: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  dateMonth: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  bookingInfo: {
    flex: 1,
    marginLeft: 12,
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
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  timeText: {
    fontSize: 13,
    color: '#6b7280',
  },
  staffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  staffText: {
    fontSize: 13,
    color: '#6b7280',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  priceLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
  },
  bookButton: {
    marginTop: 24,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
