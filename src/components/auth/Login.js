import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import apiClient from '../../services/apiClient';

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formTouched, setFormTouched] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const searchParams = new URLSearchParams(location.search);
  const sessionExpired = searchParams.get('expired') === 'true';
  const justRegistered = location.state?.registered;
  
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    if (token && user) {
      navigate('/', { replace: true });
      return;
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    setFormTouched(true);
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    setError(null);

    try {
      const url = "https://localhost:7252/api/Users/login";
      const response = await apiClient.post(url, credentials);
      const data = response.data;
      
      if (!data) {
        setError('Invalid response from server');
        setLoading(false);
        return;
      }

      const token = data.token;
      const userData = data.user;

      if (!token || !userData) {
        setError('Authentication failed: Token or user data missing');
        setLoading(false);
        return;
      }

      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(userData));

      const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
      if (redirectUrl) {
        sessionStorage.removeItem('redirectAfterLogin');
        window.location.href = redirectUrl;
      } else {
        window.location.href = '/';
      }
    } catch (err) {
      let errorMessage = 'Login failed. Please check your credentials.';
      if (err.response?.status === 401) {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (err.response?.status === 403) {
        errorMessage = 'Your account has been locked. Please contact support.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = credentials.email && credentials.password && credentials.password.length >= 6;

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card shadow-lg border-0 rounded-3" 
               style={{ transition: 'all 0.3s ease-in-out' }}>
            <div className="card-body p-4 p-sm-5">
              <div className="text-center mb-5">
                <h2 className="fw-bold mb-2">Welcome Back</h2>
                <p className="text-muted">Sign in to continue to your account</p>
              </div>
              
              {justRegistered && (
                <div className="alert alert-success mb-4 d-flex align-items-center" role="alert">
                  <i className="bi bi-check-circle-fill me-2"></i>
                  <div>Registration successful! Please login with your credentials.</div>
                </div>
              )}

              {sessionExpired && (
                <div className="alert alert-warning mb-4 d-flex align-items-center" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  <div>Your session has expired. Please login again.</div>
                </div>
              )}
              
              {error && (
                <div className="alert alert-danger mb-4 d-flex align-items-center" role="alert">
                  <i className="bi bi-x-circle-fill me-2"></i>
                  <div>{error}</div>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="mx-auto" style={{ maxWidth: '500px' }}>
                <div className="mb-4">
                  <label htmlFor="email" className="form-label small fw-medium">
                    Email Address
                  </label>
                  <div className="input-group input-group-lg has-validation">
                    <span className="input-group-text bg-light text-muted border-end-0">
                      <i className="bi bi-envelope"></i>
                    </span>
                    <input
                      type="email"
                      className={`form-control border-start-0 py-3 ${formTouched && !credentials.email ? 'is-invalid' : ''}`}
                      id="email"
                      name="email"
                      placeholder="name@example.com"
                      value={credentials.email}
                      onChange={handleChange}
                      required
                      autoFocus
                      aria-describedby="email-feedback"
                    />
                    {formTouched && !credentials.email && (
                      <div id="email-feedback" className="invalid-feedback">
                        Please enter your email address
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label htmlFor="password" className="form-label small fw-medium mb-0">
                      Password
                    </label>
                    <Link to="/forgot-password" className="small text-decoration-none text-primary">
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="input-group input-group-lg has-validation">
                    <span className="input-group-text bg-light text-muted border-end-0">
                      <i className="bi bi-lock"></i>
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      className={`form-control border-start-0 border-end-0 py-3 ${
                        formTouched && (!credentials.password || credentials.password.length < 6) ? 'is-invalid' : ''
                      }`}
                      id="password"
                      name="password"
                      placeholder="Enter your password"
                      value={credentials.password}
                      onChange={handleChange}
                      required
                      minLength="6"
                      aria-describedby="password-feedback"
                    />
                    <button
                      type="button"
                      className="input-group-text bg-light border-start-0"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                    </button>
                    {formTouched && (!credentials.password || credentials.password.length < 6) && (
                      <div id="password-feedback" className="invalid-feedback">
                        Password must be at least 6 characters
                      </div>
                    )}
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="btn btn-primary w-100 btn-lg py-3 mb-4"
                  disabled={loading || !isFormValid}
                  style={{
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>

                <div className="text-center">
                  <p className="text-muted mb-0">
                    Don't have an account?{' '}
                    <Link 
                      to="/register" 
                      className="text-decoration-none fw-medium"
                      style={{ transition: 'color 0.3s ease' }}
                    >
                      Create one now
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
