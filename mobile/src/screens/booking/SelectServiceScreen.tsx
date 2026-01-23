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
import { Service } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'SelectService'>;

export function SelectServiceScreen({ route, navigation }: Props) {
  const { businessSlug } = route.params;
  const { selectedBusiness, setSelectedService } = useBookingStore();

  const { data: services, isLoading } = useQuery({
    queryKey: ['services', selectedBusiness?.id],
    queryFn: () => api.getServices(selectedBusiness!.id),
    enabled: !!selectedBusiness?.id,
  });

  const handleSelectService = (service: Service) => {
    setSelectedService(service);
    navigation.navigate('SelectStaff', { businessSlug });
  };

  const renderServiceItem = ({ item }: { item: Service }) => (
    <TouchableOpacity
      style={styles.serviceCard}
      onPress={() => handleSelectService(item)}
    >
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceName}>{item.name}</Text>
        {item.description && (
          <Text style={styles.serviceDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        <View style={styles.serviceDetails}>
          <View style={styles.detailItem}>
            <Icon name="time-outline" size={14} color="#6b7280" />
            <Text style={styles.detailText}>{item.durationMinutes} min</Text>
          </View>
          {item.priceCents && (
            <View style={styles.detailItem}>
              <Icon name="card-outline" size={14} color="#6b7280" />
              <Text style={styles.detailText}>
                ${(item.priceCents / 100).toFixed(2)}
              </Text>
            </View>
          )}
        </View>
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select a Service</Text>
        <Text style={styles.subtitle}>
          Choose the service you'd like to book
        </Text>
      </View>

      <FlatList
        data={services?.filter((s) => s.isPublic && s.allowOnlineBooking)}
        renderItem={renderServiceItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="list-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>No services available</Text>
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
  listContent: {
    padding: 16,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
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
  serviceDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  serviceDetails: {
    flexDirection: 'row',
    marginTop: 8,
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
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
  },
});
