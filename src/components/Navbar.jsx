import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { A } from '../product.jsx';

export default function Navbar({
  user,
  role,
  wishCount = 0,
  ordersCount = 0,
  onLogout
}) {
  const isAdmin = role === 'admin';

  return (
    <nav className="navbar navbar-expand-lg navbar-dark fixed-top custom-navbar">
      <div className="container">
        {/* Brand */}
        <Link
          className="navbar-brand d-flex align-items-center gap-2 text-decoration-none"
          to={user ? '/home' : '/'}
          title="JC Sportswear"
        >
          <img src={A + 'logo.png'} alt="JC Sportswear" className="brand-logo" />
          <span className="fw-black brand-title">JC SPORTSWEAR</span>
        </Link>

        {/* Mobile Toggle Button */}
        <button
          className="navbar-toggler border-0 shadow-none"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
          aria-controls="mainNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        {/* Navbar Links */}
        <div id="mainNavbar" className="collapse navbar-collapse">
          <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-1">
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active fw-bold' : ''}`} to="/home">
                Home
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active fw-bold' : ''}`} to="/shop">
                Shop
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active fw-bold' : ''}`} to="/about">
                About
              </NavLink>
            </li>

            {/* Role-Specific Dashboard & Admin Inventory */}
            {user && isAdmin && (
              <>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active fw-bold' : ''}`} to="/admin-dashboard">
                    Admin Dashboard
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active fw-bold' : ''}`} to="/manage">
                    <i className="bi bi-box-seam me-1 text-warning" /> Inventory
                  </NavLink>
                </li>
              </>
            )}

            {user && !isAdmin && (
              <li className="nav-item">
                <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active fw-bold' : ''}`} to="/user-dashboard">
                  Dashboard
                </NavLink>
              </li>
            )}

            {user && (
              <>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => `nav-link position-relative ${isActive ? 'active fw-bold' : ''}`} to="/wishlist">
                    Wishlist
                    {wishCount > 0 && (
                      <span className="badge bg-danger ms-1 rounded-pill">{wishCount}</span>
                    )}
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink className={({ isActive }) => `nav-link position-relative ${isActive ? 'active fw-bold' : ''}`} to="/orders">
                    Orders
                    {ordersCount > 0 && (
                      <span className="badge bg-primary ms-1 rounded-pill">{ordersCount}</span>
                    )}
                  </NavLink>
                </li>
              </>
            )}

            {/* Auth / Profile Area */}
            <li className="nav-item ms-lg-2 pt-2 pt-lg-0">
              {!user ? (
                <Link
                  className="btn btn-primary d-inline-flex align-items-center gap-2 px-3 py-2"
                  to="/login"
                >
                  <i className="bi bi-person-fill" /> Sign In
                </Link>
              ) : (
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <Link
                    to="/profile"
                    className="user-pill d-flex align-items-center gap-2 px-2 py-1 bg-dark rounded border border-secondary text-decoration-none"
                    title="View Profile"
                  >
                    {user.photo ? (
                      <img
                        src={user.photo}
                        alt={user.name}
                        className="rounded-circle"
                        style={{ width: '28px', height: '28px', objectFit: 'cover' }}
                      />
                    ) : (
                      <i className="bi bi-person-circle fs-5 text-light" />
                    )}
                    <span className="text-white small fw-bold text-truncate" style={{ maxWidth: '130px' }}>
                      {user.name}
                    </span>
                  </Link>

                  <button
                    className="btn btn-outline-light btn-sm px-2"
                    onClick={onLogout}
                    title="Sign Out"
                  >
                    <i className="bi bi-box-arrow-right me-1" /> Logout
                  </button>
                </div>
              )}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
