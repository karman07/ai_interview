import React, { useState, useEffect } from 'react';
import { getTheme, COLORS } from '../../constants/colors';
import { EmptyState, Icons } from '../ui/EmptyState';
import { apiService } from '../../services/api';

interface PaymentsProps {
  isDarkMode?: boolean;
}

// Payment interfaces based on NestJS patterns
interface PaymentDto {
  _id: string;
  orderId: string;
  userId: string;
  userEmail: string;
  subscriptionId: string;
  subscriptionName: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
  paymentMethod: 'CARD' | 'UPI' | 'NET_BANKING' | 'WALLET';
  transactionId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateOrderDto {
  userId: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  paymentMethod: 'CARD' | 'UPI' | 'NET_BANKING' | 'WALLET';
  userEmail: string;
  notes?: Record<string, any>;
}

interface PaymentStatistics {
  totalRevenue: number;
  monthlyRevenue: number;
  totalTransactions: number;
  successRate: number;
  averageOrderValue: number;
  paymentMethodDistribution: Record<string, number>;
  monthlyGrowth: number;
}

// NestJS Payment Controller Pattern Implementation
class PaymentController {
  static async createOrder(dto: CreateOrderDto): Promise<PaymentDto> {
    try {
      console.log('Creating order:', dto);
      const response = await apiService.createPayment(dto);
      console.log('Order created successfully:', response);
      return response;
    } catch (error) {
      console.error('Create order error:', error);
      throw error;
    }
  }

  static async findAll(): Promise<PaymentDto[]> {
    try {
      console.log('Fetching all payments');
      const response = await apiService.getPayments();
      console.log('Payments fetched successfully:', response);
      return response;
    } catch (error) {
      console.error('Find all payments error:', error);
      throw error;
    }
  }

  static async findOne(id: string): Promise<PaymentDto> {
    try {
      console.log('Fetching payment by ID:', id);
      const response = await apiService.getPayment(id);
      console.log('Payment fetched successfully:', response);
      return response;
    } catch (error) {
      console.error('Find payment error:', error);
      throw error;
    }
  }

  static async updateStatus(id: string, status: PaymentDto['status'], transactionId?: string): Promise<PaymentDto> {
    try {
      console.log('Updating payment status:', id, status, transactionId);
      const response = await apiService.updatePaymentStatus(id, status, transactionId);
      console.log('Payment status updated successfully:', response);
      return response;
    } catch (error) {
      console.error('Update payment status error:', error);
      throw error;
    }
  }

  static async refund(id: string, reason?: string): Promise<PaymentDto> {
    try {
      console.log('Processing refund with reason:', reason);
      const response = await apiService.refundPayment(id, reason);
      console.log('Payment refunded successfully:', response);
      return response;
    } catch (error) {
      console.error('Refund payment error:', error);
      throw error;
    }
  }

