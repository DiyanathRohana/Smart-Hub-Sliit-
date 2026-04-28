import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Header.css';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8089/api/v1";
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8089";

function Header({ onMenuToggle }) {
  const [user, setUser] = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get(`${API_URL}/user/info`, { withCredentials: true });
      if (response.data?.authenticated) {
        setUser(response.data);
        if (response.data.userId) {
          fetchUnreadNotificationsCount(response.data.userId);
        }
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchUnreadNotificationsCount = async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/notifications/count/user/${userId}/unread`, { 
        withCredentials: true 
      });
      setUnreadNotifications(response.data.count || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${BACKEND_URL}/logout`, {}, { withCredentials: true });
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      localStorage.removeItem('user');
      setUser(null);
      setShowUserMenu(false);
      navigate('/login');
    }
  };

  return (
    <header className="sc-header">
      <div className="sc-header-container">
        <div className="sc-header-left">
          <button className="sc-menu-toggle" onClick={onMenuToggle} aria-label="Toggle menu">
            <i className="bi bi-list"></i>
          </button>
          <Link to="/" className="sc-header-logo">
            <i className="bi bi-buildings-fill"></i>
            <span className="sc-logo-text">SmartHub</span>
          </Link>
        </div>

        <div className="sc-header-right">
          <Link to="/notifications" className="sc-header-icon sc-notification-badge">
            <i className="bi bi-bell"></i>
            {unreadNotifications > 0 && (
              <span className="sc-badge">{unreadNotifications}</span>
            )}
          </Link>

          {user ? (
            <div className="sc-user-menu">
              <button 
                className="sc-user-profile-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="sc-user-avatar">
                  {user.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="sc-user-name">{user.username || 'User'}</span>
                <i className={`bi bi-chevron-down sc-chevron ${showUserMenu ? 'open' : ''}`}></i>
              </button>
              
              {showUserMenu && (
                <div className="sc-dropdown-menu">
                  <div className="sc-dropdown-header">
                    <p className="sc-dropdown-username">{user.username}</p>
                    <p className="sc-dropdown-email">{user.email}</p>
                  </div>
                  <hr className="sc-dropdown-divider" />
                  {(user.role === 'ADMIN' || user.role === 'ROLE_ADMIN') && (
                    <>
                      <Link to="/admin/users" className="sc-dropdown-item">
                        <i className="bi bi-people"></i> User Management
                      </Link>
                      <hr className="sc-dropdown-divider" />
                    </>
                  )}
                  <button onClick={handleLogout} className="sc-dropdown-item sc-logout-btn">
                    <i className="bi bi-box-arrow-right"></i> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="sc-btn sc-btn-primary sc-btn-sm">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
