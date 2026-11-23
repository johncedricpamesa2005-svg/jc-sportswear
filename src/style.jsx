import { useEffect } from 'react';

const styles = `
:root {
  --primary: #ff4d30;
  --primary-hover: #e03a1e;
  --dark: #111827;
  --muted: #6b7280;
  --cream: #f8f7f4;
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; overflow-x: hidden; }
body {
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: #374151;
  background: #ffffff;
  margin: 0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

#root {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.fw-black { font-weight: 900; }
.text-highlight { color: #ff6b4f; }
.hover-lift { transition: transform 0.2s ease, box-shadow 0.2s ease; }
.hover-lift:hover { transform: translateY(-4px); box-shadow: 0 10px 25px rgba(0,0,0,0.1); }

/* NAVBAR */
.custom-navbar {
  background: rgba(17, 24, 39, 0.98);
  backdrop-filter: blur(8px);
  padding: 12px 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1030;
}
.brand-logo { width: 38px; height: 38px; object-fit: contain; }
.brand-title { color: #ffffff !important; font-size: 1.15rem; letter-spacing: 0.5px; }
.nav-link { color: #d1d5db !important; padding: 6px 12px !important; border-radius: 6px; transition: 0.2s; }
.nav-link:hover, .nav-link.active { color: #ffffff !important; background: rgba(255, 255, 255, 0.08); }

/* HERO */
.hero {
  min-height: 650px;
  padding: 140px 0 80px;
  background: linear-gradient(115deg, #111827 0%, #172033 50%, #232c3d 100%);
  color: #ffffff;
  position: relative;
  overflow: hidden;
}
.hero:after {
  content: "";
  position: absolute;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  right: -200px;
  top: 60px;
  background: rgba(255, 77, 48, 0.12);
  pointer-events: none;
}
.hero-inner {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  align-items: center;
  gap: 40px;
  position: relative;
  z-index: 1;
}
.eyebrow { letter-spacing: 2px; font-size: 0.75rem; font-weight: 800; color: #ff6b4f; }
.hero-lead { font-size: 1.1rem; line-height: 1.7; color: #d1d5db; max-width: 580px; }
.btn-primary { background: var(--primary); border-color: var(--primary); }
.btn-primary:hover, .btn-primary:focus { background: var(--primary-hover); border-color: var(--primary-hover); }

/* HERO SHOWCASE CARD */
.hero-product-showcase {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.hero-card-main {
  width: min(380px, 85%);
  border-radius: 20px;
  background: #ffffff;
  padding: 12px;
  color: #111827;
  transform: rotate(2deg);
}
.hero-card-main img { width: 100%; height: 350px; object-fit: cover; border-radius: 14px; }
.hero-floating {
  position: absolute;
  background: #ffffff;
  color: #111827;
  padding: 12px 18px;
  border-radius: 12px;
  box-shadow: 0 15px 35px rgba(0,0,0,0.18);
  display: flex;
  gap: 12px;
  align-items: center;
}
.hero-floating-one { left: -10px; bottom: 30px; }
.hero-floating-two { right: 10px; top: 40px; }

/* PRODUCT CARD & HOOK */
.product-card {
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  background: #ffffff;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}
.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0,0,0,0.08);
}
.product-img {
  height: 250px;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}
.product-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}
.product-card:hover .product-img img {
  transform: scale(1.04);
}
.badge-custom {
  position: absolute;
  top: 12px;
  left: 12px;
  background: #111827;
  color: #ffffff;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  z-index: 2;
}
.wish {
  position: absolute;
  top: 12px;
  right: 12px;
  border: 0;
  border-radius: 50%;
  background: rgba(255,255,255,0.9);
  width: 36px;
  height: 36px;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  transition: color 0.2s, transform 0.2s;
  z-index: 2;
}
.wish.active { color: #ff4d30; }
.wish:hover { transform: scale(1.1); color: #ff4d30; }

/* HOOK CARD OVERLAY */
.hook-card {
  border: 2px solid rgba(255, 77, 48, 0.2);
  transition: all 0.25s ease;
}
.hook-card:hover {
  border-color: #ff4d30;
  box-shadow: 0 18px 40px rgba(255, 77, 48, 0.18);
  transform: translateY(-6px);
}
.hook-overlay {
  position: absolute;
  inset: 0;
  background: rgba(17, 24, 39, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 3;
}
.hook-card:hover .hook-overlay {
  opacity: 1;
}
.hook-overlay span {
  background: #ff4d30;
  color: #fff;
  font-weight: bold;
  padding: 8px 16px;
  border-radius: 30px;
  font-size: 0.85rem;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
}

/* GENERAL PAGES & MODAL */
.page {
  padding-top: 100px;
  flex: 1 0 auto;
}
.modal-backdrop-custom {
  position: fixed;
  inset: 0;
  z-index: 2050;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.product-modal {
  background: #ffffff;
  width: min(850px, 94vw);
  max-height: 90vh;
  overflow: auto;
  border-radius: 18px;
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  box-shadow: 0 25px 60px rgba(0,0,0,0.3);
}
.product-modal > img {
  width: 100%;
  height: 100%;
  min-height: 400px;
  object-fit: cover;
}
.modal-close {
  position: absolute;
  right: 16px;
  top: 16px;
  z-index: 10;
  background: #ffffff;
  border-radius: 50%;
  padding: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

/* AUTHENTICATION VIEW */
.auth {
  min-height: 100vh;
  background: linear-gradient(135deg, #111827 0%, #1e293b 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.auth-card {
  background: #ffffff;
  width: min(440px, 100%);
  border-radius: 20px;
  padding: 36px 30px;
  text-align: center;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
}
.auth-card img { width: 72px; height: 72px; object-fit: contain; }

/* TOAST */
.toastx {
  position: fixed;
  z-index: 3000;
  right: 20px;
  bottom: 20px;
  background: #111827;
  color: #ffffff;
  padding: 12px 20px;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
  border-left: 4px solid var(--primary);
  max-width: 380px;
  animation: slideIn 0.3s ease;
}
@keyframes slideIn {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

footer {
  background: #111827;
  color: #9ca3af;
  padding: 30px 0;
  margin-top: auto;
}

@media (max-width: 900px) {
  .hero-inner { grid-template-columns: 1fr; }
  .hero { padding-top: 120px; }
  .product-modal { grid-template-columns: 1fr; }
  .product-modal > img { min-height: 260px; max-height: 320px; }
  .hero-floating-one { left: 0; bottom: 10px; }
  .hero-floating-two { right: 0; top: 10px; }
}
`;

export default function Style() {
  useEffect(() => {
    const id = 'jc-sportswear-styles';
    let style = document.getElementById(id);
    if (!style) {
      style = document.createElement('style');
      style.id = id;
      document.head.appendChild(style);
    }
    style.textContent = styles;
    return () => {
      const current = document.getElementById(id);
      if (current) current.remove();
    };
  }, []);
  return null;
}
