import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import api from '../services/api';

const INDUSTRIES = [
  { value: 'healthcare', label: 'Healthcare / Medical' },
  { value: 'beauty', label: 'Beauty / Salon' },
  { value: 'wellness', label: 'Wellness / Spa' },
  { value: 'fitness', label: 'Fitness / Gym' },
  { value: 'home_services', label: 'Home Services' },
  { value: 'professional_services', label: 'Professional Services' },
  { value: 'education', label: 'Education / Tutoring' },
  { value: 'other', label: 'Other' },
];

export function SignupBusinessPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
    const [formData, setFormData] = useState({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      businessName: '',
      industry: 'other',
    });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

        if (formData.password.length < 8) {
          setError('Password must be at least 8 characters');
          return;
        }

        setIsLoading(true);
    try {
            await api.signUpBusiness({
              email: formData.email,
              password: formData.password,
              password_confirmation: formData.confirmPassword,
              first_name: formData.firstName,
              last_name: formData.lastName,
              phone: formData.phone || undefined,
              business_name: formData.businessName,
              industry: formData.industry,
            });
      navigate('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Create your business account</CardTitle>
          <CardDescription>Set up your business and start accepting appointments</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

                        <div className="space-y-2">
                          <Label htmlFor="businessName">Business Name</Label>
                          <Input
                            id="businessName"
                            value={formData.businessName}
                            onChange={(e) => handleChange('businessName', e.target.value)}
                            placeholder="My Awesome Business"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="industry">Industry</Label>
              <select
                id="industry"
                value={formData.industry}
                onChange={(e) => handleChange('industry', e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                {INDUSTRIES.map((ind) => (
                  <option key={ind.value} value={ind.value}>
                    {ind.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  placeholder="John"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="At least 8 characters"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  placeholder="Confirm password"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating business account...
                </>
              ) : (
                'Create business account'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm space-y-2">
            <div>
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </div>
            <div>
              Want to book appointments instead?{' '}
              <Link to="/signup/client" className="text-primary hover:underline font-medium">
                Sign up as a client
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
