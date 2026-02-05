import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, TrendingDown, Users, Calendar, DollarSign, Clock, Download, Filter } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';

import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { LoadingState } from '../components/ui/loading-state';
import { ErrorState } from '../components/ui/error-state';
import api from '../services/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function ReportsPage() {
  const [dateRange, setDateRange] = useState('30');

  const { data: reportData, isLoading, error, refetch } = useQuery({
    queryKey: ['reports', 'dashboard', dateRange],
    queryFn: () => api.getReportsDashboard({ days: parseInt(dateRange) }),
  });

  // Extract data from API response with defaults
  const statsData = reportData?.stats || [];
  const bookingsByDay = reportData?.bookings_by_day || [];
  const bookingsByService = reportData?.bookings_by_service || [];
  const bookingsByStatus = reportData?.bookings_by_status || [];
  const revenueByMonth = reportData?.revenue_by_month || [];
  const topStaff = reportData?.top_staff || [];
  const peakHours = reportData?.peak_hours || [];
  const bookingSources = reportData?.booking_sources || [];

  // Build stats array from API data
  const stats = [
    { 
      label: 'Total Bookings', 
      value: statsData.find((s: { label: string }) => s.label === 'total_bookings')?.value || '0', 
      change: statsData.find((s: { label: string }) => s.label === 'total_bookings')?.change || '0%', 
      trend: (statsData.find((s: { label: string }) => s.label === 'total_bookings')?.change || '').startsWith('-') ? 'down' : 'up',
      icon: Calendar,
      description: 'vs last period'
    },
    { 
      label: 'Revenue', 
      value: statsData.find((s: { label: string }) => s.label === 'revenue')?.value || '$0', 
      change: statsData.find((s: { label: string }) => s.label === 'revenue')?.change || '0%', 
      trend: (statsData.find((s: { label: string }) => s.label === 'revenue')?.change || '').startsWith('-') ? 'down' : 'up',
      icon: DollarSign,
      description: 'vs last period'
    },
    { 
      label: 'New Clients', 
      value: statsData.find((s: { label: string }) => s.label === 'new_clients')?.value || '0', 
      change: statsData.find((s: { label: string }) => s.label === 'new_clients')?.change || '0%', 
      trend: (statsData.find((s: { label: string }) => s.label === 'new_clients')?.change || '').startsWith('-') ? 'down' : 'up',
      icon: Users,
      description: 'vs last period'
    },
    { 
      label: 'Avg. Booking Value', 
      value: statsData.find((s: { label: string }) => s.label === 'avg_booking_value')?.value || '$0', 
      change: statsData.find((s: { label: string }) => s.label === 'avg_booking_value')?.change || '0%', 
      trend: (statsData.find((s: { label: string }) => s.label === 'avg_booking_value')?.change || '').startsWith('-') ? 'down' : 'up',
      icon: TrendingUp,
      description: 'vs last period'
    },
    { 
      label: 'Cancellation Rate', 
      value: statsData.find((s: { label: string }) => s.label === 'cancellation_rate')?.value || '0%', 
      change: statsData.find((s: { label: string }) => s.label === 'cancellation_rate')?.change || '0%', 
      trend: (statsData.find((s: { label: string }) => s.label === 'cancellation_rate')?.change || '').startsWith('+') ? 'down' : 'up',
      icon: TrendingDown,
      description: 'vs last period'
    },
    { 
      label: 'Avg. Duration', 
      value: statsData.find((s: { label: string }) => s.label === 'avg_duration')?.value || '0 min', 
      change: statsData.find((s: { label: string }) => s.label === 'avg_duration')?.change || '0 min', 
      trend: 'up',
      icon: Clock,
      description: 'vs last period'
    },
  ];

  if (isLoading) {
    return <LoadingState message="Loading reports..." />;
  }

  if (error) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">Analytics and insights for your business</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>{stat.label}</CardDescription>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold">{stat.value}</p>
                <span className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="staff">Staff Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Bookings by Day</CardTitle>
                <CardDescription>Number of bookings per day of the week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={bookingsByDay}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="bookings" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bookings by Service</CardTitle>
                <CardDescription>Distribution of bookings across services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={bookingsByService}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {bookingsByService.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Booking Status Distribution</CardTitle>
              <CardDescription>Overview of booking outcomes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                {bookingsByStatus.map((status) => (
                  <div key={status.name} className="text-center p-4 rounded-lg bg-muted">
                    <p className="text-3xl font-bold" style={{ color: status.color }}>{status.value}</p>
                    <p className="text-sm text-muted-foreground">{status.name}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Booking Trends</CardTitle>
              <CardDescription>Daily booking volume over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={bookingsByDay}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="bookings" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Peak Hours</CardTitle>
                <CardDescription>Most popular booking times</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(peakHours.length > 0 ? peakHours : [
                    { time: 'No data', bookings: 0, percentage: 0 },
                  ]).map((slot: { time: string; bookings: number; percentage: number }) => (
                    <div key={slot.time} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{slot.time}</span>
                        <span className="font-medium">{slot.bookings} bookings</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full" 
                          style={{ width: `${slot.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Booking Sources</CardTitle>
                <CardDescription>Where bookings come from</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(bookingSources.length > 0 ? bookingSources : [
                    { source: 'No data', count: 0, percentage: 0 },
                  ]).map((item: { source: string; count: number; percentage: number }) => (
                    <div key={item.source} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-primary" />
                        <span>{item.source}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{item.count}</p>
                        <p className="text-xs text-muted-foreground">{item.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Over Time</CardTitle>
              <CardDescription>Monthly revenue trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                    <Bar dataKey="revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Service</CardTitle>
                <CardDescription>Top performing services by revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(bookingsByService.length > 0 ? bookingsByService : [
                    { name: 'No data', value: 0 },
                  ]).map((item: { name: string; value: number }) => {
                    const total = bookingsByService.reduce((sum: number, s: { value: number }) => sum + s.value, 0);
                    const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
                    return (
                      <div key={item.name} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{item.name}</span>
                          <span className="font-medium">{item.value} bookings</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Revenue breakdown by payment type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Credit Card', value: 6200 },
                          { name: 'Debit Card', value: 1500 },
                          { name: 'Cash', value: 500 },
                          { name: 'UPI', value: 250 },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name }) => name}
                      >
                        {COLORS.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `$${value}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="staff" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Staff Performance</CardTitle>
              <CardDescription>Bookings and revenue by staff member</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {topStaff.map((staff, index) => (
                  <div key={staff.name} className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{staff.name}</p>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>{staff.bookings} bookings</span>
                        <span>${staff.revenue.toLocaleString()} revenue</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">${(staff.revenue / staff.bookings).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">avg per booking</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Utilization Rate</CardTitle>
                <CardDescription>Staff booking capacity usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(topStaff.length > 0 ? topStaff : [
                    { name: 'No data', utilization: 0 },
                  ]).map((staff: { name: string; bookings?: number; utilization?: number }) => {
                    const utilization = staff.utilization || Math.min(100, (staff.bookings || 0) * 3);
                    return (
                      <div key={staff.name} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{staff.name}</span>
                          <span className="font-medium">{utilization}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full" 
                            style={{ width: `${utilization}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Client Satisfaction</CardTitle>
                <CardDescription>Average ratings by staff</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(topStaff.length > 0 ? topStaff : [
                    { name: 'No data', rating: 0, reviews: 0 },
                  ]).map((staff: { name: string; rating?: number; reviews?: number; bookings?: number }) => (
                    <div key={staff.name} className="flex items-center justify-between">
                      <span>{staff.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{staff.rating || 'N/A'}</span>
                        <span className="text-yellow-500">★</span>
                        <span className="text-sm text-muted-foreground">({staff.reviews || staff.bookings || 0})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
