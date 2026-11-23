import React from 'react';

export default function About({ navigate }) {
  return (
    <main className="container page py-5">
      <section className="about-card bg-light p-4 p-md-5 rounded-4 shadow-sm border">
        <span className="badge bg-danger text-uppercase px-3 py-1 mb-2">OUR MISSION</span>
        <h1 className="fw-black text-dark mb-3">About JC Sportswear</h1>
        <p className="fs-5 text-secondary leading-relaxed">
          JC Sportswear is dedicated to providing athletes, sports teams, and fitness enthusiasts
          with professional-grade apparel and gear. From lightweight, breathable jerseys to durable
          training shorts and sports equipment, our gear is engineered for champions.
        </p>

        <div className="row g-4 mt-4">
          <div className="col-md-4">
            <div className="card h-100 border-0 shadow-sm p-4 text-center">
              <i className="bi bi-award-fill fs-1 text-danger mb-3" />
              <h4 className="fw-bold">Tournament Grade</h4>
              <p className="text-muted small">
                Every fabric is selected for athletic flexibility, sweat absorption, and enduring durability during high-intensity competition.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card h-100 border-0 shadow-sm p-4 text-center">
              <i className="bi bi-shield-check fs-1 text-warning mb-3" />
              <h4 className="fw-bold">100% Quality Guaranteed</h4>
              <p className="text-muted small">
                Rigorous testing on basketball, volleyball, and football apparel guarantees comfort and long-lasting performance.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card h-100 border-0 shadow-sm p-4 text-center">
              <i className="bi bi-truck fs-1 text-primary mb-3" />
              <h4 className="fw-bold">Doorstep Delivery</h4>
              <p className="text-muted small">
                Fast parcel delivery across the Philippines with flexible Cash on Delivery payment options.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-4 border-top text-center">
          <h4 className="fw-bold mb-2">Ready to gear up?</h4>
          <div className="d-flex justify-content-center gap-3 mt-3">
            <button className="btn btn-primary px-4" onClick={() => navigate('shop')}>
              Browse Collection
            </button>
            <button className="btn btn-outline-dark px-4" onClick={() => navigate('landing')}>
              Back to Home
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
