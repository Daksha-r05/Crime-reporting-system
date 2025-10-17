import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { crimeAPI } from '../services/api';
import { 
  Shield, 
  AlertTriangle, 
  MapPin, 
  Users, 
  FileText, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';

const Dashboard = () => {
  const { user, isCitizen, isPolice, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentCrimes, setRecentCrimes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsResponse, crimesResponse] = await Promise.all([
          crimeAPI.getStats(),
          crimeAPI.getCrimes({ limit: 5 })
        ]);

        setStats(statsResponse.data);
        setRecentCrimes(crimesResponse.data.crimes);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'under_investigation':
        return <Eye className="h-4 w-4 text-blue-500" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'closed':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'under_investigation':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user.firstName}!
            </h1>
            <p className="text-gray-600">
              {isCitizen && 'Report crimes and stay informed about your neighbourhood'}
              {isPolice && 'View crime reports and your assigned cases'}
              {isAdmin && 'Monitor system activity and manage users'}
            </p>
            <div className="mt-2 flex items-center space-x-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                user.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {user.isVerified ? 'Verified' : 'Pending Verification'}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Citizen Intro Section */}
      {isCitizen && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="relative h-48 md:h-full">
              <img
                src="https://www.shutterstock.com/image-vector/psychology-support-person-concept-hands-600nw-2143759959.jpg"
                alt="Safe Neighbourhood"
                className="object-cover w-full h-full"
                onError={(e)=>{e.currentTarget.src='https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=1200&auto=format&fit=crop';}}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"/>
            </div>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900">Together for a Safer Society</h2>
              <p className="text-gray-600 mt-2">
                Your reports help keep the community safe. Share timely, accurate information. Your identity is protected when you choose to report anonymously.
              </p>

              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-800">Guidelines</h3>
                <ul className="mt-2 list-disc list-inside text-sm text-gray-700 space-y-1">
                  <li>Provide clear details: what, where, and when it happened.</li>
                  <li>Avoid sharing personal speculation; focus on facts.</li>
                  <li>If safe, attach photos/videos to aid investigation.</li>
                  <li>For emergencies, call 100 immediately.</li>
                </ul>
              </div>

              <div className="mt-4 p-4 bg-green-50 border border-green-100 rounded-md text-sm text-green-800">
                We are committed to a safe and inclusive community. Reports are reviewed by authorities and handled with confidentiality.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isCitizen && (
          <>
            <Link
              to="/report-crime"
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border-l-4 border-red-500"
            >
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Report Crime</h3>
                  <p className="text-sm text-gray-600">Submit a new crime report</p>
                </div>
              </div>
            </Link>

            <Link
              to="/my-reports"
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border-l-4 border-blue-500"
            >
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">My Reports</h3>
                  <p className="text-sm text-gray-600">View your submitted reports</p>
                </div>
              </div>
            </Link>
          </>
        )}

        {isPolice && (
          <>
            <Link
              to="/crimes"
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border-l-4 border-blue-500"
            >
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">All Reports</h3>
                  <p className="text-sm text-gray-600">View all crime reports</p>
                </div>
              </div>
            </Link>

            <Link
              to="/assigned-cases"
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border-l-4 border-green-500"
            >
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Assigned Cases</h3>
                  <p className="text-sm text-gray-600">Manage your assigned cases</p>
                </div>
              </div>
            </Link>
          </>
        )}

        {isAdmin && (
          <>
            <Link
              to="/admin"
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border-l-4 border-purple-500"
            >
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Admin Dashboard</h3>
                  <p className="text-sm text-gray-600">System overview and analytics</p>
                </div>
              </div>
            </Link>

            <Link
              to="/admin/users"
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border-l-4 border-indigo-500"
            >
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">User Management</h3>
                  <p className="text-sm text-gray-600">Manage system users</p>
                </div>
              </div>
            </Link>
          </>
        )}

        <Link
          to="/profile"
          className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border-l-4 border-gray-500"
        >
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Profile</h3>
              <p className="text-sm text-gray-600">Update your profile information</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Reports</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalReports}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pendingReports}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.resolvedReports}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <MapPin className="h-5 w-5 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {Object.keys(stats.categoryBreakdown || {}).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {recentCrimes.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {recentCrimes.map((crime) => (
              <div key={crime._id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(crime.status)}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{crime.title}</p>
                      <p className="text-sm text-gray-600">
                        {crime.location.address} • {new Date(crime.dateTime).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(crime.status)}`}>
                    {crime.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 border-t border-gray-200">
            <Link
              to="/crimes"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View all reports →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
