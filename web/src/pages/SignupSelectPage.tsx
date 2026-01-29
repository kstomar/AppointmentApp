import { Link } from 'react-router-dom';
import { Building2, User, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export function SignupSelectPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Create your account</h1>
          <p className="text-muted-foreground mt-2">Choose how you want to use our platform</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Link to="/signup/business" className="block">
            <Card className="h-full hover:border-primary transition-colors cursor-pointer">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-4 rounded-full bg-blue-100">
                    <Building2 className="h-10 w-10 text-blue-600" />
                  </div>
                </div>
                <CardTitle>I'm a Business Owner</CardTitle>
                <CardDescription>
                  Create your business profile and start accepting appointments from clients
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Get your own booking page
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Manage services and staff
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Accept payments online
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Send automated reminders
                  </li>
                </ul>
              </CardContent>
            </Card>
          </Link>

          <Link to="/signup/client" className="block">
            <Card className="h-full hover:border-primary transition-colors cursor-pointer">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-4 rounded-full bg-green-100">
                    <User className="h-10 w-10 text-green-600" />
                  </div>
                </div>
                <CardTitle>I'm a Client</CardTitle>
                <CardDescription>
                  Create an account to book appointments with businesses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Book appointments easily
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Manage your bookings
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Get appointment reminders
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    View booking history
                  </li>
                </ul>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="mt-8 text-center text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
