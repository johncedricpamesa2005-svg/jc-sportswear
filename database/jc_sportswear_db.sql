-- ==============================================================================
-- JC SPORTSWEAR PWA - NORMALIZED MYSQL RELATIONAL SCHEMA & SEED DATA
-- Compatible with Local XAMPP (phpMyAdmin) & Cloud MySQL (Aiven, Railway, TiDB)
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS jc_sportswear_db;
USE jc_sportswear_db;

-- -----------------------------------------------------------------------------
-- 1. PRODUCTS TABLE
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- 2. ORDERS TABLE
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- 3. ORDER ITEMS TABLE (Normalized with Foreign Keys to orders & products)
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- SEED DATA: 12 SPORTSWEAR PRODUCTS
-- -----------------------------------------------------------------------------
INSERT INTO products (product_name, category, price, old_price, stock_quantity, rating, image, badge, description)
VALUES
    ('Basketball Jersey', 'Basketball', 1299.00, 1599.00, 25, 4.9, 'bballshirt.jpg', 'BEST SELLER', 'Lightweight basketball jersey designed for comfort and movement.'),
    ('Basketball Shorts', 'Basketball', 899.00, 1099.00, 30, 4.8, 'bballshorts.webp', 'SALE', 'Breathable basketball shorts perfect for training and competition.'),
    ('Football Performance Jersey', 'Football', 1499.00, 1799.00, 20, 4.9, 'fballjer.webp', 'POPULAR', 'Performance football jersey made for intense matches.'),
    ('Football Training Shorts', 'Football', 799.00, 999.00, 18, 4.7, 'fballshrt.webp', 'SALE', 'Comfortable training shorts with flexible fabric.'),
    ('Volleyball Jersey Set', 'Volleyball', 1199.00, 1399.00, 15, 4.8, 'volleyballset.jpg', 'NEW', 'Modern volleyball jersey for teams and recreational players.'),
    ('Volleyball Performance Ball', 'Volleyball', 749.00, 899.00, 12, 4.6, 'vballper.jpg', '', 'Flexible and breathable volleyball ball.'),
    ('Running Performance Shirt', 'Running', 999.00, 1199.00, 22, 4.9, 'running.webp', 'BEST SELLER', 'Lightweight running shirt with breathable performance fabric.'),
    ('Runner Training Shorts', 'Running', 699.00, 849.00, 28, 4.7, 'runningshorts.webp', 'SALE', 'Comfortable running shorts built for daily training.'),
    ('Gym Compression Shirt', 'Gym', 1099.00, 1299.00, 19, 4.8, 'gymshirt.webp', 'POPULAR', 'Compression training shirt designed for workouts.'),
    ('Wrist Supporter', 'Gym', 1299.00, 1499.00, 35, 4.8, 'wristsupp.jpg', '', 'Versatile wrist support for training and everyday use.'),
    ('Tennis Performance Polo', 'Tennis', 1399.00, 1599.00, 14, 4.9, 'tennispolo.jpg', 'NEW', 'Classic tennis polo with lightweight performance fabric.'),
    ('Tennis Performance Racket', 'Tennis', 899.00, 1099.00, 10, 4.7, 'racket.webp', 'SALE', 'Reliable racket for training and competition.');
