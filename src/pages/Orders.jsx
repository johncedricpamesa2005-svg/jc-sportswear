import React from 'react';
import { money, getImageSrc } from '../product.jsx';

export default function Orders({ orders, navigate }) {
  return (
    <main className="container page py-5">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <span className="badge bg-primary text-uppercase px-3 py-1 mb-1">
            <i className="bi bi-receipt me-1"/> Purchase Tracking
          </span>
          <h1 className="fw-black text-dark mb-1">My Orders</h1>
          <p className="text-muted mb-0">Track and review your recent sportswear purchases.</p>
        </div>
        <button className="btn btn-outline-dark" onClick={() => navigate('shop')}>
          <i className="bi bi-bag me-1"/> Browse More Gear
        </button>
      </div>

      {orders.length > 0 ? (
        <div className="row g-4">
          {orders.map(o => (
            <div className="col-12 col-lg-6" key={o.id}>
              <div className="card shadow-sm border-0 h-100">
                <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center py-3">
                  <div>
                    <strong className="d-block">{o.id}</strong>
                    <small className="text-secondary">{o.date}</small>
                  </div>
                  <span className="badge bg-warning text-dark px-3 py-2 fw-bold">
                    <i className="bi bi-clock-history me-1"/> {o.status}
                  </span>
                </div>

                <div className="card-body p-4">
                  {/* Items List */}
                  <div className="mb-3">
                    <span className="text-muted small text-uppercase fw-bold">Items Purchased</span>
                    <div className="mt-2">
                      {o.items.map((item, idx) => (
                        <div key={idx} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                          <div className="d-flex align-items-center gap-2">
                            {item.image && (
                              <img
                                src={getImageSrc(item.image)}
                                alt={item.name}
                                className="rounded border"
                                style={{ width: '42px', height: '42px', objectFit: 'cover' }}
                              />
                            )}
                            <div>
                              <strong className="text-dark d-block">{item.name}</strong>
                              <small className="text-muted">Qty: {item.qty} × {money(item.price)}</small>
                            </div>
                          </div>
                          <span className="fw-bold">{money(item.price * item.qty)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Customer & Delivery Address */}
                  {o.shippingAddress && (
                    <div className="p-3 bg-light rounded-3 border mb-3">
                      <div className="small text-muted text-uppercase fw-bold mb-1">
                        <i className="bi bi-geo-alt-fill text-danger me-1"/> Shipping Destination
                      </div>
                      <div className="text-dark fw-bold small">
                        {o.customer?.name} ({o.customer?.phone || 'No phone'})
                      </div>
                      <div className="text-secondary small">
                        {o.shippingAddress.street}
                        {o.shippingAddress.barangay ? `, Brgy. ${o.shippingAddress.barangay}` : ''}
                        , {o.shippingAddress.city}, {o.shippingAddress.province}
                        {o.shippingAddress.postalCode ? ` ${o.shippingAddress.postalCode}` : ''}
                      </div>
                      {o.shippingAddress.notes && (
                        <div className="text-muted small mt-1 fst-italic">
                          Note: "{o.shippingAddress.notes}"
                        </div>
                      )}
                    </div>
                  )}

                  <div className="d-flex justify-content-between align-items-center pt-2">
                    <span className="text-muted small">Payment Method:</span>
                    <span className="badge bg-light text-dark border">
                      <i className="bi bi-cash me-1"/> {o.payment}
                    </span>
                  </div>

                  <div className="d-flex justify-content-between align-items-center pt-3 border-top mt-3">
                    <h5 className="mb-0 fw-bold text-dark">Order Total:</h5>
                    <h4 className="mb-0 fw-black text-danger">{money(o.total)}</h4>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card border-0 shadow-sm py-5 text-center bg-light">
          <div className="card-body">
            <i className="bi bi-receipt-cutoff display-3 text-muted mb-3 d-block"/>
            <h4 className="fw-bold text-dark">No Orders Placed Yet</h4>
            <p className="text-muted mb-4">When you check out and complete the delivery form, your orders will appear here.</p>
            <button className="btn btn-primary btn-lg px-4" onClick={() => navigate('shop')}>
              Shop Now
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
