import React, { useState, useEffect } from 'react';
import { X, MapPin, Calendar, User, File, Image, Video, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { crimeAPI } from '../../services/api';
import toast from 'react-hot-toast';
// Leaflet fallback (no API key required)
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const CaseDetailModal = ({ caseId, isOpen, onClose, userRole }) => {
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const googleKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  // Fix default marker icons in Leaflet when bundled
  useEffect(() => {
    // eslint-disable-next-line no-undef
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }, []);

  useEffect(() => {
    if (isOpen && caseId) {
      loadCaseDetails();
    }
  }, [isOpen, caseId]);

  const loadCaseDetails = async () => {
    setLoading(true);
    try {
      const response = await crimeAPI.getCrime(caseId);
      setCaseData(response.data.crime);
    } catch (error) {
      toast.error('Failed to load case details');
      console.error('Error loading case details:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    try {
      await crimeAPI.updateStatus(caseId, { status: newStatus });
      toast.success('Status updated successfully');
      await loadCaseDetails();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'under_investigation': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'false_report': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'low': return <CheckCircle className="h-4 w-4" />;
      case 'medium': return <AlertTriangle className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': return <Shield className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Case Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading case details...</p>
            </div>
          ) : caseData ? (
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{caseData.title}</h3>
                    <p className="text-gray-700">{caseData.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {new Date(caseData.dateTime).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {caseData.isAnonymous ? 'Anonymous' : 
                         `${caseData.reporter?.firstName || ''} ${caseData.reporter?.lastName || ''}`.trim()}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(caseData.status)}`}>
                      {caseData.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(caseData.severity)} flex items-center gap-1`}>
                      {getSeverityIcon(caseData.severity)}
                      {caseData.severity.toUpperCase()}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {caseData.category.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Location and Map */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Location
                    </h4>
                    <p className="text-sm text-gray-600">{caseData.location.address}</p>
                    {caseData.location.city && (
                      <p className="text-sm text-gray-500">
                        {caseData.location.city}, {caseData.location.state} {caseData.location.zipCode}
                      </p>
                    )}
                  </div>

                  {/* Map: Google Maps if key present, otherwise Leaflet/OpenStreetMap fallback */}
                  <div className="h-64 bg-gray-100 rounded-lg overflow-hidden">
                    {!mapLoaded && (
                      <div className="h-full flex items-center justify-center">
                        <button
                          onClick={() => setMapLoaded(true)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Load Map
                        </button>
                      </div>
                    )}
                    {mapLoaded && (
                      googleKey ? (
                        <iframe
                          src={`https://www.google.com/maps/embed/v1/place?key=${googleKey}&q=${caseData.location.coordinates.lat},${caseData.location.coordinates.lng}&zoom=15`}
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen=""
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title="Crime Location"
                        />
                      ) : (
                        <MapContainer
                          center={[caseData.location.coordinates.lat, caseData.location.coordinates.lng]}
                          zoom={15}
                          style={{ height: '100%', width: '100%' }}
                          scrollWheelZoom={false}
                        >
                          <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />
                          <Marker position={[caseData.location.coordinates.lat, caseData.location.coordinates.lng]}>
                            <Popup>
                              {caseData.location.address}
                            </Popup>
                          </Marker>
                        </MapContainer>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Evidence Section */}
              {(caseData.evidence?.photos?.length > 0 || 
                caseData.evidence?.videos?.length > 0 || 
                caseData.evidence?.documents?.length > 0) && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Evidence</h4>
                  
                  {/* Photos */}
                  {caseData.evidence?.photos?.length > 0 && (
                    <div className="mb-6">
                      <h5 className="text-md font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <Image className="h-4 w-4" />
                        Photos ({caseData.evidence.photos.length})
                      </h5>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {caseData.evidence.photos.map((photo, index) => (
                          <div
                            key={index}
                            className="relative cursor-pointer group"
                            onClick={() => setSelectedImage(photo)}
                          >
                            <img
                              src={photo.url}
                              alt={photo.caption || `Evidence photo ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border border-gray-200 group-hover:border-blue-300 transition-colors"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                              <Image className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            {photo.caption && (
                              <p className="text-xs text-gray-600 mt-1 truncate">{photo.caption}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Videos */}
                  {caseData.evidence?.videos?.length > 0 && (
                    <div className="mb-6">
                      <h5 className="text-md font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        Videos ({caseData.evidence.videos.length})
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {caseData.evidence.videos.map((video, index) => (
                          <div key={index} className="space-y-2">
                            <video
                              src={video.url}
                              controls
                              className="w-full h-48 object-cover rounded-lg border border-gray-200"
                            />
                            {video.caption && (
                              <p className="text-sm text-gray-600">{video.caption}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Documents */}
                  {caseData.evidence?.documents?.length > 0 && (
                    <div className="mb-6">
                      <h5 className="text-md font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <File className="h-4 w-4" />
                        Documents ({caseData.evidence.documents.length})
                      </h5>
                      <div className="space-y-2">
                        {caseData.evidence.documents.map((doc, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <File className="h-5 w-5 text-gray-500" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                              <p className="text-xs text-gray-500">
                                Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              View
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Additional Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Case Information */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Case Information</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Report ID:</span>
                      <span className="text-sm font-medium text-gray-900">{caseData._id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Created:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(caseData.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Last Updated:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(caseData.updatedAt).toLocaleString()}
                      </span>
                    </div>
                    {caseData.assignedOfficer && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Assigned Officer:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {caseData.assignedOfficer.firstName} {caseData.assignedOfficer.lastName}
                          {caseData.assignedOfficer.badgeNumber && 
                            ` (${caseData.assignedOfficer.badgeNumber})`}
                        </span>
                      </div>
                    )}
                    {caseData.firRequested && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">FIR Status:</span>
                        <span className={`text-sm font-medium ${
                          caseData.firStatus === 'approved' ? 'text-green-600' :
                          caseData.firStatus === 'rejected' ? 'text-red-600' :
                          'text-yellow-600'
                        }`}>
                          {caseData.firStatus.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    )}
                    {caseData.firNumber && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">FIR Number:</span>
                        <span className="text-sm font-medium text-gray-900">{caseData.firNumber}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Police Notes */}
                {caseData.policeNotes?.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Police Notes</h4>
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                      {caseData.policeNotes.map((note, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Shield className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-gray-900">
                              {note.officer?.firstName} {note.officer?.lastName}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(note.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{note.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons for Police/Admin */}
              {(userRole === 'police' || userRole === 'admin') && (
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Actions</h4>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => updateStatus('under_investigation')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Mark Under Investigation
                    </button>
                    <button
                      onClick={() => updateStatus('resolved')}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      Mark Resolved
                    </button>
                    <button
                      onClick={() => updateStatus('closed')}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                    >
                      Close Case
                    </button>
                    <button
                      onClick={() => updateStatus('false_report')}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      Mark as False Report
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-600">Failed to load case details</p>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60 p-4">
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <X className="h-6 w-6" />
            </button>
            <img
              src={selectedImage.url}
              alt={selectedImage.caption || 'Evidence photo'}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            {selectedImage.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4 rounded-b-lg">
                <p className="text-center">{selectedImage.caption}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseDetailModal;
