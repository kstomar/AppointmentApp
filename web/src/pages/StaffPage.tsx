import { useState } from 'react';
import { Building2, Plus, Search, MoreHorizontal, Eye, Edit, Trash2, Calendar, Mail } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';

import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { DataTable } from '../components/ui/data-table';
import { LoadingState } from '../components/ui/loading-state';
import { ErrorState } from '../components/ui/error-state';
import { EmptyState } from '../components/ui/empty-state';
import type { StaffMember } from '../types';

const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function StaffPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Mock data for staff
  const mockStaff: StaffMember[] = [
    {
      id: '1',
      business_id: '1',
      user: {
        id: 'u1',
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        avatar_url: '',
      },
      title: 'Senior Stylist',
      bio: 'Expert in hair coloring and styling with 10 years of experience.',
      status: 'active',
      role: 'staff',
      skills: ['Hair Coloring', 'Styling', 'Cutting'],
      is_bookable: true,
      accepts_new_clients: true,
      max_daily_bookings: 8,
      services: [
        { id: '1', name: 'Haircut' },
        { id: '2', name: 'Hair Coloring' },
      ],
    },
    {
      id: '2',
      business_id: '1',
      user: {
        id: 'u2',
        name: 'Mike Chen',
        email: 'mike@example.com',
        avatar_url: '',
      },
      title: 'Barber',
      bio: 'Specializing in mens cuts and beard grooming.',
      status: 'active',
      role: 'staff',
      skills: ['Mens Cuts', 'Beard Grooming', 'Shaving'],
      is_bookable: true,
      accepts_new_clients: true,
      max_daily_bookings: 10,
      services: [
        { id: '1', name: 'Haircut' },
        { id: '3', name: 'Consultation' },
      ],
    },
    {
      id: '3',
      business_id: '1',
      user: {
        id: 'u3',
        name: 'Emily Davis',
        email: 'emily@example.com',
        avatar_url: '',
      },
      title: 'Yoga Instructor',
      bio: 'Certified yoga instructor with focus on mindfulness.',
      status: 'active',
      role: 'staff',
      skills: ['Yoga', 'Meditation', 'Wellness'],
      is_bookable: true,
      accepts_new_clients: true,
      services: [
        { id: '4', name: 'Group Yoga Class' },
      ],
    },
    {
      id: '4',
      business_id: '1',
      user: {
        id: 'u4',
        name: 'Alex Thompson',
        email: 'alex@example.com',
        avatar_url: '',
      },
      title: 'Front Desk',
      bio: 'Managing appointments and customer service.',
      status: 'active',
      role: 'front_desk',
      skills: ['Customer Service', 'Scheduling'],
      is_bookable: false,
      accepts_new_clients: false,
      services: [],
    },
  ];

  const staff = mockStaff;
  const isLoading = false;
  const error = null;

  const filteredStaff = staff.filter((member) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      member.user.name.toLowerCase().includes(query) ||
      member.user.email.toLowerCase().includes(query) ||
      member.title?.toLowerCase().includes(query)
    );
  });

  const columns: ColumnDef<StaffMember>[] = [
    {
      accessorKey: 'user.name',
      header: 'Staff Member',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={row.original.user.avatar_url} />
            <AvatarFallback>
              {row.original.user.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{row.original.user.name}</p>
            <p className="text-sm text-muted-foreground">{row.original.title}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'user.email',
      header: 'Contact',
      cell: ({ row }) => (
        <div>
          <p className="text-sm">{row.original.user.email}</p>
        </div>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {row.original.role.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      accessorKey: 'services',
      header: 'Services',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.services.slice(0, 2).map((service) => (
            <Badge key={service.id} variant="secondary" className="text-xs">
              {service.name}
            </Badge>
          ))}
          {row.original.services.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{row.original.services.length - 2}
            </Badge>
          )}
        </div>
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
          {row.original.is_bookable && (
            <Badge variant="outline">Bookable</Badge>
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
              setSelectedStaff(row.original);
              setIsDetailOpen(true);
            }}>
              <Eye className="mr-2 h-4 w-4" />
              View Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              setSelectedStaff(row.original);
              setIsEditOpen(true);
            }}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Staff
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Calendar className="mr-2 h-4 w-4" />
              View Schedule
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Remove Staff
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const stats = [
    { label: 'Total Staff', value: staff.length },
    { label: 'Bookable Staff', value: staff.filter(s => s.is_bookable).length },
    { label: 'Accepting New Clients', value: staff.filter(s => s.accepts_new_clients).length },
  ];

  if (isLoading) {
    return <LoadingState message="Loading staff..." />;
  }

  if (error) {
    return <ErrorState />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Staff</h1>
          <p className="text-muted-foreground">Manage your team members</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Staff Member
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
          <CardTitle>All Staff Members</CardTitle>
          <CardDescription>View and manage your team</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search staff by name, email, or title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {filteredStaff.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="No staff members found"
              description="Add your first team member to start managing schedules."
              action={{
                label: 'Add Staff Member',
                onClick: () => setIsAddOpen(true),
              }}
            />
          ) : (
            <DataTable 
              columns={columns} 
              data={filteredStaff}
              showColumnToggle={false}
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Staff Profile</DialogTitle>
          </DialogHeader>
          {selectedStaff && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={selectedStaff.user.avatar_url} />
                  <AvatarFallback className="text-xl">
                    {selectedStaff.user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{selectedStaff.user.name}</h3>
                  <p className="text-muted-foreground">{selectedStaff.title}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      {selectedStaff.user.email}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant={selectedStaff.status === 'active' ? 'default' : 'secondary'}>
                    {selectedStaff.status}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {selectedStaff.role.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              {selectedStaff.bio && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Bio</h4>
                  <p className="text-sm">{selectedStaff.bio}</p>
                </div>
              )}

              <Tabs defaultValue="services">
                <TabsList>
                  <TabsTrigger value="services">Services</TabsTrigger>
                  <TabsTrigger value="availability">Availability</TabsTrigger>
                  <TabsTrigger value="skills">Skills</TabsTrigger>
                </TabsList>
                <TabsContent value="services" className="mt-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Assigned Services</h4>
                    {selectedStaff.services.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No services assigned</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {selectedStaff.services.map((service) => (
                          <Badge key={service.id} variant="secondary">
                            {service.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="availability" className="mt-4">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Weekly Schedule</h4>
                    <div className="grid gap-2">
                      {weekDays.map((day) => (
                        <div key={day} className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="font-medium">{day}</span>
                          <span className="text-muted-foreground">9:00 AM - 5:00 PM</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="skills" className="mt-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Skills & Expertise</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedStaff.skills.map((skill, index) => (
                        <Badge key={index} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-2xl font-bold">{selectedStaff.max_daily_bookings || '-'}</p>
                  <p className="text-sm text-muted-foreground">Max Daily Bookings</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{selectedStaff.is_bookable ? 'Yes' : 'No'}</p>
                  <p className="text-sm text-muted-foreground">Bookable</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{selectedStaff.accepts_new_clients ? 'Yes' : 'No'}</p>
                  <p className="text-sm text-muted-foreground">Accepts New Clients</p>
                </div>
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
              Edit Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddOpen || isEditOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddOpen(false);
          setIsEditOpen(false);
          setSelectedStaff(null);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditOpen ? 'Edit Staff Member' : 'Add Staff Member'}</DialogTitle>
            <DialogDescription>
              {isEditOpen ? 'Update the staff member details below.' : 'Fill in the details to add a new team member.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input 
                  placeholder="John"
                  defaultValue={selectedStaff?.user.name.split(' ')[0]}
                />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input 
                  placeholder="Doe"
                  defaultValue={selectedStaff?.user.name.split(' ')[1]}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input 
                type="email"
                placeholder="john@example.com"
                defaultValue={selectedStaff?.user.email}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input 
                  placeholder="e.g., Senior Stylist"
                  defaultValue={selectedStaff?.title}
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select defaultValue={selectedStaff?.role || 'staff'}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="business_admin">Business Admin</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="front_desk">Front Desk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea 
                placeholder="Brief description of experience and expertise..."
                defaultValue={selectedStaff?.bio}
              />
            </div>
            <div className="space-y-2">
              <Label>Max Daily Bookings</Label>
              <Input 
                type="number"
                placeholder="8"
                defaultValue={selectedStaff?.max_daily_bookings}
              />
            </div>
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Bookable</Label>
                  <p className="text-sm text-muted-foreground">Can receive bookings from clients</p>
                </div>
                <Switch defaultChecked={selectedStaff?.is_bookable ?? true} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Accepts New Clients</Label>
                  <p className="text-sm text-muted-foreground">Available for new client bookings</p>
                </div>
                <Switch defaultChecked={selectedStaff?.accepts_new_clients ?? true} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddOpen(false);
              setIsEditOpen(false);
              setSelectedStaff(null);
            }}>
              Cancel
            </Button>
            <Button>{isEditOpen ? 'Save Changes' : 'Add Staff Member'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
