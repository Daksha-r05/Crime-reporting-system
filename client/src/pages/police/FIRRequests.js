import React, { useEffect, useState } from 'react';
import { FileText, CheckCircle2, XCircle, Hash } from 'lucide-react';
import { crimeAPI } from '../../services/api';
import toast from 'react-hot-toast';

const FIRRequests = () => {
  const [crimes, setCrimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [firNumbers, setFirNumbers] = useState({});

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await crimeAPI.getFIRRequests({ limit: 50, status: statusFilter });
      setCrimes(res.data.crimes || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load FIR requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleApprove = async (crimeId) => {
    try {
      const payload = { action: 'approve' };
      const num = firNumbers[crimeId];
      if (num && num.trim()) payload.firNumber = num.trim();
      await crimeAPI.updateFIR(crimeId, payload);
      toast.success('FIR approved');
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve FIR');
    }
  };

  const handleReject = async (crimeId) => {
    try {
      await crimeAPI.updateFIR(crimeId, { action: 'reject' });
      toast.success('FIR rejected');
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject FIR');
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">Loading FIR requests...</div>
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
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">FIR Requests</h1>
            <p className="text-gray-600 mt-1">Review and update FIR requests</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Status:</label>
            <select
              className="border rounded-md px-2 py-1 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="all">All</option>
            </select>
          </div>
        </div>

        <div className="p-6">
          {crimes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No FIR Requests</h3>
              <p className="text-gray-600">No cases match the current filter.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {crimes.map((c) => (
                <div key={c._id} className="border rounded-md p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{c.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{c.description}</p>
                      <div className="mt-2 text-sm text-gray-500">
                        <span className="mr-4">Status: <span className="font-medium">{c.firStatus}</span></span>
                        {c.firNumber && <span className="mr-4">FIR No: <span className="font-medium">{c.firNumber}</span></span>}
                        <span>Report: {new Date(c.dateTime).toLocaleString()}</span>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        Reporter: {c.isAnonymous ? 'Anonymous' : `${c.reporter?.firstName || ''} ${c.reporter?.lastName || ''}`.trim()}
                        {!c.isAnonymous && (
                          <span className="ml-2">
                            {c.reporter?.email && (
                              <a className="text-blue-600 hover:underline" href={`mailto:${c.reporter.email}`}>{c.reporter.email}</a>
                            )}
                            {c.reporter?.phone && (
                              <>
                                <span className="mx-1">·</span>
                                <a className="text-blue-600 hover:underline" href={`tel:${c.reporter.phone}`}>{c.reporter.phone}</a>
                              </>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right space-y-2 min-w-[220px]">
                      {c.firStatus === 'pending' ? (
                        <div className="flex flex-col gap-2 items-stretch">
                          <div className="flex items-center gap-2">
                            <Hash className="h-4 w-4 text-gray-500" />
                            <input
                              type="text"
                              className="border rounded-md px-2 py-1 text-sm w-full"
                              placeholder="FIR Number (optional)"
                              value={firNumbers[c._id] || ''}
                              onChange={(e) => setFirNumbers({ ...firNumbers, [c._id]: e.target.value })}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleApprove(c._id)} className="px-3 py-1 bg-green-600 text-white rounded-md text-sm inline-flex items-center gap-1">
                              <CheckCircle2 className="h-4 w-4" /> Approve
                            </button>
                            <button onClick={() => handleReject(c._id)} className="px-3 py-1 bg-red-600 text-white rounded-md text-sm inline-flex items-center gap-1">
                              <XCircle className="h-4 w-4" /> Reject
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm">
                          {c.firStatus === 'approved' ? (
                            <span className="text-green-700 font-medium">Approved</span>
                          ) : (
                            <span className="text-red-700 font-medium">Rejected</span>
                          )}
                        </div>
                      )}
                    </div>
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

export default FIRRequests;


