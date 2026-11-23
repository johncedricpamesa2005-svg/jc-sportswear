import React, { useEffect, useState } from 'react';
import { money, categories, getImageSrc } from '../product.jsx';
import { authFetch } from '../api.js';

export default function ManageProducts({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  notify
}) {
  const [activeTab, setActiveTab] = useState('products');
  const [filterCat, setFilterCat] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Orders Management state
  const [adminOrders, setAdminOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Form State for Add / Edit Product
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Basketball',
    price: '',
    oldPrice: '',
    stock: '25',
    rating: '5.0',
    image: 'bballshirt.jpg',
    badge: 'NEW',
    description: ''
  });

  const availableImages = [
    { label: 'Basketball Shirt', value: 'bballshirt.jpg' },
    { label: 'Basketball Shorts', value: 'bballshorts.webp' },
    { label: 'Football Jersey', value: 'fballjer.webp' },
    { label: 'Football Shorts', value: 'fballshrt.webp' },
    { label: 'Volleyball Set', value: 'volleyballset.jpg' },
    { label: 'Volleyball Ball', value: 'vballper.jpg' },
    { label: 'Running Shirt', value: 'running.webp' },
    { label: 'Running Shorts', value: 'runningshorts.webp' },
    { label: 'Gym Shirt', value: 'gymshirt.webp' },
    { label: 'Wrist Supporter', value: 'wristsupp.jpg' },
    { label: 'Tennis Polo', value: 'tennispolo.jpg' },
    { label: 'Tennis Racket', value: 'racket.webp' }
  ];

  const loadAdminOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await authFetch('/api/admin/orders');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setAdminOrders(data);
      }
    } catch (err) {
      console.warn('Error fetching admin orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'orders') {
      loadAdminOrders();
    }
  }, [activeTab]);

  const openAddModal = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData({
      name: '',
      category: 'Basketball',
      price: '',
      oldPrice: '',
      stock: '25',
      rating: '5.0',
      image: 'bballshirt.jpg',
      badge: 'NEW',
      description: ''
    });
    setShowModal(true);
  };

  const openEditModal = product => {
    setIsEditing(true);
    setEditId(product.id);
    setFormData({
      name: product.name || '',
      category: product.category || 'Basketball',
      price: product.price || '',
      oldPrice: product.oldPrice || '',
      stock: String(product.stock ?? product.stock_quantity ?? 25),
      rating: String(product.rating || '5.0'),
      image: product.image || 'bballshirt.jpg',
      badge: product.badge || '',
      description: product.description || ''
    });
    setShowModal(true);
  };

  const handleFormSubmit = async e => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price || Number(formData.price) < 0) {
      notify('Please provide a valid product name and non-negative price.');
      return;
    }

    const payload = {
      ...formData,
      name: formData.name.trim(),
      price: Number(formData.price),
      oldPrice: formData.oldPrice ? Number(formData.oldPrice) : Number((Number(formData.price) * 1.2).toFixed(2)),
      stock: Number(formData.stock) || 0,
      stock_quantity: Number(formData.stock) || 0,
      rating: Number(formData.rating) || 5.0
    };

    if (isEditing) {
      const success = await onUpdateProduct(editId, payload);
      if (success) setShowModal(false);
    } else {
      const success = await onAddProduct(payload);
      if (success) setShowModal(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      await onDeleteProduct(id);
    }
  };

  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      const res = await authFetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Status update failed');
      }
      setAdminOrders(prev =>
        prev.map(o => (String(o.order_id || o.id) === String(orderId) ? { ...o, status: newStatus } : o))
      );
      notify(`Order ${orderId} updated to ${newStatus}.`);
    } catch (err) {
      notify(`Error: ${err.message}`);
    }
  };

  const handleDeleteOrder = async orderId => {
    if (!window.confirm('Delete this order record permanently?')) return;
    try {
      const res = await authFetch(`/api/admin/orders/${orderId}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Delete failed');
      }
      setAdminOrders(prev => prev.filter(o => String(o.order_id || o.id) !== String(orderId)));
      notify('Order deleted successfully.');
    } catch (err) {
      notify(`Error: ${err.message}`);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesCat = filterCat === 'All' || p.category === filterCat;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <main className="container page py-5">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <span className="badge bg-danger text-uppercase px-3 py-1 mb-1">
            <i className="bi bi-box-seam me-1" /> Store Management
          </span>
          <h1 className="fw-black text-dark mb-1">Inventory &amp; Orders</h1>
          <p className="text-muted mb-0">
            Manage sportswear products, stock quantities, and customer order fulfillment.
          </p>
        </div>
        {activeTab === 'products' && (
          <button className="btn btn-primary d-flex align-items-center gap-2 px-3 py-2" onClick={openAddModal}>
            <i className="bi bi-plus-circle-fill" /> Add New Product
          </button>
        )}
      </div>

      {/* Navigation Tabs */}
      <ul className="nav nav-pills mb-4 gap-2">
        <li className="nav-item">
          <button
            className={`nav-link border ${activeTab === 'products' ? 'active bg-dark border-dark text-white' : 'bg-white text-dark'}`}
            onClick={() => setActiveTab('products')}
          >
            <i className="bi bi-grid-fill me-1" /> Products ({products.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link border ${activeTab === 'orders' ? 'active bg-dark border-dark text-white' : 'bg-white text-dark'}`}
            onClick={() => setActiveTab('orders')}
          >
            <i className="bi bi-receipt-cutoff me-1" /> Customer Orders
          </button>
        </li>
      </ul>

      {activeTab === 'products' ? (
        <section className="card shadow-sm border-0 mb-4">
          <div className="card-header bg-white py-3 d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div className="d-flex align-items-center gap-2">
              <h5 className="fw-bold mb-0 text-dark">Products Catalog</h5>
              <span className="badge bg-secondary rounded-pill">{filteredProducts.length} Items</span>
            </div>

            <div className="d-flex gap-2">
              <select
                className="form-select form-select-sm w-auto"
                value={filterCat}
                onChange={e => setFilterCat(e.target.value)}
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search products..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '180px' }}
              />
            </div>
          </div>

          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4">Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Badge</th>
                    <th className="text-end pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(p => {
                    const stockVal = p.stock ?? p.stock_quantity ?? 25;
                    return (
                      <tr key={p.id}>
                        <td className="ps-4">
                          <div className="d-flex align-items-center gap-3">
                            <img
                              src={getImageSrc(p.image)}
                              alt={p.name}
                              className="rounded border"
                              style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                            />
                            <div>
                              <strong className="d-block text-dark">{p.name}</strong>
                              <small className="text-muted text-truncate d-inline-block" style={{ maxWidth: '240px' }}>
                                {p.description}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td><span className="badge bg-light text-dark border">{p.category}</span></td>
                        <td>
                          <strong className="text-dark">{money(p.price)}</strong>
                          {p.oldPrice && <del className="text-muted small ms-2">{money(p.oldPrice)}</del>}
                        </td>
                        <td>
                          <span className={`badge ${stockVal <= 10 ? 'bg-warning text-dark' : 'bg-light text-dark border'}`}>
                            {stockVal} units
                          </span>
                        </td>
                        <td>
                          {p.badge ? <span className="badge bg-danger">{p.badge}</span> : <span className="text-muted small">—</span>}
                        </td>
                        <td className="text-end pe-4">
                          <div className="btn-group btn-group-sm">
                            <button className="btn btn-outline-primary" onClick={() => openEditModal(p)}>
                              <i className="bi bi-pencil-square me-1" /> Edit
                            </button>
                            <button className="btn btn-outline-danger" onClick={() => handleDelete(p.id, p.name)}>
                              <i className="bi bi-trash3-fill me-1" /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-5 text-muted">
                        No products found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      ) : (
        <section className="card shadow-sm border-0 mb-4">
          <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
            <h5 className="fw-bold mb-0 text-dark">Customer Orders ({adminOrders.length})</h5>
            <button className="btn btn-sm btn-outline-dark" onClick={loadAdminOrders}>
              <i className="bi bi-arrow-clockwise me-1" /> Refresh
            </button>
          </div>
          <div className="card-body p-0">
            {loadingOrders ? (
              <div className="p-5 text-center text-muted">Loading customer orders...</div>
            ) : adminOrders.length ? (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">Order</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th className="text-end pe-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminOrders.map(o => {
                      const oid = o.order_id || o.id;
                      return (
                        <tr key={oid}>
                          <td className="ps-4">
                            <strong className="d-block text-dark">{o.order_code || o.id}</strong>
                            <small className="text-muted">{o.date}</small>
                          </td>
                          <td>
                            <div className="fw-bold text-dark">{o.customer?.name}</div>
                            <small className="text-muted d-block">{o.customer?.phone}</small>
                            <small className="text-muted">
                              {o.shippingAddress?.city}, {o.shippingAddress?.province}
                            </small>
                          </td>
                          <td className="small">
                            {o.items?.map((i, idx) => (
                              <div key={idx}>{i.name} × {i.qty}</div>
                            ))}
                          </td>
                          <td className="fw-bold text-danger">{money(o.total)}</td>
                          <td>
                            <select
                              className="form-select form-select-sm w-auto"
                              value={o.status}
                              onChange={e => handleOrderStatusChange(oid, e.target.value)}
                            >
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="text-end pe-4">
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteOrder(oid)}
                              title="Delete order"
                            >
                              <i className="bi bi-trash3-fill" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-5 text-center text-muted">No orders placed yet.</div>
            )}
          </div>
        </section>
      )}

      {/* MODAL: ADD / EDIT PRODUCT */}
      {showModal && (
        <div className="modal-backdrop-custom" onClick={() => setShowModal(false)}>
          <div
            className="card shadow-lg border-0 modal-dialog-centered mx-auto"
            style={{ width: 'min(550px, 94vw)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center py-3">
              <h5 className="mb-0 fw-bold">
                {isEditing ? (
                  <><i className="bi bi-pencil-square text-warning me-2" /> Edit Sportswear Product</>
                ) : (
                  <><i className="bi bi-plus-circle-fill text-success me-2" /> Add New Sportswear Product</>
                )}
              </h5>
              <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)} />
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="card-body p-4">
                <div className="mb-3">
                  <label className="form-label fw-bold">Product Name *</label>
                  <input
                    required
                    type="text"
                    className="form-control"
                    placeholder="e.g. Pro Basketball Jersey"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Category</label>
                    <select
                      className="form-select"
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                    >
                      {categories.filter(c => c !== 'All').map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-bold">Badge</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. BEST SELLER, NEW"
                      value={formData.badge}
                      onChange={e => setFormData({ ...formData, badge: e.target.value })}
                    />
                  </div>
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-md-4">
                    <label className="form-label fw-bold">Price (₱) *</label>
                    <input
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      className="form-control"
                      placeholder="1299"
                      value={formData.price}
                      onChange={e => setFormData({ ...formData, price: e.target.value })}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label fw-bold">Old Price (₱)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="form-control"
                      placeholder="1599"
                      value={formData.oldPrice}
                      onChange={e => setFormData({ ...formData, oldPrice: e.target.value })}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label fw-bold">Stock Qty *</label>
                    <input
                      required
                      type="number"
                      min="0"
                      className="form-control"
                      value={formData.stock}
                      onChange={e => setFormData({ ...formData, stock: e.target.value })}
                    />
                  </div>
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Product Image</label>
                    <select
                      className="form-select"
                      value={formData.image}
                      onChange={e => setFormData({ ...formData, image: e.target.value })}
                    >
                      {availableImages.map(img => (
                        <option key={img.value} value={img.value}>{img.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-bold">Rating (1 to 5)</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      step="0.1"
                      className="form-control"
                      value={formData.rating}
                      onChange={e => setFormData({ ...formData, rating: e.target.value })}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Description</label>
                  <textarea
                    rows="3"
                    className="form-control"
                    placeholder="Enter product description and material info..."
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="card-footer bg-light d-flex justify-content-end gap-2 p-3">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary px-4">
                  {isEditing ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
