import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../styles/Sidebar.css';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8089/api/v1";

function Sidebar({ isOpen }) {
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get(`${API_URL}/user/info`, { withCredentials: true });
      if (response.data?.authenticated) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');
  const normalizedRole = (user?.role || '').toString().trim().toUpperCase();
  const isAdmin = normalizedRole === 'ADMIN' || normalizedRole === 'ROLE_ADMIN';
  const isTechnician = normalizedRole === 'TECHNICIAN' || normalizedRole === 'ROLE_TECHNICIAN';
  const canManageBookingsAndTickets = isAdmin || isTechnician;

  return (
    <aside className={`sc-sidebar ${isOpen ? 'open' : 'closed'}`}>
      <nav className="sc-sidebar-nav">
        <div className="sc-nav-section">
          <h3 className="sc-nav-title">Main</h3>
          <ul className="sc-nav-list">
            <li>
              <Link 
                to="/" 
                className={`sc-nav-link ${isActive('/facility-assets') ? 'active' : ''}`}
              >
                <i className="bi bi-building"></i>
                <span>Facilities & Assets</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/my-bookings" 
                className={`sc-nav-link ${isActive('/my-bookings') ? 'active' : ''}`}
              >
                <i className="bi bi-calendar-check"></i>
                <span>My Bookings</span>
              </Link>
            </li>
            <li>
              <Link
                to="/maintenance-ticket"
                className={`sc-nav-link ${isActive('/maintenance-ticket') ? 'active' : ''}`}
              >
                <i className="bi bi-tools"></i>
                <span>Maintenance Ticket</span>
              </Link>
            </li>
            <li>
              <Link
                to="/my-maintenance-tickets"
                className={`sc-nav-link ${isActive('/my-maintenance-tickets') ? 'active' : ''}`}
              >
                <i className="bi bi-clipboard-check"></i>
                <span>My Tickets</span>
              </Link>
            </li>
            <li>
              <Link
                to="/profile/edit"
                className={`sc-nav-link ${isActive('/profile/edit') ? 'active' : ''}`}
              >
                <i className="bi bi-person-gear"></i>
                <span>Edit Profile</span>
              </Link>
            </li>
          </ul>
        </div>

        {canManageBookingsAndTickets && (
          <div className="sc-nav-section">
            <h3 className="sc-nav-title">Management</h3>
            <ul className="sc-nav-list">
              <li>
                <Link 
                  to="/admin/bookings" 
                  className={`sc-nav-link ${isActive('/admin/bookings') ? 'active' : ''}`}
                >
                  <i className="bi bi-file-earmark-check"></i>
                  <span>Booking Requests</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/maintenance-tickets"
                  className={`sc-nav-link ${isActive('/admin/maintenance-tickets') ? 'active' : ''}`}
                >
                  <i className="bi bi-clipboard-data"></i>
                  <span>All Maintenance Tickets</span>
                </Link>
              </li>

              {isAdmin && (
                <>
                  <li>
                    <Link 
                      to="/admin/users" 
                      className={`sc-nav-link ${isActive('/admin/users') ? 'active' : ''}`}
                    >
                      <i className="bi bi-people"></i>
                      <span>Users</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/add-facility-asset" 
                      className={`sc-nav-link ${isActive('/add-facility-asset') ? 'active' : ''}`}
                    >
                      <i className="bi bi-plus-circle"></i>
                      <span>Add Asset</span>
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        )}
      </nav>
    </aside>
  );
}

export default Sidebar;
