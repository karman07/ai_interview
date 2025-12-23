import { useState, useEffect } from 'react';
import { Send, Clock, Check, X, Eye, MessageSquare } from 'lucide-react';
import { apiService } from '../services/api';

export const EmployerRequests = () => {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const statusOptions = [
    { value: 'all', label: 'All Requests' },
    { value: 'pending', label: 'Pending' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'withdrawn', label: 'Withdrawn' }
  ];

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const requestsData = await apiService.getMyRequests();
      setRequests(Array.isArray(requestsData) ? requestsData : []);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = selectedStatus === 'all' 
    ? requests 
    : requests.filter((req: any) => req.status === selectedStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'withdrawn':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Check className="h-4 w-4" />;
      case 'rejected':
        return <X className="h-4 w-4" />;
      case 'withdrawn':
        return <X className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Requests</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Track your outreach to potential candidates
          </p>
        </div>
        
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Requests', value: requests.length, color: 'bg-blue-500' },
          { label: 'Pending', value: requests.filter((r: any) => r.status === 'pending').length, color: 'bg-yellow-500' },
          { label: 'Accepted', value: requests.filter((r: any) => r.status === 'accepted').length, color: 'bg-green-500' },
          { label: 'Response Rate', value: requests.length > 0 ? `${Math.round((requests.filter((r: any) => r.status !== 'pending').length / requests.length) * 100)}%` : '0%', color: 'bg-purple-500' }
        ].map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-full`}>
                <Send className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6">
        {Array.isArray(filteredRequests) && filteredRequests.length > 0 ? (
          filteredRequests.map((request: any) => (
          <div key={request._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {request.employeeId?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                  </span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {request.employeeId?.name || 'Unknown Employee'}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(request.status)}`}>
                      {getStatusIcon(request.status)}
                      <span className="ml-1">{request.status}</span>
                    </span>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-2">{request.employeeId?.email}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mb-2">
                    Position: {request.jobId?.title || 'Unknown Position'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Sent: {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                  <Eye className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400">
                  <MessageSquare className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Your Message</h4>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                      {request.message || 'No message provided.'}
                    </p>
                  </div>
                </div>

                {request.employeeResponse && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Employee Response
                    </h4>
                    <div className={`p-4 rounded-lg ${
                      request.status === 'accepted' 
                        ? 'bg-green-50 dark:bg-green-900/20' 
                        : 'bg-red-50 dark:bg-red-900/20'
                    }`}>
                      <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                        {request.employeeResponse}
                      </p>
                    </div>
                  </div>
                )}

                {!request.employeeResponse && request.status === 'pending' && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Status</h4>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                        <p className="text-gray-700 dark:text-gray-300 text-sm">
                          Waiting for candidate response...
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {request.status === 'accepted' && (
                <div className="mt-4 flex items-center space-x-4">
                  <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Continue Conversation
                  </button>
                  <button className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">
                    Schedule Interview
                  </button>
                </div>
              )}
            </div>
          </div>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No requests found.</p>
          </div>
        )}
      </div>
    </div>
  );
};