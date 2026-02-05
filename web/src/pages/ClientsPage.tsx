import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { Users, Plus, Search, Mail, Phone, Calendar, MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';

import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { DataTable } from '../components/ui/data-table';
import { LoadingState } from '../components/ui/loading-state';
import { ErrorState } from '../components/ui/error-state';
import { EmptyState } from '../components/ui/empty-state';

interface Client {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  total_bookings: number;
  last_booking_at?: string;
  total_spent?: string;
  status: string;
}

export function ClientsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Mock data for now - will be replaced with actual API call
  const mockClients: Client[] = [
    {
      id: '1',
      email: 'john.doe@example.com',
      first_name: 'John',
      last_name: 'Doe',
      full_name: 'John Doe',
      phone: '+1 234 567 8900',
      created_at: '2024-01-15T10:00:00Z',
      total_bookings: 12,
      last_booking_at: '2024-02-01T14:00:00Z',
      total_spent: '$450.00',
      status: 'active',
    },
    {
      id: '2',
      email: 'jane.smith@example.com',
      first_name: 'Jane',
      last_name: 'Smith',
      full_name: 'Jane Smith',
      phone: '+1 234 567 8901',
      created_at: '2024-01-20T10:00:00Z',
      total_bookings: 8,
      last_booking_at: '2024-01-28T11:00:00Z',
      total_spent: '$320.00',
      status: 'active',
    },
    {
      id: '3',
      email: 'bob.wilson@example.com',
      first_name: 'Bob',
      last_name: 'Wilson',
      full_name: 'Bob Wilson',
      created_at: '2024-02-01T10:00:00Z',
      total_bookings: 2,
      total_spent: '$80.00',
      status: 'active',
    },
  ];

  const { data: clients = mockClients, isLoading, error, refetch } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => mockClients, // Replace with actual API call
    enabled: false, // Disable for now since we're using mock data
  });

  const filteredClients = clients.filter((client) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      client.full_name.toLowerCase().includes(query) ||
      client.email.toLowerCase().includes(query) ||
      client.phone?.toLowerCase().includes(query)
    );
  });

  const columns: ColumnDef<Client>[] = [
    {
      accessorKey: 'full_name',
      header: 'Client',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={row.original.avatar_url} />
            <AvatarFallback>
              {row.original.first_name[0]}{row.original.last_name[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{row.original.full_name}</p>
            <p className="text-sm text-muted-foreground">{row.original.email}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => row.original.phone || '-',
    },
    {
      accessorKey: 'total_bookings',
      header: 'Bookings',
      cell: ({ row }) => (
        <div className="text-center">
          <p className="font-medium">{row.original.total_bookings}</p>
        </div>
      ),
    },
    {
      accessorKey: 'last_booking_at',
      header: 'Last Visit',
      cell: ({ row }) => (
        row.original.last_booking_at 
          ? format(parseISO(row.original.last_booking_at), 'MMM d, yyyy')
          : 'Never'
      ),
    },
    {
      accessorKey: 'total_spent',
      header: 'Total Spent',
      cell: ({ row }) => row.original.total_spent || '$0.00',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'active' ? 'default' : 'secondary'}>
          {row.original.status}
        </Badge>
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
              setSelectedClient(row.original);
              setIsDetailOpen(true);
            }}>
              <Eye className="mr-2 h-4 w-4" />
              View Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Edit Client
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Calendar className="mr-2 h-4 w-4" />
              Book Appointment
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Client
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const stats = [
    { label: 'Total Clients', value: clients.length },
    { label: 'Active This Month', value: clients.filter(c => c.last_booking_at).length },
    { label: 'New This Month', value: 2 },
  ];

  if (isLoading) {
    return <LoadingState message="Loading clients..." />;
  }

  if (error) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Clients</h1>
          <p className="text-muted-foreground">Manage your client database</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Client
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardDescription>{stat.label}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Clients</CardTitle>
          <CardDescription>View and manage your client list</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {filteredClients.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No clients found"
              description="Start building your client base by adding your first client."
              action={{
                label: 'Add Client',
                onClick: () => setIsAddOpen(true),
              }}
            />
          ) : (
            <DataTable 
              columns={columns} 
              data={filteredClients}
              showColumnToggle={false}
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Client Profile</DialogTitle>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedClient.avatar_url} />
                  <AvatarFallback className="text-lg">
                    {selectedClient.first_name[0]}{selectedClient.last_name[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedClient.full_name}</h3>
                  <p className="text-muted-foreground">Client since {format(parseISO(selectedClient.created_at), 'MMMM yyyy')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedClient.email}</span>
                </div>
                {selectedClient.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedClient.phone}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-2xl font-bold">{selectedClient.total_bookings}</p>
                    <p className="text-sm text-muted-foreground">Total Bookings</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-2xl font-bold">{selectedClient.total_spent}</p>
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-2xl font-bold">
                      {selectedClient.last_booking_at 
                        ? format(parseISO(selectedClient.last_booking_at), 'MMM d')
                        : '-'}
                    </p>
                    <p className="text-sm text-muted-foreground">Last Visit</p>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="bookings">
                <TabsList>
                  <TabsTrigger value="bookings">Booking History</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                </TabsList>
                <TabsContent value="bookings" className="mt-4">
                  <p className="text-muted-foreground text-center py-8">
                    Booking history will be displayed here.
                  </p>
                </TabsContent>
                <TabsContent value="notes" className="mt-4">
                  <p className="text-muted-foreground text-center py-8">
                    Client notes will be displayed here.
                  </p>
                </TabsContent>
              </Tabs>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Close
            </Button>
            <Button>
              <Calendar className="mr-2 h-4 w-4" />
              Book Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
            <DialogDescription>
              Enter the client's information to add them to your database.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name</label>
                <Input placeholder="John" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name</label>
                <Input placeholder="Doe" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" placeholder="john@example.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <Input type="tel" placeholder="+1 234 567 8900" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button>Add Client</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
