import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import Style from './style.jsx';
import Navbar from './components/Navbar.jsx';
import OfflineBanner from './components/OfflineBanner.jsx';
import { ProtectedRoute, RoleRoute } from './components/ProtectedRoute.jsx';
import CheckoutModal from './components/CheckoutModal.jsx';

import Landing from './pages/Landing.jsx';
import Home from './pages/Home.jsx';
import Shop from './pages/Shop.jsx';
import ManageProducts from './pages/ManageProducts.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Profile from './pages/Profile.jsx';
import About from './pages/About.jsx';
import Wishlist from './pages/Wishlist.jsx';
import Orders from './pages/Orders.jsx';
import Login from './pages/Login.jsx';
import AccessDenied from './pages/AccessDenied.jsx';
import NotFound from './pages/NotFound.jsx';

import { money, getImageSrc } from './product.jsx';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, syncUserWithFirestore } from './firebase.js';
import { apiUrl, authFetch } from './api.js';

const INITIAL_PRODUCTS = [
  { id: 1, name: 'Basketball Jersey', category: 'Basketball', price: 1299, oldPrice: 1599, stock: 25, rating: 4.9, image: 'bballshirt.jpg', badge: 'BEST SELLER', description: 'Lightweight basketball jersey designed for comfort and movement.' },
  { id: 2, name: 'Basketball Shorts', category: 'Basketball', price: 899, oldPrice: 1099, stock: 30, rating: 4.8, image: 'bballshorts.webp', badge: 'SALE', description: 'Breathable basketball shorts perfect for training and competition.' },
  { id: 3, name: 'Football Performance Jersey', category: 'Football', price: 1499, oldPrice: 1799, stock: 20, rating: 4.9, image: 'fballjer.webp', badge: 'POPULAR', description: 'Performance football jersey made for intense matches.' },
  { id: 4, name: 'Football Training Shorts', category: 'Football', price: 799, oldPrice: 999, stock: 18, rating: 4.7, image: 'fballshrt.webp', badge: 'SALE', description: 'Comfortable training shorts with flexible fabric.' },
  { id: 5, name: 'Volleyball Jersey Set', category: 'Volleyball', price: 1199, oldPrice: 1399, stock: 15, rating: 4.8, image: 'volleyballset.jpg', badge: 'NEW', description: 'Modern volleyball jersey for teams and recreational players.' },
  { id: 6, name: 'Volleyball Performance Ball', category: 'Volleyball', price: 749, oldPrice: 899, stock: 12, rating: 4.6, image: 'vballper.jpg', badge: '', description: 'Flexible and breathable volleyball ball.' },
  { id: 7, name: 'Running Performance Shirt', category: 'Running', price: 999, oldPrice: 1199, stock: 22, rating: 4.9, image: 'running.webp', badge: 'BEST SELLER', description: 'Lightweight running shirt with breathable performance fabric.' },
  { id: 8, name: 'Runner Training Shorts', category: 'Running', price: 699, oldPrice: 849, stock: 28, rating: 4.7, image: 'runningshorts.webp', badge: 'SALE', description: 'Comfortable running shorts built for daily training.' },
  { id: 9, name: 'Gym Compression Shirt', category: 'Gym', price: 1099, oldPrice: 1299, stock: 19, rating: 4.8, image: 'gymshirt.webp', badge: 'POPULAR', description: 'Compression training shirt designed for workouts.' },
  { id: 10, name: 'Wrist Supporter', category: 'Gym', price: 1299, oldPrice: 1499, stock: 35, rating: 4.8, image: 'wristsupp.jpg', badge: '', description: 'Versatile wrist support for training and everyday use.' },
  { id: 11, name: 'Tennis Performance Polo', category: 'Tennis', price: 1399, oldPrice: 1599, stock: 14, rating: 4.9, image: 'tennispolo.jpg', badge: 'NEW', description: 'Classic tennis polo with lightweight performance fabric.' },
  { id: 12, name: 'Tennis Performance Racket', category: 'Tennis', price: 899, oldPrice: 1099, stock: 10, rating: 4.7, image: 'racket.webp', badge: 'SALE', description: 'Reliable racket for training and competition.' }
];

const ROUTE_MAP = {
  landing: '/',
  home: '/home',
  shop: '/shop',
  about: '/about',
  manage: '/manage',
  dashboard: '/dashboard',
  profile: '/profile',
  wishlist: '/wishlist',
  orders: '/orders',
  login: '/login'
};

