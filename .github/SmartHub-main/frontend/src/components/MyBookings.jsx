import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8089/api/v1";

function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const userRes = await axios.get(`${API_URL}/user/info`, { withCredentials: true });
        if (!userRes.data?.authenticated || !userRes.data?.userId) {
          navigate('/login');
          return;
        }

        const bookingsRes = await axios.get(`${API_URL}/bookings/user/${userRes.data.userId}`, { withCredentials: true });
        setBookings(Array.isArray(bookingsRes.data) ? bookingsRes.data : []);
      } catch (err) {
        if (err.response?.status === 401) navigate('/login');
        else setError('Failed to load your bookings.');
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [navigate]);

  const statusBadge = (status) => {
    switch ((status || '').toUpperCase()) {
      case 'APPROVED': return <span className="sc-badge-active">Approved</span>;
      case 'REJECTED': return <span className="sc-badge-inactive">Rejected</span>;
      case 'PENDING':  return <span className="sc-badge-maintenance">Pending</span>;
      default:         return <span className="sc-badge-unknown">{status}</span>;
    }
  };

  return (
    <>
      <Navbar />
      <div className="container sc-page-shell">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <h4 className="fw-bold mb-0"><i className="bi bi-calendar-check me-2"></i>My Bookings</h4>
          <button className="btn btn-primary fw-semibold px-4" onClick={() => navigate('/book')}>
            <i className="bi bi-plus-lg me-2"></i>New Booking
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <div className="d-flex justify-content-center mt-5">
            <div className="spinner-border" role="status"><span className="visually-hidden">Loading…</span></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-calendar-x" style={{ fontSize: '3rem', color: 'var(--sc-blue)', opacity: 0.25 }}></i>
            <p className="mt-3 text-muted">You have no booking requests yet.</p>
            <button className="btn btn-primary px-4" onClick={() => navigate('/book')}>
              Book a Resource
            </button>
          </div>
        ) : (
          <div className="card sc-card">
            <div className="table-responsive sc-table-wrap">
              <table className="table table-hover mb-0 align-middle sc-table">
                <thead>
                  <tr>
                    <th className="ps-4 py-3">Resource</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Purpose</th>
                    <th>Attendees</th>
                    <th>Status</th>
                    <th>Reason</th>
                    <th>Updated By</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b._id}>
                      <td className="ps-4 fw-semibold">{b.resourceTitle || b.resourceId}</td>
                      <td>{b.date}</td>
                      <td className="text-nowrap">{b.startTime} – {b.endTime}</td>
                      <td style={{ minWidth: 220 }}>
                        <span title={b.purpose} style={{ display: 'block', whiteSpace: 'normal', overflowWrap: 'anywhere' }}>
                          {b.purpose}
                        </span>
                      </td>
                      <td className="text-center">{b.expectedAttendees}</td>
                      <td>{statusBadge(b.status)}</td>
                      <td style={{ minWidth: 230 }}>
                        <span
                          className="small text-muted"
                          title={b.rejectionReason || ''}
                          style={{ display: 'block', whiteSpace: 'normal', overflowWrap: 'anywhere' }}
                        >
                          {b.status === 'REJECTED' ? (b.rejectionReason || '—') : '—'}
                        </span>
                      </td>
                      <td className="text-muted small">{b.statusUpdatedBy || '—'}</td>
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

export default MyBookings;
