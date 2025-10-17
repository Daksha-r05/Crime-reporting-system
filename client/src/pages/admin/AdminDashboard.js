import React, { useEffect, useState } from 'react';
import { Shield, User, FileText, CheckCircle, XCircle, Eye } from 'lucide-react';
import { crimeAPI } from '../../services/api';
import { userAPI } from '../../services/api';
import CaseDetailModal from '../../components/common/CaseDetailModal';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [crimes, setCrimes] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [selectedCrime, setSelectedCrime] = useState('');
  const [selectedOfficer, setSelectedOfficer] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [showCaseDetail, setShowCaseDetail] = useState(false);

  const loadData = async () => {
    try {
      const [crimesRes, officersRes] = await Promise.all([
        crimeAPI.getCrimes({ limit: 100 }),
        userAPI.getAvailableOfficers()
      ]);
      setCrimes(crimesRes.data.crimes || []);
      setOfficers(officersRes.data.officers || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const assign = async () => {
    if (!selectedCrime || !selectedOfficer) {
      toast.error('Select a crime and an officer');
      return;
    }
    try {
      await crimeAPI.assignOfficer(selectedCrime, { officerId: selectedOfficer });
      toast.success('Assigned');
      setSelectedOfficer('');
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign');
    }
  };

  const updateStatus = async (status) => {
    if (!selectedCrime) {
      toast.error('Select a crime first');
      return;
    }
    try {
      await crimeAPI.updateStatus(selectedCrime, { status });
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
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">Loading...</div>
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
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">System overview and administration</p>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><FileText className="h-5 w-5" /> Assign Cases</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Select Crime</label>
                <select className="w-full border rounded-md px-2 py-2" value={selectedCrime} onChange={(e) => setSelectedCrime(e.target.value)}>
                  <option value="" disabled>Select a crime...</option>
                  {crimes.map(c => (
                    <option key={c._id} value={c._id}>
                      {c.title} — {new Date(c.dateTime).toLocaleDateString()} {c.assignedOfficer ? `(Assigned to ${c.assignedOfficer.firstName})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Select Officer</label>
                <select className="w-full border rounded-md px-2 py-2" value={selectedOfficer} onChange={(e) => setSelectedOfficer(e.target.value)}>
                  <option value="" disabled>Select an officer...</option>
                  {officers.map(o => (
                    <option key={o._id} value={o._id}>{o.firstName} {o.lastName} ({o.badgeNumber})</option>
                  ))}
                </select>
              </div>
              <div>
                <button onClick={assign} className="w-full bg-blue-600 text-white rounded-md px-4 py-2">Assign Officer</button>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><FileText className="h-5 w-5" /> Edit Crime Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Selected Crime</label>
                <select className="w-full border rounded-md px-2 py-2" value={selectedCrime} onChange={(e) => setSelectedCrime(e.target.value)}>
                  <option value="" disabled>Select a crime...</option>
                  {crimes.map(c => (
                    <option key={c._id} value={c._id}>
                      {c.title} — current: {c.status}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={() => updateStatus('resolved')} className="flex-1 bg-green-600 text-white rounded-md px-4 py-2 inline-flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Mark Resolved</button>
                <button onClick={() => updateStatus('closed')} className="flex-1 bg-gray-700 text-white rounded-md px-4 py-2 inline-flex items-center gap-2"><XCircle className="h-4 w-4" /> Close Case</button>
              </div>
            </div>
          </div>

          <div className="text-gray-500 text-sm">Only admins can assign cases and edit status here.</div>

          {/* All Crimes List */}
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><FileText className="h-5 w-5" /> All Crime Reports</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {crimes.map((crime) => (
                <div key={crime._id} className="border rounded-md p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{crime.title}</h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{crime.description}</p>
                      <div className="mt-2 text-sm text-gray-500 flex flex-wrap gap-4">
                        <span>Date: {new Date(crime.dateTime).toLocaleString()}</span>
                        <span>Status: {crime.status}</span>
                        <span>Severity: {crime.severity}</span>
                        <span>Category: {crime.category}</span>
                        {crime.assignedOfficer && (
                          <span>Assigned: {crime.assignedOfficer.firstName} {crime.assignedOfficer.lastName}</span>
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      <button
                        onClick={() => handleViewDetails(crime._id)}
                        className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm inline-flex items-center gap-1 hover:bg-blue-700 transition-colors"
                      >
                        <Eye className="h-4 w-4" /> View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Case Detail Modal */}
      <CaseDetailModal
        caseId={selectedCaseId}
        isOpen={showCaseDetail}
        onClose={handleCloseDetails}
        userRole="admin"
      />
    </div>
  );
};

export default AdminDashboard;
