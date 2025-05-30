import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../../services/apiClient';

const Register = () => {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Student'
  });
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formTouched, setFormTouched] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
    setFormTouched(true);
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (error) setError(null);
  };

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!userData.name.trim()) {
      errors.name = 'Name is required';
    } else if (userData.name.length < 3) {
      errors.name = 'Name must be at least 3 characters';
    }
    
    if (!userData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(userData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!userData.password) {
      errors.password = 'Password is required';
    } else if (userData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (!userData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (userData.password !== userData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { confirmPassword, ...userDataToSubmit } = userData;
      const url = "https://localhost:7252/api/Users/register";
      await apiClient.post(url, userDataToSubmit);
      navigate('/login', { 
        state: { registered: true },
        replace: true 
      });
    } catch (err) {
      console.error('Registration failed:', err);
      let errorMessage = 'Registration failed. Please try again.';
      if (err.response?.status === 409) {
        errorMessage = 'This email is already registered. Please use a different email or try logging in.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = 
    userData.name.length >= 3 && 
    userData.email && 
    userData.password && 
    userData.password.length >= 6 &&
    userData.password === userData.confirmPassword;

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card shadow-lg border-0 rounded-3"
               style={{ transition: 'all 0.3s ease-in-out' }}>
            <div className="card-body p-4 p-sm-5">
              <div className="text-center mb-5">
                <h2 className="fw-bold mb-2">Create Account</h2>
                <p className="text-muted">Join us to start your learning journey</p>
              </div>
              
              {error && (
                <div className="alert alert-danger mb-4 d-flex align-items-center" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  <div>{error}</div>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="mx-auto" style={{ maxWidth: '500px' }}>
                <div className="mb-4">
                  <label htmlFor="name" className="form-label small fw-medium">Full Name</label>
                  <div className="input-group input-group-lg has-validation">
                    <span className="input-group-text bg-light text-muted border-end-0">
                      <i className="bi bi-person"></i>
                    </span>
                    <input
                      type="text"
                      className={`form-control border-start-0 py-3 ${validationErrors.name ? 'is-invalid' : ''}`}
                      id="name"
                      name="name"
                      placeholder="Enter your full name"
                      value={userData.name}
                      onChange={handleChange}
                      required
                      autoFocus
                      aria-describedby="name-feedback"
                    />
                    {validationErrors.name && (
                      <div id="name-feedback" className="invalid-feedback">
                        {validationErrors.name}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="email" className="form-label small fw-medium">Email Address</label>
                  <div className="input-group input-group-lg has-validation">
                    <span className="input-group-text bg-light text-muted border-end-0">
                      <i className="bi bi-envelope"></i>
                    </span>
                    <input
                      type="email"
                      className={`form-control border-start-0 py-3 ${validationErrors.email ? 'is-invalid' : ''}`}
                      id="email"
                      name="email"
                      placeholder="name@example.com"
                      value={userData.email}
                      onChange={handleChange}
                      required
                      aria-describedby="email-feedback"
                    />
                    {validationErrors.email && (
                      <div id="email-feedback" className="invalid-feedback">
                        {validationErrors.email}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="password" className="form-label small fw-medium">Password</label>
                  <div className="input-group input-group-lg has-validation">
                    <span className="input-group-text bg-light text-muted border-end-0">
                      <i className="bi bi-lock"></i>
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      className={`form-control border-start-0 border-end-0 py-3 ${validationErrors.password ? 'is-invalid' : ''}`}
                      id="password"
                      name="password"
                      placeholder="Create a strong password"
                      value={userData.password}
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
                    {validationErrors.password && (
                      <div id="password-feedback" className="invalid-feedback">
                        {validationErrors.password}
                      </div>
                    )}
                  </div>
                  <div className="form-text small mt-2">
                    Password must be at least 6 characters
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="confirmPassword" className="form-label small fw-medium">Confirm Password</label>
                  <div className="input-group input-group-lg has-validation">
                    <span className="input-group-text bg-light text-muted border-end-0">
                      <i className="bi bi-shield-lock"></i>
                    </span>
                    <input
                      type="password"
                      className={`form-control border-start-0 py-3 ${validationErrors.confirmPassword ? 'is-invalid' : ''}`}
                      id="confirmPassword"
                      name="confirmPassword"
                      placeholder="Confirm your password"
                      value={userData.confirmPassword}
                      onChange={handleChange}
                      required
                      aria-describedby="confirm-password-feedback"
                    />
                    {validationErrors.confirmPassword && (
                      <div id="confirm-password-feedback" className="invalid-feedback">
                        {validationErrors.confirmPassword}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="role" className="form-label small fw-medium">I am a</label>
                  <div className="input-group input-group-lg">
                    <span className="input-group-text bg-light text-muted border-end-0">
                      <i className="bi bi-person-badge"></i>
                    </span>
                    <select
                      className="form-select border-start-0 py-3"
                      id="role"
                      name="role"
                      value={userData.role}
                      onChange={handleChange}
                    >
                      <option value="Student">Student</option>
                      <option value="Teacher">Teacher</option>
                    </select>
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
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>

                <div className="text-center">
                  <p className="text-muted mb-0">
                    Already have an account?{' '}
                    <Link 
                      to="/login" 
                      className="text-decoration-none fw-medium"
                      style={{ transition: 'color 0.3s ease' }}
                    >
                      Sign in here
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

export default Register;
