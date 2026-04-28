import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';

function Home() {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <div className="sc-hero">
        <div className="container text-center position-relative" style={{zIndex:1}}>
          <div className="mb-3">
            <i className="bi bi-buildings-fill" style={{fontSize:'3.5rem', opacity:0.85}}></i>
          </div>
          <h1 className="display-5 fw-bold mb-3">Facility &amp; Asset Management</h1>
          <p className="lead mb-4" style={{opacity:0.8, maxWidth:'560px', margin:'0 auto 1.5rem'}}>
            Centrally manage campus facilities, track asset availability, and streamline resource operations.
          </p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Link to="/facility-assets" className="btn btn-light btn-lg fw-semibold px-4">
              <i className="bi bi-grid-3x3-gap-fill me-2"></i>Browse Catalogue
            </Link>
            <Link to="/register" className="btn btn-outline-light btn-lg fw-semibold px-4">
              <i className="bi bi-person-plus me-2"></i>Register
            </Link>
            <Link to="/login" className="btn btn-outline-light btn-lg fw-semibold px-4">
              <i className="bi bi-box-arrow-in-right me-2"></i>Login
            </Link>
          </div>
        </div>
      </div>

      {/* Feature cards */}
      <div className="container" style={{marginTop:'2.5rem', paddingBottom:'4rem'}}>
        <div className="row g-4 justify-content-center">
          <div className="col-md-4">
            <div className="card sc-feature-card h-100">
              <div className="sc-feature-icon" style={{background:'#dbeafe', color:'#1d4ed8'}}>
                <i className="bi bi-collection-fill"></i>
              </div>
              <h5 className="fw-bold mb-2">Centralized Catalogue</h5>
              <p className="text-muted mb-0">Keep all facilities and assets organized in one searchable place.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card sc-feature-card h-100">
              <div className="sc-feature-icon" style={{background:'#dcfce7', color:'#15803d'}}>
                <i className="bi bi-activity"></i>
              </div>
              <h5 className="fw-bold mb-2">Real-Time Availability</h5>
              <p className="text-muted mb-0">Track active and out-of-stock resources at a glance.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card sc-feature-card h-100">
              <div className="sc-feature-icon" style={{background:'#fef3c7', color:'#b45309'}}>
                <i className="bi bi-shield-lock-fill"></i>
              </div>
              <h5 className="fw-bold mb-2">Role-Based Access</h5>
              <p className="text-muted mb-0">Admins manage the catalogue; users browse and stay informed.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
