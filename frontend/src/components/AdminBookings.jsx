import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8089/api/v1";

const VALID_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'];

function AdminBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [rejectionModal, setRejectionModal] = useState({ open: false, bookingId: null });
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

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
        fetchBookings();
      } catch {
        navigate('/login');
      }
    };

    bootstrap();
    // eslint-disable-next-line
  }, []);

  const fetchBookings = () => {
    setLoading(true);
    axios.get(`${API_URL}/bookings/all`, { withCredentials: true })
      .then(res => setBookings(Array.isArray(res.data) ? res.data : []))
      .catch(err => {
        if (err.response?.status === 401) navigate('/login');
        else if (err.response?.status === 403) setError('You do not have permission to view bookings.');
        else setError('Failed to load bookings.');
      })
      .finally(() => setLoading(false));
  };

  const performStatusUpdate = async (bookingId, newStatus, reason = '') => {
    setUpdating(bookingId);
    try {
      const res = await axios.put(
        `${API_URL}/bookings/${bookingId}/status`,
        { status: newStatus, reason },
        { withCredentials: true }
      );
      if (res.data.success) {
        setBookings(prev => prev.map(b => b._id === bookingId
          ? { ...b, status: newStatus, rejectionReason: reason || null }
          : b));
        showToast(`Status updated to ${newStatus}`);
      }
    } catch (err) {
      showToast('Failed to update status.', true);
    } finally {
      setUpdating(null);
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm('Delete this booking? This cannot be undone.')) return;
    setDeleting(bookingId);
    try {
      await axios.delete(`${API_URL}/bookings/${bookingId}`, { withCredentials: true });
      setBookings(prev => prev.filter(b => b._id !== bookingId));
      showToast('Booking deleted.');
    } catch {
      showToast('Failed to delete booking.', true);
    } finally {
      setDeleting(null);
    }
  };

  const handleStatusChange = async (bookingId, newStatus, currentReason) => {
    if (newStatus === 'REJECTED') {
      setRejectionReasonInput(currentReason || '');
      setRejectionModal({ open: true, bookingId });
      return;
    }

    await performStatusUpdate(bookingId, newStatus);
  };

  const submitRejection = async () => {
    const reason = rejectionReasonInput.trim();
    if (!reason) {
      showToast('Rejection reason is required.', true);
      return;
    }

    const bookingId = rejectionModal.bookingId;
    setRejectionModal({ open: false, bookingId: null });
    await performStatusUpdate(bookingId, 'REJECTED', reason);
    setRejectionReasonInput('');
  };

  const closeRejectionModal = () => {
    setRejectionModal({ open: false, bookingId: null });
    setRejectionReasonInput('');
  };

  const showToast = (msg, isError = false) => {
    setToastMsg({ text: msg, error: isError });
    setTimeout(() => setToastMsg(''), 3500);
  };

  const statusBadge = (status) => {
    switch ((status || '').toUpperCase()) {
      case 'APPROVED': return <span className="sc-badge-active">Approved</span>;
      case 'REJECTED': return <span className="sc-badge-inactive">Rejected</span>;
      case 'PENDING':  return <span className="sc-badge-maintenance">Pending</span>;
      default:         return <span className="sc-badge-unknown">{status}</span>;
    }
  };

  const filtered = filterStatus === 'ALL'
    ? bookings
    : bookings.filter(b => (b.status || '').toUpperCase() === filterStatus);

  return (
    <>
      <Navbar />
      <div className="container sc-page-shell">

        {rejectionModal.open && (
          <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 100000 }}
          >
            <div className="card shadow" style={{ width: 'min(560px, 92vw)' }}>
              <div className="card-header d-flex justify-content-between align-items-center" style={{ background: 'var(--sc-blue)', color: '#fff' }}>
                <h6 className="mb-0 fw-bold">Add Rejection Reason</h6>
                <button type="button" className="btn btn-sm btn-light" onClick={closeRejectionModal}>Close</button>
              </div>
              <div className="card-body">
                <label className="form-label fw-semibold">Reason <span className="text-danger">*</span></label>
                <textarea
                  className="form-control"
                  rows={4}
                  maxLength={300}
                  value={rejectionReasonInput}
                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                  placeholder="Explain why this booking is rejected..."
                />
                <div className="form-text text-end">{rejectionReasonInput.length}/300</div>
              </div>
              <div className="card-footer d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-outline-secondary" onClick={closeRejectionModal}>Cancel</button>
                <button type="button" className="btn btn-danger" onClick={submitRejection}>
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {toastMsg && (
          <div
            className={`position-fixed top-0 end-0 m-3 alert ${toastMsg.error ? 'alert-danger' : 'alert-success'} d-flex align-items-center gap-2 shadow`}
            style={{ zIndex: 99999, minWidth: 250 }}
          >
            <i className={`bi ${toastMsg.error ? 'bi-x-circle-fill' : 'bi-check-circle-fill'}`}></i>
            {toastMsg.text}
          </div>
        )}

        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <h4 className="fw-bold mb-0"><i className="bi bi-calendar2-week me-2"></i>Manage Bookings</h4>
          <div className="d-flex align-items-center gap-2">
            <label className="fw-semibold small mb-0">Filter:</label>
            <select
              className="form-select form-select-sm"
              style={{ width: 'auto' }}
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="ALL">All</option>
              {VALID_STATUSES.map(s => (
                <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
              ))}
            </select>
            <button className="btn btn-sm btn-outline-secondary" onClick={fetchBookings}>
              <i className="bi bi-arrow-clockwise"></i>
            </button>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <div className="d-flex justify-content-center mt-5">
            <div className="spinner-border" role="status"><span className="visually-hidden">Loading…</span></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-inbox" style={{ fontSize: '3rem', opacity: 0.25 }}></i>
            <p className="mt-3">No {filterStatus !== 'ALL' ? filterStatus.toLowerCase() : ''} bookings found.</p>
          </div>
        ) : (
          <div className="card sc-card">
            <div className="table-responsive sc-table-wrap">
              <table className="table table-hover mb-0 align-middle sc-table">
                <thead>
                  <tr>
                    <th className="ps-4 py-3">Resource</th>
                    <th>Requested By</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Attendees</th>
                    <th>Purpose</th>
                    <th>Status</th>
                    <th>Reason</th>
                    <th>Update Status</th>
                    <th>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(b => (
                    <tr key={b._id}>
                      <td className="ps-4 fw-semibold">{b.resourceTitle || b.resourceId}</td>
                      <td>{b.username || b.userId}</td>
                      <td>{b.date}</td>
                      <td className="text-nowrap">{b.startTime} – {b.endTime}</td>
                      <td className="text-center">{b.expectedAttendees}</td>
                      <td style={{ minWidth: 220 }}>
                        <span title={b.purpose} style={{ display: 'block', whiteSpace: 'normal', overflowWrap: 'anywhere' }}>
                          {b.purpose}
                        </span>
                      </td>
                      <td>{statusBadge(b.status)}</td>
                      <td style={{ minWidth: 220 }}>
                        <span
                          className="small text-muted"
                          title={b.rejectionReason || ''}
                          style={{ display: 'block', whiteSpace: 'normal', overflowWrap: 'anywhere' }}
                        >
                          {b.status === 'REJECTED' ? (b.rejectionReason || '—') : '—'}
                        </span>
                      </td>
                      <td>
                        {updating === b._id ? (
                          <span className="spinner-border spinner-border-sm text-secondary" role="status"></span>
                        ) : (
                          <select
                            className="form-select form-select-sm"
                            style={{ width: 130, minWidth: 110 }}
                            value={b.status || 'PENDING'}
                            onChange={e => handleStatusChange(b._id, e.target.value, b.rejectionReason)}
                          >
                            {VALID_STATUSES.map(s => (
                              <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          disabled={deleting === b._id}
                          onClick={() => handleDeleteBooking(b._id)}
                        >
                          {deleting === b._id
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
    </>
  );
}

export default AdminBookings;
