import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8089/api/v1';

function BookingRequestForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [resources, setResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [form, setForm] = useState({
    resourceId: searchParams.get('resourceId') || '',
    resourceTitle: searchParams.get('resourceTitle') || '',
    date: '',
    startTime: '',
    endTime: '',
    purpose: '',
    expectedAttendees: ''
  });

  const getCurrentDateTime = () => new Date();

  const getTodayDate = () => {
    const now = getCurrentDateTime();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getRoundedCurrentTime = () => {
    const now = getCurrentDateTime();
    const rounded = new Date(now);
    rounded.setSeconds(0, 0);
    const hours = String(rounded.getHours()).padStart(2, '0');
    const mins = String(rounded.getMinutes()).padStart(2, '0');
    return `${hours}:${mins}`;
  };

  const isToday = form.date === getTodayDate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      navigate('/login');
      return;
    }

    axios
      .get(`${API_URL}/facility-assets/getall`, { withCredentials: true })
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : (res.data.facilityAssets || []);
        setResources(list);
        if (form.resourceId) {
          const matched = list.find((r) => r._id === form.resourceId);
          if (matched) {
            setForm((prev) => ({ ...prev, resourceTitle: matched.title }));
          }
        }
      })
      .catch(() => setErrorMsg('Failed to load resources'))
      .finally(() => setLoadingResources(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'resourceId') {
      const selected = resources.find((r) => r._id === value);
      setForm((prev) => ({
        ...prev,
        resourceId: value,
        resourceTitle: selected ? selected.title : ''
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!form.resourceId) {
      setErrorMsg('Please select a resource.');
      return;
    }
    if (!form.date) {
      setErrorMsg('Please select a date.');
      return;
    }
    if (!form.startTime || !form.endTime) {
      setErrorMsg('Please set start and end times.');
      return;
    }
    if (form.startTime >= form.endTime) {
      setErrorMsg('End time must be after start time.');
      return;
    }
    if (!form.purpose.trim()) {
      setErrorMsg('Please describe the purpose.');
      return;
    }
    if (!form.expectedAttendees || form.expectedAttendees < 1) {
      setErrorMsg('Please enter expected attendees.');
      return;
    }

    const now = getCurrentDateTime();
    const bookingStart = new Date(`${form.date}T${form.startTime}`);
    const bookingEnd = new Date(`${form.date}T${form.endTime}`);

    if (bookingStart < now) {
      setErrorMsg('Past dates or times are not allowed.');
      return;
    }
    if (bookingEnd <= bookingStart) {
      setErrorMsg('End time must be after start time.');
      return;
    }

    const user = JSON.parse(localStorage.getItem('user'));
    const payload = {
      resourceId: form.resourceId,
      resourceTitle: form.resourceTitle,
      userId: user.userId,
      username: user.username || user.name || user.email,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      purpose: form.purpose.trim(),
      expectedAttendees: parseInt(form.expectedAttendees, 10)
    };

    setSubmitting(true);
    try {
      await axios.post(`${API_URL}/bookings`, payload, { withCredentials: true });
      setSuccessMsg('Booking request submitted! You can track it in My Bookings.');
      setForm((prev) => ({
        ...prev,
        date: '',
        startTime: '',
        endTime: '',
        purpose: '',
        expectedAttendees: ''
      }));
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit booking request.';
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const todayDate = getTodayDate();

  return (
    <div className="sc-booking-modal-page">
      <div className="sc-booking-dashboard-bg" aria-hidden="true">
        <div className="sc-booking-bg-topbar"></div>
        <div className="sc-booking-bg-grid">
          <div className="sc-booking-bg-card"></div>
          <div className="sc-booking-bg-card"></div>
          <div className="sc-booking-bg-card"></div>
          <div className="sc-booking-bg-card sc-booking-bg-card-wide"></div>
        </div>
      </div>

      <div className="sc-booking-modal-overlay">
        <div className="sc-booking-modal" role="dialog" aria-modal="true" aria-label="Facility Booking Request">
          <div className="sc-booking-modal-header">
            <div>
              <h2 className="sc-booking-title">Facility Booking Request</h2>
              <p className="sc-booking-subtitle">Submit your request for approval</p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="sc-booking-close-btn"
              aria-label="Close booking form"
              type="button"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          <div className="sc-booking-modal-body">
            {successMsg && (
              <div className="alert alert-success d-flex align-items-center gap-2" role="alert">
                <i className="bi bi-check-circle-fill"></i>
                {successMsg}
                <button className="btn btn-sm btn-outline-success ms-auto" onClick={() => navigate('/my-bookings')}>
                  View My Bookings
                </button>
              </div>
            )}
            {errorMsg && (
              <div className="alert alert-danger d-flex align-items-center gap-2" role="alert">
                <i className="bi bi-exclamation-triangle-fill"></i>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="sc-booking-form">
              <div className="sc-booking-field">
                <label className="sc-booking-label">Resource / Location</label>
                {loadingResources ? (
                  <div className="text-muted small">Loading resources...</div>
                ) : (
                  <select
                    name="resourceId"
                    className="sc-booking-input"
                    value={form.resourceId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a location (e.g. Lab 01, Auditorium)</option>
                    {resources.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="sc-booking-field">
                <label className="sc-booking-label">Date</label>
                <div className="sc-booking-icon-input-wrap">
                  <i className="bi bi-calendar3 sc-booking-input-icon"></i>
                  <input
                    type="date"
                    name="date"
                    className="sc-booking-input sc-booking-input-icon-pad"
                    value={form.date}
                    min={todayDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="sc-booking-time-grid">
                <div className="sc-booking-field">
                  <label className="sc-booking-label">Start Time</label>
                  <input
                    type="time"
                    name="startTime"
                    className="sc-booking-input"
                    value={form.startTime}
                    onChange={handleChange}
                    min={isToday ? getRoundedCurrentTime() : undefined}
                    required
                    step="60"
                  />
                </div>
                <div className="sc-booking-field">
                  <label className="sc-booking-label">End Time</label>
                  <input
                    type="time"
                    name="endTime"
                    className="sc-booking-input"
                    value={form.endTime}
                    onChange={handleChange}
                    min={form.startTime || (isToday ? getRoundedCurrentTime() : undefined)}
                    required
                    step="60"
                  />
                </div>
              </div>

              <div className="sc-booking-field">
                <label className="sc-booking-label">Purpose of Booking</label>
                <textarea
                  name="purpose"
                  className="sc-booking-input sc-booking-textarea"
                  rows={4}
                  maxLength={300}
                  value={form.purpose}
                  onChange={handleChange}
                  placeholder="Describe the purpose of your booking"
                  required
                />
                <div className="form-text text-end">{form.purpose.length}/300</div>
              </div>

              <div className="sc-booking-field">
                <label className="sc-booking-label">Expected Attendees</label>
                <input
                  type="number"
                  name="expectedAttendees"
                  className="sc-booking-input"
                  value={form.expectedAttendees}
                  onChange={handleChange}
                  min={1}
                  max={999}
                  placeholder="e.g. 25"
                  required
                />
              </div>

              <div className="sc-booking-actions">
                <button type="button" className="sc-booking-btn sc-booking-btn-cancel" onClick={() => navigate(-1)}>
                  Cancel
                </button>
                <button type="submit" className="sc-booking-btn sc-booking-btn-submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Submitting...
                    </>
                  ) : (
                    <>Submit Request</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingRequestForm;
