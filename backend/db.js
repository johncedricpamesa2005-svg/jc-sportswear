import mysql from 'mysql2/promise';

export const DEFAULT_PRODUCTS = [
  { name: 'Basketball Jersey', category: 'Basketball', price: 1299.00, oldPrice: 1599.00, stock: 25, rating: 4.9, image: 'bballshirt.jpg', badge: 'BEST SELLER', description: 'Lightweight basketball jersey designed for comfort and movement.' },
  { name: 'Basketball Shorts', category: 'Basketball', price: 899.00, oldPrice: 1099.00, stock: 30, rating: 4.8, image: 'bballshorts.webp', badge: 'SALE', description: 'Breathable basketball shorts perfect for training and competition.' },
  { name: 'Football Performance Jersey', category: 'Football', price: 1499.00, oldPrice: 1799.00, stock: 20, rating: 4.9, image: 'fballjer.webp', badge: 'POPULAR', description: 'Performance football jersey made for intense matches.' },
  { name: 'Football Training Shorts', category: 'Football', price: 799.00, oldPrice: 999.00, stock: 18, rating: 4.7, image: 'fballshrt.webp', badge: 'SALE', description: 'Comfortable training shorts with flexible fabric.' },
  { name: 'Volleyball Jersey Set', category: 'Volleyball', price: 1199.00, oldPrice: 1399.00, stock: 15, rating: 4.8, image: 'volleyballset.jpg', badge: 'NEW', description: 'Modern volleyball jersey for teams and recreational players.' },
  { name: 'Volleyball Performance Ball', category: 'Volleyball', price: 749.00, oldPrice: 899.00, stock: 12, rating: 4.6, image: 'vballper.jpg', badge: '', description: 'Flexible and breathable volleyball ball.' },
  { name: 'Running Performance Shirt', category: 'Running', price: 999.00, oldPrice: 1199.00, stock: 22, rating: 4.9, image: 'running.webp', badge: 'BEST SELLER', description: 'Lightweight running shirt with breathable performance fabric.' },
  { name: 'Runner Training Shorts', category: 'Running', price: 699.00, oldPrice: 849.00, stock: 28, rating: 4.7, image: 'runningshorts.webp', badge: 'SALE', description: 'Comfortable running shorts built for daily training.' },
  { name: 'Gym Compression Shirt', category: 'Gym', price: 1099.00, oldPrice: 1299.00, stock: 19, rating: 4.8, image: 'gymshirt.webp', badge: 'POPULAR', description: 'Compression training shirt designed for workouts.' },
  { name: 'Wrist Supporter', category: 'Gym', price: 1299.00, oldPrice: 1499.00, stock: 35, rating: 4.8, image: 'wristsupp.jpg', badge: '', description: 'Versatile wrist support for training and everyday use.' },
  { name: 'Tennis Performance Polo', category: 'Tennis', price: 1399.00, oldPrice: 1599.00, stock: 14, rating: 4.9, image: 'tennispolo.jpg', badge: 'NEW', description: 'Classic tennis polo with lightweight performance fabric.' },
  { name: 'Tennis Performance Racket', category: 'Tennis', price: 899.00, oldPrice: 1099.00, stock: 10, rating: 4.7, image: 'racket.webp', badge: 'SALE', description: 'Reliable racket for training and competition.' }
];

let pool = null;
let mysqlConnected = false;

export const isMysqlConnected = () => mysqlConnected;
export const getPool = () => pool;

