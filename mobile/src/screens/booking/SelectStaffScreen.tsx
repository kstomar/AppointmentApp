import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import Icon from 'react-native-vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { api } from '../../services/api';
import { useBookingStore } from '../../stores/bookingStore';
import { StaffMember } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'SelectStaff'>;

export function SelectStaffScreen({ route, navigation }: Props) {
  const { businessSlug } = route.params;
  const { selectedBusiness, setSelectedStaff } = useBookingStore();

  const { data: staffMembers, isLoading } = useQuery({
    queryKey: ['staffMembers', selectedBusiness?.id],
    queryFn: () => api.getStaffMembers(selectedBusiness!.id),
    enabled: !!selectedBusiness?.id,
  });

  const handleSelectStaff = (staff: StaffMember | null) => {
    setSelectedStaff(staff);
    navigation.navigate('SelectDateTime', { businessSlug });
  };

  const renderStaffItem = ({ item }: { item: StaffMember }) => (
    <TouchableOpacity
      style={styles.staffCard}
      onPress={() => handleSelectStaff(item)}
    >
      <View style={styles.avatar}>
        {item.user?.avatarUrl ? (
          <Text style={styles.avatarText}>
            {item.user?.firstName?.[0]}
            {item.user?.lastName?.[0]}
          </Text>
        ) : (
          <Text style={styles.avatarText}>
            {item.user?.firstName?.[0]}
            {item.user?.lastName?.[0]}
          </Text>
        )}
      </View>
      <View style={styles.staffInfo}>
        <Text style={styles.staffName}>
          {item.user?.firstName} {item.user?.lastName}
        </Text>
        {item.title && <Text style={styles.staffTitle}>{item.title}</Text>}
        {item.bio && (
          <Text style={styles.staffBio} numberOfLines={2}>
            {item.bio}
          </Text>
        )}
      </View>
      <Icon name="chevron-forward" size={20} color="#d1d5db" />
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const bookableStaff = staffMembers?.filter((s) => s.isBookable && s.status === 'active');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select a Staff Member</Text>
        <Text style={styles.subtitle}>
          Choose who you'd like to see, or skip to see any available
        </Text>
      </View>

      <TouchableOpacity
        style={styles.anyStaffCard}
        onPress={() => handleSelectStaff(null)}
      >
        <View style={styles.anyStaffIcon}>
          <Icon name="people" size={24} color="#3b82f6" />
        </View>
        <View style={styles.staffInfo}>
          <Text style={styles.staffName}>Any Available Staff</Text>
          <Text style={styles.staffTitle}>
            We'll match you with the first available
          </Text>
        </View>
        <Icon name="chevron-forward" size={20} color="#d1d5db" />
      </TouchableOpacity>

      <FlatList
        data={bookableStaff}
        renderItem={renderStaffItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="person-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>No staff members available</Text>
          </View>
        }
      />
    </View>
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
  anyStaffCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    margin: 16,
    marginBottom: 0,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  anyStaffIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  staffCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  staffInfo: {
    flex: 1,
    marginLeft: 12,
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
  staffBio: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 4,
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
});
