import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8089/api/v1";
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8089";

function Navbar() {
  const [user, setUser] = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const navigate = useNavigate();
  const normalizedRole = (user?.role || '').toString().trim().toUpperCase();
  const canAddEntry = normalizedRole === 'ADMIN' || normalizedRole === 'ROLE_ADMIN';
  const isAdminOrTech = normalizedRole === 'ADMIN' || normalizedRole === 'ROLE_ADMIN' || normalizedRole === 'TECHNICIAN' || normalizedRole === 'ROLE_TECHNICIAN';

  const getDisplayName = (sessionData) => {
    const username = sessionData?.username;
    const name = sessionData?.name;
    const email = sessionData?.email;

    if (username && username.trim()) {
      return username;
    }
    if (name && name.trim()) {
      return name;
    }
    if (email && email.includes('@')) {
      return email.split('@')[0];
    }
    return 'User';
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get(`${API_URL}/user/info`, { withCredentials: true });
      if (response.data?.authenticated) {
        const displayName = getDisplayName(response.data);
        const sessionUser = {
          userId: response.data.userId,
          username: displayName,
          email: response.data.email || '',
          role: response.data.role || ''
        };
        setUser(sessionUser);
        localStorage.setItem('user', JSON.stringify(sessionUser));
        if (sessionUser.userId) {
          fetchUnreadNotificationsCount(sessionUser.userId);
        }
      } else {
        setUser(null);
        localStorage.removeItem('user');
      }
    } catch (error) {
      setUser(null);
      localStorage.removeItem('user');
    }
  };

  const fetchUnreadNotificationsCount = async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/notifications/count/user/${userId}/unread`, { withCredentials: true });
      setUnreadNotifications(response.data.count);
    } catch (error) {
      console.error('Error fetching unread notifications count:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${BACKEND_URL}/logout`, {}, { withCredentials: true });
    } catch (error) {
      // Continue client-side cleanup even if backend logout call fails.
      console.error('Error during backend logout:', error);
    } finally {
      localStorage.removeItem('user');
      setUser(null);
      navigate('/login');
    }
  };

  return (
    <nav className="sc-navbar">
      <div className="container">
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Home
              </Link>
            </li>

            {user && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/my-bookings">
                    <i className="bi bi-calendar-check me-1"></i>My Bookings
                  </Link>
                </li>
                {canAddEntry && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/admin/users">
                      <i className="bi bi-people-fill me-1"></i>Manage Users
                    </Link>
                  </li>
                )}
                {isAdminOrTech && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/admin/bookings">
                      <i className="bi bi-calendar2-week me-1"></i>Manage Bookings
                    </Link>
                  </li>
                )}
              </>
            )}
          </ul>
          <ul className="navbar-nav">
            {user ? (
              <>
                {canAddEntry && (
                  <li className="nav-item me-1">
                    <Link className="nav-link btn btn-outline-warning btn-sm px-2" to="/add-facility-asset">
                      + Add New Entry
                    </Link>
                  </li>
                )}
                <li className="nav-item">
                  <Link className="nav-link position-relative" to="/notifications">
                    <i className="bi bi-bell-fill"></i>
                    {unreadNotifications > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                        {unreadNotifications}
                        <span className="visually-hidden">unread notifications</span>
                      </span>
                    )}
                  </Link>
                </li>
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    id="navbarDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    {getDisplayName(user)}
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                    <li>
                      <Link className="dropdown-item" to="/">
                        Home
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={handleLogout}
                      >
                        Logout
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
