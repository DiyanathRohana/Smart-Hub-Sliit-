import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8089/api/v1';

const PRIORITY_STYLES = {
  HIGH:   { background: '#fef2f2', color: '#b91c1c', border: '1px solid #fca5a5' },
  MEDIUM: { background: '#fffbeb', color: '#b45309', border: '1px solid #fcd34d' },
  LOW:    { background: '#f0fdf4', color: '#15803d', border: '1px solid #86efac' },
};

const STATUS_STYLES = {
  OPEN:        { background: '#eff6ff', color: '#1d4ed8', border: '1px solid #93c5fd' },
  IN_PROGRESS: { background: '#fefce8', color: '#a16207', border: '1px solid #fde047' },
  RESOLVED:    { background: '#f0fdf4', color: '#15803d', border: '1px solid #86efac' },
  CLOSED:      { background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db' },
};

function chip(label, styles) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: '999px',
      fontSize: '0.72rem',
      fontWeight: 700,
      letterSpacing: '0.03em',
      ...styles,
    }}>
      {label}
    </span>
  );
}

function normalizeImageList(images) {
  if (Array.isArray(images)) {
    return images;
  }
  if (typeof images === 'string' && images.trim()) {
    try {
      const parsed = JSON.parse(images);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      // Ignore parse errors and continue with simple fallback.
    }
    return [images];
  }
  return [];
}

function resolveImageSrc(raw) {
  const value = (raw || '').toString().trim();
  if (!value) {
    return '';
  }
  if (value.startsWith('data:image/') || value.startsWith('http://') || value.startsWith('https://') || value.startsWith('blob:')) {
    return value;
  }
  if (/\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(value)) {
    const backendBase = API_URL.replace('/api/v1', '');
    return `${backendBase}/uploads/${encodeURIComponent(value)}`;
  }

  // Handle raw base64 strings (without data URL prefix) from legacy records.
  if (/^[A-Za-z0-9+/=\s]+$/.test(value) && value.length > 120) {
    return `data:image/jpeg;base64,${value.replace(/\s+/g, '')}`;
  }

  return '';
}

function renderTicketImages(images, onOpenImage) {
  const list = normalizeImageList(images);
  if (list.length === 0) {
    return <span className="text-muted small">—</span>;
  }

  return (
    <div className="d-flex gap-1 flex-wrap">
      {list.slice(0, 3).map((img, idx) => {
        const value = typeof img === 'object' && img !== null
          ? (img.imageDataUrl || img.url || img.src || img.fileName || '')
          : img;
        const src = resolveImageSrc(value);
        return src ? (
          <button
            key={`${idx}-${value.slice(0, 20)}`}
            type="button"
            onClick={() => onOpenImage(src)}
            className="btn p-0 border-0 bg-transparent"
            title="Open image"
          >
            <img
              src={src}
              alt={`Ticket attachment ${idx + 1}`}
              style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 6, border: '1px solid #cfdcf0' }}
            />
          </button>
        ) : (
          <span
            key={`${idx}-${value}`}
            className="badge text-bg-light border"
            title={(value || '').toString()}
          >
            {(value || 'image').toString().slice(0, 10)}
          </span>
        );
      })}
    </div>
  );
}

function MyMaintenanceTickets() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedImageError, setSelectedImageError] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const userRes = await axios.get(`${API_URL}/user/info`, { withCredentials: true });
        if (!userRes.data?.authenticated || !userRes.data?.userId) {
          navigate('/login');
          return;
        }

        const ticketsRes = await axios.get(`${API_URL}/maintenance-tickets/user/${userRes.data.userId}`, { withCredentials: true });
        setTickets(Array.isArray(ticketsRes.data) ? ticketsRes.data : []);
      } catch (err) {
        if (err.response?.status === 401) navigate('/login');
        else setError('Failed to load your maintenance tickets.');
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [navigate]);

  return (
    <div className="container sc-page-shell">
      {selectedImage && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 100000 }}
          onClick={() => {
            setSelectedImage('');
            setSelectedImageError(false);
          }}
        >
          <div className="position-relative" style={{ width: 'min(92vw, 980px)', maxHeight: '90vh' }}>
            <button
              type="button"
              className="btn btn-light btn-sm position-absolute top-0 end-0 m-2"
              onClick={() => {
                setSelectedImage('');
                setSelectedImageError(false);
              }}
            >
              Close
            </button>
            {selectedImageError ? (
              <div className="alert alert-warning m-0">Unable to load this image preview.</div>
            ) : (
              <img
                src={selectedImage}
                alt="Ticket attachment preview"
                onError={() => setSelectedImageError(true)}
                style={{ width: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: 10, background: '#fff' }}
              />
            )}
          </div>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h4 className="fw-bold mb-0">
          <i className="bi bi-tools me-2"></i>My Maintenance Tickets
        </h4>
        <button
          className="btn btn-primary fw-semibold px-4"
          onClick={() => navigate('/maintenance-ticket')}
        >
          <i className="bi bi-plus-lg me-2"></i>New Ticket
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="d-flex justify-content-center mt-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading…</span>
          </div>
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-tools" style={{ fontSize: '3rem', color: 'var(--sc-blue)', opacity: 0.25 }}></i>
          <p className="mt-3 text-muted">You haven't submitted any maintenance tickets yet.</p>
          <button className="btn btn-primary px-4" onClick={() => navigate('/maintenance-ticket')}>
            Create a Ticket
          </button>
        </div>
      ) : (
        <div className="card sc-card">
          <div className="table-responsive sc-table-wrap">
            <table className="table table-hover mb-0 align-middle sc-table">
              <thead>
                <tr>
                  <th className="ps-4 py-3">Resource / Location</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Images</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Resolution Notes</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t._id}>
                    <td className="ps-4 fw-semibold">{t.resource || '—'}</td>
                    <td>{t.category || '—'}</td>
                    <td style={{ maxWidth: 240, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {t.description || '—'}
                    </td>
                    <td>{renderTicketImages(t.images, (src) => {
                      setSelectedImage(src);
                      setSelectedImageError(false);
                    })}</td>
                    <td>
                      {chip(
                        (t.priority || 'MEDIUM').toUpperCase(),
                        PRIORITY_STYLES[(t.priority || 'MEDIUM').toUpperCase()] || PRIORITY_STYLES.MEDIUM
                      )}
                    </td>
                    <td>
                      {chip(
                        (t.status || 'OPEN').replace('_', ' '),
                        STATUS_STYLES[(t.status || 'OPEN').toUpperCase()] || STATUS_STYLES.OPEN
                      )}
                    </td>
                    <td style={{ maxWidth: 220, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {t.technicianResolutionNotes || <span className="text-muted fst-italic">Pending</span>}
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyMaintenanceTickets;
