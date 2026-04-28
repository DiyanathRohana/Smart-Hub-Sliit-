import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8089/api/v1/facility-assets";

function AddFacilityAssetEntry() {
  const [user, setUser] = useState(null);
  const [resourceName, setResourceName] = useState('');
  const [resourceType, setResourceType] = useState('LECTURE_HALL');
  const [capacity, setCapacity] = useState('');
  const [location, setLocation] = useState('');
  const [availabilityWindows, setAvailabilityWindows] = useState('');
  const [status, setStatus] = useState('AVAILABLE');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const availabilityLabel = status === 'AVAILABLE' ? 'Available Until' : 'Expected Availability';
  const availabilityHelperText = status === 'AVAILABLE'
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
    fetchCurrentUser();
  }, [navigate]);

  const fetchCurrentUser = async () => {
    try {
      const userInfoResponse = await axios.get('http://localhost:8089/api/v1/user/info', { withCredentials: true });
      if (!userInfoResponse.data?.authenticated) {
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }

      const sessionUser = {
        userId: userInfoResponse.data.userId,
        username: userInfoResponse.data.username || userInfoResponse.data.name || 'User'
      };

      setUser(sessionUser);
      localStorage.setItem('user', JSON.stringify(sessionUser));
    } catch (error) {
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      if (!user?.userId) {
        setError('Your session has expired. Please log in again.');
        navigate('/login');
        return;
      }

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
        `Status: ${status}`
      ].join('; ');
      
      const facilityAsset = {
        title: resourceName,
        description,
        userId: user.userId,
        username: user.username,
        status: status === 'AVAILABLE' ? 'NOT_STARTED' : 'COMPLETED',
        isPublic: true
      };
      
      const response = await axios.post(`${API_URL}/save`, facilityAsset, { withCredentials: true });
      
      if (response.data.success) {
        alert('Facility asset created successfully!');
        navigate('/facility-assets');
      } else {
        setError(response.data.message || 'Error creating facility asset');
      }
    } catch (error) {
      setError('Error creating facility asset');
      console.error('Error creating facility asset:', error);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container sc-page-shell">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card sc-card">
              <div className="sc-card-header">
                <h3 className="mb-0 fw-bold">Add Facility Asset</h3>
                <p className="mb-0 mt-1 opacity-75 small">Create a new facility or resource entry for the campus catalogue.</p>
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

                  <div className="mb-4">
                    <label htmlFor="status" className="form-label">Operational Status</label>
                    <select
                      className="form-select"
                      id="status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
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
                      onClick={() => navigate('/facility-assets')}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary fw-semibold px-4">
                      Save Facility Asset
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

export default AddFacilityAssetEntry;
