import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cert, initializeApp, getApps } from 'firebase-admin/app';
import { getAuth as getFirebaseAdminAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { initDatabase, getPool, isMysqlConnected, mapProductRow, DEFAULT_PRODUCTS } from './db.js';
import { createAuthMiddleware } from './middleware/auth.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const PORT = Number(process.env.PORT || 8080);

fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(PRODUCTS_FILE)) {
  const seeded = DEFAULT_PRODUCTS.map((p, idx) => ({ id: idx + 1, product_id: idx + 1, ...p }));
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(seeded, null, 2));
}
if (!fs.existsSync(ORDERS_FILE)) {
  fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2));
}

const readJson = (file, fallback) => {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return fallback; }
};
const writeJson = (file, data) => {
  try { fs.writeFileSync(file, JSON.stringify(data, null, 2)); }
  catch (err) { console.error('File write error:', err.message); }
};

// Initialize Firebase Admin & Firestore
let firebaseAdminReady = false;
let firestoreDb = null;

try {
  const serviceAccountPath = path.join(process.cwd(), 'serviceAccountKey.json');
  let adminApp = null;

  if (getApps().length === 0) {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      adminApp = initializeApp({ credential: cert(serviceAccount) });
    } else if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      adminApp = initializeApp({ credential: cert(serviceAccount) });
    } else {
      adminApp = initializeApp();
    }
  } else {
    adminApp = getApps()[0];
  }

  firestoreDb = getFirestore(adminApp);
  firebaseAdminReady = true;
  console.log('[FIREBASE] Admin SDK & Firestore connected.');
} catch (error) {
  console.error('[FIREBASE ERROR] Admin initialization failed:', error.message);
}

// Initialize MySQL Pool & Relational Schema
await initDatabase();

const app = express();

// CORS Configuration (supports local dev + Netlify production URL via CLIENT_ORIGIN)
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin.startsWith('http://localhost:') ||
      origin.startsWith('http://127.0.0.1:')
    ) {
      return callback(null, true);
    }
    return callback(new Error(`CORS policy blocked origin: ${origin}`));
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Request Logging Middleware
app.use((req, res, next) => {
  const time = new Date().toLocaleTimeString();
  console.log(`[${time}] ${req.method} ${req.path}`);
  next();
});

const { verifyFirebaseToken, requireAdmin } = createAuthMiddleware({
  getFirestoreDb: () => firestoreDb,
  isFirebaseReady: () => firebaseAdminReady
});

const OWNER_ADMIN_EMAILS = [
  'admin@jcsportswear.com',
  'mysteryprince123@gmail.com',
  'johncedricpamesa2005@gmail.com'
];

// ==========================================
// 1. HEALTH CHECK ENDPOINT (Render)
// ==========================================
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'jc-sportswear-api',
    database: isMysqlConnected() ? 'mysql-connected' : 'json-fallback',
    mysqlConnected: isMysqlConnected(),
    firebaseAdminReady,
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// 2. AUTHENTICATION & FIRESTORE ROLE SYNC
// ==========================================
app.post(['/api/auth/google', '/api/firebase-login'], async (req, res, next) => {
  try {
    if (!firebaseAdminReady) {
      return res.status(503).json({ message: 'Firebase Admin is not configured on the server.' });
    }

    const { idToken } = req.body || {};
    if (!idToken) {
      return res.status(400).json({ message: 'Firebase ID token is required.' });
    }

    const decoded = await getFirebaseAdminAuth().verifyIdToken(idToken);
    const uid = decoded.uid;
    const email = decoded.email?.toLowerCase()?.trim() || '';
    const name = decoded.name || email.split('@')[0] || 'Google User';
    const photoURL = decoded.picture || '';

    let role = OWNER_ADMIN_EMAILS.includes(email) ? 'admin' : 'user';

    if (firestoreDb) {
      const userDocRef = firestoreDb.collection('users').doc(uid);
      const docSnap = await userDocRef.get();

      if (!docSnap.exists) {
        await userDocRef.set({
          uid,
          name,
          email,
          photoURL,
          provider: 'google',
          role,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
          lastLogin: FieldValue.serverTimestamp()
        });
      } else {
        const existing = docSnap.data();
        role = existing.role || role;
        await userDocRef.update({
          name: name || existing.name,
          photoURL: photoURL || existing.photoURL || '',
          email: email || existing.email,
          updatedAt: FieldValue.serverTimestamp(),
          lastLogin: FieldValue.serverTimestamp()
        });
      }
    }

    return res.status(200).json({
      user: { id: uid, uid, name, email, photo: photoURL, photoURL, role, provider: 'google' }
    });
  } catch (error) {
    if (error.code?.startsWith?.('auth/')) {
      return res.status(401).json({ message: 'Invalid or expired Google authentication token.' });
    }
    return next(error);
  }
});

