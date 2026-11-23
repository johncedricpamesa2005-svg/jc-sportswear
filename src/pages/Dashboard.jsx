import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { money } from '../product.jsx';
import { authFetch } from '../api.js';

export default function Dashboard({ user, role, products = [], orders = [], wish = [] }) {
  const isAdmin = role === 'admin';
  const [adminOrders, setAdminOrders] = useState([]);
  const [loadingAdmin, setLoadingAdmin] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    let active = true;
    setLoadingAdmin(true);
    authFetch('/api/admin/orders')
      .then(res => (res.ok ? res.json() : []))
      .then(data => {
        if (active && Array.isArray(data)) setAdminOrders(data);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoadingAdmin(false);
      });
    return () => { active = false; };
  }, [isAdmin]);

  if (isAdmin) {
    const lowStockProducts = products.filter(p => Number(p.stock ?? p.stock_quantity ?? 25) <= 15);
    const totalRevenue = adminOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
    const pendingOrders = adminOrders.filter(o => o.status === 'Processing').length;

    return (
      <main className="container page py-5">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
          <div>
            <span className="badge bg-danger text-uppercase px-3 py-1 mb-1">
              <i className="bi bi-speedometer2 me-1" /> Admin Dashboard
            </span>
            <h1 className="fw-black text-dark mb-1">Welcome, {user?.name}</h1>
            <p className="text-muted mb-0">Store overview, inventory health, and customer order metrics.</p>
          </div>
          <Link to="/manage" className="btn btn-primary px-4 py-2 fw-bold">
            <i className="bi bi-box-seam me-2" /> Open Inventory & Orders Manager
          </Link>
        </div>

        {/* Admin KPI Cards */}
        <div className="row g-3 mb-4">
          <div className="col-6 col-lg-3">
            <div className="card border-0 shadow-sm p-3 h-100">
              <small className="text-muted text-uppercase fw-bold">Catalog Products</small>
              <h2 className="fw-black text-dark mt-2 mb-0">{products.length}</h2>
              <small className="text-success mt-1"><i className="bi bi-check-circle me-1" /> Active items</small>
            </div>
          </div>
          <div className="col-6 col-lg-3">
            <div className="card border-0 shadow-sm p-3 h-100">
              <small className="text-muted text-uppercase fw-bold">Low Stock Alerts</small>
              <h2 className="fw-black text-warning mt-2 mb-0">{lowStockProducts.length}</h2>
              <small className="text-muted mt-1">Items with ≤ 15 units</small>
            </div>
          </div>
          <div className="col-6 col-lg-3">
            <div className="card border-0 shadow-sm p-3 h-100">
              <small className="text-muted text-uppercase fw-bold">Total Orders</small>
              <h2 className="fw-black text-primary mt-2 mb-0">{adminOrders.length}</h2>
              <small className="text-muted mt-1">{pendingOrders} processing</small>
            </div>
          </div>
          <div className="col-6 col-lg-3">
            <div className="card border-0 shadow-sm p-3 h-100">
              <small className="text-muted text-uppercase fw-bold">Total Revenue</small>
              <h2 className="fw-black text-danger mt-2 mb-0">{money(totalRevenue)}</h2>
              <small className="text-muted mt-1">Across all orders</small>
            </div>
          </div>
        </div>

        {/* Recent Customer Orders */}
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
            <h5 className="fw-bold mb-0 text-dark">Recent Customer Orders</h5>
            <Link to="/manage" className="btn btn-sm btn-outline-dark">Manage All</Link>
          </div>
          <div className="card-body p-0">
            {loadingAdmin ? (
              <div className="p-4 text-center text-muted">Loading orders...</div>
            ) : adminOrders.length ? (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">Order Code</th>
                      <th>Customer</th>
                      <th>Destination</th>
                      <th>Status</th>
                      <th className="text-end pe-4">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminOrders.slice(0, 6).map(o => (
                      <tr key={o.id}>
                        <td className="ps-4 fw-bold">{o.order_code || o.id}</td>
                        <td>
                          <div className="fw-bold text-dark">{o.customer?.name}</div>
                          <small className="text-muted">{o.customer?.phone}</small>
                        </td>
                        <td className="small text-muted">
                          {o.shippingAddress?.city}, {o.shippingAddress?.province}
                        </td>
                        <td>
                          <span className={`badge ${
                            o.status === 'Delivered' ? 'bg-success' :
                            o.status === 'Shipped' ? 'bg-info text-dark' :
                            o.status === 'Cancelled' ? 'bg-danger' : 'bg-warning text-dark'
                          }`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="text-end pe-4 fw-bold text-dark">{money(o.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 text-center text-muted">No customer orders recorded yet.</div>
            )}
          </div>
        </div>
      </main>
    );
  }

  // Standard User Dashboard
  const totalSpent = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);

  return (
    <main className="container page py-5">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <span className="badge bg-primary text-uppercase px-3 py-1 mb-1">
            <i className="bi bi-person-badge me-1" /> Member Dashboard
          </span>
          <h1 className="fw-black text-dark mb-1">Welcome back, {user?.name}</h1>
          <p className="text-muted mb-0">Track your orders, saved favorites, and profile details.</p>
        </div>
        <Link to="/shop" className="btn btn-primary px-4 py-2 fw-bold">
          <i className="bi bi-bag me-2" /> Browse Shop
        </Link>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-4 h-100">
            <small className="text-muted text-uppercase fw-bold">My Orders</small>
            <h2 className="fw-black text-dark mt-2 mb-1">{orders.length}</h2>
            <Link to="/orders" className="small text-decoration-none fw-bold">View order history →</Link>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-4 h-100">
            <small className="text-muted text-uppercase fw-bold">Saved Wishlist</small>
            <h2 className="fw-black text-danger mt-2 mb-1">{wish.length}</h2>
            <Link to="/wishlist" className="small text-decoration-none fw-bold">Open wishlist →</Link>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-4 h-100">
            <small className="text-muted text-uppercase fw-bold">Total Purchases</small>
            <h2 className="fw-black text-primary mt-2 mb-1">{money(totalSpent)}</h2>
            <Link to="/profile" className="small text-decoration-none fw-bold">Manage profile →</Link>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm p-4 bg-light">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <h5 className="fw-bold text-dark mb-1">Ready for your next game?</h5>
            <p className="text-muted mb-0 small">Explore {products.length} tournament-ready sportswear items in our catalog.</p>
          </div>
          <Link to="/shop" className="btn btn-dark">Explore Collection</Link>
        </div>
      </div>
    </main>
  );
}
