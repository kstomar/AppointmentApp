import { useState } from 'react';
import { TrendingUp, TrendingDown, Users, Calendar, DollarSign, Clock, Download, Filter } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';

import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { LoadingState } from '../components/ui/loading-state';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function ReportsPage() {
  const [dateRange, setDateRange] = useState('30');
  const [isLoading] = useState(false);

  // Mock data for charts
  const bookingsByDay = [
    { date: 'Mon', bookings: 12, revenue: 420 },
    { date: 'Tue', bookings: 19, revenue: 665 },
    { date: 'Wed', bookings: 15, revenue: 525 },
    { date: 'Thu', bookings: 22, revenue: 770 },
    { date: 'Fri', bookings: 28, revenue: 980 },
    { date: 'Sat', bookings: 35, revenue: 1225 },
    { date: 'Sun', bookings: 8, revenue: 280 },
  ];

  const revenueByMonth = [
    { month: 'Sep', revenue: 4200 },
    { month: 'Oct', revenue: 5100 },
    { month: 'Nov', revenue: 4800 },
    { month: 'Dec', revenue: 6200 },
    { month: 'Jan', revenue: 5800 },
    { month: 'Feb', revenue: 3200 },
  ];

  const bookingsByService = [
    { name: 'Haircut', value: 45 },
    { name: 'Hair Coloring', value: 25 },
    { name: 'Consultation', value: 15 },
    { name: 'Group Yoga', value: 10 },
    { name: 'Other', value: 5 },
  ];

  const bookingsByStatus = [
    { name: 'Completed', value: 156, color: '#22c55e' },
    { name: 'Confirmed', value: 42, color: '#3b82f6' },
    { name: 'Cancelled', value: 18, color: '#ef4444' },
    { name: 'No Show', value: 8, color: '#f59e0b' },
  ];

  const topStaff = [
    { name: 'Sarah Johnson', bookings: 48, revenue: 2400 },
    { name: 'Mike Chen', bookings: 42, revenue: 1890 },
    { name: 'Emily Davis', bookings: 35, revenue: 875 },
    { name: 'Alex Thompson', bookings: 28, revenue: 1260 },
  ];

  const stats = [
    { 
      label: 'Total Bookings', 
      value: '224', 
      change: '+12%', 
      trend: 'up',
      icon: Calendar,
      description: 'vs last period'
    },
    { 
      label: 'Revenue', 
      value: '$8,450', 
      change: '+8%', 
      trend: 'up',
      icon: DollarSign,
      description: 'vs last period'
    },
    { 
      label: 'New Clients', 
      value: '32', 
      change: '+24%', 
      trend: 'up',
      icon: Users,
      description: 'vs last period'
    },
    { 
      label: 'Avg. Booking Value', 
      value: '$37.72', 
      change: '-3%', 
      trend: 'down',
      icon: TrendingUp,
      description: 'vs last period'
    },
    { 
      label: 'Cancellation Rate', 
      value: '8%', 
      change: '-2%', 
      trend: 'up',
      icon: TrendingDown,
      description: 'vs last period'
    },
    { 
      label: 'Avg. Duration', 
      value: '45 min', 
      change: '+5 min', 
      trend: 'up',
      icon: Clock,
      description: 'vs last period'
    },
  ];

  if (isLoading) {
    return <LoadingState message="Loading reports..." />;
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
                  {[
                    { time: '10:00 AM - 11:00 AM', bookings: 28, percentage: 85 },
                    { time: '2:00 PM - 3:00 PM', bookings: 24, percentage: 73 },
                    { time: '11:00 AM - 12:00 PM', bookings: 22, percentage: 67 },
                    { time: '4:00 PM - 5:00 PM', bookings: 18, percentage: 55 },
                    { time: '9:00 AM - 10:00 AM', bookings: 15, percentage: 45 },
                  ].map((slot) => (
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
                  {[
                    { source: 'Online Booking', count: 145, percentage: 65 },
                    { source: 'Phone', count: 45, percentage: 20 },
                    { source: 'Walk-in', count: 22, percentage: 10 },
                    { source: 'Mobile App', count: 12, percentage: 5 },
                  ].map((item) => (
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
                  {[
                    { service: 'Hair Coloring', revenue: 3600, percentage: 43 },
                    { service: 'Haircut', revenue: 2450, percentage: 29 },
                    { service: 'Group Yoga', revenue: 1250, percentage: 15 },
                    { service: 'Consultation', revenue: 750, percentage: 9 },
                    { service: 'Other', revenue: 400, percentage: 4 },
                  ].map((item) => (
                    <div key={item.service} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{item.service}</span>
                        <span className="font-medium">${item.revenue.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 rounded-full" 
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
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
                  {[
                    { name: 'Sarah Johnson', utilization: 85 },
                    { name: 'Mike Chen', utilization: 78 },
                    { name: 'Emily Davis', utilization: 65 },
                    { name: 'Alex Thompson', utilization: 52 },
                  ].map((staff) => (
                    <div key={staff.name} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{staff.name}</span>
                        <span className="font-medium">{staff.utilization}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full" 
                          style={{ width: `${staff.utilization}%` }}
                        />
                      </div>
                    </div>
                  ))}
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
                  {[
                    { name: 'Sarah Johnson', rating: 4.9, reviews: 48 },
                    { name: 'Emily Davis', rating: 4.8, reviews: 35 },
                    { name: 'Mike Chen', rating: 4.7, reviews: 42 },
                    { name: 'Alex Thompson', rating: 4.5, reviews: 28 },
                  ].map((staff) => (
                    <div key={staff.name} className="flex items-center justify-between">
                      <span>{staff.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{staff.rating}</span>
                        <span className="text-yellow-500">★</span>
                        <span className="text-sm text-muted-foreground">({staff.reviews})</span>
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