export async function initDatabase() {
  try {
    const dbName = process.env.DB_NAME || 'jc_sportswear_db';

    if (process.env.MYSQL_URI) {
      pool = mysql.createPool({
        uri: process.env.MYSQL_URI,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
      });
    } else {
      const host = process.env.DB_HOST || '127.0.0.1';
      const port = Number(process.env.DB_PORT || 3306);
      const user = process.env.DB_USER || 'root';
      const password = process.env.DB_PASSWORD || '';
      const ssl = process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined;

      // Ensure database exists when using local XAMPP / standard MySQL credentials
      const tempConn = await mysql.createConnection({ host, port, user, password, ssl });
      await tempConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
      await tempConn.end();

      pool = mysql.createPool({
        host,
        port,
        user,
        password,
        database: dbName,
        ssl,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });
    }

    // Verify connection
    const conn = await pool.getConnection();
    try {
      await conn.query(`
        CREATE TABLE IF NOT EXISTS products (
          product_id INT AUTO_INCREMENT PRIMARY KEY,
          product_name VARCHAR(100) NOT NULL,
          category VARCHAR(50) NOT NULL,
          price DECIMAL(10, 2) NOT NULL,
          old_price DECIMAL(10, 2) DEFAULT NULL,
          stock_quantity INT NOT NULL DEFAULT 25,
          rating DECIMAL(3, 1) NOT NULL DEFAULT 5.0,
          image VARCHAR(255) NOT NULL DEFAULT 'bballshirt.jpg',
          badge VARCHAR(40) DEFAULT '',
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
      `);

      await conn.query(`
        CREATE TABLE IF NOT EXISTS orders (
          order_id INT AUTO_INCREMENT PRIMARY KEY,
          order_code VARCHAR(32) NOT NULL UNIQUE,
          firebase_uid VARCHAR(128) NOT NULL,
          customer_name VARCHAR(120) NOT NULL,
          customer_email VARCHAR(150) NOT NULL,
          customer_phone VARCHAR(40) NOT NULL,
          shipping_street VARCHAR(200) NOT NULL,
          shipping_barangay VARCHAR(120) DEFAULT '',
          shipping_city VARCHAR(100) NOT NULL,
          shipping_province VARCHAR(100) NOT NULL,
          shipping_postal_code VARCHAR(20) DEFAULT '',
          delivery_notes TEXT,
          payment_method VARCHAR(50) NOT NULL DEFAULT 'Cash on Delivery',
          status ENUM('Processing', 'Shipped', 'Delivered', 'Cancelled') NOT NULL DEFAULT 'Processing',
          total_amount DECIMAL(10, 2) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_orders_uid (firebase_uid)
        );
      `);

      await conn.query(`
        CREATE TABLE IF NOT EXISTS order_items (
          item_id INT AUTO_INCREMENT PRIMARY KEY,
          order_id INT NOT NULL,
          product_id INT NULL,
          product_name VARCHAR(100) NOT NULL,
          image VARCHAR(255) DEFAULT 'bballshirt.jpg',
          unit_price DECIMAL(10, 2) NOT NULL,
          quantity INT NOT NULL DEFAULT 1,
          subtotal DECIMAL(10, 2) NOT NULL,
          CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
          CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE SET NULL
        );
      `);

      // Seed default products if table is empty
      const [rows] = await conn.query('SELECT COUNT(*) AS count FROM products');
      if (rows[0].count === 0) {
        const values = DEFAULT_PRODUCTS.map(p => [
          p.name, p.category, p.price, p.oldPrice, p.stock, p.rating, p.image, p.badge, p.description
        ]);
        await conn.query(
          `INSERT INTO products (product_name, category, price, old_price, stock_quantity, rating, image, badge, description) VALUES ?`,
          [values]
        );
        console.log('[MYSQL] Seeded 12 default sportswear products.');
      }

      mysqlConnected = true;
      console.log(`[MYSQL] Connected and relational schema verified (${dbName}).`);
    } finally {
      conn.release();
    }
  } catch (err) {
    mysqlConnected = false;
    console.warn('[MYSQL WARNING] Could not connect to MySQL:', err.message);
    console.warn('[MYSQL WARNING] Ensure XAMPP MySQL is running or MYSQL_URI is configured. Falling back to local JSON mirror until MySQL is available.');
  }
}

export function mapProductRow(row) {
  return {
    id: row.product_id,
    product_id: row.product_id,
    name: row.product_name,
    category: row.category,
    price: Number(row.price),
    oldPrice: row.old_price ? Number(row.old_price) : null,
    stock: Number(row.stock_quantity),
    stock_quantity: Number(row.stock_quantity),
    rating: Number(row.rating),
    image: row.image,
    badge: row.badge || '',
    description: row.description || ''
  };
}