  static async getStatistics(): Promise<PaymentStatistics> {
    try {
      console.log('Fetching payment statistics...');
      const response = await apiService.getPaymentStatistics();
      console.log('Payment statistics fetched successfully:', response);
      return response;
    } catch (error) {
      console.error('Get payment statistics error:', error);
      throw error;
    }
  }
}

// Payments component with actual API integration

const Payments: React.FC<PaymentsProps> = ({ isDarkMode = false }) => {
  const [payments, setPayments] = useState<PaymentDto[]>([]);
  const [statistics, setStatistics] = useState<PaymentStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | PaymentDto['status']>('ALL');

  const theme = getTheme(isDarkMode);
  const [filterMethod, setFilterMethod] = useState<'ALL' | PaymentDto['paymentMethod']>('ALL');
  const [selectedPayment, setSelectedPayment] = useState<PaymentDto | null>(null);

  useEffect(() => {
    fetchPayments();
    fetchStatistics();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching payments data...');
      // Log analytics: Payment dashboard viewed
      console.log('Analytics: Payment dashboard accessed at', new Date().toISOString());
      
      const paymentsRes = await PaymentController.findAll();
      
      console.log('Payments data:', paymentsRes);
      // Log analytics: Successful data fetch
      console.log('Analytics: Payment data fetched successfully', {
        count: paymentsRes?.length || 0,
        timestamp: new Date().toISOString()
      });
      
      setPayments(Array.isArray(paymentsRes) ? paymentsRes : []);
    } catch (err: any) {
      console.error('Payments API Error:', err);
      // Log analytics: API error
      console.log('Analytics: Payment API error occurred', {
        error: err.message,
        timestamp: new Date().toISOString()
      });
      setError('Failed to fetch payments data. Please check your connection and try again.');
      setPayments([]); // Start with empty array instead of mock data
      console.log('No payments data available - showing empty state');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      console.log('Fetching payment statistics...');
      // Log analytics: Statistics requested
      console.log('Analytics: Payment statistics requested at', new Date().toISOString());
      
      const statsRes = await PaymentController.getStatistics();
      
      console.log('Statistics data:', statsRes);
      // Log analytics: Statistics received
      console.log('Analytics: Payment statistics received', {
        totalRevenue: statsRes?.totalRevenue || 0,
        totalTransactions: statsRes?.totalTransactions || 0,
        timestamp: new Date().toISOString()
      });
      
      setStatistics(statsRes);
    } catch (err: any) {
      console.error('Statistics API Error:', err);
      // Log analytics: Statistics error
      console.log('Analytics: Payment statistics error', {
        error: err.message,
        timestamp: new Date().toISOString()
      });
      // Mock statistics will be handled by the controller
    }
  };

  const handleCreateOrder = async (data: CreateOrderDto) => {
    try {
      console.log('Creating order:', data);
      const newPayment = await PaymentController.createOrder(data);
      setPayments([newPayment, ...payments]);
      setShowCreateOrder(false);
      console.log('Order created:', newPayment);
    } catch (err: any) {
      console.error('❌ Create order error:', err);
      setError('Failed to create order');
    }
  };

  const handleUpdateStatus = async (id: string, status: PaymentDto['status']) => {
    try {
      console.log('Updating payment status:', id, status);
      const updatedPayment = await PaymentController.updateStatus(id, status);
      setPayments(payments.map(p => p._id === id ? updatedPayment : p));
      await fetchStatistics(); // Refresh statistics
      console.log('Payment status updated:', updatedPayment);
    } catch (err: any) {
      console.error('❌ Update payment status error:', err);
      setError('Failed to update payment status');
    }
  };

  const handleRefund = async (id: string) => {
    if (window.confirm('Are you sure you want to refund this payment?')) {
      try {
        console.log('Processing refund:', id);
        const refundedPayment = await PaymentController.refund(id);
        setPayments(payments.map(p => p._id === id ? refundedPayment : p));
        await fetchStatistics(); // Refresh statistics
        console.log('Payment refunded:', refundedPayment);
      } catch (err: any) {
        console.error('Refund payment error:', err);
        setError('Failed to process refund');
      }
    }
  };

  // Filter payments based on search and filters
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.subscriptionName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || payment.status === filterStatus;
    const matchesMethod = filterMethod === 'ALL' || payment.paymentMethod === filterMethod;
    return matchesSearch && matchesStatus && matchesMethod;
  });

  const formatCurrency = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: PaymentDto['status']) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      case 'REFUNDED': return 'bg-purple-100 text-purple-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodIcon = (method: PaymentDto['paymentMethod']) => {
    switch (method) {
      case 'CARD': return '💳';
      case 'UPI': return '📱';
      case 'NET_BANKING': return '🏦';
      case 'WALLET': return '👛';
      default: return '💰';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: COLORS.primary[600] }}></div>
      </div>
    );
  }

  // Create Order Form Component
  const CreateOrderForm: React.FC<{ 
    onSubmit: (data: CreateOrderDto) => void; 
    onCancel: () => void 
  }> = ({ onSubmit, onCancel }) => {
    const [formData, setFormData] = useState<CreateOrderDto>({
      userId: '',
      subscriptionId: '',
      amount: 0,
      currency: 'INR',
      paymentMethod: 'CARD',
      userEmail: ''
    });

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg w-full max-w-md" style={{ backgroundColor: theme.card }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>
            Create New Order
          </h3>
          <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: theme.text.secondary }}>
                  User Email
                </label>
                <input
                  type="email"
                  value={formData.userEmail}
                  onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text.primary }}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: theme.text.secondary }}>
                  User ID
                </label>
                <input
                  type="text"
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text.primary }}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: theme.text.secondary }}>
                    Subscription ID
                  </label>
                  <select
                    value={formData.subscriptionId}
                    onChange={(e) => setFormData({ ...formData, subscriptionId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text.primary }}
                    required
                  >
                    <option value="">Select Plan</option>
                    <option value="sub_basic">Basic Plan</option>
                    <option value="sub_premium">Premium Plan</option>
                    <option value="sub_enterprise">Enterprise Plan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: theme.text.secondary }}>
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text.primary }}
                    min="0"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: theme.text.secondary }}>
                  Payment Method
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentDto['paymentMethod'] })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text.primary }}
                >
                  <option value="CARD">Credit/Debit Card</option>
                  <option value="UPI">UPI</option>
                  <option value="NET_BANKING">Net Banking</option>
                  <option value="WALLET">Wallet</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors"
                style={{ borderColor: theme.border, color: theme.text.secondary }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Create Order
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: theme.text.primary }}>Payment Management</h1>
          <p className="mt-2" style={{ color: theme.text.secondary }}>
            Track and manage all payment transactions
          </p>
        </div>
        <button
          onClick={() => setShowCreateOrder(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Create Order
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg border" style={{ backgroundColor: theme.warning, borderColor: theme.border }}>
          <p style={{ color: theme.text.primary }}>{error}</p>
        </div>
      )}

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-lg shadow-sm border" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: theme.text.secondary }}>Total Revenue</p>
                <p className="text-2xl font-bold" style={{ color: theme.text.primary }}>
                  {formatCurrency(statistics.totalRevenue)}
                </p>
                <p className="text-xs mt-1" style={{ color: COLORS.green[600] }}>
                  +{statistics.monthlyGrowth}% from last month
                </p>
              </div>
              <div className="p-3 rounded-full" style={{ backgroundColor: COLORS.green[100] }}>
                <svg className="w-6 h-6" style={{ color: COLORS.green[600] }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-lg shadow-sm border" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: theme.text.secondary }}>Monthly Revenue</p>
                <p className="text-2xl font-bold" style={{ color: theme.text.primary }}>
                  {formatCurrency(statistics.monthlyRevenue)}
                </p>
              </div>
              <div className="p-3 rounded-full" style={{ backgroundColor: COLORS.blue[100] }}>
                <svg className="w-6 h-6" style={{ color: COLORS.blue[600] }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-lg shadow-sm border" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: theme.text.secondary }}>Success Rate</p>
                <p className="text-2xl font-bold" style={{ color: theme.text.primary }}>
                  {statistics.successRate.toFixed(1)}%
                </p>
                <p className="text-xs mt-1" style={{ color: theme.text.secondary }}>
                  {statistics.totalTransactions} total transactions
                </p>
              </div>
              <div className="p-3 rounded-full" style={{ backgroundColor: COLORS.purple[100] }}>
                <svg className="w-6 h-6" style={{ color: COLORS.purple[600] }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-lg shadow-sm border" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: theme.text.secondary }}>Avg Order Value</p>
                <p className="text-2xl font-bold" style={{ color: theme.text.primary }}>
                  {formatCurrency(statistics.averageOrderValue)}
                </p>
              </div>
              <div className="p-3 rounded-full" style={{ backgroundColor: COLORS.yellow[100] }}>
                <svg className="w-6 h-6" style={{ color: COLORS.yellow[600] }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by email, order ID, or subscription..."
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text.primary }}
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
          className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text.primary }}
        >
          <option value="ALL">All Status</option>
          <option value="COMPLETED">Completed</option>
          <option value="PENDING">Pending</option>
          <option value="FAILED">Failed</option>
          <option value="REFUNDED">Refunded</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <select
          value={filterMethod}
          onChange={(e) => setFilterMethod(e.target.value as typeof filterMethod)}
          className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text.primary }}
        >
          <option value="ALL">All Methods</option>
          <option value="CARD">Card</option>
          <option value="UPI">UPI</option>
          <option value="NET_BANKING">Net Banking</option>
          <option value="WALLET">Wallet</option>
        </select>
      </div>

      {/* Payments Table */}
      <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: theme.bgSecondary }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.text.secondary }}>
                  Order Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.text.secondary }}>
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.text.secondary }}>
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.text.secondary }}>
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.text.secondary }}>
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.text.secondary }}>
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.text.secondary }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4">
                    <EmptyState
                      icon={<Icons.CreditCard />}
                      title="No Payments Found"
                      description="Payment transactions will appear here once customers start purchasing your subscription plans."
                      isDarkMode={isDarkMode}
                    />
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                <tr key={payment._id} className="hover:bg-gray-50" style={{ backgroundColor: theme.card }}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium" style={{ color: theme.text.primary }}>
                        {payment.orderId}
                      </div>
                      <div className="text-sm" style={{ color: theme.text.secondary }}>
                        {payment.subscriptionName}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm" style={{ color: theme.text.primary }}>
                      {payment.userEmail}
                    </div>
                    <div className="text-sm" style={{ color: theme.text.secondary }}>
                      ID: {payment.userId}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium" style={{ color: theme.text.primary }}>
                      {formatCurrency(payment.amount, payment.currency)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="mr-2">{getPaymentMethodIcon(payment.paymentMethod)}</span>
                      <span className="text-sm" style={{ color: theme.text.primary }}>
                        {payment.paymentMethod.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm" style={{ color: theme.text.primary }}>
                      {formatDate(payment.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedPayment(payment)}
                        className="text-blue-600 hover:text-blue-900 text-sm"
                      >
                        View
                      </button>
                      {payment.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(payment._id, 'COMPLETED')}
                            className="text-green-600 hover:text-green-900 text-sm"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(payment._id, 'FAILED')}
                            className="text-red-600 hover:text-red-900 text-sm"
                          >
                            Fail
                          </button>
                        </>
                      )}
                      {payment.status === 'COMPLETED' && (
                        <button
                          onClick={() => handleRefund(payment._id)}
                          className="text-purple-600 hover:text-purple-900 text-sm"
                        >
                          Refund
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Forms and Modals */}
      {showCreateOrder && (
        <CreateOrderForm
          onSubmit={handleCreateOrder}
          onCancel={() => setShowCreateOrder(false)}
        />
      )}

      {selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: theme.card }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold" style={{ color: theme.text.primary }}>
                Payment Details
              </h3>
              <button
                onClick={() => setSelectedPayment(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium" style={{ color: theme.text.secondary }}>Order ID</label>
                  <p className="text-sm" style={{ color: theme.text.primary }}>{selectedPayment.orderId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium" style={{ color: theme.text.secondary }}>Transaction ID</label>
                  <p className="text-sm" style={{ color: theme.text.primary }}>{selectedPayment.transactionId || 'N/A'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium" style={{ color: theme.text.secondary }}>Customer Email</label>
                  <p className="text-sm" style={{ color: theme.text.primary }}>{selectedPayment.userEmail}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium" style={{ color: theme.text.secondary }}>Subscription</label>
                  <p className="text-sm" style={{ color: theme.text.primary }}>{selectedPayment.subscriptionName}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium" style={{ color: theme.text.secondary }}>Amount</label>
                  <p className="text-sm" style={{ color: theme.text.primary }}>
                    {formatCurrency(selectedPayment.amount, selectedPayment.currency)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium" style={{ color: theme.text.secondary }}>Payment Method</label>
                  <p className="text-sm" style={{ color: theme.text.primary }}>
                    {getPaymentMethodIcon(selectedPayment.paymentMethod)} {selectedPayment.paymentMethod.replace('_', ' ')}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium" style={{ color: theme.text.secondary }}>Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedPayment.status)}`}>
                    {selectedPayment.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium" style={{ color: theme.text.secondary }}>Created At</label>
                  <p className="text-sm" style={{ color: theme.text.primary }}>{formatDate(selectedPayment.createdAt)}</p>
                </div>
              </div>
              
              {selectedPayment.failureReason && (
                <div>
                  <label className="block text-sm font-medium" style={{ color: theme.text.secondary }}>Failure Reason</label>
                  <p className="text-sm text-red-600">{selectedPayment.failureReason}</p>
                </div>
              )}
              
              {selectedPayment.razorpayOrderId && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium" style={{ color: theme.text.secondary }}>Razorpay Order ID</label>
                    <p className="text-sm" style={{ color: theme.text.primary }}>{selectedPayment.razorpayOrderId}</p>
                  </div>
                  {selectedPayment.razorpayPaymentId && (
                    <div>
                      <label className="block text-sm font-medium" style={{ color: theme.text.secondary }}>Razorpay Payment ID</label>
                      <p className="text-sm" style={{ color: theme.text.primary }}>{selectedPayment.razorpayPaymentId}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;