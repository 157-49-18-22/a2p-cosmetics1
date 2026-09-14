require('dotenv').config({path: './backend/.env'});
const mysql = require('mysql2/promise');

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
  });

  await connection.query("CREATE TABLE IF NOT EXISTS dealer_orders (id INT AUTO_INCREMENT PRIMARY KEY, dealer_id INT, distributor_id INT, order_number VARCHAR(50), total_amount DECIMAL(15,2), status ENUM('Pending', 'Approved', 'Shipped', 'Delivered', 'Cancelled') DEFAULT 'Pending', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");

  await connection.query("CREATE TABLE IF NOT EXISTS dealer_order_items (id INT AUTO_INCREMENT PRIMARY KEY, order_id INT, product_id INT, product_name VARCHAR(255), quantity INT, price DECIMAL(10,2))");
  
  console.log('Tables created');
  process.exit(0);
}
run();
