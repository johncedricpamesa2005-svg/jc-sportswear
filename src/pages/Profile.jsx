import React from 'react';
import { Link } from 'react-router-dom';

export default function Profile({ user, role, ordersCount = 0, wishCount = 0, onLogout }) {
  return (
    <main className="container page py-5">
      <div className="row justify-content-center">
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm overflow-hidden">
            <div className="card-header bg-dark text-white py-4 px-4 d-flex align-items-center gap-3">
              {user?.photo ? (
                <img
                  src={user.photo}
                  alt={user.name}
                  className="rounded-circle border border-2 border-light"
                  style={{ width: '72px', height: '72px', objectFit: 'cover' }}
                />
              ) : (
                <i className="bi bi-person-circle display-4 text-light" />
              )}
              <div>
                <h3 className="fw-bold mb-1">{user?.name || 'Member'}</h3>
                <div className="text-secondary small">{user?.email}</div>
                <span className={`badge mt-2 ${role === 'admin' ? 'bg-danger' : 'bg-primary'}`}>
                  {role === 'admin' ? 'Administrator' : 'Member'}
                </span>
              </div>
            </div>

            <div className="card-body p-4">
              <h6 className="fw-bold text-uppercase text-muted small mb-3">Account Summary</h6>
              <div className="row g-3 mb-4">
                <div className="col-6">
                  <div className="p-3 bg-light rounded border text-center">
                    <div className="fs-3 fw-black text-dark">{ordersCount}</div>
                    <small className="text-muted">Orders Placed</small>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-3 bg-light rounded border text-center">
                    <div className="fs-3 fw-black text-danger">{wishCount}</div>
                    <small className="text-muted">Wishlist Items</small>
                  </div>
                </div>
              </div>

              <div className="list-group list-group-flush mb-4 border rounded">
                <div className="list-group-item d-flex justify-content-between">
                  <span className="text-muted">Sign-In Provider</span>
                  <strong className="text-capitalize">{user?.provider || 'Google'}</strong>
                </div>
                <div className="list-group-item d-flex justify-content-between">
                  <span className="text-muted">Account ID</span>
                  <code className="small text-dark">{user?.uid || user?.id}</code>
                </div>
              </div>

              <div className="d-flex flex-wrap gap-2 justify-content-between">
                <div className="d-flex gap-2">
                  <Link to={role === 'admin' ? '/admin-dashboard' : '/user-dashboard'} className="btn btn-outline-dark">
                    <i className="bi bi-speedometer2 me-1" /> Dashboard
                  </Link>
                  <Link to="/orders" className="btn btn-outline-primary">
                    <i className="bi bi-receipt me-1" /> My Orders
                  </Link>
                </div>
                <button className="btn btn-danger" onClick={onLogout}>
                  <i className="bi bi-box-arrow-right me-1" /> Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