// Verify current token & return user + Firestore role
app.get('/api/me', verifyFirebaseToken, (req, res) => {
  res.status(200).json({ authenticated: true, user: req.user });
});

// ==========================================
// 3. PRODUCTS REST API (MySQL + Fallback)
// ==========================================

// GET /api/products (Public Read with optional category & search filtering)
app.get(['/api/products', '/api/data'], async (req, res, next) => {
  try {
    const { category, search } = req.query;

    if (isMysqlConnected()) {
      const pool = getPool();
      let sql = 'SELECT * FROM products WHERE 1=1';
      const params = [];

      if (category && category !== 'All') {
        sql += ' AND category = ?';
        params.push(category);
      }
      if (search && search.trim()) {
        sql += ' AND (product_name LIKE ? OR category LIKE ? OR description LIKE ?)';
        const term = `%${search.trim()}%`;
        params.push(term, term, term);
      }
      sql += ' ORDER BY product_id ASC';

      const [rows] = await pool.query(sql, params);
      const mapped = rows.map(mapProductRow);
      writeJson(PRODUCTS_FILE, mapped);
      return res.status(200).json(mapped);
    }

    let list = readJson(PRODUCTS_FILE, []);
    if (category && category !== 'All') list = list.filter(p => p.category === category);
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(p => `${p.name} ${p.category} ${p.description}`.toLowerCase().includes(q));
    }
    return res.status(200).json(list);
  } catch (error) {
    return next(error);
  }
});

// GET /api/products/:id
app.get('/api/products/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid product ID.' });

    if (isMysqlConnected()) {
      const [rows] = await getPool().query('SELECT * FROM products WHERE product_id = ?', [id]);
      if (!rows.length) return res.status(404).json({ message: 'Product not found.' });
      return res.status(200).json(mapProductRow(rows[0]));
    }

    const list = readJson(PRODUCTS_FILE, []);
    const item = list.find(p => Number(p.id) === id);
    if (!item) return res.status(404).json({ message: 'Product not found.' });
    return res.status(200).json(item);
  } catch (error) {
    return next(error);
  }
});

