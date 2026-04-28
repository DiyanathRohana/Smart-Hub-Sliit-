import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8089/api/v1';

function EditProfile() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      const stored = localStorage.getItem('user');
      if (!stored) {
        navigate('/login');
        return;
      }

      let localUser;
      try {
        localUser = JSON.parse(stored);
      } catch {
        navigate('/login');
        return;
      }

      // Set fast initial values from local storage, then refresh from session API.
      setForm((prev) => ({
        ...prev,
        username: localUser.username || '',
        email: localUser.email || '',
      }));

      try {
        const res = await axios.get(`${API_URL}/user/info`, { withCredentials: true });
        if (res.data?.authenticated) {
          const freshUsername = res.data.username || localUser.username || '';
          const freshEmail = res.data.email || localUser.email || '';

          setForm((prev) => ({
            ...prev,
            username: freshUsername,
            email: freshEmail,
          }));

          localStorage.setItem('user', JSON.stringify({
            ...localUser,
            userId: res.data.userId || localUser.userId,
            username: freshUsername,
            email: freshEmail,
            role: res.data.role || localUser.role,
          }));
        }
      } catch {
        // Keep local storage values if session info call fails.
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    if (!form.username.trim()) {
      setError('Username cannot be empty.');
      return;
    }
    if (!form.email.trim()) {
      setError('Email cannot be empty.');
      return;
    }
    if (form.password && form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password && form.password.trim().length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    const payload = {
      username: form.username.trim(),
      email: form.email.trim(),
    };
    if (form.password.trim()) {
      payload.password = form.password.trim();
    }

    setSaving(true);
    try {
      const res = await axios.put(`${API_URL}/user/profile`, payload, { withCredentials: true });
      if (res.data?.success) {
        // Update localStorage so Navbar/Sidebar shows fresh name
        const stored = localStorage.getItem('user');
        if (stored) {
          const user = JSON.parse(stored);
          user.username = res.data.username;
          user.email = res.data.email;
          localStorage.setItem('user', JSON.stringify(user));
        }
        setSuccess('Profile updated successfully.');
        setForm((prev) => ({ ...prev, password: '', confirmPassword: '' }));
      } else {
        setError(res.data?.message || 'Update failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <div className="spinner-border" role="status"><span className="visually-hidden">Loading…</span></div>
      </div>
    );
  }

  return (
    <div className="container sc-page-shell" style={{ maxWidth: 580 }}>
      <h4 className="fw-bold mb-1">
        <i className="bi bi-person-gear me-2"></i>Edit Profile
      </h4>
      <p className="text-muted small mb-4">Update your username, email address, or password.</p>

      {success && (
        <div className="alert alert-success d-flex align-items-center gap-2 py-2">
          <i className="bi bi-check-circle-fill"></i>{success}
        </div>
      )}
      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2 py-2">
          <i className="bi bi-exclamation-triangle-fill"></i>{error}
        </div>
      )}

      <div className="card sc-card">
        <div className="card-body p-4">
          <form onSubmit={handleSubmit} noValidate>

            <div className="mb-3">
              <label className="form-label fw-semibold">Username <span className="text-danger">*</span></label>
              <input
                type="text"
                name="username"
                className="form-control"
                value={form.username}
                onChange={handleChange}
                maxLength={50}
                autoComplete="username"
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Email Address <span className="text-danger">*</span></label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={form.email}
                onChange={handleChange}
                maxLength={120}
                autoComplete="email"
              />
            </div>

            <hr className="my-4" />
            <p className="small text-muted mb-3">Leave the password fields blank to keep your current password.</p>

            <div className="mb-3">
              <label className="form-label fw-semibold">New Password</label>
              <input
                type="password"
                name="password"
                className="form-control"
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 6 characters"
                autoComplete="new-password"
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-control"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat new password"
                autoComplete="new-password"
              />
            </div>

            <div className="d-flex gap-2 justify-content-end">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate(-1)}
                disabled={saving}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary px-4 fw-semibold" disabled={saving}>
                {saving
                  ? <><span className="spinner-border spinner-border-sm me-2" />Saving…</>
                  : 'Save Changes'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

export default EditProfile;
