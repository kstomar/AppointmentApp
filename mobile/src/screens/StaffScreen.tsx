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
import { StaffMember, User } from '../types';

interface StaffWithDetails extends StaffMember {
  user: User;
  servicesCount?: number;
  bookingsThisMonth?: number;
  rating?: number;
}

export function StaffScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStaff, setSelectedStaff] = useState<StaffWithDetails | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  // Mock data
  const mockStaff: StaffWithDetails[] = [
    {
      id: '1',
      businessId: 'b1',
      userId: 'u1',
      title: 'Senior Stylist',
      bio: 'Experienced stylist with 10+ years in the industry',
      status: 'active',
      role: 'provider',
      isBookable: true,
      acceptsNewClients: true,
      maxDailyBookings: 8,
      user: {
        id: 'u1',
        email: 'sarah@example.com',
        firstName: 'Sarah',
        lastName: 'Johnson',
        phone: '+1 234 567 8900',
        role: 'staff',
      },
      servicesCount: 5,
      bookingsThisMonth: 45,
      rating: 4.8,
    },
    {
      id: '2',
      businessId: 'b1',
      userId: 'u2',
      title: 'Colorist',
      bio: 'Specializing in balayage and color corrections',
      status: 'active',
      role: 'provider',
      isBookable: true,
      acceptsNewClients: true,
      maxDailyBookings: 6,
      user: {
        id: 'u2',
        email: 'mike@example.com',
        firstName: 'Mike',
        lastName: 'Chen',
        phone: '+1 234 567 8901',
        role: 'staff',
      },
      servicesCount: 3,
      bookingsThisMonth: 32,
      rating: 4.9,
    },
    {
      id: '3',
      businessId: 'b1',
      userId: 'u3',
      title: 'Junior Stylist',
      bio: 'Passionate about modern cuts and styles',
      status: 'active',
      role: 'assistant',
      isBookable: true,
      acceptsNewClients: true,
      maxDailyBookings: 10,
      user: {
        id: 'u3',
        email: 'emma@example.com',
        firstName: 'Emma',
        lastName: 'Wilson',
        phone: '+1 234 567 8902',
        role: 'staff',
      },
      servicesCount: 4,
      bookingsThisMonth: 28,
      rating: 4.6,
    },
    {
      id: '4',
      businessId: 'b1',
      userId: 'u4',
      title: 'Manager',
      bio: 'Managing operations and client relations',
      status: 'active',
      role: 'manager',
      isBookable: false,
      acceptsNewClients: false,
      user: {
        id: 'u4',
        email: 'david@example.com',
        firstName: 'David',
        lastName: 'Brown',
        phone: '+1 234 567 8903',
        role: 'staff',
      },
      servicesCount: 0,
      bookingsThisMonth: 0,
    },
  ];

  const {
    data: staff = mockStaff,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['staff'],
    queryFn: () => api.getStaff(),
    placeholderData: mockStaff,
  });

  const filteredStaff = staff.filter((member: StaffWithDetails) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      member.user.firstName.toLowerCase().includes(searchLower) ||
      member.user.lastName.toLowerCase().includes(searchLower) ||
      member.title?.toLowerCase().includes(searchLower) ||
      member.role.toLowerCase().includes(searchLower)
    );
  });

  const handleStaffPress = (member: StaffWithDetails) => {
    setSelectedStaff(member);
    setIsDetailModalVisible(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#22c55e';
      case 'inactive':
        return '#f59e0b';
      case 'on_leave':
        return '#3b82f6';
      case 'terminated':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return '#8b5cf6';
      case 'manager':
        return '#3b82f6';
      case 'provider':
        return '#22c55e';
      case 'assistant':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const renderStaffItem = ({ item }: { item: StaffWithDetails }) => (
    <TouchableOpacity
      style={styles.staffCard}
      onPress={() => handleStaffPress(item)}
    >
      <View style={styles.staffHeader}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.user.firstName[0]}{item.user.lastName[0]}
            </Text>
          </View>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(item.status) }]} />
        </View>
        <View style={styles.staffInfo}>
          <Text style={styles.staffName}>
            {item.user.firstName} {item.user.lastName}
          </Text>
          <Text style={styles.staffTitle}>{item.title}</Text>
          <View style={styles.badgeRow}>
            <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.role) + '20' }]}>
              <Text style={[styles.roleText, { color: getRoleColor(item.role) }]}>
                {item.role}
              </Text>
            </View>
            {item.isBookable && (
              <View style={styles.bookableBadge}>
                <Icon name="calendar-outline" size={12} color="#22c55e" />
                <Text style={styles.bookableText}>Bookable</Text>
              </View>
            )}
          </View>
        </View>
        <Icon name="chevron-forward" size={20} color="#d1d5db" />
      </View>
      <View style={styles.staffStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.servicesCount || 0}</Text>
          <Text style={styles.statLabel}>Services</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.bookingsThisMonth || 0}</Text>
          <Text style={styles.statLabel}>Bookings</Text>
        </View>
        {item.rating && (
          <View style={styles.statItem}>
            <View style={styles.ratingContainer}>
              <Icon name="star" size={14} color="#f59e0b" />
              <Text style={styles.statValue}>{item.rating}</Text>
            </View>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="people-outline" size={64} color="#d1d5db" />
      <Text style={styles.emptyTitle}>No Staff Found</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery
          ? 'Try adjusting your search'
          : 'Add your first staff member to get started'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Staff</Text>
        <TouchableOpacity style={styles.addButton}>
          <Icon name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Icon name="search-outline" size={20} color="#6b7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search staff..."
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
          <Text style={styles.statCardValue}>{staff.length}</Text>
          <Text style={styles.statCardLabel}>Total Staff</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statCardValue}>
            {staff.filter((s: StaffWithDetails) => s.status === 'active').length}
          </Text>
          <Text style={styles.statCardLabel}>Active</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statCardValue}>
            {staff.filter((s: StaffWithDetails) => s.isBookable).length}
          </Text>
          <Text style={styles.statCardLabel}>Bookable</Text>
        </View>
      </View>

      <FlatList
        data={filteredStaff}
        renderItem={renderStaffItem}
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
            <Text style={styles.modalTitle}>Staff Details</Text>
            <TouchableOpacity>
              <Icon name="create-outline" size={24} color="#3b82f6" />
            </TouchableOpacity>
          </View>

          {selectedStaff && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.profileSection}>
                <View style={styles.largeAvatar}>
                  <Text style={styles.largeAvatarText}>
                    {selectedStaff.user.firstName[0]}{selectedStaff.user.lastName[0]}
                  </Text>
                </View>
                <Text style={styles.profileName}>
                  {selectedStaff.user.firstName} {selectedStaff.user.lastName}
                </Text>
                <Text style={styles.profileTitle}>{selectedStaff.title}</Text>
                <View style={styles.profileBadges}>
                  <View style={[styles.roleBadge, { backgroundColor: getRoleColor(selectedStaff.role) + '20' }]}>
                    <Text style={[styles.roleText, { color: getRoleColor(selectedStaff.role) }]}>
                      {selectedStaff.role}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedStaff.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(selectedStaff.status) }]}>
                      {selectedStaff.status}
                    </Text>
                  </View>
                </View>
              </View>

              {selectedStaff.bio && (
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Bio</Text>
                  <Text style={styles.bioText}>{selectedStaff.bio}</Text>
                </View>
              )}

              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Contact Information</Text>
                <View style={styles.infoRow}>
                  <Icon name="mail-outline" size={20} color="#6b7280" />
                  <Text style={styles.infoText}>{selectedStaff.user.email}</Text>
                </View>
                {selectedStaff.user.phone && (
                  <View style={styles.infoRow}>
                    <Icon name="call-outline" size={20} color="#6b7280" />
                    <Text style={styles.infoText}>{selectedStaff.user.phone}</Text>
                  </View>
                )}
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Settings</Text>
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Bookable</Text>
                  <Switch
                    value={selectedStaff.isBookable}
                    disabled
                    trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
                    thumbColor={selectedStaff.isBookable ? '#3b82f6' : '#f4f3f4'}
                  />
                </View>
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Accepts New Clients</Text>
                  <Switch
                    value={selectedStaff.acceptsNewClients}
                    disabled
                    trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
                    thumbColor={selectedStaff.acceptsNewClients ? '#3b82f6' : '#f4f3f4'}
                  />
                </View>
                {selectedStaff.maxDailyBookings && (
                  <View style={styles.infoRowBetween}>
                    <Text style={styles.settingLabel}>Max Daily Bookings</Text>
                    <Text style={styles.settingValue}>{selectedStaff.maxDailyBookings}</Text>
                  </View>
                )}
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Performance</Text>
                <View style={styles.statsGrid}>
                  <View style={styles.statsGridItem}>
                    <Text style={styles.statsGridValue}>{selectedStaff.servicesCount || 0}</Text>
                    <Text style={styles.statsGridLabel}>Services</Text>
                  </View>
                  <View style={styles.statsGridItem}>
                    <Text style={styles.statsGridValue}>{selectedStaff.bookingsThisMonth || 0}</Text>
                    <Text style={styles.statsGridLabel}>This Month</Text>
                  </View>
                  {selectedStaff.rating && (
                    <View style={styles.statsGridItem}>
                      <View style={styles.ratingDisplay}>
                        <Icon name="star" size={16} color="#f59e0b" />
                        <Text style={styles.statsGridValue}>{selectedStaff.rating}</Text>
                      </View>
                      <Text style={styles.statsGridLabel}>Rating</Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.actionButton}>
                  <Icon name="calendar-outline" size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>View Schedule</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
                  <Icon name="time-outline" size={20} color="#374151" />
                  <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
                    Edit Availability
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
  staffCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  staffHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#fff',
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  staffTitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  bookableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#dcfce7',
    borderRadius: 4,
  },
  bookableText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#22c55e',
  },
  staffStats: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
  profileTitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  profileBadges: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
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
  bioText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
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
  settingValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  infoRowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
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
  ratingDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