const readStorage = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
};

function App() {
  const routerNavigate = useNavigate();

  const [user, setUser] = useState(() => readStorage('jcUser', null));
  const [role, setRole] = useState(() => readStorage('jcUserRole', 'user'));
  const [authReady, setAuthReady] = useState(false);

  const [shopCategory, setShopCategory] = useState('All');
  const [products, setProducts] = useState(() => readStorage('jcProductsCache', INITIAL_PRODUCTS));
  const [wish, setWish] = useState(() => readStorage('jcWish', []));
  const [orders, setOrders] = useState(() => readStorage('jcOrders', []));
  const [pendingBuy, setPendingBuy] = useState(null);
  const [hookMessage, setHookMessage] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [checkoutProduct, setCheckoutProduct] = useState(null);
  const [apiOffline, setApiOffline] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => { localStorage.setItem('jcWish', JSON.stringify(wish)); }, [wish]);
  useEffect(() => { localStorage.setItem('jcOrders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('jcProductsCache', JSON.stringify(products)); }, [products]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('jcUser', JSON.stringify(user));
      localStorage.setItem('jcUserRole', JSON.stringify(role));
    } else {
      localStorage.removeItem('jcUser');
      localStorage.removeItem('jcUserRole');
    }
  }, [user, role]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Register Service Worker for PWA (production) & clean up stale dev workers
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    if (import.meta.env.DEV) {
      const cleanupKey = 'jc-dev-sw-cleanup-v3';
      navigator.serviceWorker.getRegistrations().then(async registrations => {
        if (!registrations.length || sessionStorage.getItem(cleanupKey)) return;
        sessionStorage.setItem(cleanupKey, '1');
        await Promise.all(registrations.map(r => r.unregister()));
        const keys = await caches.keys();
        await Promise.all(keys.filter(k => k.startsWith('jc-sportswear-')).map(k => caches.delete(k)));
        window.location.reload();
      }).catch(() => {});
      return;
    }

    navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' })
      .then(reg => reg.update())
      .catch(() => {});
  }, []);

  const notify = msg => setToast(msg);

  const navigate = (nextPage, category = 'All') => {
    const targetPath = ROUTE_MAP[nextPage] || (nextPage.startsWith('/') ? nextPage : `/${nextPage}`);
    if (nextPage === 'shop') setShopCategory(category || 'All');
    setSelectedProduct(null);
    setCheckoutProduct(null);
    routerNavigate(targetPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fetch products from Express + MySQL backend (Network-First via SW when offline)
  const fetchProductsFromBackend = async () => {
    try {
      const res = await fetch(apiUrl('/api/products'));
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
          setApiOffline(false);
        }
      } else {
        setApiOffline(true);
      }
    } catch {
      setApiOffline(true);
    }
  };

  const fetchMyOrders = async () => {
    try {
      const res = await authFetch('/api/orders/my');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setOrders(data);
        }
      }
    } catch {}
  };

  useEffect(() => {
    fetchProductsFromBackend();
  }, []);

  // Firebase Auth Listener: syncs user & role from Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async firebaseUser => {
      if (firebaseUser) {
        const synced = await syncUserWithFirestore(firebaseUser);
        setUser(synced);
        setRole(synced.role || 'user');
        fetchMyOrders();
      } else {
        setUser(null);
        setRole('user');
      }
      setAuthReady(true);
    });
    return unsubscribe;
  }, []);

  // Landing page hook: clicking a product card directs to Login
  const handleLandingHookClick = product => {
    setPendingBuy(product);
    setHookMessage(`You selected "${product.name}". Sign in to unlock checkout!`);
    notify(`Redirecting to Login: Sign in to purchase ${product.name}!`);
    navigate('login');
  };

  // Buy Now -> opens CheckoutModal if signed in, or redirects to Login
  const handleBuyProduct = product => {
    if (!user) {
      setPendingBuy(product);
      setHookMessage(`Sign in to purchase "${product.name}".`);
      notify(`Please sign in to order ${product.name}.`);
      navigate('login');
      return;
    }
    setCheckoutProduct(product);
  };

  // Submit Checkout Form -> POST /api/orders (MySQL transaction + stock deduction)
  const handleConfirmOrder = async orderData => {
    const payload = {
      customer: orderData.customer,
      shippingAddress: orderData.shippingAddress,
      paymentMethod: orderData.paymentMethod || 'Cash on Delivery',
      items: [{
        id: orderData.product.id,
        name: orderData.product.name,
        price: Number(orderData.product.price),
        qty: orderData.qty,
        image: orderData.product.image
      }]
    };

    try {
      const res = await authFetch('/api/orders', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setOrders(prev => [data.order, ...prev]);
        fetchProductsFromBackend(); // refresh deducted stock
      } else {
        const err = await res.json();
        notify(err.message || 'Order could not be processed.');
        return;
      }
    } catch {
      // Offline fallback order record
      const fallbackOrder = {
        id: `JC-${Date.now().toString().slice(-8)}`,
        date: new Date().toLocaleString('en-PH'),
        status: 'Processing',
        payment: payload.paymentMethod,
        customer: payload.customer,
        shippingAddress: payload.shippingAddress,
        items: payload.items,
        total: orderData.total
      };
      setOrders(prev => [fallbackOrder, ...prev]);
    }

    setCheckoutProduct(null);
    setSelectedProduct(null);
    notify(`Order placed! Delivery to ${orderData.shippingAddress.city}, ${orderData.shippingAddress.province}.`);
    navigate('orders');
  };

  const toggleWish = product => {
    if (!user) {
      setPendingBuy(product);
      setHookMessage('Sign in to save items to your wishlist.');
      notify('Please sign in to save products.');
      navigate('login');
      return;
    }
    const exists = wish.includes(product.id);
    setWish(prev => (exists ? prev.filter(id => id !== product.id) : [...prev, product.id]));
    notify(exists ? `Removed ${product.name} from wishlist.` : `Saved ${product.name} to wishlist!`);
  };

  // Protected Admin Product CRUD (Bearer Token + Role verified on Express backend)
  const handleAddProduct = async newProductData => {
    try {
      const res = await authFetch('/api/products', {
        method: 'POST',
        body: JSON.stringify(newProductData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create product');
      setProducts(prev => [...prev, data]);
      notify(`Product "${data.name}" created!`);
      return true;
    } catch (err) {
      notify(`Error: ${err.message}`);
      return false;
    }
  };

  const handleUpdateProduct = async (id, updatedFields) => {
    try {
      const res = await authFetch(`/api/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedFields)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update product');
      setProducts(prev => prev.map(p => (String(p.id) === String(id) ? { ...p, ...data } : p)));
      notify(`Product "${data.name}" updated!`);
      return true;
    } catch (err) {
      notify(`Error: ${err.message}`);
      return false;
    }
  };

  const handleDeleteProduct = async id => {
    try {
      const res = await authFetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete product');
      setProducts(prev => prev.filter(p => String(p.id) !== String(id)));
      notify('Product deleted successfully.');
      return true;
    } catch (err) {
      notify(`Error: ${err.message}`);
      return false;
    }
  };

  const handleLogout = async () => {
    try { await signOut(auth); } catch {}
    setUser(null);
    setRole('user');
    setSelectedProduct(null);
    setCheckoutProduct(null);
    notify('You have been signed out.');
    navigate('landing');
  };

  const handleLoginSuccess = (account, redirectTo = '/home') => {
    const userRole = account.role || 'user';
    const cleanAccount = { ...account, role: userRole };
    setUser(cleanAccount);
    setRole(userRole);
    fetchMyOrders();

    const pending = pendingBuy;
    setPendingBuy(null);
    setHookMessage('');

    if (pending) {
      notify(`Welcome, ${cleanAccount.name}! Opening checkout for ${pending.name}...`);
      routerNavigate('/shop');
      setCheckoutProduct(pending);
    } else {
      notify(`Welcome, ${cleanAccount.name}!`);
      routerNavigate(redirectTo === '/login' ? '/home' : redirectTo);
    }
  };

  if (!authReady) {
    return (
      <div className="auth">
        <div className="auth-card">
          <img src="/assets/logo.png" alt="JC Sportswear" />
          <h2 className="mt-3 fw-bold">JC Sportswear</h2>
          <div className="spinner-border text-danger my-3" role="status" />
          <p className="text-muted mb-0">Loading store...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar
        user={user}
        role={role}
        wishCount={wish.length}
        ordersCount={orders.length}
        onLogout={handleLogout}
      />

      <OfflineBanner apiOffline={apiOffline} />

      <Routes>
        <Route
          path="/"
          element={
            <Landing
              products={products}
              onHookClick={handleLandingHookClick}
              navigate={navigate}
            />
          }
        />

        <Route
          path="/home"
          element={
            <Home
              products={products}
              goShop={() => navigate('shop')}
              setCat={c => navigate('shop', c)}
              wish={wish}
              onWish={toggleWish}
              onView={p => setSelectedProduct(p)}
              onBuy={handleBuyProduct}
              isLoggedIn={!!user}
              signIn={() => navigate('login')}
            />
          }
        />

        <Route
          path="/shop"
          element={
            <Shop
              products={products}
              wish={wish}
              onWish={toggleWish}
              onView={p => setSelectedProduct(p)}
              onBuy={handleBuyProduct}
              initialCategory={shopCategory}
            />
          }
        />

        <Route path="/about" element={<About navigate={navigate} />} />

        <Route
          path="/login"
          element={<Login onLogin={handleLoginSuccess} initialHookMessage={hookMessage} />}
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user} authReady={authReady}>
              <Dashboard user={user} role={role} products={products} orders={orders} wish={wish} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute user={user} authReady={authReady}>
              <Profile
                user={user}
                role={role}
                ordersCount={orders.length}
                wishCount={wish.length}
                onLogout={handleLogout}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/wishlist"
          element={
            <ProtectedRoute user={user} authReady={authReady}>
              <Wishlist
                products={products}
                wish={wish}
                onRemoveWish={toggleWish}
                onBuy={handleBuyProduct}
                navigate={navigate}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute user={user} authReady={authReady}>
              <Orders orders={orders} navigate={navigate} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manage"
          element={
            <RoleRoute user={user} role={role} authReady={authReady} allowedRoles={['admin']}>
              <ManageProducts
                products={products}
                onAddProduct={handleAddProduct}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
                notify={notify}
              />
            </RoleRoute>
          }
        />

        <Route path="/access-denied" element={<AccessDenied />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <footer>
        <div className="container d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <strong className="text-white">JC SPORTSWEAR</strong>
            <span className="ms-2">| Train Harder. Play Better. Shop Smarter.</span>
          </div>
          <div className="small text-muted">
            <span>&copy; 2026 JC Sportswear. All rights reserved.</span>
          </div>
        </div>
      </footer>

      {selectedProduct && (
        <div className="modal-backdrop-custom" onClick={() => setSelectedProduct(null)}>
          <div className="product-modal shadow-lg" onClick={e => e.stopPropagation()}>
            <button
              className="btn-close modal-close"
              onClick={() => setSelectedProduct(null)}
              aria-label="Close"
            />
            <img src={getImageSrc(selectedProduct.image)} alt={selectedProduct.name} />
            <div className="p-4 d-flex flex-column">
              <span className="small text-muted text-uppercase fw-bold">{selectedProduct.category}</span>
              <h2 className="fw-black text-dark mt-1 mb-2">{selectedProduct.name}</h2>
              <div className="rating text-warning fs-5 mb-2">★ {selectedProduct.rating}</div>
              <h3 className="text-dark fw-bold mb-3">
                {money(selectedProduct.price)}{' '}
                {selectedProduct.oldPrice && <del className="text-muted fs-6">{money(selectedProduct.oldPrice)}</del>}
              </h3>
              <p className="text-secondary">{selectedProduct.description}</p>
              <div className="mt-auto pt-3">
                <button
                  className="btn btn-primary w-100 py-2 fs-5"
                  onClick={() => {
                    const p = selectedProduct;
                    setSelectedProduct(null);
                    handleBuyProduct(p);
                  }}
                >
                  <i className="bi bi-cart-fill me-2" />
                  {user ? 'Proceed to Checkout' : 'Sign in to Purchase'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {checkoutProduct && (
        <CheckoutModal
          product={checkoutProduct}
          user={user}
          onClose={() => setCheckoutProduct(null)}
          onConfirmOrder={handleConfirmOrder}
        />
      )}

      {toast && (
        <div className="toastx shadow-lg" role="status">
          <i className="bi bi-info-circle-fill text-warning me-2" /> {toast}
        </div>
      )}
    </>
  );
}

function AppRoot() {
  return (
    <BrowserRouter>
      <Style />
      <App />
    </BrowserRouter>
  );
}

createRoot(document.getElementById('root')).render(<AppRoot />);
