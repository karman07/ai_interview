import React, { useState, useEffect } from 'react';
import { apiService, Subscription } from '../../services/api';
import { getTheme, COLORS } from '../../constants/colors';
import { EmptyState, Icons } from '../ui/EmptyState';

interface SubscriptionsProps {
  isDarkMode?: boolean;
}

interface CreateSubscriptionDto {
  name: string;
  displayName: string;
  description: string;
  price: number;
  type: 'MONTHLY' | 'YEARLY';
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  features: Array<{
    name: string;
    description?: string;
    included: boolean;
  }>;
  popularBadge?: boolean;
}

interface UpdateSubscriptionDto {
  displayName?: string;
  description?: string;
  price?: number;
  status?: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  features?: Array<{
    name: string;
    description?: string;
    included: boolean;
  }>;
  popularBadge?: boolean;
}

// NestJS Controller Pattern Implementation
class SubscriptionController {
  static async create(dto: CreateSubscriptionDto): Promise<Subscription> {
    try {
      // Transform the form data to match API service expectations
      const apiDto = {
        ...dto,
        features: dto.features.map(f => ({
          name: f.name,
          description: f.description || '',
          type: 'BOOLEAN' as const,
          value: f.included,
          enabled: f.included
        }))
      };
      return await apiService.createSubscription(apiDto);
    } catch (error) {
      console.error('Create subscription error:', error);
      throw error;
    }
  }

  static async findAll(): Promise<Subscription[]> {
    try {
      return await apiService.getSubscriptions();
    } catch (error) {
      console.error('Find all subscriptions error:', error);
      throw error;
    }
  }

  static async findOne(id: string): Promise<Subscription> {
    try {
      return await apiService.getSubscription(id);
    } catch (error) {
      console.error('Find subscription error:', error);
      throw error;
    }
  }

  static async update(id: string, dto: UpdateSubscriptionDto): Promise<Subscription> {
    try {
      // Transform the form data to match API service expectations
      const apiDto = {
        ...dto,
        features: dto.features?.map(f => ({
          name: f.name,
          description: f.description || '',
          type: 'BOOLEAN' as const,
          value: f.included,
          enabled: f.included
        }))
      };
      return await apiService.updateSubscription(id, apiDto);
    } catch (error) {
      console.error('Update subscription error:', error);
      throw error;
    }
  }

  static async remove(id: string): Promise<void> {
    try {
      await apiService.deleteSubscription(id);
    } catch (error) {
      console.error('Delete subscription error:', error);
      throw error;
    }
  }

  static async toggleStatus(id: string): Promise<Subscription> {
    try {
      const subscription = await this.findOne(id);
      const newStatus = subscription.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      return await this.update(id, { status: newStatus });
    } catch (error) {
      console.error('Toggle subscription status error:', error);
      throw error;
    }
  }
}

