import React, { useEffect, useState } from 'react';
import { FileText, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import { userAPI } from '../../services/api';

const MyReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await userAPI.getMyReports({ limit: 50 });
        setReports(res.data.crimes || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load reports');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const statusBadge = (status) => {
    const map = {
      pending: { icon: <Clock className="h-4 w-4" />, cls: 'bg-yellow-100 text-yellow-800' },
      under_investigation: { icon: <Eye className="h-4 w-4" />, cls: 'bg-blue-100 text-blue-800' },
      resolved: { icon: <CheckCircle className="h-4 w-4" />, cls: 'bg-green-100 text-green-800' },
      closed: { icon: <XCircle className="h-4 w-4" />, cls: 'bg-gray-100 text-gray-800' },
    };
    const s = map[status] || map.pending;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${s.cls}`}>
        {s.icon}
        {status.replace('_', ' ')}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">Loading your reports...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">My Reports</h1>
          <p className="text-gray-600 mt-1">Track the status of your submitted crime reports</p>
        </div>

        <div className="p-6">
          {reports.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Yet</h3>
              <p className="text-gray-600 mb-4">
                You haven't submitted any crime reports yet. Start by reporting an incident.
              </p>
              <a href="/report-crime" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Report a Crime</a>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((r) => (
                <div key={r._id} className="border rounded-md p-4 flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{r.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{r.description}</p>
                    <div className="mt-2 text-sm text-gray-500">
                      <span className="mr-2">Category: {r.category}</span>
                      <span className="mr-2">Severity: {r.severity}</span>
                      <span className="mr-2">Date: {new Date(r.dateTime).toLocaleString()}</span>
                    </div>
                    {r.firRequested && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          FIR Requested
                        </span>
                        {r.firStatus && r.firStatus !== 'not_requested' && (
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            r.firStatus === 'approved' ? 'bg-green-100 text-green-800' :
                            r.firStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            FIR {r.firStatus.charAt(0).toUpperCase() + r.firStatus.slice(1)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    {statusBadge(r.status)}
                    {r.assignedOfficer && (
                      <div className="text-xs text-gray-500 mt-2">Officer: {r.assignedOfficer.firstName} {r.assignedOfficer.lastName}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyReports;
