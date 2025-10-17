import React, { useEffect, useState } from 'react';
import { FileText, MapPin, Calendar, User } from 'lucide-react';
import { crimeAPI } from '../../services/api';
import toast from 'react-hot-toast';

const CrimeList = () => {
  const [crimes, setCrimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      const crimesRes = await crimeAPI.getCrimes({ limit: 50 });
      setCrimes(crimesRes.data.crimes || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load crimes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">Loading crimes...</div>
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
          <h1 className="text-2xl font-bold text-gray-900">All Crime Reports</h1>
          <p className="text-gray-600 mt-1">View submitted crime reports</p>
        </div>

        <div className="p-6">
          {crimes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Available</h3>
              <p className="text-gray-600">There are no crime reports in the system yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {crimes.map((c) => (
                <div key={c._id} className="border rounded-md p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{c.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{c.description}</p>
                      <div className="mt-2 text-sm text-gray-500 flex gap-4">
                        <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {new Date(c.dateTime).toLocaleString()}</span>
                        <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {c.location?.address}</span>
                        <span className="flex items-center gap-1"><User className="h-4 w-4" /> {c.isAnonymous ? 'Anonymous' : `${c.reporter?.firstName || ''} ${c.reporter?.lastName || ''}`.trim()}</span>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="text-xs text-gray-500">Status: {c.status}</div>
                      <div className="text-xs text-gray-500">Assigned: {c.assignedOfficer ? `${c.assignedOfficer.firstName} ${c.assignedOfficer.lastName}` : 'None'}</div>
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

export default CrimeList;