const Subscriptions: React.FC<SubscriptionsProps> = ({ isDarkMode = false }) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'>('ALL');

  const theme = getTheme(isDarkMode);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching subscriptions data...');
      
      const subscriptionsRes = await SubscriptionController.findAll();
      
      console.log('💰 Subscriptions data:', subscriptionsRes);
      
      setSubscriptions(Array.isArray(subscriptionsRes) ? subscriptionsRes : []);
    } catch (err: any) {
      console.error('❌ Subscriptions API Error:', err);
      setError('Failed to fetch subscriptions data. Using mock data for demonstration.');
      
      // Mock data for demonstration
      const mockSubscriptions: Subscription[] = [
        {
          _id: '1',
          name: 'basic-plan',
          displayName: 'Basic Plan',
          description: 'Perfect for individual learners starting their journey',
          price: 299,
          currency: 'INR',
          type: 'MONTHLY',
          status: 'ACTIVE',
          features: [
            { name: 'Access to 50+ courses', description: 'Basic course access', type: 'BOOLEAN', value: true, enabled: true },
            { name: 'Basic progress tracking', description: 'Track your progress', type: 'BOOLEAN', value: true, enabled: true },
            { name: 'Email support', description: 'Email-based support', type: 'BOOLEAN', value: true, enabled: true },
            { name: 'Download certificates', description: 'Certificate downloads', type: 'BOOLEAN', value: false, enabled: false },
            { name: 'Priority support', description: 'Priority customer support', type: 'BOOLEAN', value: false, enabled: false }
          ],
          popularBadge: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: '2',
          name: 'premium-plan',
          displayName: 'Premium Plan',
          description: 'Best value for serious learners with advanced features',
          price: 599,
          currency: 'INR',
          type: 'MONTHLY',
          status: 'ACTIVE',
          features: [
            { name: 'Access to all 200+ courses', description: 'Full course library access', type: 'BOOLEAN', value: true, enabled: true },
            { name: 'Advanced progress tracking', description: 'Detailed analytics', type: 'BOOLEAN', value: true, enabled: true },
            { name: 'Priority email & chat support', description: 'Fast support response', type: 'BOOLEAN', value: true, enabled: true },
            { name: 'Download certificates', description: 'Certificate downloads', type: 'BOOLEAN', value: true, enabled: true },
            { name: 'Offline course downloads', description: 'Download for offline viewing', type: 'BOOLEAN', value: true, enabled: true },
            { name: 'Live webinars access', description: 'Join live sessions', type: 'BOOLEAN', value: true, enabled: true },
            { name: '1-on-1 mentoring sessions', description: 'Personal mentoring', type: 'BOOLEAN', value: false, enabled: false }
          ],
          popularBadge: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: '3',
          name: 'enterprise-plan',
          displayName: 'Enterprise Plan',
          description: 'Complete solution for teams and organizations',
          price: 999,
          currency: 'INR',
          type: 'MONTHLY',
          status: 'INACTIVE',
          features: [
            { name: 'Unlimited course access', description: 'All courses included', type: 'BOOLEAN', value: true, enabled: true },
            { name: 'Team management dashboard', description: 'Manage team members', type: 'BOOLEAN', value: true, enabled: true },
            { name: 'Custom learning paths', description: 'Create custom paths', type: 'BOOLEAN', value: true, enabled: true },
            { name: 'Advanced analytics', description: 'Detailed team analytics', type: 'BOOLEAN', value: true, enabled: true },
            { name: 'Dedicated account manager', description: 'Personal account support', type: 'BOOLEAN', value: true, enabled: true },
            { name: '1-on-1 mentoring sessions', description: 'Personal mentoring', type: 'BOOLEAN', value: true, enabled: true },
            { name: 'Custom branding', description: 'White-label branding', type: 'BOOLEAN', value: true, enabled: true }
          ],
          popularBadge: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      setSubscriptions(mockSubscriptions);
      console.log('📝 Using mock subscriptions data:', mockSubscriptions);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubscription = async (data: CreateSubscriptionDto) => {
    try {
      console.log('➕ Creating subscription:', data);
      const newSubscription = await SubscriptionController.create(data);
      setSubscriptions([...subscriptions, newSubscription]);
      setShowForm(false);
      console.log('✅ Subscription created:', newSubscription);
    } catch (err: any) {
      console.error('❌ Create subscription error:', err);
      setError('Failed to create subscription');
    }
  };

  const handleUpdateSubscription = async (id: string, data: UpdateSubscriptionDto) => {
    try {
      console.log('✏️ Updating subscription:', id, data);
      const updatedSubscription = await SubscriptionController.update(id, data);
      setSubscriptions(subscriptions.map(s => s._id === id ? updatedSubscription : s));
      setEditingSubscription(null);
      console.log('✅ Subscription updated:', updatedSubscription);
    } catch (err: any) {
      console.error('❌ Update subscription error:', err);
      setError('Failed to update subscription');
    }
  };

  const handleDeleteSubscription = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this subscription plan?')) {
      try {
        console.log('🗑️ Deleting subscription:', id);
        await SubscriptionController.remove(id);
        setSubscriptions(subscriptions.filter(s => s._id !== id));
        console.log('✅ Subscription deleted');
      } catch (err: any) {
        console.error('❌ Delete subscription error:', err);
        setError('Failed to delete subscription');
      }
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      console.log('🔄 Toggling subscription status:', id);
      const updatedSubscription = await SubscriptionController.toggleStatus(id);
      setSubscriptions(subscriptions.map(s => s._id === id ? updatedSubscription : s));
      console.log('✅ Subscription status toggled:', updatedSubscription);
    } catch (err: any) {
      console.error('❌ Toggle subscription status error:', err);
      setError('Failed to toggle subscription status');
    }
  };

  // Filter subscriptions based on search and status
  const filteredSubscriptions = subscriptions.filter(subscription => {
    const matchesSearch = subscription.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subscription.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || subscription.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: COLORS.primary[600] }}></div>
      </div>
    );
  }

  // Subscription Form Component
  const SubscriptionForm: React.FC<{ 
    subscription?: Subscription; 
    onSubmit: (data: CreateSubscriptionDto) => void; 
    onCancel: () => void 
  }> = ({ subscription, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
      name: subscription?.name || '',
      displayName: subscription?.displayName || '',
      description: subscription?.description || '',
      price: subscription?.price || 0,
      currency: subscription?.currency || 'INR',
      type: ((subscription?.type === 'FREE' || subscription?.type === 'LIFETIME') ? 'MONTHLY' : subscription?.type) || 'MONTHLY',
      status: subscription?.status || 'ACTIVE',
      features: subscription?.features?.map(f => ({
        name: f.name,
        description: f.description,
        included: f.enabled || false
      })) || [
        { name: '', description: '', included: true }
      ],
      popularBadge: subscription?.popularBadge || false
    });

    const addFeature = () => {
      setFormData({
        ...formData,
        features: [...formData.features, { name: '', description: '', included: true }]
      });
    };

    const updateFeature = (index: number, field: keyof typeof formData.features[0], value: any) => {
      const newFeatures = [...formData.features];
      newFeatures[index] = { ...newFeatures[index], [field]: value };
      setFormData({ ...formData, features: newFeatures });
    };

    const removeFeature = (index: number) => {
      setFormData({
        ...formData,
        features: formData.features.filter((_, i) => i !== index)
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: theme.card }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>
            {subscription ? 'Edit Subscription Plan' : 'Create New Subscription Plan'}
          </h3>
          <form onSubmit={(e) => { 
            e.preventDefault(); 
            const submitData: CreateSubscriptionDto = {
              ...formData,
              type: formData.type as 'MONTHLY' | 'YEARLY',
              status: formData.status as 'ACTIVE' | 'INACTIVE' | 'ARCHIVED',
              features: formData.features
            };
            onSubmit(submitData); 
          }}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: theme.text.secondary }}>
                    Plan Name (Internal)
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text.primary }}
                    placeholder="basic-plan"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: theme.text.secondary }}>
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text.primary }}
                    placeholder="Basic Plan"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: theme.text.secondary }}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text.primary }}
                  rows={2}
                  placeholder="Plan description..."
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: theme.text.secondary }}>
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text.primary }}
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: theme.text.secondary }}>
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'MONTHLY' | 'YEARLY' })}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text.primary }}
                  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="YEARLY">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: theme.text.secondary }}>
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ACTIVE' | 'INACTIVE' | 'ARCHIVED' })}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text.primary }}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="popularBadge"
                  checked={formData.popularBadge}
                  onChange={(e) => setFormData({ ...formData, popularBadge: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="popularBadge" className="text-sm" style={{ color: theme.text.secondary }}>
                  Mark as Popular Plan
                </label>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium" style={{ color: theme.text.secondary }}>
                    Features
                  </label>
                  <button
                    type="button"
                    onClick={addFeature}
                    className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Add Feature
                  </button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 border rounded" style={{ borderColor: theme.border }}>
                      <input
                        type="checkbox"
                        checked={feature.included}
                        onChange={(e) => updateFeature(index, 'included', e.target.checked)}
                      />
                      <input
                        type="text"
                        value={feature.name}
                        onChange={(e) => updateFeature(index, 'name', e.target.value)}
                        className="flex-1 px-2 py-1 border rounded text-sm focus:outline-none"
                        style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text.primary }}
                        placeholder="Feature name"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
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
                {subscription ? 'Update Plan' : 'Create Plan'}
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
          <h1 className="text-3xl font-bold" style={{ color: theme.text.primary }}>Subscription Management</h1>
          <p className="mt-2" style={{ color: theme.text.secondary }}>
            Manage subscription plans, pricing, and features
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Create New Plan
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg border" style={{ backgroundColor: theme.warning, borderColor: theme.border }}>
          <p style={{ color: theme.text.primary }}>{error}</p>
        </div>
      )}

      {/* Filters and Search */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search subscription plans..."
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
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 rounded-lg shadow-sm border" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: theme.text.secondary }}>Total Plans</p>
              <p className="text-2xl font-bold" style={{ color: theme.text.primary }}>{subscriptions.length}</p>
            </div>
            <div className="p-3 rounded-full" style={{ backgroundColor: COLORS.blue[100] }}>
              <svg className="w-6 h-6" style={{ color: COLORS.blue[600] }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-lg shadow-sm border" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: theme.text.secondary }}>Active Plans</p>
              <p className="text-2xl font-bold" style={{ color: theme.text.primary }}>
                {subscriptions.filter(s => s.status === 'ACTIVE').length}
              </p>
            </div>
            <div className="p-3 rounded-full" style={{ backgroundColor: COLORS.green[100] }}>
              <svg className="w-6 h-6" style={{ color: COLORS.green[600] }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-lg shadow-sm border" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: theme.text.secondary }}>Average Price</p>
              <p className="text-2xl font-bold" style={{ color: theme.text.primary }}>
                ₹{subscriptions.length > 0 ? Math.round(subscriptions.reduce((sum, s) => sum + s.price, 0) / subscriptions.length) : 0}
              </p>
            </div>
            <div className="p-3 rounded-full" style={{ backgroundColor: COLORS.yellow[100] }}>
              <svg className="w-6 h-6" style={{ color: COLORS.yellow[600] }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-lg shadow-sm border" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: theme.text.secondary }}>Popular Plans</p>
              <p className="text-2xl font-bold" style={{ color: theme.text.primary }}>
                {subscriptions.filter(s => s.popularBadge).length}
              </p>
            </div>
            <div className="p-3 rounded-full" style={{ backgroundColor: COLORS.purple[100] }}>
              <svg className="w-6 h-6" style={{ color: COLORS.purple[600] }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Subscriptions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubscriptions.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              icon={<Icons.Star />}
              title="No Subscription Plans Found"
              description="Create subscription plans to monetize your educational content. Set pricing, features, and access levels for your courses."
              isDarkMode={isDarkMode}
              action={
                <button
                  onClick={() => setShowForm(true)}
                  className="px-6 py-3 text-sm font-medium text-white rounded-lg transition-colors"
                  style={{ backgroundColor: COLORS.primary[600] }}
                >
                  Create First Plan
                </button>
              }
            />
          </div>
        ) : (
          filteredSubscriptions.map((subscription) => (
          <div 
            key={subscription._id} 
            className="p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow relative"
            style={{ backgroundColor: theme.card, borderColor: theme.border }}
          >
            {subscription.popularBadge && (
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                Popular
              </div>
            )}
            
            <div className="text-center">
              <h3 className="text-xl font-bold" style={{ color: theme.text.primary }}>
                {subscription.displayName}
              </h3>
              <p className="text-sm mt-2" style={{ color: theme.text.secondary }}>
                {subscription.description}
              </p>
              
              <div className="mt-4">
                <span className="text-3xl font-bold" style={{ color: theme.text.primary }}>
                  ₹{subscription.price}
                </span>
                <span className="text-sm" style={{ color: theme.text.secondary }}>
                  /{subscription.type.toLowerCase()}
                </span>
              </div>
              
              <div className="flex items-center justify-center space-x-2 mt-4">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  subscription.status === 'ACTIVE' 
                    ? 'bg-green-100 text-green-700' 
                    : subscription.status === 'INACTIVE'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {subscription.status}
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                  {subscription.type}
                </span>
              </div>
              
              <div className="mt-4 space-y-2 text-left">
                <p className="text-xs font-medium" style={{ color: theme.text.secondary }}>Features:</p>
                {subscription.features.slice(0, 4).map((feature, index) => (
                  <div key={index} className="text-sm flex items-center" style={{ color: theme.text.secondary }}>
                    <span className={`mr-2 ${feature.enabled ? 'text-green-600' : 'text-red-600'}`}>
                      {feature.enabled ? '✓' : '✗'}
                    </span>
                    {feature.name}
                  </div>
                ))}
                {subscription.features.length > 4 && (
                  <div className="text-xs" style={{ color: theme.text.muted }}>
                    +{subscription.features.length - 4} more features
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-center space-x-2 mt-6">
                <button
                  onClick={() => setEditingSubscription(subscription)}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleToggleStatus(subscription._id)}
                  className={`px-3 py-2 rounded transition-colors text-sm ${
                    subscription.status === 'ACTIVE'
                      ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {subscription.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => handleDeleteSubscription(subscription._id)}
                  className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
          ))
        )}
      </div>

      {/* Forms */}
      {showForm && (
        <SubscriptionForm
          onSubmit={handleCreateSubscription}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingSubscription && (
        <SubscriptionForm
          subscription={editingSubscription}
          onSubmit={(data) => handleUpdateSubscription(editingSubscription._id, data)}
          onCancel={() => setEditingSubscription(null)}
        />
      )}
    </div>
  );
};

export default Subscriptions;