import { User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import type { StaffMember } from '../../types';

interface StaffSelectorProps {
  staffMembers: StaffMember[];
  selectedStaff: StaffMember | null;
  onSelect: (staff: StaffMember | null) => void;
  allowAny?: boolean;
}

export function StaffSelector({ staffMembers, selectedStaff, onSelect, allowAny = true }: StaffSelectorProps) {
  const bookableStaff = staffMembers.filter((s) => s.is_bookable);

  if (bookableStaff.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No staff members available for this service.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Select a Provider</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {allowAny && (
          <Card
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedStaff === null ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onSelect(null)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>
                    <User className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">Any Available</CardTitle>
                  <CardDescription>First available provider</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        )}
        {bookableStaff.map((staff) => (
          <Card
            key={staff.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedStaff?.id === staff.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onSelect(staff)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={staff.user.avatar_url} alt={staff.user.name} />
                  <AvatarFallback>
                    {staff.user.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{staff.user.name}</CardTitle>
                  {staff.title && <CardDescription>{staff.title}</CardDescription>}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {staff.bio && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{staff.bio}</p>
              )}
              {staff.skills.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {staff.skills.slice(0, 3).map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {staff.skills.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{staff.skills.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
