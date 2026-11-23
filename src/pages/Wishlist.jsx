import React from 'react';
import { A, money, getImageSrc } from '../product.jsx';

export default function Wishlist({ products, wish, onRemoveWish, onBuy, navigate }) {
  const wishProducts = products.filter(p => wish.includes(p.id));

  return (
    <main className="container page py-5">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <span className="badge bg-danger text-uppercase px-3 py-1 mb-1">
            <i className="bi bi-heart-fill me-1"/> Saved Favorites
          </span>
          <h1 className="fw-black text-dark mb-1">My Wishlist</h1>
          <p className="text-muted mb-0">Sportswear items you saved for your next game.</p>
        </div>
        <button className="btn btn-outline-dark" onClick={() => navigate('shop')}>
          <i className="bi bi-bag me-1"/> Continue Shopping
        </button>
      </div>

      {wishProducts.length > 0 ? (
        <div className="row g-4">
          {wishProducts.map(p => (
            <div className="col-12 col-md-6 col-lg-4" key={p.id}>
              <div className="card h-100 shadow-sm border-0 product-card">
                <div className="position-relative">
                  <img
                    src={getImageSrc(p.image)}
                    alt={p.name}
                    className="card-img-top"
                    style={{ height: '220px', objectFit: 'cover' }}
                  />
                  <button
                    className="btn btn-sm btn-light position-absolute top-0 end-0 m-2 rounded-circle shadow-sm"
                    onClick={() => onRemoveWish(p)}
                    title="Remove from wishlist"
                  >
                    <i className="bi bi-trash text-danger"/>
                  </button>
                </div>

                <div className="card-body d-flex flex-column">
                  <small className="text-muted text-uppercase fw-bold">{p.category}</small>
                  <h5 className="card-title mt-1 fw-bold text-dark">{p.name}</h5>
                  <div className="d-flex align-items-center justify-content-between mt-auto pt-3">
                    <div>
                      <strong className="fs-5 text-dark">{money(p.price)}</strong>
                      {p.oldPrice && <del className="text-muted small ms-2">{money(p.oldPrice)}</del>}
                    </div>
                    <button className="btn btn-primary" onClick={() => onBuy(p)}>
                      <i className="bi bi-cart-plus me-1"/> Buy Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card border-0 shadow-sm py-5 text-center bg-light">
          <div className="card-body">
            <i className="bi bi-heartbreak display-3 text-muted mb-3 d-block"/>
            <h4 className="fw-bold text-dark">Your Wishlist is Empty</h4>
            <p className="text-muted mb-4">You haven't saved any sportswear gear yet.</p>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('shop')}>
              Explore Shop
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
