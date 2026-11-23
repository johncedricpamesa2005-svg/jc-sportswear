import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="container page py-5">
      <div className="card border-0 shadow-sm p-5 text-center bg-light my-4 mx-auto" style={{ maxWidth: '600px' }}>
        <i className="bi bi-signpost-split display-1 text-warning mb-3 d-block" />
        <span className="badge bg-dark mx-auto mb-2 px-3 py-1">404 &bull; PAGE NOT FOUND</span>
        <h1 className="fw-black text-dark mb-2">Oops! Wrong Court</h1>
        <p className="text-muted mb-4">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="d-flex justify-content-center gap-3">
          <Link to="/" className="btn btn-primary px-4">
            Go to Landing
          </Link>
          <Link to="/shop" className="btn btn-outline-dark px-4">
            Visit Shop
          </Link>
        </div>
      </div>
    </main>
  );
}
