import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { AlertTriangle, MapPin, Calendar, FileText, Upload, Send } from 'lucide-react';
import { crimeAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { MapContainer, TileLayer, CircleMarker, Popup, useMapEvent } from 'react-leaflet';

const ReportCrime = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm();

  const [coordinates, setCoordinates] = useState(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef(null);
  const address = watch('address');

  // Geocode address using OpenStreetMap Nominatim (no API key required)
  useEffect(() => {
    const controller = new AbortController();
    if (!address || address.trim().length < 3) {
      setCoordinates(null);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setIsGeocoding(true);
        const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(address)}`;
        const res = await fetch(url, {
          headers: {
            'Accept': 'application/json',
          },
          signal: controller.signal,
        });
        if (!res.ok) throw new Error('Failed to geocode');
        const data = await res.json();
        setSuggestions(Array.isArray(data) ? data : []);
        setShowSuggestions(true);
        if (Array.isArray(data) && data.length > 0) {
          const { lat, lon } = data[0];
          setCoordinates({ lat: parseFloat(lat), lng: parseFloat(lon) });
        } else {
          setCoordinates(null);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Geocoding error:', err);
        }
      } finally {
        setIsGeocoding(false);
      }
    }, 600); // debounce

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [address]);

  const handleSelectSuggestion = (s) => {
    const fullAddress = s.display_name || '';
    setValue('address', fullAddress, { shouldValidate: true, shouldDirty: true });
    setCoordinates({ lat: parseFloat(s.lat), lng: parseFloat(s.lon) });
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const payload = {
        title: data.title,
        description: data.description,
        category: data.category,
        severity: data.severity,
        location: {
          address: data.address,
          coordinates: coordinates || { lat: 0, lng: 0 }
        },
        dateTime: new Date(data.dateTime).toISOString(),
        isAnonymous: !!data.isAnonymous,
        firRequested: !!data.firRequested,
        evidence: {}
      };

      await crimeAPI.reportCrime(payload);
      toast.success('Report submitted successfully');
      navigate('/my-reports');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to submit report';
      toast.error(message);
      console.error('Error submitting report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Report a Crime</h1>
          <p className="text-gray-600 mt-1">
            Help keep your community safe by reporting incidents
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Crime Title *
              </label>
              <input
                id="title"
                type="text"
                {...register('title', {
                  required: 'Title is required',
                  minLength: { value: 5, message: 'Title must be at least 5 characters' }
                })}
                className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Brief description of the incident"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                id="category"
                {...register('category', { required: 'Category is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a category</option>
                <option value="theft">Theft</option>
                <option value="assault">Assault</option>
                <option value="vandalism">Vandalism</option>
                <option value="fraud">Fraud</option>
                <option value="burglary">Burglary</option>
                <option value="vehicle_theft">Vehicle Theft</option>
                <option value="harassment">Harassment</option>
                <option value="drug_related">Drug Related</option>
                <option value="other">Other</option>
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Detailed Description *
            </label>
            <textarea
              id="description"
              rows={4}
              {...register('description', {
                required: 'Description is required',
                minLength: { value: 10, message: 'Description must be at least 10 characters' }
              })}
              className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Provide detailed information about what happened, when, and any other relevant details..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="dateTime" className="block text-sm font-medium text-gray-700 mb-2">
                Date and Time *
              </label>
              <input
                id="dateTime"
                type="datetime-local"
                {...register('dateTime', { required: 'Date and time is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.dateTime && (
                <p className="mt-1 text-sm text-red-600">{errors.dateTime.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="severity" className="block text-sm font-medium text-gray-700 mb-2">
                Severity Level *
              </label>
              <select
                id="severity"
                {...register('severity', { required: 'Severity is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select severity</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
              {errors.severity && (
                <p className="mt-1 text-sm text-red-600">{errors.severity.message}</p>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="relative">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
              Location Address *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="address"
                type="text"
                {...register('address', { required: 'Address is required' })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter the exact location where the incident occurred"
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              />
            </div>
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
            )}

            {showSuggestions && suggestions.length > 0 && (
              <ul
                ref={suggestionsRef}
                className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm border border-gray-200"
              >
                {suggestions.map((s, idx) => (
                  <li
                    key={`${s.place_id}-${idx}`}
                    className="cursor-pointer select-none px-3 py-2 text-gray-700 hover:bg-gray-50"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectSuggestion(s);
                    }}
                  >
                    {s.display_name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Map View */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {isGeocoding ? 'Locating address…' : coordinates ? 'Location found' : 'Enter an address to locate on map'}
              </div>
              {coordinates && (
                <a
                  href={`https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  View in Google Maps
                </a>
              )}
            </div>

            <div className="rounded-lg overflow-hidden border border-gray-200">
              {coordinates ? (
                <MapContainer
                  center={[coordinates.lat, coordinates.lng]}
                  zoom={16}
                  style={{ height: 320, width: '100%' }}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <CircleMarker center={[coordinates.lat, coordinates.lng]} radius={10} pathOptions={{ color: '#2563eb' }}>
                    <Popup>
                      {address}
                    </Popup>
                  </CircleMarker>
                  <MapClickOpener lat={coordinates.lat} lng={coordinates.lng} />
                </MapContainer>
              ) : (
                <div className="bg-gray-50 h-80 flex flex-col items-center justify-center text-center">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Type an address above to preview its location.</p>
                </div>
              )}
            </div>
          </div>

          {/* Evidence Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Evidence (Photos, Videos, Documents)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 mb-2">Drag and drop files here, or click to select</p>
              <input
                type="file"
                multiple
                accept="image/*,video/*,.pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
              >
                Choose Files
              </label>
            </div>
            
            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Files:</h4>
                <div className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-600">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* FIR Option */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <input
                id="firRequested"
                type="checkbox"
                {...register('firRequested')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
              />
              <div className="ml-3">
                <label htmlFor="firRequested" className="text-sm font-medium text-gray-900">
                  Request FIR (First Information Report)
                </label>
                <p className="text-sm text-gray-600 mt-1">
                  Check this box if you want to file an official FIR. You will receive an email with 
                  confirmation and required documents list for FIR filing.
                </p>
              </div>
            </div>
          </div>

          {/* Anonymous Reporting */}
          <div className="flex items-center">
            <input
              id="anonymous"
              type="checkbox"
              {...register('isAnonymous')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="anonymous" className="ml-2 block text-sm text-gray-700">
              Submit this report anonymously
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Report
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportCrime;

// Opens Google Maps when the map is clicked
function MapClickOpener({ lat, lng }) {
  useMapEvent('click', () => {
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  });
  return null;
}
