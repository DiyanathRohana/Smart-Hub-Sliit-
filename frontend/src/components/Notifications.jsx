import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8089/api/v1/notifications";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
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

    fetchNotifications();
  }, [navigate]);

  const normalizeNotifications = (data) => {
    if (Array.isArray(data)) {
      return data;
    }

    if (data && typeof data === 'object') {
      if (Array.isArray(data.notifications)) {
        return data.notifications;
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

  const fetchNotifications = async () => {
    try {
      let user = JSON.parse(localStorage.getItem('user'));

      if (!user?.userId) {
        const userInfo = await axios.get('http://localhost:8089/api/v1/user/info', { withCredentials: true });
        if (!userInfo.data?.authenticated || !userInfo.data?.userId) {
          setError('User session not found. Please login again.');
          setNotifications([]);
          setLoading(false);
          return;
        }

        user = {
          userId: userInfo.data.userId,
          username: userInfo.data.username || userInfo.data.name || 'User'
        };
        localStorage.setItem('user', JSON.stringify(user));
      }

      const response = await axios.get(`${API_URL}/user/${user.userId}`, { withCredentials: true });
      const notificationList = normalizeNotifications(response.data);
      
      // Sort notifications by date (newest first)
      const sortedNotifications = notificationList.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      setNotifications(sortedNotifications);
      setLoading(false);
      
      // Mark all as read
      await axios.put(`${API_URL}/read/all/user/${user.userId}`, {}, { withCredentials: true });
    } catch (error) {
      setError('Error fetching notifications');
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      setLoading(false);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await axios.delete(`${API_URL}/delete/${notificationId}`, { withCredentials: true });
      setNotifications(notifications.filter(notification => notification._id !== notificationId));
    } catch (error) {
      setError('Error deleting notification');
      console.error('Error deleting notification:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getNotificationLink = (notification) => {
    switch (notification.resourceType) {
      case 'LEARNING_PLAN':
      case 'FACILITY_ASSET':
        return `/facility-asset/${notification.resourceId}`;
      default:
        return '#';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'NEW_FACILITY_ASSET':
        return <i className="bi bi-building-add text-info me-2"></i>;
      case 'EDIT_FACILITY_ASSET':
        return <i className="bi bi-pencil-square text-warning me-2"></i>;
      case 'DELETE_FACILITY_ASSET':
        return <i className="bi bi-trash-fill text-danger me-2"></i>;
      default:
        return <i className="bi bi-bell-fill text-warning me-2"></i>;
    }
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

  return (
    <>
      <Navbar />
      <div className="container sc-page-shell">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card sc-card">
              <div className="sc-card-header d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-bell-fill fs-5"></i>
                  <h5 className="mb-0 fw-bold">Notifications</h5>
                </div>
                {notifications.length > 0 && (
                  <span className="badge bg-white text-primary fw-semibold">{notifications.length}</span>
                )}
              </div>
              <div className="card-body p-3">
                {error && (
                  <div className="alert alert-danger d-flex align-items-center gap-2 py-2" role="alert">
                    <i className="bi bi-exclamation-triangle-fill"></i>{error}
                  </div>
                )}
                
                {notifications.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-bell-slash" style={{fontSize:'3rem', color:'#94a3b8'}}></i>
                    <p className="text-muted mt-3 mb-0">You have no notifications.</p>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {notifications.map((notification) => {
                      const typeClass =
                        notification.type === 'NEW_FACILITY_ASSET' ? 'sc-notif-new' :
                        notification.type === 'EDIT_FACILITY_ASSET' ? 'sc-notif-edit' :
                        notification.type === 'DELETE_FACILITY_ASSET' ? 'sc-notif-delete' : '';
                      return (
                        <div key={notification._id} className={`list-group-item sc-notification-item d-flex justify-content-between align-items-center gap-3 py-3 px-3 ${typeClass}`}>
                          <Link
                            to={getNotificationLink(notification)}
                            className="text-decoration-none flex-grow-1 min-w-0"
                          >
                            <div className="d-flex align-items-start gap-3">
                              <div className="flex-shrink-0 mt-1">
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="min-w-0">
                                <p className="mb-1 text-dark fw-medium" style={{fontSize:'0.92rem'}}>{notification.message}</p>
                                <small className="text-muted">
                                  <i className="bi bi-clock me-1"></i>{formatDate(notification.createdAt)}
                                </small>
                              </div>
                            </div>
                          </Link>
                          <button
                            className="btn btn-sm btn-outline-danger flex-shrink-0"
                            onClick={() => handleDeleteNotification(notification._id)}
                            title="Delete"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Notifications;
