import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8089/api/v1/facility-assets";

function FacilityAssetList() {
  const [user, setUser] = useState(null);
  const [facilityAssets, setFacilityAssets] = useState([]);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'my'
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [capacityFilter, setCapacityFilter] = useState('');
  const navigate = useNavigate();

  const normalizeFacilityAssets = (data) => {
    if (Array.isArray(data)) {
      return data;
    }

    if (data && typeof data === 'object') {
      if (Array.isArray(data.facilityAssets)) {
        return data.facilityAssets;
      }

      if (Array.isArray(data.learningPlans)) {
        return data.learningPlans;
      }

      if (Array.isArray(data.data)) {
        return data.data;
      }

      if (typeof data[Symbol.iterator] === 'function') {
        return Array.from(data);
      }
    }

    return [];
  };
  
  useEffect(() => {
    fetchCurrentUser();
  }, [navigate, filter]);

  const fetchCurrentUser = async () => {
    try {
      const userInfoResponse = await axios.get('http://localhost:8089/api/v1/user/info', { withCredentials: true });
      if (!userInfoResponse.data?.authenticated) {
        navigate('/login');
        return;
      }

      const sessionUser = {
        userId: userInfoResponse.data.userId,
        username: userInfoResponse.data.username || userInfoResponse.data.name || 'User'
      };

      setUser(sessionUser);
      localStorage.setItem('user', JSON.stringify(sessionUser));
      fetchFacilityAssets(sessionUser);
    } catch (error) {
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const fetchFacilityAssets = async (currentUser) => {
    try {
      let endpoint = '/getall';
      
      if (filter === 'my') {
        if (!currentUser?.userId) {
          setError('Unable to load your facility assets. User session not available.');
          return;
        }
        endpoint = `/user/${currentUser.userId}`;
      }
      
      const response = await axios.get(`${API_URL}${endpoint}`, { withCredentials: true });
      setFacilityAssets(normalizeFacilityAssets(response.data));
    } catch (error) {
      setError('Error fetching catalogue entries');
      console.error('Error fetching catalogue entries:', error);
      setFacilityAssets([]);
    }
  };

  const handleViewFacilityAsset = (assetId) => {
    navigate(`/facility-asset/${assetId}`);
  };

  const handleEditFacilityAsset = (assetId) => {
    navigate(`/edit-facility-asset/${assetId}`);
  };

  const handleDeleteFacilityAsset = async (assetId) => {
    if (window.confirm('Are you sure you want to delete this facility asset?')) {
      try {
        await axios.delete(`${API_URL}/delete/${assetId}`, { withCredentials: true });
        alert('Facility asset deleted successfully');
        fetchFacilityAssets(user); // Refresh the list
      } catch (error) {
        setError('Error deleting facility asset');
        console.error('Error deleting facility asset:', error);
      }
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const parseOperationalStatus = (description) => {
    const match = (description || '').match(/Status\s*:\s*([^;\n]+)/i);
    return match ? match[1].trim().toUpperCase() : '';
  };

  const parseDescriptionField = (description, fieldName) => {
    const match = (description || '').match(new RegExp(`${fieldName}\s*:\s*([^;\n]+)`, 'i'));
    return match ? match[1].trim() : '';
  };

  const getAvailabilityValue = (description) => {
    return parseDescriptionField(description, 'Availability Update')
      || parseDescriptionField(description, 'Availability Windows');
  };

  const formatAvailabilityValue = (value) => {
    if (!value) {
      return 'Not specified';
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

    return parsed.toLocaleString();
  };

  const getAvailabilityLabel = (status) => {
    return status === 'AVAILABLE' ? 'Available Until' : 'Expected Availability';
  };

  const renderFacilityAssetStatus = (operationalStatus) => {
    switch (operationalStatus) {
      case 'AVAILABLE':
        return <span className="sc-badge-active">Available</span>;
      case 'BOOKED':
        return <span className="sc-badge-inactive">Booked/Full</span>;
      case 'MAINTENANCE':
        return <span className="sc-badge-maintenance">Maintenance</span>;
      default:
        return <span className="sc-badge-unknown">Unknown</span>;
    }
  };

  const getFilterableText = (plan) => {
    return `${plan.title || ''} ${plan.description || ''}`.toLowerCase();
  };

  const getTaggedFieldValue = (plan, fieldName) => {
    const combinedText = getFilterableText(plan);
    const fieldPattern = new RegExp(`${fieldName}\\s*[:=-]\\s*([^,;\\n]+)`, 'i');
    const match = combinedText.match(fieldPattern);
    return match ? match[1].trim() : '';
  };

  const filteredFacilityAssets = facilityAssets.filter((asset) => {
    const filterText = getFilterableText(asset);
    const searchMatch = searchTerm
      ? filterText.includes(searchTerm.toLowerCase())
      : true;

    const locationValue = getTaggedFieldValue(asset, 'location');
    const locationMatch = locationFilter
      ? locationValue.includes(locationFilter.toLowerCase()) || filterText.includes(locationFilter.toLowerCase())
      : true;

    const capacityValue = getTaggedFieldValue(asset, 'capacity');
    const capacityMatch = capacityFilter
      ? capacityValue.includes(capacityFilter.toLowerCase()) || filterText.includes(capacityFilter.toLowerCase())
      : true;

    return searchMatch && locationMatch && capacityMatch;
  });

  const canManageAsset = (asset) => {
    return !!user?.userId && asset.userId === user.userId;
  };

  const totalResources = facilityAssets.length;
  const currentlyAvailable = facilityAssets.filter(
    (asset) => parseOperationalStatus(asset.description) === 'AVAILABLE'
  ).length;
  const underMaintenance = facilityAssets.filter(
    (asset) => parseOperationalStatus(asset.description) === 'MAINTENANCE'
  ).length;

  return (
    <>
      <Navbar />
      <div className="container sc-page-shell">

        {/* Page header */}
        <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 gap-3">
          <div>
            <h1 className="sc-page-title mb-0">
              <i className="bi bi-house-door me-2 text-primary"></i>Home
            </h1>
            <p className="text-muted mb-0" style={{fontSize:'0.9rem'}}>Browse and manage campus resources</p>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <button
              className={`btn btn-sm fw-semibold ${filter === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => handleFilterChange('all')}
            >
              All
            </button>
            <button
              className={`btn btn-sm fw-semibold ${filter === 'my' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => handleFilterChange('my')}
            >
              My Entries
            </button>
            <button
              className="btn btn-sm btn-outline-secondary fw-semibold"
              onClick={() => navigate('/notifications')}
            >
              <i className="bi bi-bell me-1"></i>Notifications
            </button>
          </div>
        </div>

        {/* Analytics overview */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="sc-overview-card h-100">
              <div className="sc-overview-icon sc-overview-icon-available">
                <i className="bi bi-check2-circle"></i>
              </div>
              <div>
                <p className="sc-overview-label mb-1">Currently Available</p>
                <h3 className="sc-overview-value mb-0">{currentlyAvailable}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="sc-overview-card h-100">
              <div className="sc-overview-icon sc-overview-icon-total">
                <i className="bi bi-grid-3x3-gap"></i>
              </div>
              <div>
                <p className="sc-overview-label mb-1">Total Resources</p>
                <h3 className="sc-overview-value mb-0">{totalResources}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="sc-overview-card h-100">
              <div className="sc-overview-icon sc-overview-icon-maintenance">
                <i className="bi bi-tools"></i>
              </div>
              <div>
                <p className="sc-overview-label mb-1">Under Maintenance</p>
                <h3 className="sc-overview-value mb-0">{underMaintenance}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Search / filter panel */}
        <div className="sc-filter-panel">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label htmlFor="catalogueSearch" className="form-label fw-semibold small text-uppercase text-muted" style={{letterSpacing:'0.05em'}}>Search</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  id="catalogueSearch"
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Name, description or specs…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-4">
              <label htmlFor="locationFilter" className="form-label fw-semibold small text-uppercase text-muted" style={{letterSpacing:'0.05em'}}>Location</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-geo-alt text-muted"></i>
                </span>
                <input
                  id="locationFilter"
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="e.g., Lab 01"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-4">
              <label htmlFor="capacityFilter" className="form-label fw-semibold small text-uppercase text-muted" style={{letterSpacing:'0.05em'}}>Capacity</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-people text-muted"></i>
                </span>
                <input
                  id="capacityFilter"
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="e.g., 40"
                  value={capacityFilter}
                  onChange={(e) => setCapacityFilter(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2" role="alert">
            <i className="bi bi-exclamation-triangle-fill"></i>{error}
          </div>
        )}

        {facilityAssets.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-inbox" style={{fontSize:'3rem', color:'#94a3b8'}}></i>
            <p className="text-muted mt-3">No catalogue entries found. Add your first facility or asset!</p>
          </div>
        ) : filteredFacilityAssets.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-search" style={{fontSize:'3rem', color:'#94a3b8'}}></i>
            <p className="text-muted mt-3">No entries match your search or filter criteria.</p>
          </div>
        ) : (
          <div className="row g-4">
            {filteredFacilityAssets.map((asset) => (
              <div key={asset._id} className="col-md-4">
                <div className="card sc-card h-100">
                  <div className="sc-card-header d-flex justify-content-between align-items-start">
                    <h5 className="mb-0 fw-semibold" style={{lineHeight:1.3}}>{asset.title}</h5>
                    {renderFacilityAssetStatus(parseOperationalStatus(asset.description))}
                  </div>
                  <div className="card-body d-flex flex-column">
                    <div className="text-muted flex-grow-1" style={{ fontSize:'0.9rem' }}>
                      <p className="mb-2">
                        <strong>Type:</strong> {parseDescriptionField(asset.description, 'Type') || '-'}
                      </p>
                      <p className="mb-2">
                        <strong>Location:</strong> {parseDescriptionField(asset.description, 'Location') || '-'}
                      </p>
                      <p className="mb-2">
                        <strong>Capacity:</strong> {parseDescriptionField(asset.description, 'Capacity') || '-'}
                      </p>
                      <p className="mb-0">
                        <strong>{getAvailabilityLabel(parseOperationalStatus(asset.description))}:</strong>{' '}
                        {formatAvailabilityValue(getAvailabilityValue(asset.description))}
                      </p>
                    </div>
                    <p className="mb-0 mt-2">
                      <small className="text-muted">
                        <i className="bi bi-person me-1"></i>{asset.username}
                      </small>
                    </p>
                  </div>
                  <div className="card-footer bg-white border-top d-flex gap-2 justify-content-end">
                    <button
                      className="btn btn-sm btn-outline-primary fw-semibold"
                      onClick={() => handleViewFacilityAsset(asset._id)}
                    >
                      <i className="bi bi-eye me-1"></i>View
                    </button>
                    {canManageAsset(asset) && (
                      <>
                        <button
                          className="btn btn-sm btn-outline-warning fw-semibold"
                          onClick={() => handleEditFacilityAsset(asset._id)}
                        >
                          <i className="bi bi-pencil me-1"></i>Edit
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger fw-semibold"
                          onClick={() => handleDeleteFacilityAsset(asset._id)}
                        >
                          <i className="bi bi-trash me-1"></i>Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default FacilityAssetList;
