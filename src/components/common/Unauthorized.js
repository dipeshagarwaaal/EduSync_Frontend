import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext'; // assumes AuthContext decodes token and provides currentUser

const Unauthorized = () => {
  const { currentUser } = useAuth(); // currentUser is assumed to be decoded from JWT

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow border-danger">
            <div className="card-header bg-danger text-white text-center">
              <h3 className="mb-0">Access Denied</h3>
            </div>
            <div className="card-body text-center">
              <div className="mb-4">
                <i className="bi bi-shield-lock display-1 text-danger"></i>
              </div>

              <h4 className="mb-3">You don't have permission to access this page</h4>
              
              <p className="mb-4">
                {currentUser ? (
                  <>
                    Your role <strong>({currentUser.role})</strong> is not authorized to view this page.
                    Please contact the administrator if you believe this is a mistake.
                  </>
                ) : (
                  'You need to be logged in with the appropriate permissions to access this resource.'
                )}
              </p>

              <div className="d-grid gap-3">
                <Link to="/" className="btn btn-primary btn-lg">
                  Go to Home Page
                </Link>

                {!currentUser && (
                  <Link to="/login" className="btn btn-outline-primary">
                    Login with a Different Account
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
