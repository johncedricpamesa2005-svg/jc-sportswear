import React from 'react';
import { A, Product } from '../product.jsx';

export default function Home({
  products,
  goShop,
  setCat,
  wish,
  onWish,
  onView,
  onBuy,
  isLoggedIn,
  signIn
}) {
  return (
    <main>
      <header className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <span className="eyebrow text-uppercase">
              <i className="bi bi-award-fill text-warning me-1" /> JC SPORTSWEAR • PLAY • TRAIN • PERFORM
            </span>
            <h1 className="display-4 fw-black">
              Gear Up.<br />
              <span className="text-highlight">Play Hard.</span>
            </h1>
            <p className="hero-lead">
              Premium sportswear and performance gear for athletes who refuse to sit on the sidelines.
              Designed with breathable fabrics, tailored fits, and tournament durability.
            </p>
            <div className="hero-actions d-flex flex-wrap gap-2">
              <button className="btn btn-primary btn-lg" onClick={goShop}>
                Shop the collection <i className="bi bi-arrow-right ms-1" />
              </button>
              {!isLoggedIn && (
                <button className="btn btn-light btn-lg" onClick={signIn}>
                  Sign in to buy
                </button>
              )}
            </div>
            <div className="hero-points d-flex flex-wrap gap-3 mt-4 text-light">
              <span><i className="bi bi-check-circle-fill text-warning me-1" /> Performance ready</span>
              <span><i className="bi bi-star-fill text-warning me-1" /> Top-rated picks</span>
              <span><i className="bi bi-lightning-charge-fill text-warning me-1" /> Fast Nationwide Delivery</span>
            </div>
          </div>
          <div className="hero-product-showcase">
            <div className="hero-card hero-card-main shadow-lg">
              <img src={A + 'bballshirt.jpg'} alt="Basketball Jersey" />
              <div className="p-3">
                <span className="badge bg-danger mb-1">BEST SELLER</span>
                <b className="d-block text-dark fs-5">Basketball Jersey</b>
                <strong className="fs-5 text-dark">₱1,299.00</strong>
              </div>
            </div>
            <div className="hero-floating hero-floating-one">
              <i className="bi bi-fire text-danger fs-3" />
              <div>
                <b>Hot Drop</b>
                <small>Built for game day</small>
              </div>
            </div>
            <div className="hero-floating hero-floating-two">
              <b>4.9/5</b>
              <small>Customer rating</small>
            </div>
          </div>
        </div>
      </header>

      <section className="trust-strip py-4 bg-light border-bottom">
        <div className="container">
          <div className="row g-3 text-center text-md-start">
            <div className="col-md-4 d-flex align-items-center justify-content-center justify-content-md-start gap-3">
              <i className="bi bi-shield-check fs-2 text-danger" />
              <div>
                <b className="d-block text-dark">Quality First</b>
                <small className="text-muted">High durability tournament sportswear</small>
              </div>
            </div>
            <div className="col-md-4 d-flex align-items-center justify-content-center justify-content-md-start gap-3">
              <i className="bi bi-truck fs-2 text-danger" />
              <div>
                <b className="d-block text-dark">Fast Nationwide Shipping</b>
                <small className="text-muted">Reliable doorstep parcel delivery</small>
              </div>
            </div>
            <div className="col-md-4 d-flex align-items-center justify-content-center justify-content-md-start gap-3">
              <i className="bi bi-cash-coin fs-2 text-danger" />
              <div>
                <b className="d-block text-dark">Cash on Delivery</b>
                <small className="text-muted">Convenient payment upon order receipt</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Sport */}
      <section className="container section py-5">
        <div className="section-heading text-center mb-5">
          <span className="badge bg-danger text-uppercase px-3 py-1 mb-2">FIND YOUR GAME</span>
          <h2 className="display-5 fw-bold text-dark">Shop by Sport</h2>
          <p className="text-muted fs-5">From the court to the track, find gear made for your next move.</p>
        </div>
        <div className="row g-3">
          {[
            ['Basketball', 'basketball.png'],
            ['Football', 'football.png'],
            ['Volleyball', 'volleyball.png'],
            ['Running', 'running.png'],
            ['Gym', 'gym.png'],
            ['Tennis', 'tennis.png']
          ].map(([c, img]) => (
            <div className="col-6 col-md-4 col-lg-2" key={c}>
              <button className="sport-card w-100 btn text-center p-3 border rounded-3 bg-white hover-lift" onClick={() => setCat(c)}>
                <img src={A + img} alt={c} style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                <b className="d-block mt-2 text-dark">{c}</b>
                <i className="bi bi-arrow-right text-muted" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container section pt-0" id="featured-products">
        <div className="d-flex flex-wrap justify-content-between align-items-end mb-4 gap-3">
          <div>
            <span className="badge bg-danger text-uppercase px-3 py-1 mb-1">SHOP FAVORITES</span>
            <h2 className="fw-bold text-dark mb-1">Featured Sportswear</h2>
            <p className="text-muted mb-0">Browse our top performance sportswear.</p>
          </div>
          <button className="btn btn-outline-dark" onClick={goShop}>
            View all products <i className="bi bi-arrow-right ms-1" />
          </button>
        </div>
        <div className="row g-4">
          {products.slice(0, 8).map(p => (
            <Product
              key={p.id}
              p={p}
              liked={wish.includes(p.id)}
              onView={onView}
              onWish={onWish}
              onBuy={onBuy}
            />
          ))}
        </div>
      </section>

      {/* Banner */}
      <section className="cta-banner py-5 bg-dark text-white">
        <div className="container d-flex flex-wrap align-items-center justify-content-between gap-4">
          <div>
            <span className="badge bg-warning text-dark text-uppercase px-3 py-1 mb-2">READY TO PLAY?</span>
            <h2 className="display-6 fw-bold">Don't just watch the game. Gear up for it.</h2>
            <p className="text-light mb-0">Browse freely. Add items to cart and check out with Cash on Delivery.</p>
          </div>
          <button className="btn btn-primary btn-lg" onClick={goShop}>
            Start Shopping <i className="bi bi-arrow-right ms-1" />
          </button>
        </div>
      </section>
    </main>
  );
}
