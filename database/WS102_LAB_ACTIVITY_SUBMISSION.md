# LABORATORY ACTIVITY
## Database Implementation Based on Your Proposed System
### Course / Subject: WS102 - Web Systems and Technologies

**Student Name:** John Cedric Pamesa  
**Section / Year:** BSIT 3A  
**Date:** 10/24/2026  

---

### Task 1 — Identify Your System’s Data Requirements

| Requirement | Your Answer |
| :--- | :--- |
| **System Name** | JC Sportswear E-Commerce Athletic Apparel & Equipment Management System (PWA) |
| **Purpose of the System** | To provide a progressive web application (PWA) e-commerce platform where athletes and sports enthusiasts can browse, filter, and order high-performance sportswear, jerseys, and athletic accessories, and store administrators can manage catalog inventory, stock levels, and product pricing. |
| **Main Information to be Stored** | Product catalog information (product ID, product name, sport category, unit price, available stock quantity, and product description). |
| **Proposed Database Name** | `jc_sportswear_db` |
| **Main Table Name** | `products` |
| **At Least Five Columns Needed** | `product_id`, `product_name`, `category`, `price`, `stock_quantity`, `description` |

---

### Task 2 — Create Your Database in phpMyAdmin

#### SQL Statement:
```sql
CREATE DATABASE IF NOT EXISTS jc_sportswear_db;
```

> **[INSERT SCREENSHOT HERE]**  
> *Screenshot 1: phpMyAdmin SQL tab executing `CREATE DATABASE IF NOT EXISTS jc_sportswear_db;` with green success alert "MySQL returned an empty result set".*  
>  
> **[INSERT SCREENSHOT HERE]**  
> *Screenshot 2: Left sidebar in phpMyAdmin showing the newly created database `jc_sportswear_db`.*

---

### Task 3 — Design and Create Your Main Table

#### Table Schema:
* **Table Name:** `products`
* **Primary Key:** `product_id` (INT, AUTO_INCREMENT)
* **Columns & Data Types:**
  * `product_id` : INT, Primary Key, Auto Increment
  * `product_name` : VARCHAR(100), NOT NULL
  * `category` : VARCHAR(50), NOT NULL
  * `price` : DECIMAL(10,2), NOT NULL
  * `stock_quantity` : INT, NOT NULL, DEFAULT 0
  * `description` : TEXT, NULL

#### SQL Statement:
```sql
USE jc_sportswear_db;

CREATE TABLE products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    description TEXT
);
```

> **[INSERT SCREENSHOT HERE]**  
> *Screenshot 3: phpMyAdmin SQL tab showing the `CREATE TABLE products (...)` query before/after execution.*  
>  
> **[INSERT SCREENSHOT HERE]**  
> *Screenshot 4: Table "Structure" tab in phpMyAdmin displaying all 6 columns, types, null settings, defaults, and primary key on `product_id`.*

---

### Task 4 — INSERT: Add Sample Records

#### SQL Statement:
```sql
INSERT INTO products (product_name, category, price, stock_quantity, description)
VALUES
    ('Basketball Jersey', 'Basketball', 1299.00, 25, 'Lightweight basketball jersey designed for comfort and movement.'),
    ('Basketball Shorts', 'Basketball', 899.00, 30, 'Breathable basketball shorts perfect for training and competition.'),
    ('Football Performance Jersey', 'Football', 1499.00, 20, 'Performance football jersey made for intense tournament matches.'),
    ('Football Training Shorts', 'Football', 799.00, 18, 'Comfortable training shorts with flexible athletic fabric.'),
    ('Volleyball Jersey Set', 'Volleyball', 1199.00, 15, 'Modern volleyball jersey set for teams and recreational players.'),
    ('Volleyball Performance Ball', 'Volleyball', 749.00, 12, 'Flexible and tournament-grade synthetic leather volleyball.'),
    ('Running Performance Shirt', 'Running', 999.00, 22, 'Lightweight running shirt with breathable performance fabric.'),
    ('Tennis Performance Racket', 'Tennis', 899.00, 10, 'Reliable graphite tennis racket for training and competition.');
```

> **[INSERT SCREENSHOT HERE]**  
> *Screenshot 5: phpMyAdmin SQL tab showing the `INSERT INTO products ...` statement and the green confirmation alert (e.g., "8 rows inserted").*  
>  
> **[INSERT SCREENSHOT HERE]**  
> *Screenshot 6: Table "Browse" tab in phpMyAdmin showing all 8 sample sportswear products with product_id 1 to 8.*

---

### Task 5 — SELECT: Retrieve and Display Records

#### Query 1: Display All Records
```sql
SELECT * FROM products;
```

> **[INSERT SCREENSHOT HERE]**  
> *Screenshot 7: Query window running `SELECT * FROM products;` and the resulting table showing rows 0 - 7 (8 total).*

---

#### Query 2: Display Selected Columns
```sql
SELECT product_id, product_name, category, price, stock_quantity 
FROM products;
```

> **[INSERT SCREENSHOT HERE]**  
> *Screenshot 8: Query window running the projection query and the resulting grid with only the 5 selected columns displayed.*

---

#### Query 3: Search for Records by Condition (WHERE category = 'Basketball')
```sql
SELECT * 
FROM products 
WHERE category = 'Basketball';
```

> **[INSERT SCREENSHOT HERE]**  
> *Screenshot 9: Query window running `SELECT * FROM products WHERE category = 'Basketball';` returning the Basketball Jersey and Basketball Shorts.*

---

### Task 6 — UPDATE: Modify Existing Records

#### Update Operation 1: Price Adjustment
```sql
UPDATE products 
SET price = 1199.00 
WHERE product_id = 1;
```

> **[INSERT SCREENSHOT HERE]**  
> *Screenshot 10: phpMyAdmin SQL tab executing the UPDATE query and green alert "1 row affected".*  
>  
> **[INSERT SCREENSHOT HERE]**  
> *Screenshot 11: Verification showing `product_id = 1` (Basketball Jersey) with updated price `1199.00`.*

---

#### Update Operation 2: Stock Replenishment
```sql
UPDATE products 
SET stock_quantity = 40 
WHERE product_id = 2;
```

> **[INSERT SCREENSHOT HERE]**  
> *Screenshot 12: phpMyAdmin SQL tab executing the stock UPDATE query and green alert "1 row affected".*  
>  
> **[INSERT SCREENSHOT HERE]**  
> *Screenshot 13: Verification showing `product_id = 2` (Basketball Shorts) with updated stock quantity `40`.*

---

### Task 7 — DELETE: Remove a Selected Record

#### Step 1: Identify the Record to Remove (Tennis Performance Racket)
```sql
SELECT * FROM products WHERE product_id = 8;
```

> **[INSERT SCREENSHOT HERE]**  
> *Screenshot 14: SELECT query identifying product_id = 8 before deletion.*

---

#### Step 2: Remove the Discontinued Product
```sql
DELETE FROM products 
WHERE product_id = 8;
```

> **[INSERT SCREENSHOT HERE]**  
> *Screenshot 15: phpMyAdmin SQL tab executing `DELETE FROM products WHERE product_id = 8;` with confirmation and "1 row affected".*

---

#### Step 3: Verification of Remaining Products
```sql
SELECT * FROM products;
```

> **[INSERT SCREENSHOT HERE]**  
> *Screenshot 16: Table "Browse" tab showing rows 0 - 6 (7 total), proving that product_id = 8 was permanently removed and remaining products 1 to 7 are intact.*
