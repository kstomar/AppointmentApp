import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { CreditCard, Search, MoreHorizontal, Eye, RefreshCw, Download, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';

import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { DataTable } from '../components/ui/data-table';
import { LoadingState } from '../components/ui/loading-state';
import { ErrorState } from '../components/ui/error-state';
import { EmptyState } from '../components/ui/empty-state';
import api from '../services/api';
import type { Payment } from '../types';

interface PaymentDisplay extends Payment {
  client_name: string;
  client_email: string;
  service_name: string;
}

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  completed: 'default',
  pending: 'secondary',
  failed: 'destructive',
  refunded: 'outline',
};

export function PaymentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<PaymentDisplay | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isRefundOpen, setIsRefundOpen] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const queryClient = useQueryClient();

  const { data: paymentsResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['payments', statusFilter !== 'all' ? statusFilter : undefined],
    queryFn: () => api.getPayments({ status: statusFilter !== 'all' ? statusFilter : undefined }),
  });

  const payments: PaymentDisplay[] = (paymentsResponse?.data || []).map((p: Payment) => ({
    ...p,
    client_name: p.booking?.client?.full_name || p.booking?.client?.first_name || 'Unknown',
    client_email: p.booking?.client?.email || '',
    service_name: p.booking?.service?.name || 'Unknown Service',
  }));

  const refundMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => api.refundPayment(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      setIsRefundOpen(false);
      setRefundReason('');
    },
  });

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch = !searchQuery || 
      payment.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.client_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.service_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const columns: ColumnDef<Payment>[] = [
    {
      accessorKey: 'created_at',
      header: 'Date',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{format(parseISO(row.original.created_at), 'MMM d, yyyy')}</p>
          <p className="text-sm text-muted-foreground">{format(parseISO(row.original.created_at), 'h:mm a')}</p>
        </div>
      ),
    },
    {
      accessorKey: 'client_name',
      header: 'Client',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.client_name}</p>
          <p className="text-sm text-muted-foreground">{row.original.client_email}</p>
        </div>
      ),
    },
    {
      accessorKey: 'service_name',
      header: 'Service',
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => (
        <p className="font-medium">{row.original.amount}</p>
      ),
    },
    {
      accessorKey: 'payment_method',
      header: 'Method',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <span className="capitalize">{row.original.card_brand || row.original.payment_method}</span>
          {row.original.card_last_four && (
            <span className="text-muted-foreground">****{row.original.card_last_four}</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={statusColors[row.original.status]}>
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
              setSelectedPayment(row.original);
              setIsDetailOpen(true);
            }}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Download className="mr-2 h-4 w-4" />
              Download Receipt
            </DropdownMenuItem>
            {row.original.status === 'completed' && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive"
                  onClick={() => {
                    setSelectedPayment(row.original);
                    setIsRefundOpen(true);
                  }}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Issue Refund
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const totalRevenue = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount_cents, 0) / 100;

  const pendingAmount = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount_cents, 0) / 100;

  const refundedAmount = payments
    .filter(p => p.status === 'refunded')
    .reduce((sum, p) => sum + p.amount_cents, 0) / 100;

  const stats = [
    { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-green-600' },
    { label: 'Pending', value: `$${pendingAmount.toFixed(2)}`, icon: TrendingUp, color: 'text-yellow-600' },
    { label: 'Refunded', value: `$${refundedAmount.toFixed(2)}`, icon: RefreshCw, color: 'text-red-600' },
    { label: 'Transactions', value: payments.length, icon: CreditCard, color: 'text-blue-600' },
  ];

  if (isLoading) {
    return <LoadingState message="Loading payments..." />;
  }

  if (error) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="text-muted-foreground">Track and manage your transactions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>{stat.label}</CardDescription>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>View all payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by client, email, or service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredPayments.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title="No payments found"
              description="Payments will appear here once clients make bookings."
            />
          ) : (
            <DataTable 
              columns={columns} 
              data={filteredPayments}
              showColumnToggle={false}
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{selectedPayment.amount}</p>
                  <Badge variant={statusColors[selectedPayment.status]} className="mt-2">
                    {selectedPayment.status}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Transaction ID</p>
                  <p className="font-mono text-sm">{selectedPayment.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Client</h4>
                  <p className="font-medium">{selectedPayment.client_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedPayment.client_email}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Service</h4>
                  <p className="font-medium">{selectedPayment.service_name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Payment Method</h4>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    <span>{selectedPayment.card_brand} ****{selectedPayment.card_last_four}</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Provider</h4>
                  <p className="font-medium capitalize">{selectedPayment.provider}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Created</h4>
                  <p className="font-medium">{format(parseISO(selectedPayment.created_at), 'MMM d, yyyy h:mm a')}</p>
                </div>
                {selectedPayment.paid_at && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Paid</h4>
                    <p className="font-medium">{format(parseISO(selectedPayment.paid_at), 'MMM d, yyyy h:mm a')}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Close
            </Button>
            {selectedPayment?.status === 'completed' && (
              <Button variant="destructive" onClick={() => {
                setIsDetailOpen(false);
                setIsRefundOpen(true);
              }}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Issue Refund
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRefundOpen} onOpenChange={setIsRefundOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Issue Refund</DialogTitle>
            <DialogDescription>
              Are you sure you want to refund this payment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{selectedPayment.client_name}</p>
                    <p className="text-sm text-muted-foreground">{selectedPayment.service_name}</p>
                  </div>
                  <p className="text-xl font-bold">{selectedPayment.amount}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Refund Policy</p>
                  <p>The refund will be processed within 5-10 business days depending on the payment provider.</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRefundOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              disabled={refundMutation.isPending}
              onClick={() => {
                if (selectedPayment) {
                  refundMutation.mutate({ id: selectedPayment.id, reason: refundReason });
                }
              }}
            >
              {refundMutation.isPending ? 'Processing...' : 'Confirm Refund'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
