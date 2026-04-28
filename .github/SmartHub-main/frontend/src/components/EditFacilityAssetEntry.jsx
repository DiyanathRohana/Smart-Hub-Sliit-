import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8089/api/v1/facility-assets';

function EditFacilityAssetEntry() {
  const { assetId } = useParams();
  const [resourceName, setResourceName] = useState('');
  const [resourceType, setResourceType] = useState('LECTURE_HALL');
  const [capacity, setCapacity] = useState('');
  const [location, setLocation] = useState('');
  const [availabilityWindows, setAvailabilityWindows] = useState('');
  const [operationalStatus, setOperationalStatus] = useState('AVAILABLE');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const availabilityLabel = operationalStatus === 'AVAILABLE' ? 'Available Until' : 'Expected Availability';
  const availabilityHelperText = operationalStatus === 'AVAILABLE'
    ? 'Set the date and time until this asset can be used.'
    : 'Set when this asset is expected to become available again.';

  const getCurrentDateTimeLocal = () => {
    const now = new Date();
    now.setSeconds(0, 0);
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      navigate('/login');
      return;
    }

    fetchFacilityAsset();
  }, [assetId, navigate]);

  const parseField = (text, fieldName) => {
    const safeText = text || '';
    const pattern = new RegExp(`${fieldName}\\s*:\\s*([^;\\n]+)`, 'i');
    const match = safeText.match(pattern);
    return match ? match[1].trim() : '';
  };

  const normalizeDateTimeLocal = (value) => {
    if (!value) {
      return '';
    }

    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
      return value;
    }

    if (/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}$/.test(value)) {
      return value.replace(' ', 'T');
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return '';
    }

    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    const hours = String(parsed.getHours()).padStart(2, '0');
    const minutes = String(parsed.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const normalizeFacilityAsset = (data) => {
    if (!data) {
      return null;
    }

    if (data._id) {
      return data;
    }

    if (data.facilityAsset && data.facilityAsset._id) {
      return data.facilityAsset;
    }

    if (data.data && data.data._id) {
      return data.data;
    }

    return null;
  };

  const fetchFacilityAsset = async () => {
    try {
      const response = await axios.get(`${API_URL}/${assetId}`, { withCredentials: true });
      const facilityAsset = normalizeFacilityAsset(response.data);

      if (!facilityAsset) {
        setError('Facility asset not found');
        setLoading(false);
        return;
      }

      setResourceName(facilityAsset.title || '');
      setResourceType(parseField(facilityAsset.description, 'Type') || 'LECTURE_HALL');
      setCapacity(parseField(facilityAsset.description, 'Capacity') || '');
      setLocation(parseField(facilityAsset.description, 'Location') || '');
      setAvailabilityWindows(normalizeDateTimeLocal(
        parseField(facilityAsset.description, 'Availability Update')
        || parseField(facilityAsset.description, 'Availability Windows')
      ));

      const parsedStatus = (parseField(facilityAsset.description, 'Status') || '').toUpperCase();
      if (parsedStatus === 'BOOKED') {
        setOperationalStatus('BOOKED');
      } else if (parsedStatus === 'MAINTENANCE') {
        setOperationalStatus('MAINTENANCE');
      } else {
        setOperationalStatus('AVAILABLE');
      }

      setError(null);
      setLoading(false);
    } catch (err) {
      setError('Error fetching facility asset details');
      console.error('Error fetching facility asset details:', err);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const user = JSON.parse(localStorage.getItem('user'));

      if (!availabilityWindows) {
        setError('Please select a valid date and time.');
        return;
      }

      if (new Date(availabilityWindows) < new Date()) {
        setError('Past dates or times are not allowed.');
        return;
      }

      const description = [
        `Type: ${resourceType}`,
        `Capacity: ${capacity}`,
        `Location: ${location}`,
        `Availability Update: ${availabilityWindows}`,
        `Status: ${operationalStatus}`
      ].join('; ');

      const facilityAsset = {
        _id: assetId,
        title: resourceName,
        description,
        userId: user.userId,
        username: user.username,
        status: operationalStatus === 'AVAILABLE' ? 'NOT_STARTED' : 'COMPLETED',
        isPublic: true
      };

      const response = await axios.put(`${API_URL}/edit/${assetId}`, facilityAsset, { withCredentials: true });

      if (response.data.success) {
        alert('Facility asset updated successfully!');
        navigate(`/facility-asset/${assetId}`);
      } else {
        setError(response.data.message || 'Error updating facility asset');
      }
    } catch (err) {
      setError('Error updating facility asset');
      console.error('Error updating facility asset:', err);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mt-4">
          <div className="d-flex justify-content-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container sc-page-shell">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card sc-card">
              <div className="sc-card-header">
                <h3 className="mb-0 fw-bold">Edit Facility Asset</h3>
                <p className="mb-0 mt-1 opacity-75 small">Update details and operational status for this resource.</p>
              </div>
              <div className="card-body">
                {error && (
                  <div className="alert alert-danger d-flex align-items-center gap-2" role="alert">
                    <i className="bi bi-exclamation-triangle-fill"></i>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="resourceName" className="form-label">Asset Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="resourceName"
                      value={resourceName}
                      onChange={(e) => setResourceName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="resourceType" className="form-label">Asset Type</label>
                      <select
                        className="form-select"
                        id="resourceType"
                        value={resourceType}
                        onChange={(e) => setResourceType(e.target.value)}
                        required
                      >
                        <option value="LECTURE_HALL">Lecture halls</option>
                        <option value="LAB">Labs</option>
                        <option value="EQUIPMENT">Equipment</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="capacity" className="form-label">Capacity</label>
                      <input
                        type="number"
                        min="1"
                        className="form-control"
                        id="capacity"
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="location" className="form-label">Location</label>
                    <input
                      type="text"
                      className="form-control"
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="availabilityWindows" className="form-label">{availabilityLabel}</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      id="availabilityWindows"
                      value={availabilityWindows}
                      onChange={(e) => setAvailabilityWindows(e.target.value)}
                      min={getCurrentDateTimeLocal()}
                      step="60"
                      required
                    />
                    <small className="text-muted">{availabilityHelperText}</small>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="status" className="form-label">Operational Status</label>
                    <select
                      className="form-select"
                      id="status"
                      value={operationalStatus}
                      onChange={(e) => setOperationalStatus(e.target.value)}
                      required
                    >
                      <option value="AVAILABLE">Available</option>
                      <option value="BOOKED">Booked/Full</option>
                      <option value="MAINTENANCE">Maintenance</option>
                    </select>
                  </div>

                  <div className="d-flex justify-content-between gap-2 flex-wrap">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => navigate(`/facility-asset/${assetId}`)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary fw-semibold px-4">
                      Update Facility Asset
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default EditFacilityAssetEntry;
