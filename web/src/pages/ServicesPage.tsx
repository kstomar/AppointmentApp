import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, Plus, Search, MoreHorizontal, Eye, Edit, Trash2, DollarSign, Users } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';

import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { DataTable } from '../components/ui/data-table';
import { LoadingState } from '../components/ui/loading-state';
import { ErrorState } from '../components/ui/error-state';
import { EmptyState } from '../components/ui/empty-state';
import api from '../services/api';
import { useBusinessStore } from '../stores/businessStore';
import type { Service } from '../types';

export function ServicesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const queryClient = useQueryClient();
  const { currentBusiness, fetchBusinesses } = useBusinessStore();

  useEffect(() => {
    if (!currentBusiness) {
      fetchBusinesses();
    }
  }, [currentBusiness, fetchBusinesses]);

  const businessId = currentBusiness?.id || '';

  const { data: services = [], isLoading, error, refetch } = useQuery({
    queryKey: ['services', businessId],
    queryFn: () => api.getServices(businessId),
    enabled: !!businessId,
  });

  const deleteServiceMutation = useMutation({
    mutationFn: (serviceId: string) => api.deleteService(businessId, serviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services', businessId] });
    },
  });

  const filteredServices = services.filter((service) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      service.name.toLowerCase().includes(query) ||
      service.description?.toLowerCase().includes(query)
    );
  });

  const columns: ColumnDef<Service>[] = [
    {
      accessorKey: 'name',
      header: 'Service',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          <p className="text-sm text-muted-foreground line-clamp-1">{row.original.description}</p>
        </div>
      ),
    },
    {
      accessorKey: 'duration_minutes',
      header: 'Duration',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.duration_minutes} min</span>
        </div>
      ),
    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.original.price}</span>
        </div>
      ),
    },
    {
      accessorKey: 'max_attendees',
      header: 'Capacity',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.max_attendees === 1 ? '1 person' : `Up to ${row.original.max_attendees}`}</span>
        </div>
      ),
    },
    {
      accessorKey: 'staff_count',
      header: 'Staff',
      cell: ({ row }) => (
        <span>{row.original.staff_count} assigned</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Badge variant={row.original.status === 'active' ? 'default' : 'secondary'}>
            {row.original.status}
          </Badge>
          {row.original.is_public && (
            <Badge variant="outline">Public</Badge>
          )}
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
              setSelectedService(row.original);
              setIsDetailOpen(true);
            }}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              setSelectedService(row.original);
              setIsEditOpen(true);
            }}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Service
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive"
              onClick={() => {
                if (confirm('Are you sure you want to delete this service?')) {
                  deleteServiceMutation.mutate(row.original.id);
                }
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Service
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const stats = [
    { label: 'Total Services', value: services.length },
    { label: 'Active Services', value: services.filter(s => s.status === 'active').length },
    { label: 'Public Services', value: services.filter(s => s.is_public).length },
  ];

  if (isLoading) {
    return <LoadingState message="Loading services..." />;
  }

  if (error) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Services</h1>
          <p className="text-muted-foreground">Manage your service offerings</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Service
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
          <CardTitle>All Services</CardTitle>
          <CardDescription>View and manage your service catalog</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {filteredServices.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="No services found"
              description="Create your first service to start accepting bookings."
              action={{
                label: 'Add Service',
                onClick: () => setIsAddOpen(true),
              }}
            />
          ) : (
            <DataTable 
              columns={columns} 
              data={filteredServices}
              showColumnToggle={false}
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Service Details</DialogTitle>
          </DialogHeader>
          {selectedService && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold">{selectedService.name}</h3>
                <p className="text-muted-foreground mt-1">{selectedService.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Duration</h4>
                  <p className="font-medium">{selectedService.duration_minutes} minutes</p>
                  <p className="text-sm text-muted-foreground">
                    +{selectedService.buffer_before_minutes}min before, +{selectedService.buffer_after_minutes}min after
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Price</h4>
                  <p className="font-medium">{selectedService.price}</p>
                  {selectedService.deposit_amount && (
                    <p className="text-sm text-muted-foreground">Deposit: {selectedService.deposit_amount}</p>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Capacity</h4>
                  <p className="font-medium">
                    {selectedService.min_attendees === selectedService.max_attendees 
                      ? `${selectedService.max_attendees} person(s)`
                      : `${selectedService.min_attendees} - ${selectedService.max_attendees} people`
                    }
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Staff Assigned</h4>
                  <p className="font-medium">{selectedService.staff_count} staff members</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant={selectedService.status === 'active' ? 'default' : 'secondary'}>
                  {selectedService.status}
                </Badge>
                {selectedService.is_public && <Badge variant="outline">Public</Badge>}
                {selectedService.allow_online_booking && <Badge variant="outline">Online Booking</Badge>}
                {selectedService.requires_confirmation && <Badge variant="outline">Requires Confirmation</Badge>}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setIsDetailOpen(false);
              setIsEditOpen(true);
            }}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddOpen || isEditOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddOpen(false);
          setIsEditOpen(false);
          setSelectedService(null);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditOpen ? 'Edit Service' : 'Add New Service'}</DialogTitle>
            <DialogDescription>
              {isEditOpen ? 'Update the service details below.' : 'Fill in the details to create a new service.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="space-y-2">
              <Label>Service Name</Label>
              <Input 
                placeholder="e.g., Haircut, Consultation" 
                defaultValue={selectedService?.name}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                placeholder="Describe your service..."
                defaultValue={selectedService?.description}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Duration (minutes)</Label>
                <Input 
                  type="number" 
                  placeholder="30"
                  defaultValue={selectedService?.duration_minutes}
                />
              </div>
              <div className="space-y-2">
                <Label>Price</Label>
                <Input 
                  type="number" 
                  placeholder="0.00"
                  defaultValue={selectedService?.price_cents ? selectedService.price_cents / 100 : undefined}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Buffer Before (minutes)</Label>
                <Input 
                  type="number" 
                  placeholder="5"
                  defaultValue={selectedService?.buffer_before_minutes}
                />
              </div>
              <div className="space-y-2">
                <Label>Buffer After (minutes)</Label>
                <Input 
                  type="number" 
                  placeholder="5"
                  defaultValue={selectedService?.buffer_after_minutes}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min Attendees</Label>
                <Input 
                  type="number" 
                  placeholder="1"
                  defaultValue={selectedService?.min_attendees}
                />
              </div>
              <div className="space-y-2">
                <Label>Max Attendees</Label>
                <Input 
                  type="number" 
                  placeholder="1"
                  defaultValue={selectedService?.max_attendees}
                />
              </div>
            </div>
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Public Service</Label>
                  <p className="text-sm text-muted-foreground">Show this service on your public booking page</p>
                </div>
                <Switch defaultChecked={selectedService?.is_public ?? true} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow Online Booking</Label>
                  <p className="text-sm text-muted-foreground">Clients can book this service online</p>
                </div>
                <Switch defaultChecked={selectedService?.allow_online_booking ?? true} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Requires Confirmation</Label>
                  <p className="text-sm text-muted-foreground">Bookings need manual confirmation</p>
                </div>
                <Switch defaultChecked={selectedService?.requires_confirmation ?? false} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddOpen(false);
              setIsEditOpen(false);
              setSelectedService(null);
            }}>
              Cancel
            </Button>
            <Button>{isEditOpen ? 'Save Changes' : 'Create Service'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
