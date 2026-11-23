import React, { useState } from 'react';
import { money, getImageSrc } from '../product.jsx';

export default function CheckoutModal({ product, user, onClose, onConfirmOrder }) {
  const [qty, setQty] = useState(1);
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    street: '',
    barangay: '',
    city: '',
    province: '',
    postalCode: '',
    notes: '',
    paymentMethod: 'Cash on Delivery'
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!product) return null;

  const unitPrice = Number(product.price) || 0;
  const totalPrice = unitPrice * qty;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.fullName.trim()) {
      setError('Please provide your full name.');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Please provide a contact phone number for the delivery courier.');
      return;
    }
    if (!formData.street.trim() || !formData.city.trim() || !formData.province.trim()) {
      setError('Please provide a complete delivery address (Street, City, Province).');
      return;
    }

    setSubmitting(true);

    const orderData = {
      product,
      qty,
      total: totalPrice,
      customer: {
        name: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim()
      },
      shippingAddress: {
        street: formData.street.trim(),
        barangay: formData.barangay.trim(),
        city: formData.city.trim(),
        province: formData.province.trim(),
        postalCode: formData.postalCode.trim(),
        notes: formData.notes.trim()
      },
      paymentMethod: formData.paymentMethod
    };

    onConfirmOrder(orderData);
  };

  return (
    <div className="modal-backdrop-custom" onClick={onClose}>
      <div
        className="card shadow-lg border-0 modal-dialog-centered mx-auto overflow-hidden"
        style={{ width: 'min(640px, 95vw)', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center py-3">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-bag-check-fill text-warning fs-5"/>
            <h5 className="mb-0 fw-bold">Checkout & Delivery Details</h5>
          </div>
          <button type="button" className="btn-close btn-close-white" onClick={onClose} aria-label="Close"/>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="card-body p-4 overflow-auto" style={{ maxHeight: 'calc(92vh - 130px)' }}>
          {/* Order Item Summary Card */}
          <div className="p-3 bg-light rounded-3 border mb-4">
            <div className="d-flex align-items-center gap-3">
              <img
                src={getImageSrc(product.image)}
                alt={product.name}
                className="rounded border"
                style={{ width: '70px', height: '70px', objectFit: 'cover' }}
              />
              <div className="flex-grow-1">
                <small className="text-muted text-uppercase fw-bold">{product.category}</small>
                <h6 className="mb-1 fw-bold text-dark">{product.name}</h6>
                <div className="text-dark fw-bold">{money(unitPrice)}</div>
              </div>
              <div className="d-flex align-items-center gap-2 bg-white px-2 py-1 rounded border">
                <button
                  type="button"
                  className="btn btn-sm btn-light py-0 px-2 fw-bold"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                >
                  −
                </button>
                <span className="fw-bold px-1">{qty}</span>
                <button
                  type="button"
                  className="btn btn-sm btn-light py-0 px-2 fw-bold"
                  onClick={() => setQty(qty + 1)}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}

          <form onSubmit={handleSubmit} id="checkoutForm">
            {/* Section: Customer Information */}
            <h6 className="fw-bold text-dark mb-3 border-bottom pb-2">
              <i className="bi bi-person-fill text-danger me-1"/> 1. Customer Information
            </h6>

            <div className="row g-2 mb-3">
              <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">Full Name *</label>
                <input
                  required
                  type="text"
                  className="form-control"
                  placeholder="e.g. Juan Dela Cruz"
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">Contact Phone Number *</label>
                <input
                  required
                  type="tel"
                  className="form-control"
                  placeholder="e.g. 0917-123-4567"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label small fw-bold text-muted">Email Address</label>
              <input
                required
                type="email"
                className="form-control"
                placeholder="e.g. juan@example.com"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            {/* Section: Delivery Shipping Address */}
            <h6 className="fw-bold text-dark mb-3 border-bottom pb-2">
              <i className="bi bi-geo-alt-fill text-danger me-1"/> 2. Delivery Shipping Address
            </h6>

            <div className="mb-3">
              <label className="form-label small fw-bold text-muted">House / Unit No., Street Address *</label>
              <input
                required
                type="text"
                className="form-control"
                placeholder="e.g. Unit 4B, 123 Sports Avenue"
                value={formData.street}
                onChange={e => setFormData({ ...formData, street: e.target.value })}
              />
            </div>

            <div className="row g-2 mb-3">
              <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">Barangay / District</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Barangay Central"
                  value={formData.barangay}
                  onChange={e => setFormData({ ...formData, barangay: e.target.value })}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">City / Municipality *</label>
                <input
                  required
                  type="text"
                  className="form-control"
                  placeholder="e.g. Quezon City / Cebu City"
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
            </div>

            <div className="row g-2 mb-3">
              <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">Province / Region *</label>
                <input
                  required
                  type="text"
                  className="form-control"
                  placeholder="e.g. Metro Manila / Cebu"
                  value={formData.province}
                  onChange={e => setFormData({ ...formData, province: e.target.value })}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">Postal / ZIP Code</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. 1100"
                  value={formData.postalCode}
                  onChange={e => setFormData({ ...formData, postalCode: e.target.value })}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label small fw-bold text-muted">Delivery Notes / Landmarks (Optional)</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Beside the basketball court, leave at reception"
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            {/* Section: Payment Method */}
            <h6 className="fw-bold text-dark mb-3 border-bottom pb-2">
              <i className="bi bi-credit-card-2-front-fill text-danger me-1"/> 3. Payment Method
            </h6>

            <div className="d-flex flex-column gap-2 mb-4">
              <label className={`p-3 rounded-3 border d-flex align-items-center justify-content-between ${formData.paymentMethod === 'Cash on Delivery' ? 'border-primary bg-light' : ''}`} style={{ cursor: 'pointer' }}>
                <div className="d-flex align-items-center gap-2">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Cash on Delivery"
                    checked={formData.paymentMethod === 'Cash on Delivery'}
                    onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                  />
                  <div>
                    <strong className="d-block text-dark">Cash on Delivery (COD)</strong>
                    <small className="text-muted">Pay in cash upon receiving the parcel from the rider.</small>
                  </div>
                </div>
                <span className="badge bg-success">Recommended</span>
              </label>

              <label className={`p-3 rounded-3 border d-flex align-items-center justify-content-between ${formData.paymentMethod === 'GCash / Maya' ? 'border-primary bg-light' : ''}`} style={{ cursor: 'pointer' }}>
                <div className="d-flex align-items-center gap-2">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="GCash / Maya"
                    checked={formData.paymentMethod === 'GCash / Maya'}
                    onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                  />
                  <div>
                    <strong className="d-block text-dark">GCash / Maya (E-Wallet)</strong>
                    <small className="text-muted">Fast digital payment transfer upon delivery confirmation.</small>
                  </div>
                </div>
                <span className="badge bg-primary">E-Wallet</span>
              </label>
            </div>

            {/* Price Breakdown */}
            <div className="p-3 bg-light rounded-3 border">
              <div className="d-flex justify-content-between small text-muted mb-1">
                <span>Subtotal ({qty} item{qty > 1 ? 's' : ''}):</span>
                <span>{money(totalPrice)}</span>
              </div>
              <div className="d-flex justify-content-between small text-muted mb-2">
                <span>Shipping Fee:</span>
                <span className="text-success fw-bold">FREE</span>
              </div>
              <div className="d-flex justify-content-between fw-bold text-dark fs-5 pt-2 border-top">
                <span>Total Amount:</span>
                <span className="text-danger">{money(totalPrice)}</span>
              </div>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="card-footer bg-white d-flex justify-content-between align-items-center p-3 border-top">
          <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button
            type="submit"
            form="checkoutForm"
            className="btn btn-primary px-4 py-2 fw-bold d-flex align-items-center gap-2"
            disabled={submitting}
          >
            {submitting ? 'Placing Order...' : (
              <>
                <i className="bi bi-bag-check-fill"/> Place Order ({money(totalPrice)})
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
