import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

interface StatCard {
  title: string;
  value: string;
  change: number;
  icon: string;
  color: string;
}

interface ChartData {
  label: string;
  value: number;
}

export function ReportsScreen() {
  const [dateRange, setDateRange] = useState('30');

  const stats: StatCard[] = [
    {
      title: 'Total Revenue',
      value: '$12,450',
      change: 12.5,
      icon: 'trending-up',
      color: '#22c55e',
    },
    {
      title: 'Total Bookings',
      value: '156',
      change: 8.2,
      icon: 'calendar',
      color: '#3b82f6',
    },
    {
      title: 'New Clients',
      value: '24',
      change: -3.1,
      icon: 'people',
      color: '#8b5cf6',
    },
    {
      title: 'Avg. Rating',
      value: '4.8',
      change: 2.0,
      icon: 'star',
      color: '#f59e0b',
    },
  ];

  const bookingsByDay: ChartData[] = [
    { label: 'Mon', value: 12 },
    { label: 'Tue', value: 18 },
    { label: 'Wed', value: 15 },
    { label: 'Thu', value: 22 },
    { label: 'Fri', value: 28 },
    { label: 'Sat', value: 35 },
    { label: 'Sun', value: 8 },
  ];

  const revenueByService: ChartData[] = [
    { label: 'Haircut', value: 4500 },
    { label: 'Coloring', value: 3800 },
    { label: 'Styling', value: 2200 },
    { label: 'Treatment', value: 1950 },
  ];

  const topStaff = [
    { name: 'Sarah Johnson', bookings: 45, revenue: 3150, rating: 4.9 },
    { name: 'Mike Chen', bookings: 38, revenue: 4560, rating: 4.8 },
    { name: 'Emma Wilson', bookings: 32, revenue: 2240, rating: 4.7 },
  ];

  const maxBookings = Math.max(...bookingsByDay.map((d) => d.value));
  const maxRevenue = Math.max(...revenueByService.map((d) => d.value));

  const dateRangeOptions = [
    { label: '7 Days', value: '7' },
    { label: '30 Days', value: '30' },
    { label: '90 Days', value: '90' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reports</Text>
        <TouchableOpacity style={styles.exportButton}>
          <Icon name="download-outline" size={24} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.dateRangeContainer}
        contentContainerStyle={styles.dateRangeContent}
      >
        {dateRangeOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.dateRangeChip,
              dateRange === option.value && styles.dateRangeChipActive,
            ]}
            onPress={() => setDateRange(option.value)}
          >
            <Text
              style={[
                styles.dateRangeText,
                dateRange === option.value && styles.dateRangeTextActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <View style={styles.statHeader}>
              <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                <Icon name={stat.icon} size={20} color={stat.color} />
              </View>
              <View
                style={[
                  styles.changeIndicator,
                  { backgroundColor: stat.change >= 0 ? '#dcfce7' : '#fee2e2' },
                ]}
              >
                <Icon
                  name={stat.change >= 0 ? 'arrow-up' : 'arrow-down'}
                  size={12}
                  color={stat.change >= 0 ? '#22c55e' : '#ef4444'}
                />
                <Text
                  style={[
                    styles.changeText,
                    { color: stat.change >= 0 ? '#22c55e' : '#ef4444' },
                  ]}
                >
                  {Math.abs(stat.change)}%
                </Text>
              </View>
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statTitle}>{stat.title}</Text>
          </View>
        ))}
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Bookings by Day</Text>
        <View style={styles.barChart}>
          {bookingsByDay.map((day, index) => (
            <View key={index} style={styles.barContainer}>
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: (day.value / maxBookings) * 120,
                      backgroundColor: '#3b82f6',
                    },
                  ]}
                />
              </View>
              <Text style={styles.barLabel}>{day.label}</Text>
              <Text style={styles.barValue}>{day.value}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Revenue by Service</Text>
        <View style={styles.horizontalBarChart}>
          {revenueByService.map((service, index) => (
            <View key={index} style={styles.horizontalBarContainer}>
              <View style={styles.horizontalBarHeader}>
                <Text style={styles.horizontalBarLabel}>{service.label}</Text>
                <Text style={styles.horizontalBarValue}>
                  ${service.value.toLocaleString()}
                </Text>
              </View>
              <View style={styles.horizontalBarBackground}>
                <View
                  style={[
                    styles.horizontalBar,
                    {
                      width: `${(service.value / maxRevenue) * 100}%`,
                      backgroundColor: ['#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6'][index],
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Top Performing Staff</Text>
        {topStaff.map((staff, index) => (
          <View key={index} style={styles.staffRow}>
            <View style={styles.staffRank}>
              <Text style={styles.rankText}>{index + 1}</Text>
            </View>
            <View style={styles.staffInfo}>
              <Text style={styles.staffName}>{staff.name}</Text>
              <View style={styles.staffStats}>
                <View style={styles.staffStatItem}>
                  <Icon name="calendar-outline" size={14} color="#6b7280" />
                  <Text style={styles.staffStatText}>{staff.bookings}</Text>
                </View>
                <View style={styles.staffStatItem}>
                  <Icon name="cash-outline" size={14} color="#6b7280" />
                  <Text style={styles.staffStatText}>${staff.revenue}</Text>
                </View>
                <View style={styles.staffStatItem}>
                  <Icon name="star" size={14} color="#f59e0b" />
                  <Text style={styles.staffStatText}>{staff.rating}</Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.quickInsights}>
        <Text style={styles.chartTitle}>Quick Insights</Text>
        <View style={styles.insightCard}>
          <Icon name="trending-up" size={24} color="#22c55e" />
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>Peak Hours</Text>
            <Text style={styles.insightText}>
              Most bookings occur between 2 PM - 5 PM on Saturdays
            </Text>
          </View>
        </View>
        <View style={styles.insightCard}>
          <Icon name="people" size={24} color="#3b82f6" />
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>Client Retention</Text>
            <Text style={styles.insightText}>
              78% of clients have booked more than once this month
            </Text>
          </View>
        </View>
        <View style={styles.insightCard}>
          <Icon name="star" size={24} color="#f59e0b" />
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>Top Service</Text>
            <Text style={styles.insightText}>
              Haircut is your most popular service with 45 bookings
            </Text>
          </View>
        </View>
      </View>

      <View style={{ height: 40 }} />
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
  dateRangeContainer: {
    backgroundColor: '#fff',
    maxHeight: 50,
  },
  dateRangeContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  dateRangeChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  dateRangeChipActive: {
    backgroundColor: '#3b82f6',
  },
  dateRangeText: {
    fontSize: 14,
    color: '#6b7280',
  },
  dateRangeTextActive: {
    color: '#fff',
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 8,
  },
  statCard: {
    width: (width - 40) / 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statTitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
  chartCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    height: 120,
    justifyContent: 'flex-end',
  },
  bar: {
    width: 24,
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
  },
  barValue: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },
  horizontalBarChart: {
    gap: 16,
  },
  horizontalBarContainer: {
    gap: 8,
  },
  horizontalBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  horizontalBarLabel: {
    fontSize: 14,
    color: '#374151',
  },
  horizontalBarValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  horizontalBarBackground: {
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  horizontalBar: {
    height: '100%',
    borderRadius: 4,
  },
  staffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  staffRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1f2937',
  },
  staffStats: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 16,
  },
  staffStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  staffStatText: {
    fontSize: 13,
    color: '#6b7280',
  },
  quickInsights: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 16,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 8,
    gap: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  insightText: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
});
