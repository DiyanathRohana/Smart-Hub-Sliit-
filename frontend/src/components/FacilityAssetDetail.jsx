import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8089/api/v1";

function FacilityAssetDetail() {
  const { assetId } = useParams();
  const [facilityAsset, setFacilityAsset] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      navigate('/login');
      return;
    }

    fetchFacilityAsset();
  }, [assetId, navigate]);

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
      const response = await axios.get(`${API_URL}/facility-assets/${assetId}`, { withCredentials: true });
      const normalized = normalizeFacilityAsset(response.data);

      if (!normalized) {
        setError('Facility asset not found');
        setFacilityAsset(null);
      } else {
        setFacilityAsset(normalized);
        setError(null);
      }
      setLoading(false);
    } catch (error) {
      setError('Error fetching facility asset details');
      console.error('Error fetching facility asset details:', error);
      setFacilityAsset(null);
      setLoading(false);
    }
  };

  const renderAvailabilityStatus = (operationalStatus) => {
    switch ((operationalStatus || '').toUpperCase()) {
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

  const parseDescriptionField = (text, fieldName) => {
    const safeText = text || '';
    const pattern = new RegExp(`${fieldName}\\s*:\\s*([^;\\n]+)`, 'i');
    const match = safeText.match(pattern);
    return match ? match[1].trim() : '-';
  };

  const formatAvailabilityValue = (value) => {
    if (!value || value === '-') {
      return 'Not specified';
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

    return parsed.toLocaleString();
  };

  const getAvailabilityLabel = (operationalStatus) => {
    return (operationalStatus || '').toUpperCase() === 'AVAILABLE'
      ? 'Available Until'
      : 'Expected Availability';
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

  if (error || !facilityAsset) {
    return (
      <>
        <Navbar />
        <div className="container mt-4">
          <div className="alert alert-danger" role="alert">
            {error || 'Facility asset not found'}
          </div>
          <Link to="/facility-assets" className="btn btn-primary">
            Back to Catalogue
          </Link>
        </div>
      </>
    );
  }

  const user = JSON.parse(localStorage.getItem('user'));
  const isOwner = user.userId === facilityAsset.userId;
  const parsedType = parseDescriptionField(facilityAsset.description, 'Type');
  const parsedCapacity = parseDescriptionField(facilityAsset.description, 'Capacity');
  const parsedLocation = parseDescriptionField(facilityAsset.description, 'Location');
  const parsedOperationalStatus = parseDescriptionField(facilityAsset.description, 'Status');
  const parsedAvailabilityWindows = parseDescriptionField(facilityAsset.description, 'Availability Update') !== '-'
    ? parseDescriptionField(facilityAsset.description, 'Availability Update')
    : parseDescriptionField(facilityAsset.description, 'Availability Windows');

  return (
    <>
      <Navbar />
      <div className="container sc-page-shell">
        <div className="row justify-content-center">
          <div className="col-lg-9">

            {/* Back link */}
            <Link to="/facility-assets" className="d-inline-flex align-items-center gap-1 text-decoration-none text-muted mb-3 small fw-semibold">
              <i className="bi bi-arrow-left"></i> Back to Catalogue
            </Link>

            <div className="card sc-card">
              {/* Card header */}
              <div className="sc-card-header d-flex align-items-center justify-content-between flex-wrap gap-2">
                <div>
                  <h2 className="mb-1 fw-bold fs-4">{facilityAsset.title}</h2>
                  <small className="opacity-75">
                    <i className="bi bi-person me-1"></i>{facilityAsset.username}
                  </small>
                </div>
                {renderAvailabilityStatus(parsedOperationalStatus)}
              </div>

              <div className="card-body p-4">
                <h6 className="fw-bold text-uppercase text-muted mb-3" style={{fontSize:'0.72rem', letterSpacing:'0.06em'}}>
                  <i className="bi bi-info-circle me-1"></i>Asset Details
                </h6>
                <div className="sc-detail-grid mb-4">
                  <div className="sc-detail-item">
                    <span className="sc-detail-label">Type</span>
                    <span className="sc-detail-value">{parsedType}</span>
                  </div>
                  <div className="sc-detail-item">
                    <span className="sc-detail-label">Capacity</span>
                    <span className="sc-detail-value">{parsedCapacity}</span>
                  </div>
                  <div className="sc-detail-item">
                    <span className="sc-detail-label">Location</span>
                    <span className="sc-detail-value">{parsedLocation}</span>
                  </div>
                  <div className="sc-detail-item">
                    <span className="sc-detail-label">{getAvailabilityLabel(parsedOperationalStatus)}</span>
                    <span className="sc-detail-value">{formatAvailabilityValue(parsedAvailabilityWindows)}</span>
                  </div>
                  <div className="sc-detail-item">
                    <span className="sc-detail-label">Operational Status</span>
                    <span className="sc-detail-value">{renderAvailabilityStatus(parsedOperationalStatus)}</span>
                  </div>
                </div>

                {isOwner && (
                  <div className="d-flex justify-content-end pt-2">
                    <Link to={`/edit-facility-asset/${assetId}`} className="btn btn-warning fw-semibold px-4">
                      <i className="bi bi-pencil me-2"></i>Edit Asset
                    </Link>
                  </div>
                )}

                {/* Book This Resource — available to all logged-in users */}
                <div className={`d-flex ${isOwner ? 'mt-2' : 'pt-2'} justify-content-end`}>
                  <button
                    className="btn btn-primary fw-semibold px-4"
                    onClick={() =>
                      navigate(`/book?resourceId=${encodeURIComponent(facilityAsset._id)}&resourceTitle=${encodeURIComponent(facilityAsset.title)}`)
                    }
                  >
                    <i className="bi bi-calendar-plus me-2"></i>Book This Resource
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default FacilityAssetDetail;
