import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Login from './components/Login';
import AddEntryCard from './components/AddEntryCard';
import EntriesTableCard from './components/EntriesTableCard';
import ManagerDashboard from './components/ManagerDashboard';

// --- Helper Functions & Constants ---

const API_BASE_URL = 'http://localhost:5000/api/entries';

// A simple utility to format date as YYYY-MM-DD
const formatDateForInput = (date) => {
  if (!date) return '';
  // Handles both Date objects and string dates
  const d = new Date(date);
  // Adjust for timezone offset to prevent date from changing
  const adjustedDate = new Date(d.getTime() + Math.abs(d.getTimezoneOffset()*60000))
  return adjustedDate.toISOString().split('T')[0];
};

// --- Main App Component ---

export default function App() {
  const [entries, setEntries] = useState([]);
  const [editingEntry, setEditingEntry] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userRole, setUserRole] = useState(null);

  // Check if user is authenticated on component mount
  useEffect(() => {
    if (token) {
      setIsAuthenticated(true);
    }
  }, [token]);

  const handleLogin = (newToken) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
    setIsAuthenticated(true);
    
    // Decode the JWT token to get user role
    try {
      const payload = JSON.parse(atob(newToken.split('.')[1]));
      setUserRole(payload.user.role);
    } catch (err) {
      console.error('Error decoding token:', err);
      setUserRole('employee'); // Default to employee if decoding fails
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setIsAuthenticated(false);
    setUserRole(null);
    setEntries([]);
  };

  const fetchEntries = useCallback(async () => {
    if (!token) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(API_BASE_URL, {
        headers: {
          'x-auth-token': token
        }
      });
      if (!response.ok) {
        if (response.status === 401) {
          // Token is invalid, logout user
          handleLogout();
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setEntries(data);
    } catch (e) {
      console.error("Failed to fetch entries:", e);
      setError("Failed to load timesheet entries. Make sure the backend server is running.");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchEntries();
    }
  }, [fetchEntries, isAuthenticated]);

  const handleSave = useCallback(async (formData, id) => {
    if (!token) return;
    
    const isUpdating = !!id;
    const url = isUpdating ? `${API_BASE_URL}/${id}` : API_BASE_URL;
    const method = isUpdating ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) { 
        if (response.status === 401) {
          handleLogout();
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`); 
      }
      
      setEditingEntry(null);
      fetchEntries();
    } catch (e) {
      console.error("Failed to save entry:", e);
      setError("Failed to save entry. Please try again.");
    }
  }, [fetchEntries, token]);

  const handleDelete = useCallback(async (id) => {
    if (!token) return;
    
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/${id}`, { 
          method: 'DELETE',
          headers: {
            'x-auth-token': token
          }
        });
        if (!response.ok) { 
          if (response.status === 401) {
            handleLogout();
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`); 
        }
        fetchEntries();
      } catch (e) {
        console.error("Failed to delete entry:", e);
        setError("Failed to delete entry. Please try again.");
      }
    }
  }, [fetchEntries, token]);
  
  const handleEdit = useCallback((entry) => {
    setEditingEntry(entry);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  // Show manager dashboard if user is a manager
  if (userRole === 'manager') {
    return <ManagerDashboard token={token} onLogout={handleLogout} />;
  }

  // Show employee dashboard (default timesheet interface)
  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold leading-tight text-gray-900">Timesheet</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Role: {userRole || 'employee'}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 space-y-6">
        <AddEntryCard 
          onSave={handleSave} 
          editingEntry={editingEntry} 
          setEditingEntry={setEditingEntry} 
        />
        
        <EntriesTableCard 
          entries={entries}
          isLoading={isLoading}
          error={error}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </main>
    </div>
  );
}

