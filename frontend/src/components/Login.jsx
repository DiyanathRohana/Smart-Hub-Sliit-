import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8089';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const hasLoginError = new URLSearchParams(window.location.search).get('error') === 'true';
  const [error, setError] = useState(hasLoginError ? 'Invalid username/email or password.' : null);

  const handleSubmit = (event) => {
    event.preventDefault();
    setError(null);
    const form = event.currentTarget;
    console.log('Submitting form login to:', form.action);
    form.submit();
  };

  return (
    <div className="sc-auth-wrapper">
      <div className="sc-auth-shell">
        <aside className="sc-auth-visual" aria-label="SmartHub branding panel">
          <div className="sc-auth-visual-content" />
        </aside>

        <section className="sc-auth-form-side">
          <div className="sc-auth-form-inner">
            <div className="card sc-auth-card">
              <div className="sc-auth-header">
                <div className="sc-auth-logo">
                  <i className="bi bi-buildings-fill"></i>
                </div>
                <h4 className="fw-bold mb-1">Welcome Back</h4>
                <p className="mb-0 opacity-75" style={{fontSize:'0.9rem'}}>Sign in to SmartHub SLIIT</p>
              </div>

              <div className="card-body p-4 sc-auth-body">
                <form method="post" action={`${BACKEND_URL}/login`} onSubmit={handleSubmit}>
                  <div className="mb-3 sc-auth-input-block">
                    <label htmlFor="username" className="form-label fw-semibold small">Username</label>
                    <div className="input-group sc-auth-input-group">
                      <span className="input-group-text bg-light border-end-0 sc-auth-input-icon">
                        <i className="bi bi-person text-muted"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0 ps-0 sc-auth-input"
                        id="username"
                        name="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your username"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3 sc-auth-input-block">
                    <label htmlFor="password" className="form-label fw-semibold small">Password</label>
                    <div className="input-group sc-auth-input-group">
                      <span className="input-group-text bg-light border-end-0 sc-auth-input-icon">
                        <i className="bi bi-lock text-muted"></i>
                      </span>
                      <input
                        type="password"
                        className="form-control border-start-0 ps-0 sc-auth-input"
                        id="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="alert alert-danger alert-dismissible fade show py-2 sc-auth-alert" role="alert">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>{error}
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => setError(null)}
                        aria-label="Close"
                      ></button>
                    </div>
                  )}

                  <div className="d-grid mt-4">
                    <button type="submit" className="btn btn-primary fw-semibold py-2 sc-auth-submit-btn">
                      <i className="bi bi-box-arrow-in-right me-2"></i>Sign In
                    </button>
                  </div>
                </form>

                <div className="d-flex align-items-center my-3 sc-auth-divider-wrap">
                  <hr className="flex-grow-1" />
                  <span className="mx-2 text-muted small">or</span>
                  <hr className="flex-grow-1" />
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

              <div className="card-footer text-center bg-light py-3 sc-auth-footer">
                <small className="text-muted">
                  Don't have an account? <Link to="/register" className="fw-semibold text-primary text-decoration-none">Register here</Link>
                </small>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Login;
