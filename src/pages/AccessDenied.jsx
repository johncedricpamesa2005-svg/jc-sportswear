import React from 'react';
import { Link } from 'react-router-dom';

export default function AccessDenied() {
  return (
    <main className="container page py-5">
      <div className="card border-0 shadow-sm p-5 text-center bg-light my-4 mx-auto" style={{ maxWidth: '600px' }}>
        <i className="bi bi-shield-x display-1 text-danger mb-3 d-block" />
        <span className="badge bg-danger mx-auto mb-2 px-3 py-1">403 &bull; ACCESS DENIED</span>
        <h1 className="fw-black text-dark mb-2">Restricted Area</h1>
        <p className="text-muted mb-4">
          You do not have administrator permissions to access this page.
          Your account role is managed by the store owner in Firebase Firestore.
        </p>
        <div className="d-flex justify-content-center gap-3">
          <Link to="/home" className="btn btn-primary px-4">
            Back to Home
          </Link>
          <Link to="/shop" className="btn btn-outline-dark px-4">
            Browse Shop
          </Link>
        </div>
      </div>
    </main>
  );
}
