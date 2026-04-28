import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8089/api/v1';
const ROLE_OPTIONS = [
  { value: 'USER', label: 'STUDENT' },
  { value: 'LECTURER', label: 'LECTURER' },
  { value: 'TECHNICIAN', label: 'TECHNICIAN' },
  { value: 'ADMIN', label: 'ADMIN' }
];

function AdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState({});
  const [deleting, setDeleting] = useState(null);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const normalizeUsers = (data) => {
    if (Array.isArray(data)) {
      return data;
    }
    if (data && Array.isArray(data.users)) {
      return data.users;
    }
    if (data && Array.isArray(data.data)) {
      return data.data;
    }
    return [];
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/admin/users`, { withCredentials: true });
      setUsers(normalizeUsers(response.data));
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Access denied. You must be an ADMIN to view this page.');
      } else if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Failed to load users. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (userId, newRole) => {
    setSaving(prev => ({ ...prev, [userId]: true }));
    try {
      await axios.put(
        `${API_URL}/admin/users/${userId}/role`,
        { role: newRole },
        { withCredentials: true }
      );
      setUsers(prev =>
        (Array.isArray(prev) ? prev : []).map(u => (u._id === userId ? { ...u, role: newRole } : u))
      );
      showToast('Role updated successfully');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update role', 'danger');
    } finally {
      setSaving(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user? This cannot be undone.')) return;
    setDeleting(userId);
    try {
      await axios.delete(`${API_URL}/admin/users/${userId}`, { withCredentials: true });
      setUsers(prev => (Array.isArray(prev) ? prev : []).filter(u => u._id !== userId));
      showToast('User deleted successfully');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete user', 'danger');
    } finally {
      setDeleting(null);
    }
  };

  const roleBadgeClass = (role) => {
    switch ((role || '').toUpperCase()) {
      case 'ADMIN':       return 'bg-danger';
      case 'TECHNICIAN':  return 'bg-warning text-dark';
      case 'LECTURER':    return 'bg-info text-dark';
      default:            return 'bg-secondary';
    }
  };

  const roleDisplayLabel = (role) => {
    const normalized = (role || '').toUpperCase();
    if (normalized === 'USER') {
      return 'STUDENT';
    }
    return normalized || 'STUDENT';
  };

  const roleValueForSelect = (role) => {
    const normalized = (role || '').toUpperCase();
    if (normalized === 'STUDENT' || normalized === 'USER') {
      return 'USER';
    }
    return normalized || 'USER';
  };

  return (
    <>
      <Navbar />
      <div className="container sc-page-shell">
        <div className="sc-section-head">
          <h3 className="sc-section-title">
            <i className="bi bi-people-fill me-2 text-primary"></i>User Management
          </h3>
          <button className="btn btn-outline-secondary btn-sm fw-semibold" onClick={fetchUsers}>
            <i className="bi bi-arrow-clockwise me-1"></i>Refresh
          </button>
        </div>

        {toast && (
          <div className={`alert alert-${toast.type} alert-dismissible py-2`} role="alert">
            <i className={`bi bi-${toast.type === 'success' ? 'check-circle' : 'exclamation-triangle'}-fill me-2`}></i>
            {toast.message}
            <button type="button" className="btn-close" onClick={() => setToast(null)} aria-label="Close"></button>
          </div>
        )}

        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="alert alert-danger">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>{error}
          </div>
        )}

        {!loading && !error && (
          <div className="card sc-card">
            <div className="card-header bg-light d-flex justify-content-between align-items-center py-2">
              <span className="fw-semibold small text-muted">
                {users.length} user{users.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="table-responsive sc-table-wrap">
              <table className="table table-hover align-middle sc-table">
                <thead>
                  <tr>
                    <th className="ps-3">Username</th>
                    <th>Email</th>
                    <th>Current Role</th>
                    <th>Change Role</th>
                    <th>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id}>
                      <td className="ps-3 fw-semibold">
                        <i className="bi bi-person-circle me-2 text-muted"></i>
                        {user.username || '—'}
                      </td>
                      <td className="text-muted small">{user.email || '—'}</td>
                      <td>
                        <span className={`badge ${roleBadgeClass(user.role)}`}>
                          {roleDisplayLabel(user.role)}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <select
                            className="form-select form-select-sm"
                            style={{ maxWidth: '160px' }}
                            value={roleValueForSelect(user.role)}
                            onChange={e => handleRoleChange(user._id, e.target.value)}
                            disabled={saving[user._id]}
                          >
                            {ROLE_OPTIONS.map(option => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                          {saving[user._id] && (
                            <span className="spinner-border spinner-border-sm text-primary" role="status"></span>
                          )}
                        </div>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          disabled={deleting === user._id}
                          onClick={() => handleDeleteUser(user._id)}
                        >
                          {deleting === user._id
                            ? <span className="spinner-border spinner-border-sm" />
                            : <i className="bi bi-trash"></i>}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center text-muted py-4">No users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default AdminUserManagement;
