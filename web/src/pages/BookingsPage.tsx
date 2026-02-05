import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO, startOfWeek, endOfWeek, addWeeks, subWeeks, startOfMonth, endOfMonth, addMonths, subMonths, isSameDay } from 'date-fns';
import { Calendar, List, Plus, ChevronLeft, ChevronRight, Filter, Search, MoreHorizontal, Eye, X, Check, Clock, AlertTriangle } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';

import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { DataTable } from '../components/ui/data-table';
import { LoadingState } from '../components/ui/loading-state';
import { ErrorState } from '../components/ui/error-state';
import { EmptyState } from '../components/ui/empty-state';
import api from '../services/api';
import type { Booking } from '../types';

type ViewMode = 'list' | 'calendar';

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  confirmed: 'default',
  pending: 'secondary',
  completed: 'outline',
  cancelled: 'destructive',
  no_show: 'destructive',
};

const statusIcons: Record<string, React.ReactNode> = {
  confirmed: <Check className="h-3 w-3" />,
  pending: <Clock className="h-3 w-3" />,
  completed: <Check className="h-3 w-3" />,
  cancelled: <X className="h-3 w-3" />,
  no_show: <AlertTriangle className="h-3 w-3" />,
};

export function BookingsPage() {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [calendarView] = useState<'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  const getDateRange = () => {
    if (calendarView === 'week') {
      return {
        start_date: format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
        end_date: format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
      };
    }
    return {
      start_date: format(startOfMonth(currentDate), 'yyyy-MM-dd'),
      end_date: format(endOfMonth(currentDate), 'yyyy-MM-dd'),
    };
  };

  const { start_date, end_date } = getDateRange();

  const { data: bookings, isLoading, error, refetch } = useQuery({
    queryKey: ['bookings', start_date, end_date, statusFilter],
    queryFn: () => api.getBookings({ 
      start_date, 
      end_date,
      status: statusFilter !== 'all' ? statusFilter : undefined 
    }),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.cancelBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      setIsCancelDialogOpen(false);
      setSelectedBooking(null);
    },
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => api.completeBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });

  const noShowMutation = useMutation({
    mutationFn: (id: string) => api.noShowBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });

  const navigateDate = (direction: 'prev' | 'next') => {
    if (calendarView === 'week') {
      setCurrentDate(direction === 'prev' ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1));
    } else {
      setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
    }
  };

  const filteredBookings = (bookings || []).filter((booking: Booking) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      booking.client.name.toLowerCase().includes(query) ||
      booking.service.name.toLowerCase().includes(query) ||
      booking.confirmation_code.toLowerCase().includes(query)
    );
  });

  const columns: ColumnDef<Booking>[] = [
    {
      accessorKey: 'start_at',
      header: 'Date & Time',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{format(parseISO(row.original.start_at), 'MMM d, yyyy')}</p>
          <p className="text-sm text-muted-foreground">
            {format(parseISO(row.original.start_at), 'h:mm a')} - {format(parseISO(row.original.end_at), 'h:mm a')}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'client',
      header: 'Client',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.client.name}</p>
          <p className="text-sm text-muted-foreground">{row.original.client.email}</p>
        </div>
      ),
    },
    {
      accessorKey: 'service',
      header: 'Service',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.service.name}</p>
          {row.original.staff_member && (
            <p className="text-sm text-muted-foreground">with {row.original.staff_member.name}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={statusColors[row.original.status]} className="gap-1">
          {statusIcons[row.original.status]}
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: 'total_amount',
      header: 'Amount',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.total_amount || 'Free'}</p>
          <p className="text-xs text-muted-foreground">{row.original.payment_status}</p>
        </div>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => {
              setSelectedBooking(row.original);
              setIsDetailOpen(true);
            }}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {row.original.status === 'confirmed' && (
              <>
                <DropdownMenuItem onClick={() => completeMutation.mutate(row.original.id)}>
                  <Check className="mr-2 h-4 w-4" />
                  Mark Complete
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => noShowMutation.mutate(row.original.id)}>
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Mark No-Show
                </DropdownMenuItem>
              </>
            )}
            {row.original.can_cancel && (
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => {
                  setSelectedBooking(row.original);
                  setIsCancelDialogOpen(true);
                }}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel Booking
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const renderCalendarView = () => {
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      return date;
    });

    const getBookingsForDay = (date: Date) => {
      return filteredBookings.filter((booking: Booking) => 
        isSameDay(parseISO(booking.start_at), date)
      );
    };

    return (
      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-7 bg-muted">
          {weekDays.map((day, i) => (
            <div key={day} className="p-3 text-center border-r last:border-r-0">
              <p className="text-sm font-medium text-muted-foreground">{day}</p>
              <p className="text-lg font-semibold">{format(days[i], 'd')}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 min-h-[400px]">
          {days.map((date, i) => {
            const dayBookings = getBookingsForDay(date);
            const isToday = isSameDay(date, new Date());
            return (
              <div 
                key={i} 
                className={`border-r last:border-r-0 border-b p-2 ${isToday ? 'bg-primary/5' : ''}`}
              >
                <div className="space-y-1">
                  {dayBookings.slice(0, 4).map((booking: Booking) => (
                    <div
                      key={booking.id}
                      className="p-2 rounded text-xs bg-primary/10 hover:bg-primary/20 cursor-pointer transition-colors"
                      onClick={() => {
                        setSelectedBooking(booking);
                        setIsDetailOpen(true);
                      }}
                    >
                      <p className="font-medium truncate">{format(parseISO(booking.start_at), 'h:mm a')}</p>
                      <p className="truncate text-muted-foreground">{booking.client.name}</p>
                    </div>
                  ))}
                  {dayBookings.length > 4 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{dayBookings.length - 4} more
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <LoadingState message="Loading bookings..." />;
  }

  if (error) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Bookings</h1>
          <p className="text-muted-foreground">Manage your appointments and schedules</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Booking
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                <TabsList>
                  <TabsTrigger value="list" className="gap-2">
                    <List className="h-4 w-4" />
                    List
                  </TabsTrigger>
                  <TabsTrigger value="calendar" className="gap-2">
                    <Calendar className="h-4 w-4" />
                    Calendar
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => navigateDate('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[150px] text-center">
                {calendarView === 'week' 
                  ? `${format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'MMM d')} - ${format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'MMM d, yyyy')}`
                  : format(currentDate, 'MMMM yyyy')
                }
              </span>
              <Button variant="outline" size="icon" onClick={() => navigateDate('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                Today
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by client, service, or confirmation code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="no_show">No Show</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredBookings.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No bookings found"
              description="There are no bookings matching your criteria. Try adjusting your filters or create a new booking."
              action={{
                label: 'Create Booking',
                onClick: () => {},
              }}
            />
          ) : viewMode === 'list' ? (
            <DataTable 
              columns={columns} 
              data={filteredBookings}
              showColumnToggle={false}
            />
          ) : (
            renderCalendarView()
          )}
        </CardContent>
      </Card>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              Confirmation Code: {selectedBooking?.confirmation_code}
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Client</h4>
                  <p className="font-medium">{selectedBooking.client.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedBooking.client.email}</p>
                  {selectedBooking.client.phone && (
                    <p className="text-sm text-muted-foreground">{selectedBooking.client.phone}</p>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Service</h4>
                  <p className="font-medium">{selectedBooking.service.name}</p>
                  {selectedBooking.staff_member && (
                    <p className="text-sm text-muted-foreground">with {selectedBooking.staff_member.name}</p>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Date & Time</h4>
                  <p className="font-medium">{format(parseISO(selectedBooking.start_at), 'EEEE, MMMM d, yyyy')}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(parseISO(selectedBooking.start_at), 'h:mm a')} - {format(parseISO(selectedBooking.end_at), 'h:mm a')}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                  <Badge variant={statusColors[selectedBooking.status]} className="gap-1 mt-1">
                    {statusIcons[selectedBooking.status]}
                    {selectedBooking.status}
                  </Badge>
                </div>
                {selectedBooking.location && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Location</h4>
                    <p className="font-medium">{selectedBooking.location.name}</p>
                    {selectedBooking.location.address && (
                      <p className="text-sm text-muted-foreground">{selectedBooking.location.address}</p>
                    )}
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Payment</h4>
                  <p className="font-medium">{selectedBooking.total_amount || 'Free'}</p>
                  <p className="text-sm text-muted-foreground">{selectedBooking.payment_status}</p>
                </div>
              </div>
              {selectedBooking.client_notes && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Client Notes</h4>
                  <p className="text-sm mt-1 p-3 bg-muted rounded-lg">{selectedBooking.client_notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {selectedBooking?.can_cancel && (
              <Button 
                variant="destructive" 
                onClick={() => {
                  setIsDetailOpen(false);
                  setIsCancelDialogOpen(true);
                }}
              >
                Cancel Booking
              </Button>
            )}
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
              Keep Booking
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedBooking && cancelMutation.mutate(selectedBooking.id)}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Booking'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