// POST /api/products (Protected: Admin only)
app.post('/api/products', verifyFirebaseToken, requireAdmin, async (req, res, next) => {
  try {
    const { name, category, price, oldPrice, stock, stock_quantity, rating, image, badge, description } = req.body || {};

    if (!name || !String(name).trim() || !category || price === undefined || Number.isNaN(Number(price)) || Number(price) < 0) {
      return res.status(400).json({ message: 'Valid product name, category, and non-negative price are required.' });
    }

    const cleanName = String(name).trim();
    const cleanCat = String(category).trim();
    const numPrice = Number(price);
    const numOldPrice = oldPrice ? Number(oldPrice) : Number((numPrice * 1.2).toFixed(2));
    const numStock = stock_quantity !== undefined ? Number(stock_quantity) : (stock !== undefined ? Number(stock) : 25);
    const numRating = rating !== undefined ? Number(rating) : 5.0;
    const cleanImage = image || 'bballshirt.jpg';
    const cleanBadge = badge || '';
    const cleanDesc = description || `${cleanName} - High-performance sportswear.`;

    if (isMysqlConnected()) {
      const pool = getPool();
      const [result] = await pool.query(
        `INSERT INTO products (product_name, category, price, old_price, stock_quantity, rating, image, badge, description)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [cleanName, cleanCat, numPrice, numOldPrice, numStock, numRating, cleanImage, cleanBadge, cleanDesc]
      );
      const [rows] = await pool.query('SELECT * FROM products WHERE product_id = ?', [result.insertId]);
      const created = mapProductRow(rows[0]);
      return res.status(201).json(created);
    }

    const list = readJson(PRODUCTS_FILE, []);
    const newId = list.length ? Math.max(...list.map(p => Number(p.id) || 0)) + 1 : 1;
    const created = {
      id: newId,
      product_id: newId,
      name: cleanName,
      category: cleanCat,
      price: numPrice,
      oldPrice: numOldPrice,
      stock: numStock,
      stock_quantity: numStock,
      rating: numRating,
      image: cleanImage,
      badge: cleanBadge,
      description: cleanDesc
    };
    list.push(created);
    writeJson(PRODUCTS_FILE, list);
    return res.status(201).json(created);
  } catch (error) {
    return next(error);
  }
});

// PUT & PATCH /api/products/:id (Protected: Admin only)
app.route('/api/products/:id')
  .put(verifyFirebaseToken, requireAdmin, updateProductHandler)
  .patch(verifyFirebaseToken, requireAdmin, updateProductHandler);

async function updateProductHandler(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid product ID.' });

    const { name, category, price, oldPrice, stock, stock_quantity, rating, image, badge, description } = req.body || {};

    if (price !== undefined && (Number.isNaN(Number(price)) || Number(price) < 0)) {
      return res.status(400).json({ message: 'Price must be a valid non-negative number.' });
    }

    if (isMysqlConnected()) {
      const pool = getPool();
      const [existingRows] = await pool.query('SELECT * FROM products WHERE product_id = ?', [id]);
      if (!existingRows.length) return res.status(404).json({ message: `Product ${id} not found.` });

      const cur = existingRows[0];
      const nextName = name !== undefined ? String(name).trim() : cur.product_name;
      const nextCat = category !== undefined ? String(category).trim() : cur.category;
      const nextPrice = price !== undefined ? Number(price) : Number(cur.price);
      const nextOld = oldPrice !== undefined ? Number(oldPrice) : (cur.old_price ? Number(cur.old_price) : null);
      const nextStock = stock_quantity !== undefined ? Number(stock_quantity) : (stock !== undefined ? Number(stock) : Number(cur.stock_quantity));
      const nextRating = rating !== undefined ? Number(rating) : Number(cur.rating);
      const nextImg = image !== undefined ? image : cur.image;
      const nextBadge = badge !== undefined ? badge : cur.badge;
      const nextDesc = description !== undefined ? description : cur.description;

      await pool.query(
        `UPDATE products
         SET product_name = ?, category = ?, price = ?, old_price = ?, stock_quantity = ?, rating = ?, image = ?, badge = ?, description = ?
         WHERE product_id = ?`,
        [nextName, nextCat, nextPrice, nextOld, nextStock, nextRating, nextImg, nextBadge, nextDesc, id]
      );

      const [updatedRows] = await pool.query('SELECT * FROM products WHERE product_id = ?', [id]);
      return res.status(200).json(mapProductRow(updatedRows[0]));
    }

    const list = readJson(PRODUCTS_FILE, []);
    const idx = list.findIndex(p => Number(p.id) === id);
    if (idx === -1) return res.status(404).json({ message: `Product ${id} not found.` });

    const updated = {
      ...list[idx],
      ...(name !== undefined && { name: String(name).trim() }),
      ...(category !== undefined && { category: String(category).trim() }),
      ...(price !== undefined && { price: Number(price) }),
      ...(oldPrice !== undefined && { oldPrice: Number(oldPrice) }),
      ...(stock !== undefined && { stock: Number(stock), stock_quantity: Number(stock) }),
      ...(stock_quantity !== undefined && { stock: Number(stock_quantity), stock_quantity: Number(stock_quantity) }),
      ...(rating !== undefined && { rating: Number(rating) }),
      ...(image !== undefined && { image }),
      ...(badge !== undefined && { badge }),
      ...(description !== undefined && { description })
    };
    list[idx] = updated;
    writeJson(PRODUCTS_FILE, list);
    return res.status(200).json(updated);
  } catch (error) {
    return next(error);
  }
}

// DELETE /api/products/:id (Protected: Admin only)
app.delete('/api/products/:id', verifyFirebaseToken, requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid product ID.' });

    if (isMysqlConnected()) {
      const [result] = await getPool().query('DELETE FROM products WHERE product_id = ?', [id]);
      if (result.affectedRows === 0) return res.status(404).json({ message: `Product ${id} not found.` });
      return res.status(200).json({ success: true, message: `Product ${id} deleted.`, id });
    }

    const list = readJson(PRODUCTS_FILE, []);
    const filtered = list.filter(p => Number(p.id) !== id);
    if (filtered.length === list.length) return res.status(404).json({ message: `Product ${id} not found.` });
    writeJson(PRODUCTS_FILE, filtered);
    return res.status(200).json({ success: true, message: `Product ${id} deleted.`, id });
  } catch (error) {
    return next(error);
  }
});

// ==========================================
// 4. ORDERS RELATIONAL API (MySQL JOINs & Transactions)
// ==========================================

function formatOrdersFromJoinedRows(rows) {
  const orderMap = new Map();
  for (const row of rows) {
    if (!orderMap.has(row.order_id)) {
      orderMap.set(row.order_id, {
        id: row.order_code,
        order_id: row.order_id,
        order_code: row.order_code,
        firebase_uid: row.firebase_uid,
        date: new Date(row.created_at).toLocaleString('en-PH'),
        created_at: row.created_at,
        status: row.status,
        payment: row.payment_method,
        total: Number(row.total_amount),
        customer: {
          name: row.customer_name,
          email: row.customer_email,
          phone: row.customer_phone
        },
        shippingAddress: {
          street: row.shipping_street,
          barangay: row.shipping_barangay,
          city: row.shipping_city,
          province: row.shipping_province,
          postalCode: row.shipping_postal_code,
          notes: row.delivery_notes
        },
        items: []
      });
    }
    if (row.item_id) {
      orderMap.get(row.order_id).items.push({
        item_id: row.item_id,
        id: row.product_id,
        name: row.item_product_name,
        image: row.item_image,
        price: Number(row.unit_price),
        qty: Number(row.quantity),
        subtotal: Number(row.subtotal)
      });
    }
  }
  return Array.from(orderMap.values());
}

// POST /api/orders (Protected: Authenticated User -> MySQL Transaction with Stock Deduction)
app.post('/api/orders', verifyFirebaseToken, async (req, res, next) => {
  try {
    const { customer, shippingAddress, paymentMethod, items } = req.body || {};

    if (!customer?.name || !customer?.phone || !shippingAddress?.street || !shippingAddress?.city || !shippingAddress?.province) {
      return res.status(400).json({ message: 'Complete customer contact and shipping address are required.' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'At least one order item is required.' });
    }

    const orderCode = `JC-${Date.now().toString().slice(-8)}`;
    const uid = req.user.uid;
    const payMethod = paymentMethod || 'Cash on Delivery';

    if (isMysqlConnected()) {
      const conn = await getPool().getConnection();
      try {
        await conn.beginTransaction();

        let computedTotal = 0;
        const verifiedItems = [];

        for (const item of items) {
          const qty = Math.max(1, Number(item.qty) || 1);
          const pid = Number(item.id);
          const [pRows] = await conn.query('SELECT * FROM products WHERE product_id = ? FOR UPDATE', [pid]);

          let unitPrice = Number(item.price) || 0;
          let prodName = item.name || 'Sportswear Item';
          let prodImage = item.image || 'bballshirt.jpg';

          if (pRows.length > 0) {
            const dbProd = pRows[0];
            if (dbProd.stock_quantity < qty) {
              await conn.rollback();
              return res.status(400).json({ message: `Insufficient stock for ${dbProd.product_name} (${dbProd.stock_quantity} left).` });
            }
            unitPrice = Number(dbProd.price);
            prodName = dbProd.product_name;
            prodImage = dbProd.image;

            await conn.query('UPDATE products SET stock_quantity = stock_quantity - ? WHERE product_id = ?', [qty, pid]);
          }

          const subtotal = unitPrice * qty;
          computedTotal += subtotal;
          verifiedItems.push({ product_id: pRows.length ? pid : null, prodName, prodImage, unitPrice, qty, subtotal });
        }

        const [orderResult] = await conn.query(
          `INSERT INTO orders (
            order_code, firebase_uid, customer_name, customer_email, customer_phone,
            shipping_street, shipping_barangay, shipping_city, shipping_province, shipping_postal_code,
            delivery_notes, payment_method, status, total_amount
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Processing', ?)`,
          [
            orderCode, uid, customer.name.trim(), customer.email || req.user.email, customer.phone.trim(),
            shippingAddress.street.trim(), shippingAddress.barangay || '', shippingAddress.city.trim(),
            shippingAddress.province.trim(), shippingAddress.postalCode || '', shippingAddress.notes || '',
            payMethod, computedTotal
          ]
        );

        const orderId = orderResult.insertId;
        for (const vi of verifiedItems) {
          await conn.query(
            `INSERT INTO order_items (order_id, product_id, product_name, image, unit_price, quantity, subtotal)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [orderId, vi.product_id, vi.prodName, vi.prodImage, vi.unitPrice, vi.qty, vi.subtotal]
          );
        }

        await conn.commit();

        const [joinedRows] = await conn.query(
          `SELECT o.*, oi.item_id, oi.product_id, oi.product_name AS item_product_name,
                  oi.image AS item_image, oi.unit_price, oi.quantity, oi.subtotal
           FROM orders o
           LEFT JOIN order_items oi ON o.order_id = oi.order_id
           WHERE o.order_id = ?`,
          [orderId]
        );

        const [createdOrder] = formatOrdersFromJoinedRows(joinedRows);
        return res.status(201).json({ success: true, order: createdOrder });
      } catch (txErr) {
        await conn.rollback();
        throw txErr;
      } finally {
        conn.release();
      }
    }

    // Fallback JSON order persistence
    const computedTotal = items.reduce((acc, i) => acc + Number(i.price) * (Number(i.qty) || 1), 0);
    const newOrder = {
      id: orderCode,
      order_code: orderCode,
      firebase_uid: uid,
      date: new Date().toLocaleString('en-PH'),
      status: 'Processing',
      payment: payMethod,
      customer,
      shippingAddress,
      items,
      total: computedTotal
    };
    const ordersList = readJson(ORDERS_FILE, []);
    ordersList.unshift(newOrder);
    writeJson(ORDERS_FILE, ordersList);
    return res.status(201).json({ success: true, order: newOrder });
  } catch (error) {
    return next(error);
  }
});

// GET /api/orders/my (Protected: Current user's orders via JOIN)
app.get('/api/orders/my', verifyFirebaseToken, async (req, res, next) => {
  try {
    if (isMysqlConnected()) {
      const [rows] = await getPool().query(
        `SELECT o.*, oi.item_id, oi.product_id, oi.product_name AS item_product_name,
                oi.image AS item_image, oi.unit_price, oi.quantity, oi.subtotal
         FROM orders o
         LEFT JOIN order_items oi ON o.order_id = oi.order_id
         WHERE o.firebase_uid = ?
         ORDER BY o.created_at DESC`,
        [req.user.uid]
      );
      return res.status(200).json(formatOrdersFromJoinedRows(rows));
    }

    const ordersList = readJson(ORDERS_FILE, []).filter(o => o.firebase_uid === req.user.uid);
    return res.status(200).json(ordersList);
  } catch (error) {
    return next(error);
  }
});

// GET /api/admin/orders (Protected: Admin only -> All orders via JOIN + dashboard metrics)
app.get('/api/admin/orders', verifyFirebaseToken, requireAdmin, async (req, res, next) => {
  try {
    if (isMysqlConnected()) {
      const [rows] = await getPool().query(
        `SELECT o.*, oi.item_id, oi.product_id, oi.product_name AS item_product_name,
                oi.image AS item_image, oi.unit_price, oi.quantity, oi.subtotal
         FROM orders o
         LEFT JOIN order_items oi ON o.order_id = oi.order_id
         ORDER BY o.created_at DESC`
      );
      return res.status(200).json(formatOrdersFromJoinedRows(rows));
    }

    return res.status(200).json(readJson(ORDERS_FILE, []));
  } catch (error) {
    return next(error);
  }
});

// PATCH /api/admin/orders/:id/status (Protected: Admin only)
app.patch('/api/admin/orders/:id/status', verifyFirebaseToken, requireAdmin, async (req, res, next) => {
  try {
    const orderParam = req.params.id;
    const { status } = req.body || {};
    const validStatuses = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    if (isMysqlConnected()) {
      const [result] = await getPool().query(
        'UPDATE orders SET status = ? WHERE order_id = ? OR order_code = ?',
        [status, Number(orderParam) || 0, orderParam]
      );
      if (result.affectedRows === 0) return res.status(404).json({ message: 'Order not found.' });
      return res.status(200).json({ success: true, id: orderParam, status });
    }

    const list = readJson(ORDERS_FILE, []);
    const idx = list.findIndex(o => String(o.id) === String(orderParam) || String(o.order_id) === String(orderParam));
    if (idx === -1) return res.status(404).json({ message: 'Order not found.' });
    list[idx].status = status;
    writeJson(ORDERS_FILE, list);
    return res.status(200).json({ success: true, id: orderParam, status });
  } catch (error) {
    return next(error);
  }
});

// DELETE /api/admin/orders/:id (Protected: Admin only)
app.delete('/api/admin/orders/:id', verifyFirebaseToken, requireAdmin, async (req, res, next) => {
  try {
    const orderParam = req.params.id;

    if (isMysqlConnected()) {
      const [result] = await getPool().query(
        'DELETE FROM orders WHERE order_id = ? OR order_code = ?',
        [Number(orderParam) || 0, orderParam]
      );
      if (result.affectedRows === 0) return res.status(404).json({ message: 'Order not found.' });
      return res.status(200).json({ success: true, id: orderParam });
    }

    const list = readJson(ORDERS_FILE, []);
    const filtered = list.filter(o => String(o.id) !== String(orderParam));
    if (filtered.length === list.length) return res.status(404).json({ message: 'Order not found.' });
    writeJson(ORDERS_FILE, filtered);
    return res.status(200).json({ success: true, id: orderParam });
  } catch (error) {
    return next(error);
  }
});

// ==========================================
// 5. CENTRALIZED 404 & ERROR HANDLING MIDDLEWARE
// ==========================================
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: `API endpoint not found: ${req.method} ${req.originalUrl}` });
});

app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`JC SPORTSWEAR EXPRESS SERVER RUNNING ON PORT ${PORT}`);
  console.log(`Health Check: http://localhost:${PORT}/api/health`);
  console.log(`MySQL Status: ${isMysqlConnected() ? 'CONNECTED' : 'FALLBACK MODE'}`);
  console.log(`===============================================`);
});
