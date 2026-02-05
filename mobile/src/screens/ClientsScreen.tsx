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
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import Icon from 'react-native-vector-icons/Ionicons';
import { format } from 'date-fns';
import { api } from '../services/api';
import { User } from '../types';

interface Client extends User {
  total_bookings?: number;
  last_booking_at?: string;
  total_spent?: number;
  notes?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
}

export function ClientsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  const {
    data: clientsResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['clients', searchQuery],
    queryFn: () => api.getClients({ search: searchQuery || undefined }),
  });

  const clients: Client[] = clientsResponse?.data || [];

  // Client-side filtering is now done server-side via search param
  const filteredClients = clients;

  const handleClientPress = (client: Client) => {
    setSelectedClient(client);
    setIsDetailModalVisible(true);
  };

  const getInitials = (client: Client) => {
    const first = client.first_name || client.firstName || '';
    const last = client.last_name || client.lastName || '';
    return `${first[0] || ''}${last[0] || ''}`.toUpperCase();
  };

  const getFullName = (client: Client) => {
    if (client.full_name) return client.full_name;
    const first = client.first_name || client.firstName || '';
    const last = client.last_name || client.lastName || '';
    return `${first} ${last}`.trim();
  };

  const renderClientItem = ({ item }: { item: Client }) => (
    <TouchableOpacity
      style={styles.clientCard}
      onPress={() => handleClientPress(item)}
    >
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {getInitials(item)}
          </Text>
        </View>
      </View>
      <View style={styles.clientInfo}>
        <Text style={styles.clientName}>
          {getFullName(item)}
        </Text>
        <Text style={styles.clientEmail}>{item.email}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Icon name="calendar-outline" size={14} color="#6b7280" />
            <Text style={styles.statText}>{item.total_bookings || 0} bookings</Text>
          </View>
          {item.last_booking_at && (
            <View style={styles.statItem}>
              <Icon name="time-outline" size={14} color="#6b7280" />
              <Text style={styles.statText}>
                Last: {format(new Date(item.last_booking_at), 'MMM d')}
              </Text>
            </View>
          )}
        </View>
      </View>
      <Icon name="chevron-forward" size={20} color="#d1d5db" />
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="people-outline" size={64} color="#d1d5db" />
      <Text style={styles.emptyTitle}>No Clients Found</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery
          ? 'Try adjusting your search'
          : 'Your clients will appear here'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Clients</Text>
        <TouchableOpacity style={styles.addButton}>
          <Icon name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Icon name="search-outline" size={20} color="#6b7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search clients..."
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
          <Text style={styles.statCardValue}>{clients.length}</Text>
          <Text style={styles.statCardLabel}>Total Clients</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statCardValue}>
            {clients.filter((c: Client) => {
              if (!c.last_booking_at) return false;
              const lastVisit = new Date(c.last_booking_at);
              const thirtyDaysAgo = new Date();
              thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
              return lastVisit >= thirtyDaysAgo;
            }).length}
          </Text>
          <Text style={styles.statCardLabel}>Active (30d)</Text>
        </View>
      </View>

      <FlatList
        data={filteredClients}
        renderItem={renderClientItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        ListEmptyComponent={renderEmptyState}
      />

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
            <Text style={styles.modalTitle}>Client Details</Text>
            <TouchableOpacity>
              <Icon name="create-outline" size={24} color="#3b82f6" />
            </TouchableOpacity>
          </View>

          {selectedClient && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.profileSection}>
                <View style={styles.largeAvatar}>
                  <Text style={styles.largeAvatarText}>
                    {getInitials(selectedClient)}
                  </Text>
                </View>
                <Text style={styles.profileName}>
                  {getFullName(selectedClient)}
                </Text>
                <Text style={styles.profileEmail}>{selectedClient.email}</Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Contact Information</Text>
                <View style={styles.detailRow}>
                  <Icon name="mail-outline" size={20} color="#6b7280" />
                  <Text style={styles.detailText}>{selectedClient.email}</Text>
                </View>
                {selectedClient.phone && (
                  <View style={styles.detailRow}>
                    <Icon name="call-outline" size={20} color="#6b7280" />
                    <Text style={styles.detailText}>{selectedClient.phone}</Text>
                  </View>
                )}
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Statistics</Text>
                <View style={styles.statsGrid}>
                  <View style={styles.statsGridItem}>
                    <Text style={styles.statsGridValue}>
                      {selectedClient.total_bookings || 0}
                    </Text>
                    <Text style={styles.statsGridLabel}>Total Bookings</Text>
                  </View>
                  <View style={styles.statsGridItem}>
                    <Text style={styles.statsGridValue}>
                      ${selectedClient.total_spent || 0}
                    </Text>
                    <Text style={styles.statsGridLabel}>Total Spent</Text>
                  </View>
                  <View style={styles.statsGridItem}>
                    <Text style={styles.statsGridValue}>
                      {selectedClient.last_booking_at
                        ? format(new Date(selectedClient.last_booking_at), 'MMM d')
                        : 'N/A'}
                    </Text>
                    <Text style={styles.statsGridLabel}>Last Visit</Text>
                  </View>
                </View>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.actionButton}>
                  <Icon name="calendar-outline" size={20} color="#3b82f6" />
                  <Text style={styles.actionButtonText}>Book Appointment</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
                  <Icon name="chatbubble-outline" size={20} color="#6b7280" />
                  <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
                    Send Message
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
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
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statCardLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  clientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  clientEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
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
  modalContent: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  largeAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  largeAvatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  profileEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
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
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  detailText: {
    fontSize: 16,
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
    fontSize: 20,
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
  secondaryButton: {
    backgroundColor: '#f3f4f6',
  },
  secondaryButtonText: {
    color: '#374151',
  },
});
