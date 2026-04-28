import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8089/api/v1';

const VALID_STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

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

function AdminMaintenanceTickets() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedImageError, setSelectedImageError] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [updating, setUpdating] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [statusModal, setStatusModal] = useState({ open: false, ticket: null });
  const [modalStatus, setModalStatus] = useState('');
  const [modalNotes, setModalNotes] = useState('');

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const res = await axios.get(`${API_URL}/user/info`, { withCredentials: true });
        if (!res.data?.authenticated) {
          navigate('/login');
          return;
        }
        const role = (res.data?.role || '').toString().trim().toUpperCase();
        const isPrivileged = role === 'ADMIN' || role === 'ROLE_ADMIN' || role === 'TECHNICIAN' || role === 'ROLE_TECHNICIAN';
        if (!isPrivileged) {
          navigate('/');
          return;
        }
        fetchTickets();
      } catch {
        navigate('/login');
      }
    };

    bootstrap();
    // eslint-disable-next-line
  }, []);

  const fetchTickets = () => {
    setLoading(true);
    axios
      .get(`${API_URL}/maintenance-tickets/all`, { withCredentials: true })
      .then((res) => setTickets(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        if (err.response?.status === 401) navigate('/login');
        else if (err.response?.status === 403) setError('You do not have permission to view maintenance tickets.');
        else setError('Failed to load maintenance tickets.');
      })
      .finally(() => setLoading(false));
  };

  const openStatusModal = (ticket) => {
    setModalStatus(ticket.status || 'OPEN');
    setModalNotes(ticket.technicianResolutionNotes || '');
    setStatusModal({ open: true, ticket });
  };

  const closeStatusModal = () => {
    setStatusModal({ open: false, ticket: null });
    setModalStatus('');
    setModalNotes('');
  };

  const submitStatusUpdate = async () => {
    const { ticket } = statusModal;
    if (!modalStatus) return;
    setUpdating(ticket._id);
    closeStatusModal();
    try {
      const res = await axios.put(
        `${API_URL}/maintenance-tickets/${ticket._id}/status`,
        { status: modalStatus, resolutionNotes: modalNotes },
        { withCredentials: true }
      );
      if (res.data?.success) {
        setTickets((prev) =>
          prev.map((t) =>
            t._id === ticket._id
              ? { ...t, status: modalStatus, technicianResolutionNotes: modalNotes || t.technicianResolutionNotes }
              : t
          )
        );
        showToast(`Status updated to ${modalStatus.replace('_', ' ')}`);
      }
    } catch {
      showToast('Failed to update status.', true);
    } finally {
      setUpdating(null);
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    if (!window.confirm('Delete this maintenance ticket? This cannot be undone.')) return;
    setDeleting(ticketId);
    try {
      await axios.delete(`${API_URL}/maintenance-tickets/${ticketId}`, { withCredentials: true });
      setTickets(prev => prev.filter(t => t._id !== ticketId));
      showToast('Ticket deleted.');
    } catch {
      showToast('Failed to delete ticket.', true);
    } finally {
      setDeleting(null);
    }
  };

  const showToast = (msg, isError = false) => {
    setToastMsg({ text: msg, error: isError });
    setTimeout(() => setToastMsg(''), 3500);
  };

  const filtered = filterStatus === 'ALL'
    ? tickets
    : tickets.filter((t) => (t.status || '').toUpperCase() === filterStatus);

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


      {/* Status update modal */}
      {statusModal.open && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 100000 }}
        >
          <div className="card shadow" style={{ width: 'min(520px, 92vw)' }}>
            <div
              className="card-header d-flex justify-content-between align-items-center"
              style={{ background: 'var(--sc-blue)', color: '#fff' }}
            >
              <h6 className="mb-0 fw-bold">Update Ticket Status</h6>
              <button type="button" className="btn btn-sm btn-light" onClick={closeStatusModal}>Close</button>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label fw-semibold">Status</label>
                <select
                  className="form-select"
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value)}
                >
                  {VALID_STATUSES.map((s) => (
                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <div className="mb-1">
                <label className="form-label fw-semibold">Resolution Notes</label>
                <textarea
                  className="form-control"
                  rows={4}
                  maxLength={500}
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  placeholder="Describe the resolution or current action taken…"
                />
                <div className="form-text text-end">{modalNotes.length}/500</div>
              </div>
            </div>
            <div className="card-footer d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-outline-secondary" onClick={closeStatusModal}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={submitStatusUpdate}>
                Save Update
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h4 className="fw-bold mb-0">
          <i className="bi bi-clipboard-check me-2"></i>All Maintenance Tickets
        </h4>
        <div className="d-flex gap-2 align-items-center">
          <label className="fw-semibold text-muted small mb-0">Filter:</label>
          <select
            className="form-select form-select-sm"
            style={{ width: 'auto' }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="ALL">All</option>
            {VALID_STATUSES.map((s) => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {toastMsg && (
        <div
          className={`alert ${toastMsg.error ? 'alert-danger' : 'alert-success'} py-2 px-3`}
          style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 99999, minWidth: 260 }}
        >
          {toastMsg.text}
        </div>
      )}

      {loading ? (
        <div className="d-flex justify-content-center mt-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading…</span>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-clipboard-x" style={{ fontSize: '3rem', color: 'var(--sc-blue)', opacity: 0.25 }}></i>
          <p className="mt-3 text-muted">No maintenance tickets found.</p>
        </div>
      ) : (
        <div className="card sc-card">
          <div className="table-responsive sc-table-wrap">
            <table className="table table-hover mb-0 align-middle sc-table">
              <thead>
                <tr>
                  <th className="ps-4 py-3">Resource / Location</th>
                  <th>Category</th>
                  <th>Submitted By</th>
                  <th>Description</th>
                  <th>Images</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Resolution Notes</th>
                  <th>Date</th>
                  <th>Update</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t._id}>
                    <td className="ps-4 fw-semibold">{t.resource || '—'}</td>
                    <td>{t.category || '—'}</td>
                    <td>{t.requesterName || t.requesterId || '—'}</td>
                    <td style={{ maxWidth: 220, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
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
                    <td style={{ maxWidth: 200, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {t.technicianResolutionNotes || <span className="text-muted fst-italic">—</span>}
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary"
                        disabled={updating === t._id}
                        onClick={() => openStatusModal(t)}
                      >
                        {updating === t._id
                          ? <span className="spinner-border spinner-border-sm" />
                          : 'Update'}
                      </button>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        disabled={deleting === t._id}
                        onClick={() => handleDeleteTicket(t._id)}
                      >
                        {deleting === t._id
                          ? <span className="spinner-border spinner-border-sm" />
                          : <i className="bi bi-trash"></i>}
                      </button>
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

export default AdminMaintenanceTickets;
