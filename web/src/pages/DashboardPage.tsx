import { useQuery } from '@tanstack/react-query';
import { format, parseISO, startOfDay, endOfDay, addDays } from 'date-fns';
import { Calendar, Clock, Users, DollarSign, TrendingUp, Bell } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import api from '../services/api';
import { useAuthStore } from '../stores/authStore';
import type { Booking } from '../types';

export function DashboardPage() {
  const { user } = useAuthStore();

  const today = new Date();
  const startDate = format(startOfDay(today), 'yyyy-MM-dd');
  const endDate = format(endOfDay(addDays(today, 7)), 'yyyy-MM-dd');

  const { data: bookingsData } = useQuery({
    queryKey: ['bookings', 'upcoming', startDate, endDate],
    queryFn: () => api.getBookings({ start_date: startDate, end_date: endDate }),
  });

  const { data: notificationsData } = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: () => api.getUnreadCount(),
  });

  const bookings = bookingsData?.data || [];
  const unreadCount = notificationsData?.data?.count || 0;

  const todayBookings = bookings.filter((b: Booking) =>
    format(parseISO(b.start_at), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
  );

  const upcomingBookings = bookings
    .filter((b: Booking) => parseISO(b.start_at) > today)
    .slice(0, 5);

  const stats = [
    {
      title: "Today's Appointments",
      value: todayBookings.length,
      icon: Calendar,
      description: 'Scheduled for today',
    },
    {
      title: 'This Week',
      value: bookings.length,
      icon: Clock,
      description: 'Next 7 days',
    },
    {
      title: 'Pending Confirmations',
      value: bookings.filter((b: Booking) => b.status === 'pending').length,
      icon: Users,
      description: 'Awaiting confirmation',
    },
    {
      title: 'Unread Notifications',
      value: unreadCount,
      icon: Bell,
      description: 'New updates',
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      confirmed: 'default',
      pending: 'secondary',
      completed: 'outline',
      cancelled: 'destructive',
      no_show: 'destructive',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {user?.first_name}!</h1>
        <p className="text-muted-foreground">
          Here's what's happening with your appointments today.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
            <CardDescription>
              {format(today, 'EEEE, MMMM d, yyyy')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {todayBookings.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No appointments scheduled for today.
              </p>
            ) : (
              <div className="space-y-4">
                {todayBookings.map((booking: Booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-center min-w-[60px]">
                        <p className="text-sm font-medium">
                          {format(parseISO(booking.start_at), 'h:mm a')}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">{booking.client.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {booking.service.name}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>Next 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingBookings.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No upcoming appointments.
              </p>
            ) : (
              <div className="space-y-4">
                {upcomingBookings.map((booking: Booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{booking.client.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {booking.service.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(parseISO(booking.start_at), 'EEE, MMM d')} at{' '}
                        {format(parseISO(booking.start_at), 'h:mm a')}
                      </p>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                ))}
              </div>
            )}
            <Button variant="outline" className="w-full mt-4">
              View All Appointments
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
              <Calendar className="h-6 w-6" />
              <span>New Booking</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
              <Users className="h-6 w-6" />
              <span>Manage Staff</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
              <Clock className="h-6 w-6" />
              <span>Set Availability</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
              <TrendingUp className="h-6 w-6" />
              <span>View Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
