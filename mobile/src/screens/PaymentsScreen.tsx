import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import Icon from 'react-native-vector-icons/Ionicons';
import { format } from 'date-fns';
import { api } from '../services/api';
import { Payment } from '../types';

interface PaymentWithDetails extends Payment {
  clientName?: string;
  serviceName?: string;
  createdAt?: string;
}

export function PaymentsScreen() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<PaymentWithDetails | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  // Mock data
  const mockPayments: PaymentWithDetails[] = [
    {
      id: '1',
      bookingId: 'b1',
      amountCents: 3500,
      currency: 'USD',
      status: 'completed',
      provider: 'stripe',
      paymentType: 'full_payment',
      providerPaymentId: 'pi_123456',
      clientName: 'John Doe',
      serviceName: 'Haircut',
      createdAt: '2026-02-01T10:30:00Z',
    },
    {
      id: '2',
      bookingId: 'b2',
      amountCents: 12000,
      currency: 'USD',
      status: 'completed',
      provider: 'stripe',
      paymentType: 'full_payment',
      providerPaymentId: 'pi_123457',
      clientName: 'Jane Smith',
      serviceName: 'Hair Coloring',
      createdAt: '2026-02-01T14:00:00Z',
    },
    {
      id: '3',
      bookingId: 'b3',
      amountCents: 5500,
      currency: 'USD',
      status: 'pending',
      provider: 'stripe',
      paymentType: 'deposit',
      clientName: 'Mike Johnson',
      serviceName: 'Deep Conditioning',
      createdAt: '2026-02-02T09:00:00Z',
    },
    {
      id: '4',
      bookingId: 'b4',
      amountCents: 3500,
      currency: 'USD',
      status: 'refunded',
      provider: 'stripe',
      paymentType: 'full_payment',
      providerPaymentId: 'pi_123458',
      refundAmountCents: 3500,
      refundReason: 'Client cancelled',
      clientName: 'Sarah Williams',
      serviceName: 'Haircut',
      createdAt: '2026-01-30T16:00:00Z',
    },
    {
      id: '5',
      bookingId: 'b5',
      amountCents: 7500,
      currency: 'USD',
      status: 'failed',
      provider: 'stripe',
      paymentType: 'full_payment',
      clientName: 'David Brown',
      serviceName: 'Haircut + Styling',
      createdAt: '2026-02-02T11:30:00Z',
    },
  ];

  const {
    data: payments = mockPayments,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['payments'],
    queryFn: () => api.getPayments(),
    placeholderData: mockPayments,
  });

  const filteredPayments = payments.filter((payment: PaymentWithDetails) => {
    if (statusFilter === 'all') return true;
    return payment.status === statusFilter;
  });

  const handlePaymentPress = (payment: PaymentWithDetails) => {
    setSelectedPayment(payment);
    setIsDetailModalVisible(true);
  };

  const handleRefund = () => {
    Alert.alert(
      'Process Refund',
      'Are you sure you want to refund this payment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Refund',
          style: 'destructive',
          onPress: () => {
            // Process refund
            Alert.alert('Success', 'Refund processed successfully');
            setIsDetailModalVisible(false);
          },
        },
      ]
    );
  };

  const formatAmount = (cents: number, currency: string) => {
    const amount = cents / 100;
    if (currency === 'USD') return `$${amount.toFixed(2)}`;
    if (currency === 'INR') return `₹${amount.toFixed(2)}`;
    return `${amount.toFixed(2)} ${currency}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#22c55e';
      case 'pending':
        return '#f59e0b';
      case 'processing':
        return '#3b82f6';
      case 'failed':
        return '#ef4444';
      case 'refunded':
        return '#6b7280';
      case 'partially_refunded':
        return '#8b5cf6';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return 'checkmark-circle';
      case 'pending':
        return 'time';
      case 'processing':
        return 'sync';
      case 'failed':
        return 'close-circle';
      case 'refunded':
        return 'arrow-undo';
      default:
        return 'help-circle';
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'stripe':
        return 'card';
      case 'razorpay':
        return 'wallet';
      case 'cash':
        return 'cash';
      default:
        return 'card';
    }
  };

  const totalRevenue = payments
    .filter((p: PaymentWithDetails) => p.status === 'completed')
    .reduce((sum: number, p: PaymentWithDetails) => sum + p.amountCents, 0);

  const pendingAmount = payments
    .filter((p: PaymentWithDetails) => p.status === 'pending')
    .reduce((sum: number, p: PaymentWithDetails) => sum + p.amountCents, 0);

  const refundedAmount = payments
    .filter((p: PaymentWithDetails) => p.status === 'refunded' || p.status === 'partially_refunded')
    .reduce((sum: number, p: PaymentWithDetails) => sum + (p.refundAmountCents || 0), 0);

  const filterOptions = [
    { label: 'All', value: 'all' },
    { label: 'Completed', value: 'completed' },
    { label: 'Pending', value: 'pending' },
    { label: 'Failed', value: 'failed' },
    { label: 'Refunded', value: 'refunded' },
  ];

  const renderPaymentItem = ({ item }: { item: PaymentWithDetails }) => (
    <TouchableOpacity
      style={styles.paymentCard}
      onPress={() => handlePaymentPress(item)}
    >
      <View style={styles.paymentHeader}>
        <View style={styles.paymentIcon}>
          <Icon name={getProviderIcon(item.provider)} size={24} color="#3b82f6" />
        </View>
        <View style={styles.paymentInfo}>
          <Text style={styles.clientName}>{item.clientName}</Text>
          <Text style={styles.serviceName}>{item.serviceName}</Text>
          {item.createdAt && (
            <Text style={styles.paymentDate}>
              {format(new Date(item.createdAt), 'MMM d, yyyy h:mm a')}
            </Text>
          )}
        </View>
        <View style={styles.amountContainer}>
          <Text style={styles.amount}>{formatAmount(item.amountCents, item.currency)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Icon name={getStatusIcon(item.status)} size={12} color={getStatusColor(item.status)} />
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="card-outline" size={64} color="#d1d5db" />
      <Text style={styles.emptyTitle}>No Payments Found</Text>
      <Text style={styles.emptySubtitle}>
        {statusFilter !== 'all'
          ? 'Try changing the filter'
          : 'Payments will appear here'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Payments</Text>
        <TouchableOpacity style={styles.exportButton}>
          <Icon name="download-outline" size={24} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: '#dcfce7' }]}>
          <Icon name="trending-up" size={20} color="#22c55e" />
          <Text style={[styles.statCardValue, { color: '#22c55e' }]}>
            {formatAmount(totalRevenue, 'USD')}
          </Text>
          <Text style={styles.statCardLabel}>Revenue</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#fef3c7' }]}>
          <Icon name="time" size={20} color="#f59e0b" />
          <Text style={[styles.statCardValue, { color: '#f59e0b' }]}>
            {formatAmount(pendingAmount, 'USD')}
          </Text>
          <Text style={styles.statCardLabel}>Pending</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#f3f4f6' }]}>
          <Icon name="arrow-undo" size={20} color="#6b7280" />
          <Text style={[styles.statCardValue, { color: '#6b7280' }]}>
            {formatAmount(refundedAmount, 'USD')}
          </Text>
          <Text style={styles.statCardLabel}>Refunded</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {filterOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.filterChip,
              statusFilter === option.value && styles.filterChipActive,
            ]}
            onPress={() => setStatusFilter(option.value)}
          >
            <Text
              style={[
                styles.filterChipText,
                statusFilter === option.value && styles.filterChipTextActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredPayments}
        renderItem={renderPaymentItem}
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
            <Text style={styles.modalTitle}>Payment Details</Text>
            <View style={{ width: 24 }} />
          </View>

          {selectedPayment && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.paymentDetailHeader}>
                <View style={styles.largePaymentIcon}>
                  <Icon name={getProviderIcon(selectedPayment.provider)} size={32} color="#3b82f6" />
                </View>
                <Text style={styles.largeAmount}>
                  {formatAmount(selectedPayment.amountCents, selectedPayment.currency)}
                </Text>
                <View style={[styles.statusBadgeLarge, { backgroundColor: getStatusColor(selectedPayment.status) + '20' }]}>
                  <Icon name={getStatusIcon(selectedPayment.status)} size={16} color={getStatusColor(selectedPayment.status)} />
                  <Text style={[styles.statusTextLarge, { color: getStatusColor(selectedPayment.status) }]}>
                    {selectedPayment.status}
                  </Text>
                </View>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Transaction Details</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Client</Text>
                  <Text style={styles.detailValue}>{selectedPayment.clientName}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Service</Text>
                  <Text style={styles.detailValue}>{selectedPayment.serviceName}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Payment Type</Text>
                  <Text style={styles.detailValue}>{selectedPayment.paymentType.replace('_', ' ')}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Provider</Text>
                  <Text style={styles.detailValue}>{selectedPayment.provider}</Text>
                </View>
                {selectedPayment.createdAt && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Date</Text>
                    <Text style={styles.detailValue}>
                      {format(new Date(selectedPayment.createdAt), 'MMM d, yyyy h:mm a')}
                    </Text>
                  </View>
                )}
                {selectedPayment.providerPaymentId && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Transaction ID</Text>
                    <Text style={styles.detailValue}>{selectedPayment.providerPaymentId}</Text>
                  </View>
                )}
              </View>

              {(selectedPayment.status === 'refunded' || selectedPayment.status === 'partially_refunded') && (
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Refund Details</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Refund Amount</Text>
                    <Text style={styles.detailValue}>
                      {formatAmount(selectedPayment.refundAmountCents || 0, selectedPayment.currency)}
                    </Text>
                  </View>
                  {selectedPayment.refundReason && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Reason</Text>
                      <Text style={styles.detailValue}>{selectedPayment.refundReason}</Text>
                    </View>
                  )}
                </View>
              )}

              {selectedPayment.status === 'completed' && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity style={styles.actionButton} onPress={handleRefund}>
                    <Icon name="arrow-undo-outline" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>Process Refund</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
                    <Icon name="receipt-outline" size={20} color="#374151" />
                    <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
                      Send Receipt
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
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
  exportButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  statCardValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  statCardLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  filterContainer: {
    maxHeight: 50,
    backgroundColor: '#fff',
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#3b82f6',
  },
  filterChipText: {
    fontSize: 14,
    color: '#6b7280',
  },
  filterChipTextActive: {
    color: '#fff',
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  paymentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  serviceName: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  paymentDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
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
  paymentDetailHeader: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  largePaymentIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  largeAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  statusBadgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusTextLarge: {
    fontSize: 14,
    fontWeight: '600',
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
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    textTransform: 'capitalize',
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
