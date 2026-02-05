import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Modal,
  ScrollView,
  Switch,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import Icon from 'react-native-vector-icons/Ionicons';
import { api } from '../services/api';
import { Service } from '../types';

interface ServiceWithStats extends Service {
  bookingsCount?: number;
  revenue?: number;
}

export function ServicesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<ServiceWithStats | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  // Mock data for now
  const mockServices: ServiceWithStats[] = [
    {
      id: '1',
      businessId: 'b1',
      name: 'Haircut',
      slug: 'haircut',
      description: 'Professional haircut service with styling',
      serviceType: 'appointment',
      durationMinutes: 30,
      bufferBeforeMinutes: 0,
      bufferAfterMinutes: 10,
      priceCents: 3500,
      currency: 'USD',
      maxAttendees: 1,
      minAttendees: 1,
      isPublic: true,
      allowOnlineBooking: true,
      requiresConfirmation: false,
      status: 'active',
      bookingsCount: 45,
      revenue: 1575,
    },
    {
      id: '2',
      businessId: 'b1',
      name: 'Hair Coloring',
      slug: 'hair-coloring',
      description: 'Full hair coloring with premium products',
      serviceType: 'appointment',
      durationMinutes: 120,
      bufferBeforeMinutes: 0,
      bufferAfterMinutes: 15,
      priceCents: 12000,
      currency: 'USD',
      maxAttendees: 1,
      minAttendees: 1,
      isPublic: true,
      allowOnlineBooking: true,
      requiresConfirmation: true,
      status: 'active',
      bookingsCount: 28,
      revenue: 3360,
    },
    {
      id: '3',
      businessId: 'b1',
      name: 'Consultation',
      slug: 'consultation',
      description: 'Free consultation for new clients',
      serviceType: 'consultation',
      durationMinutes: 15,
      bufferBeforeMinutes: 0,
      bufferAfterMinutes: 5,
      priceCents: 0,
      currency: 'USD',
      maxAttendees: 1,
      minAttendees: 1,
      isPublic: true,
      allowOnlineBooking: true,
      requiresConfirmation: false,
      status: 'active',
      bookingsCount: 12,
      revenue: 0,
    },
    {
      id: '4',
      businessId: 'b1',
      name: 'Deep Conditioning',
      slug: 'deep-conditioning',
      description: 'Intensive hair treatment for damaged hair',
      serviceType: 'appointment',
      durationMinutes: 45,
      bufferBeforeMinutes: 0,
      bufferAfterMinutes: 10,
      priceCents: 5500,
      currency: 'USD',
      maxAttendees: 1,
      minAttendees: 1,
      isPublic: true,
      allowOnlineBooking: true,
      requiresConfirmation: false,
      status: 'active',
      bookingsCount: 18,
      revenue: 990,
    },
  ];

  const {
    data: services = mockServices,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['services'],
    queryFn: () => api.getServices(),
    placeholderData: mockServices,
  });

  const filteredServices = services.filter((service: ServiceWithStats) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      service.name.toLowerCase().includes(searchLower) ||
      service.description?.toLowerCase().includes(searchLower)
    );
  });

  const handleServicePress = (service: ServiceWithStats) => {
    setSelectedService(service);
    setIsDetailModalVisible(true);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const formatPrice = (cents?: number) => {
    if (!cents || cents === 0) return 'Free';
    return `$${(cents / 100).toFixed(2)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#22c55e';
      case 'inactive':
        return '#f59e0b';
      case 'archived':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const renderServiceItem = ({ item }: { item: ServiceWithStats }) => (
    <TouchableOpacity
      style={styles.serviceCard}
      onPress={() => handleServicePress(item)}
    >
      <View style={styles.serviceHeader}>
        <View style={styles.serviceIcon}>
          <Icon name="cut-outline" size={24} color="#3b82f6" />
        </View>
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceName}>{item.name}</Text>
          <Text style={styles.serviceDescription} numberOfLines={1}>
            {item.description}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
      </View>
      <View style={styles.serviceDetails}>
        <View style={styles.detailItem}>
          <Icon name="time-outline" size={16} color="#6b7280" />
          <Text style={styles.detailText}>{formatDuration(item.durationMinutes)}</Text>
        </View>
        <View style={styles.detailItem}>
          <Icon name="pricetag-outline" size={16} color="#6b7280" />
          <Text style={styles.detailText}>{formatPrice(item.priceCents)}</Text>
        </View>
        <View style={styles.detailItem}>
          <Icon name="calendar-outline" size={16} color="#6b7280" />
          <Text style={styles.detailText}>{item.bookingsCount || 0} bookings</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="briefcase-outline" size={64} color="#d1d5db" />
      <Text style={styles.emptyTitle}>No Services Found</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery
          ? 'Try adjusting your search'
          : 'Add your first service to get started'}
      </Text>
      {!searchQuery && (
        <TouchableOpacity
          style={styles.addServiceButton}
          onPress={() => setIsAddModalVisible(true)}
        >
          <Text style={styles.addServiceButtonText}>Add Service</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Services</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsAddModalVisible(true)}
        >
          <Icon name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Icon name="search-outline" size={20} color="#6b7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search services..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9ca3af"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close-circle" size={20} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statCardValue}>{services.length}</Text>
          <Text style={styles.statCardLabel}>Total Services</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statCardValue}>
            {services.filter((s: ServiceWithStats) => s.status === 'active').length}
          </Text>
          <Text style={styles.statCardLabel}>Active</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statCardValue}>
            ${services.reduce((sum: number, s: ServiceWithStats) => sum + (s.revenue || 0), 0)}
          </Text>
          <Text style={styles.statCardLabel}>Revenue</Text>
        </View>
      </View>

      <FlatList
        data={filteredServices}
        renderItem={renderServiceItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        ListEmptyComponent={renderEmptyState}
      />

      {/* Service Detail Modal */}
      <Modal
        visible={isDetailModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsDetailModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsDetailModalVisible(false)}>
              <Icon name="close" size={24} color="#1f2937" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Service Details</Text>
            <TouchableOpacity>
              <Icon name="create-outline" size={24} color="#3b82f6" />
            </TouchableOpacity>
          </View>

          {selectedService && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.serviceDetailHeader}>
                <View style={styles.largeServiceIcon}>
                  <Icon name="cut-outline" size={32} color="#3b82f6" />
                </View>
                <Text style={styles.serviceDetailName}>{selectedService.name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedService.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(selectedService.status) }]}>
                    {selectedService.status}
                  </Text>
                </View>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.descriptionText}>
                  {selectedService.description || 'No description provided'}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Pricing & Duration</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Price</Text>
                  <Text style={styles.infoValue}>{formatPrice(selectedService.priceCents)}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Duration</Text>
                  <Text style={styles.infoValue}>{formatDuration(selectedService.durationMinutes)}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Buffer After</Text>
                  <Text style={styles.infoValue}>{selectedService.bufferAfterMinutes} min</Text>
                </View>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Settings</Text>
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Online Booking</Text>
                  <Switch
                    value={selectedService.allowOnlineBooking}
                    disabled
                    trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
                    thumbColor={selectedService.allowOnlineBooking ? '#3b82f6' : '#f4f3f4'}
                  />
                </View>
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Requires Confirmation</Text>
                  <Switch
                    value={selectedService.requiresConfirmation}
                    disabled
                    trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
                    thumbColor={selectedService.requiresConfirmation ? '#3b82f6' : '#f4f3f4'}
                  />
                </View>
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Public</Text>
                  <Switch
                    value={selectedService.isPublic}
                    disabled
                    trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
                    thumbColor={selectedService.isPublic ? '#3b82f6' : '#f4f3f4'}
                  />
                </View>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Statistics</Text>
                <View style={styles.statsGrid}>
                  <View style={styles.statsGridItem}>
                    <Text style={styles.statsGridValue}>{selectedService.bookingsCount || 0}</Text>
                    <Text style={styles.statsGridLabel}>Bookings</Text>
                  </View>
                  <View style={styles.statsGridItem}>
                    <Text style={styles.statsGridValue}>${selectedService.revenue || 0}</Text>
                    <Text style={styles.statsGridLabel}>Revenue</Text>
                  </View>
                </View>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.actionButton}>
                  <Icon name="create-outline" size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>Edit Service</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, styles.dangerButton]}>
                  <Icon name="trash-outline" size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>Delete Service</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>

      {/* Add Service Modal */}
      <Modal
        visible={isAddModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsAddModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Service</Text>
            <TouchableOpacity>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Service Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter service name"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter description"
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Duration (min)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="30"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                <Text style={styles.inputLabel}>Price ($)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  placeholderTextColor="#9ca3af"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Buffer After (min)</Text>
              <TextInput
                style={styles.input}
                placeholder="10"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.switchGroup}>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Allow Online Booking</Text>
                <Switch
                  value={true}
                  trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
                  thumbColor="#3b82f6"
                />
              </View>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Requires Confirmation</Text>
                <Switch
                  value={false}
                  trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
                  thumbColor="#f4f3f4"
                />
              </View>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Public</Text>
                <Switch
                  value={true}
                  trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
                  thumbColor="#3b82f6"
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    color: '#1f2937',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  statCardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statCardLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  serviceDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  serviceDetails: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 13,
    color: '#6b7280',
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
  addServiceButton: {
    marginTop: 24,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addServiceButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  cancelText: {
    fontSize: 16,
    color: '#6b7280',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
  },
  modalContent: {
    flex: 1,
  },
  serviceDetailHeader: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  largeServiceIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  serviceDetailName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  detailSection: {
    backgroundColor: '#fff',
    marginTop: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingLabel: {
    fontSize: 14,
    color: '#374151',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statsGridItem: {
    alignItems: 'center',
  },
  statsGridValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statsGridLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  actionButtons: {
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  dangerButton: {
    backgroundColor: '#ef4444',
  },
  inputGroup: {
    padding: 16,
    paddingBottom: 0,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  inputRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  switchGroup: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 4,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  switchLabel: {
    fontSize: 14,
    color: '#374151',
  },
});
