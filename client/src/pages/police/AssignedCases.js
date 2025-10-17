import React, { useEffect, useState } from 'react';
import { Users, FileText, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import { userAPI, crimeAPI } from '../../services/api';
import CaseDetailModal from '../../components/common/CaseDetailModal';
import toast from 'react-hot-toast';

const AssignedCases = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [showCaseDetail, setShowCaseDetail] = useState(false);

  const loadData = async () => {
    try {
      const res = await userAPI.getAssignedCases({ limit: 50 });
      setCases(res.data.crimes || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load assigned cases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateStatus = async (crimeId, status) => {
    try {
      await crimeAPI.updateStatus(crimeId, { status });
      toast.success('Status updated');
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleViewDetails = (caseId) => {
    setSelectedCaseId(caseId);
    setShowCaseDetail(true);
  };

  const handleCloseDetails = () => {
    setShowCaseDetail(false);
    setSelectedCaseId(null);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">Loading assigned cases...</div>
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
          <h1 className="text-2xl font-bold text-gray-900">Assigned Cases</h1>
          <p className="text-gray-600 mt-1">Manage your assigned crime investigation cases</p>
        </div>

        <div className="p-6">
          {cases.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Assigned Cases</h3>
              <p className="text-gray-600">You don't have any assigned cases at the moment.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cases.map((c) => (
                <div key={c._id} className="border rounded-md p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{c.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{c.description}</p>
                      <div className="mt-2 text-sm text-gray-500">
                        <span className="mr-2">Date: {new Date(c.dateTime).toLocaleString()}</span>
                        <span className="mr-2">Status: {c.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <button 
                      onClick={() => handleViewDetails(c._id)} 
                      className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm inline-flex items-center gap-1 hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="h-4 w-4" /> View Details
                    </button>
                    <button onClick={() => updateStatus(c._id, 'resolved')} className="px-3 py-1 bg-green-600 text-white rounded-md text-sm inline-flex items-center gap-1 hover:bg-green-700 transition-colors">
                      <CheckCircle className="h-4 w-4" /> Mark Resolved
                    </button>
                    <button onClick={() => updateStatus(c._id, 'closed')} className="px-3 py-1 bg-gray-600 text-white rounded-md text-sm inline-flex items-center gap-1 hover:bg-gray-700 transition-colors">
                      <XCircle className="h-4 w-4" /> Close Case
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Case Detail Modal */}
      <CaseDetailModal
        caseId={selectedCaseId}
        isOpen={showCaseDetail}
        onClose={handleCloseDetails}
        userRole="police"
      />
    </div>
  );
};

export default AssignedCases;
