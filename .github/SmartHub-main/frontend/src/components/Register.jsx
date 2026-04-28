import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8089/api/v1/auth";
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8089';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secretCode, setSecretCode] = useState('');
  const [showSecretCode, setShowSecretCode] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    // Validate password match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      console.log('Sending registration request to:', `${API_URL}/register`);
      const response = await axios.post(`${API_URL}/register`, {
        username,
        email,
        password,
        secretCode,
        role: 'STUDENT' // Default role
      });

      console.log('Registration response:', response.data);
      if (response.data.success) {
        alert('Registration successful! Please login.');
        navigate('/login', { replace: true });
        return;
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        setError(error.response.data?.message || `Error ${error.response.status}: Registration failed`);
      } else if (error.request) {
        console.error('Error request:', error.request);
        setError('No response received from server. Please try again later.');
      } else {
        console.error('Error message:', error.message);
        setError(`Error: ${error.message}`);
      }
    }
  };

  return (
    <div className="sc-auth-wrapper sc-auth-wrapper-compact">
      <div className="sc-auth-shell">
        <aside className="sc-auth-visual" aria-label="SmartHub branding panel">
          <div className="sc-auth-visual-content" />
        </aside>

        <section className="sc-auth-form-side">
          <div className="sc-auth-form-inner">
            <div className="card sc-auth-card">
              <div className="sc-auth-header">
                <div className="sc-auth-logo">
                  <i className="bi bi-person-plus-fill"></i>
                </div>
                <h4 className="fw-bold mb-1">Create Account</h4>
                <p className="mb-0 opacity-75" style={{fontSize:'0.9rem'}}>Join SmartHub SLIIT</p>
              </div>
              <div className="card-body p-3 sc-auth-body">
                <form onSubmit={handleSubmit} className="sc-register-form">
                  <div className="row g-2">
                    <div className="col-md-6">
                      <label htmlFor="username" className="form-label fw-semibold small">Username</label>
                      <div className="input-group sc-auth-input-group">
                        <span className="input-group-text bg-light border-end-0 sc-auth-input-icon">
                          <i className="bi bi-person text-muted"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control border-start-0 ps-0 sc-auth-input"
                          id="username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="Choose a username"
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="email" className="form-label fw-semibold small">Email</label>
                      <div className="input-group sc-auth-input-group">
                        <span className="input-group-text bg-light border-end-0 sc-auth-input-icon">
                          <i className="bi bi-envelope text-muted"></i>
                        </span>
                        <input
                          type="email"
                          className="form-control border-start-0 ps-0 sc-auth-input"
                          id="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your@email.com"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row g-2 mt-1">
                    <div className="col-md-6">
                      <label htmlFor="password" className="form-label fw-semibold small">Password</label>
                      <div className="input-group sc-auth-input-group">
                        <span className="input-group-text bg-light border-end-0 sc-auth-input-icon">
                          <i className="bi bi-lock text-muted"></i>
                        </span>
                        <input
                          type="password"
                          className="form-control border-start-0 ps-0 sc-auth-input"
                          id="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Create a password"
                          autoComplete="new-password"
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="confirmPassword" className="form-label fw-semibold small">Confirm Password</label>
                      <div className="input-group sc-auth-input-group">
                        <span className="input-group-text bg-light border-end-0 sc-auth-input-icon">
                          <i className="bi bi-lock-fill text-muted"></i>
                        </span>
                        <input
                          type="password"
                          className="form-control border-start-0 ps-0 sc-auth-input"
                          id="confirmPassword"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repeat your password"
                          autoComplete="new-password"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-2">
                    <button
                      type="button"
                      className="btn btn-link p-0 small text-decoration-none sc-auth-toggle-link"
                      onClick={() => setShowSecretCode(prev => !prev)}
                    >
                      <i className={`bi ${showSecretCode ? 'bi-dash-circle' : 'bi-plus-circle'} me-1`}></i>
                      {showSecretCode ? 'Hide' : 'Add'} secret code (optional)
                    </button>
                  </div>

                  {showSecretCode && (
                    <div className="mt-2">
                      <label htmlFor="secretCode" className="form-label fw-semibold small">Secret Code</label>
                      <div className="input-group sc-auth-input-group">
                        <span className="input-group-text bg-light border-end-0 sc-auth-input-icon">
                          <i className="bi bi-key text-muted"></i>
                        </span>
                        <input
                          type="password"
                          className="form-control border-start-0 ps-0 sc-auth-input"
                          id="secretCode"
                          value={secretCode}
                          onChange={(e) => setSecretCode(e.target.value)}
                          placeholder="Enter code if you have one"
                        />
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="alert alert-danger py-2 mt-2 mb-0 sc-auth-alert" role="alert">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>{error}
                    </div>
                  )}

                  <div className="d-grid mt-3">
                    <button type="submit" className="btn btn-primary fw-semibold py-2 sc-auth-submit-btn">
                      <i className="bi bi-person-check me-2"></i>Create Account
                    </button>
                  </div>
                </form>

                <div className="d-flex align-items-center my-2 sc-auth-divider-wrap">
                  <hr className="flex-grow-1 my-1" />
                  <span className="mx-2 text-muted small">or</span>
                  <hr className="flex-grow-1 my-1" />
                </div>

                <div className="d-grid">
                  <a
                    href={`${BACKEND_URL}/oauth2/authorization/google`}
                    className="btn btn-outline-secondary fw-semibold py-2 sc-auth-google-btn"
                  >
                    <svg className="me-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20" height="20">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                      <path fill="none" d="M0 0h48v48H0z"/>
                    </svg>
                    Continue with Google
                  </a>
                </div>
              </div>
              <div className="card-footer text-center bg-light py-2 sc-auth-footer">
                <small className="text-muted">
                  Already have an account? <Link to="/login" className="fw-semibold text-primary text-decoration-none">Sign in here</Link>
                </small>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Register;
