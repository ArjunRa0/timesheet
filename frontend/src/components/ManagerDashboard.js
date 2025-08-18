import React, { useState, useEffect } from 'react';

const ManagerDashboard = ({ token, onLogout }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchEntries();
  }, [statusFilter]);

  const fetchEntries = async () => {
    try {
      const url = statusFilter === 'pending' 
        ? 'http://localhost:5000/api/manager/approvals'
        : `http://localhost:5000/api/manager/entries?status=${statusFilter}`;
        
      const response = await fetch(url, {
        headers: {
          'x-auth-token': token
        }
      });

      if (!response.ok) {
        if (response.status === 403) {
          setError('Access denied. Managers only.');
        } else {
          setError('Failed to fetch entries');
        }
        return;
      }

      const data = await response.json();
      setEntries(data);
    } catch (err) {
      setError('Error fetching entries');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (entryId, status) => {
    try {
      const response = await fetch(`http://localhost:5000/api/manager/approve/${entryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        setError('Failed to update approval status');
        return;
      }

      // Refresh the list
      fetchEntries();
    } catch (err) {
      setError('Error updating approval status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading manager dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={onLogout}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
            <button
              onClick={onLogout}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Employee Timesheet Entries</h2>
                <p className="text-gray-600 mt-1">Review and manage timesheet entries from your employees</p>
              </div>
              <div className="flex items-center space-x-4">
                <label htmlFor="statusFilter" className="text-sm font-medium text-gray-700">
                  Filter by Status:
                </label>
                <select
                  id="statusFilter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">All Entries</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {entries.length === 0 ? (
            <div className="p-6 text-center">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {statusFilter === 'all' ? 'No Entries Found' : `No ${statusFilter} Entries`}
              </h3>
              <p className="text-gray-600">
                {statusFilter === 'all' 
                  ? 'There are no timesheet entries from your employees yet.'
                  : `There are no ${statusFilter} timesheet entries.`
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Task
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                                     {entries.map((entry) => {
                     const durationHours = parseFloat(entry.duration_hours) || 
                       ((new Date(`2000-01-01T${entry.end_time}`) - new Date(`2000-01-01T${entry.start_time}`)) / (1000 * 60 * 60));
                    
                    const getStatusBadge = (status) => {
                      switch (status) {
                        case 'pending':
                          return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>;
                        case 'approved':
                          return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Approved</span>;
                        case 'rejected':
                          return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Rejected</span>;
                        default:
                          return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
                      }
                    };
                    
                    return (
                      <tr key={entry.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {entry.employee_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(entry.entry_date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{entry.project}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {entry.task_description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {durationHours.toFixed(2)}h
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(entry.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {entry.status === 'pending' ? (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleApproval(entry.id, 'approved')}
                                className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleApproval(entry.id, 'rejected')}
                                className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-500 text-xs">
                              {entry.status === 'approved' ? 'Approved' : 'Rejected'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard; 