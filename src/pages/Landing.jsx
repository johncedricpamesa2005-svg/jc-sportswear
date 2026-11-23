import React from 'react';
import { A, Product } from '../product.jsx';

export default function Landing({ products = [], onHookClick, navigate }) {
  return (
    <main className="landing-page">
      {/* Hero Section */}
      <header className="hero landing-hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <span className="eyebrow text-uppercase">
              <i className="bi bi-fire text-warning me-1" /> EXCLUSIVE SPORTSWEAR COLLECTION
            </span>
            <h1 className="display-4 fw-black">
              Gear Up.<br />
              <span className="text-highlight">Play Without Limits.</span>
            </h1>
            <p className="hero-lead">
              Engineered for athletes, crafted for winners. Discover professional performance jerseys,
              breathable shorts, and elite athletic accessories.
            </p>

            <div className="landing-hook-notice p-3 rounded-3 bg-dark border border-secondary my-3 d-flex align-items-center gap-3">
              <i className="bi bi-box-arrow-in-right fs-2 text-warning" />
              <div>
                <strong className="text-white d-block">Looking to Buy? Click Any Product Card!</strong>
                <span className="text-light small">
                  Every product card below links directly to our member portal so you can unlock instant checkout.
                </span>
              </div>
            </div>

            <div className="hero-actions d-flex flex-wrap gap-2 pt-2">
              <a href="#landing-products" className="btn btn-primary btn-lg px-4">
                <i className="bi bi-bag-check-fill me-2" /> Explore Products
              </a>
              <button className="btn btn-outline-light btn-lg px-4" onClick={() => navigate('login')}>
                <i className="bi bi-person-circle me-2" /> Sign In / Register
              </button>
            </div>

            <div className="hero-points d-flex flex-wrap gap-3 mt-4 text-light">
              <span><i className="bi bi-shield-fill-check text-warning me-1" /> 100% Authentic Quality</span>
              <span><i className="bi bi-truck text-warning me-1" /> Cash on Delivery Available</span>
              <span><i className="bi bi-lightning-charge-fill text-warning me-1" /> Rapid Nationwide Shipping</span>
            </div>
          </div>

          {/* Hero Image Showcase */}
          <div className="hero-product-showcase text-center">
            <div className="hero-card hero-card-main shadow-lg">
              <img src={A + 'bballshirt.jpg'} alt="Basketball Jersey" className="img-fluid rounded" />
              <div className="p-3 text-start">
                <span className="badge bg-danger mb-1">BEST SELLER</span>
                <h4 className="fw-bold mb-1 text-dark">Pro Basketball Jersey</h4>
                <div className="d-flex justify-content-between align-items-center mt-2">
                  <strong className="fs-5 text-dark">₱1,299.00</strong>
                  <button
                    className="btn btn-sm btn-dark"
                    onClick={() => onHookClick({ name: 'Pro Basketball Jersey', price: 1299 })}
                  >
                    Click to Buy →
                  </button>
                </div>
              </div>
            </div>
            <div className="hero-floating hero-floating-one">
              <i className="bi bi-star-fill text-warning" />
              <div>
                <b>4.9 / 5 Rating</b>
                <small>Player tested & approved</small>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Trust Strip */}
      <section className="trust-strip py-4 bg-light border-bottom border-top">
        <div className="container">
          <div className="row g-3 text-center text-md-start">
            <div className="col-md-4 d-flex align-items-center justify-content-center justify-content-md-start gap-3">
              <i className="bi bi-award-fill fs-2 text-danger" />
              <div>
                <b className="d-block text-dark">Pro-Grade Fabric</b>
                <small className="text-muted">Moisture-wicking, breathable sports gear</small>
              </div>
            </div>
            <div className="col-md-4 d-flex align-items-center justify-content-center justify-content-md-start gap-3">
              <i className="bi bi-shield-lock-fill fs-2 text-danger" />
              <div>
                <b className="d-block text-dark">Safe & Secure Ordering</b>
                <small className="text-muted">Direct Google authentication and order tracking</small>
              </div>
            </div>
            <div className="col-md-4 d-flex align-items-center justify-content-center justify-content-md-start gap-3">
              <i className="bi bi-cash-coin fs-2 text-danger" />
              <div>
                <b className="d-block text-dark">Cash on Delivery Available</b>
                <small className="text-muted">Pay conveniently right at your doorstep</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Hook Section */}
      <section className="container section py-5" id="landing-products">
        <div className="text-center mb-5">
          <span className="badge bg-danger text-uppercase px-3 py-2 mb-2">
            <i className="bi bi-fire me-1" /> Featured Drops
          </span>
          <h2 className="display-5 fw-bold text-dark">Featured Sportswear</h2>
          <p className="text-muted fs-5 max-w-700 mx-auto">
            Browse our sports catalog below. <strong>Click any product card</strong> to immediately
            enter the login portal and finalize your checkout!
          </p>
        </div>

        <div className="row g-4">
          {products.map(p => (
            <Product
              key={p.id}
              p={p}
              isHook={true}
              onHookClick={onHookClick}
            />
          ))}
        </div>
      </section>

      {/* Sports Categories Strip */}
      <section className="bg-dark text-white py-5">
        <div className="container">
          <div className="text-center mb-4">
            <span className="text-warning text-uppercase small fw-bold">CHOOSE YOUR SPORT</span>
            <h3 className="fw-bold mt-1">Ready for Any Arena</h3>
          </div>
          <div className="row g-3 justify-content-center">
            {[
              ['Basketball', 'basketball.png'],
              ['Football', 'football.png'],
              ['Volleyball', 'volleyball.png'],
              ['Running', 'running.png'],
              ['Gym', 'gym.png'],
              ['Tennis', 'tennis.png']
            ].map(([sport, img]) => (
              <div className="col-6 col-md-4 col-lg-2 text-center" key={sport}>
                <div
                  className="p-3 bg-secondary bg-opacity-25 rounded-3 hover-lift border border-secondary"
                  style={{ cursor: 'pointer' }}
                  onClick={() => onHookClick({ name: `${sport} Collection` })}
                  title={`Sign in to explore ${sport}`}
                >
                  <img src={A + img} alt={sport} style={{ width: '55px', height: '55px', objectFit: 'contain' }} />
                  <b className="d-block mt-2 text-light">{sport}</b>
                  <small className="text-warning">Sign in to buy →</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="cta-banner py-5 bg-light">
        <div className="container text-center py-4">
          <h2 className="fw-bold text-dark mb-3">Join the JC Sportswear Community</h2>
          <p className="text-muted fs-5 max-w-600 mx-auto mb-4">
            Create an account or sign in with Google in seconds. Manage your wishlist, track orders,
            and shop tournament-ready gear.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <button className="btn btn-primary btn-lg px-4" onClick={() => navigate('login')}>
              <i className="bi bi-google me-2" /> Sign In with Google
            </button>
            <button className="btn btn-outline-dark btn-lg px-4" onClick={() => navigate('shop')}>
              View Full Shop
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
