const mysql = require('mysql2');
require('dotenv').config();

console.log('Attempting to connect to database with user:', process.env.DB_USER);
console.log('Password provided:', process.env.DB_PASSWORD ? 'YES' : 'NO');

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const setupDatabase = async () => {
  try {
    const promiseConn = connection.promise();

    await promiseConn.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
    console.log(`✅ Database "${process.env.DB_NAME}" checked/created.`);

    await promiseConn.query(`USE \`${process.env.DB_NAME}\``);

    // Cart table
    await promiseConn.query(`
      CREATE TABLE IF NOT EXISTS cart (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        image_url TEXT,
        quantity INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Wishlist table
    await promiseConn.query(`
      CREATE TABLE IF NOT EXISTS wishlist (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Cart & Wishlist tables checked/created.');

    // Categories table
    await promiseConn.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        image_url TEXT,
        status ENUM('Active','Inactive') DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Categories table checked/created.');
    
    // Seed default categories if empty
    const [catCount] = await promiseConn.query('SELECT COUNT(*) as cnt FROM categories');
    if (catCount[0].cnt === 0) {
      await promiseConn.query(`
        INSERT INTO categories (name, slug) VALUES 
        ('Face Wash', 'face-wash'),
        ('Face Serum', 'face-serum'),
        ('Face Cream', 'face-cream'),
        ('Body Wash', 'body-wash'),
        ('Lips', 'lips')
      `);
      console.log('✅ Default categories seeded.');
    }

    // Products table
    await promiseConn.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(255),
        price DECIMAL(10, 2) NOT NULL,
        stock INT DEFAULT 0,
        image_url TEXT,
        hover_image_url TEXT,
        description TEXT,
        status ENUM('Active','Inactive','Out of Stock') DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Products table checked/created.');

    // Banners / CMS table
    await promiseConn.query(`
      CREATE TABLE IF NOT EXISTS banners (
        id INT AUTO_INCREMENT PRIMARY KEY,
        section_key VARCHAR(100) NOT NULL UNIQUE,
        title TEXT,
        subtitle TEXT,
        cta_label VARCHAR(255),
        cta_color VARCHAR(50) DEFAULT '#3b82f6',
        image_url TEXT,
        is_active TINYINT(1) DEFAULT 1,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Seed default banners if empty
    const [bannerRows] = await promiseConn.query('SELECT COUNT(*) as cnt FROM banners');
    if (bannerRows[0].cnt === 0) {
      await promiseConn.query(`
        INSERT INTO banners (section_key, title, subtitle, cta_label, cta_color, image_url) VALUES
        ('hero', 'Elegance in Every Skin Cell', 'Discover the premium secret to glowing skin with our new botanical range.', 'Shop Collection', '#3b82f6', ''),
        ('offer_bar', 'Free Shipping on Orders Above ₹499 | Use Code: A2PFREE', '', '', '', ''),
        ('ad_section_1', 'Face Cream', 'Upto 40% OFF', 'Shop Now', '#f43f5e', ''),
        ('ad_section_2', 'Body Wash', 'Limited Edition', 'Explore', '#3b82f6', '')
      `);
      console.log('✅ Default banners seeded.');
    }
    console.log('✅ Banners table checked/created.');

    // Inventory logs table
    await promiseConn.query(`
      CREATE TABLE IF NOT EXISTS inventory_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT,
        product_name VARCHAR(255),
        change_type VARCHAR(100),
        quantity_change INT,
        agent VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Inventory logs table checked/created.');

    // ═══════════════════════════════════════════
    //  DISTRIBUTOR PORTAL TABLES
    // ═══════════════════════════════════════════

    // Distributors
    await promiseConn.query(`
      CREATE TABLE IF NOT EXISTS distributors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(20),
        role VARCHAR(100) DEFAULT 'Senior Distributor',
        tier ENUM('Platinum', 'Gold', 'Silver', 'Bronze') DEFAULT 'Bronze',
        region VARCHAR(100),
        credit_limit DECIMAL(15,2) DEFAULT 0,
        balance DECIMAL(15,2) DEFAULT 0,
        status ENUM('Active','Inactive') DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Dealers / Sub-Dealers
    await promiseConn.query(`
      CREATE TABLE IF NOT EXISTS dealers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        distributor_id INT,
        name VARCHAR(255) NOT NULL,
        contact_person VARCHAR(255),
        phone VARCHAR(20),
        email VARCHAR(255),
        zone VARCHAR(100),
        type ENUM('Dealer','Sub-Dealer') DEFAULT 'Dealer',
        status ENUM('Active','Inactive') DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Orders
    await promiseConn.query(`
      CREATE TABLE IF NOT EXISTS distributor_orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        distributor_id INT,
        order_number VARCHAR(50) UNIQUE,
        amount DECIMAL(15, 2),
        status ENUM('Pending','Shipped','Delivered','Cancelled') DEFAULT 'Pending',
        items_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Bills / Invoices
    await promiseConn.query(`
      CREATE TABLE IF NOT EXISTS distributor_bills (
        id INT AUTO_INCREMENT PRIMARY KEY,
        distributor_id INT,
        bill_number VARCHAR(50) UNIQUE,
        amount DECIMAL(15, 2),
        status ENUM('Paid','Unpaid','Overdue') DEFAULT 'Unpaid',
        due_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Zones / Area Allocation
    await promiseConn.query(`
      CREATE TABLE IF NOT EXISTS distributor_zones (
        id INT AUTO_INCREMENT PRIMARY KEY,
        distributor_id INT,
        zone_name VARCHAR(100),
        status ENUM('Allocated','Vacant') DEFAULT 'Allocated',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Super Stockists
    await promiseConn.query(`
      CREATE TABLE IF NOT EXISTS super_stockists (
        id INT AUTO_INCREMENT PRIMARY KEY,
        distributor_id INT,
        name VARCHAR(255) NOT NULL,
        zone VARCHAR(100),
        status ENUM('Active','Inactive') DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Activity Logs
    await promiseConn.query(`
      CREATE TABLE IF NOT EXISTS distributor_activity (
        id INT AUTO_INCREMENT PRIMARY KEY,
        distributor_id INT,
        activity_text TEXT,
        activity_type VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed default distributor if none exists
    const [distRows] = await promiseConn.query('SELECT COUNT(*) as cnt FROM distributors');
    if (distRows[0].cnt === 0) {
      await promiseConn.query(`
        INSERT INTO distributors (name, email, phone, role) VALUES 
        ('Rahul Sharma', 'rahul@a2p.com', '9876543210', 'Senior Distributor')
      `);
      
      // Seed some initial data for Rahul (assuming ID 1)
      await promiseConn.query(`
        INSERT INTO dealers (distributor_id, name, zone, status) VALUES 
        (1, 'Sharma Traders', 'Zone A', 'Active'),
        (1, 'Krishna Stores', 'Zone D', 'Active')
      `);

      await promiseConn.query(`
        INSERT INTO distributor_activity (distributor_id, activity_text, activity_type) VALUES 
        (1, 'Dealer "Sharma Traders" onboarded in Zone A', 'Success'),
        (1, 'Invoice #1042 generated for Ravi Distribution', 'Invoice')
      `);
    }

    // Branding Campaigns
    await promiseConn.query(`
      CREATE TABLE IF NOT EXISTS branding_campaigns (
        id INT AUTO_INCREMENT PRIMARY KEY,
        distributor_id INT,
        title VARCHAR(255) NOT NULL,
        type VARCHAR(100) DEFAULT 'Digital',
        zone VARCHAR(100) DEFAULT 'All Zones',
        budget DECIMAL(15,2) DEFAULT 0,
        start_date DATE,
        end_date DATE,
        description TEXT,
        status ENUM('Upcoming','Active','Completed','Cancelled') DEFAULT 'Upcoming',
        assets_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Branding Assets
    await promiseConn.query(`
      CREATE TABLE IF NOT EXISTS branding_assets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        distributor_id INT,
        campaign_id INT,
        campaign_title VARCHAR(255),
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) DEFAULT 'Digital',
        file_format VARCHAR(20),
        file_size VARCHAR(50),
        zone VARCHAR(100) DEFAULT 'All',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed branding data if empty
    const [campRows] = await promiseConn.query('SELECT COUNT(*) as cnt FROM branding_campaigns');
    if (campRows[0].cnt === 0) {
      await promiseConn.query(`
        INSERT INTO branding_campaigns (distributor_id, title, type, zone, budget, start_date, end_date, status, assets_count) VALUES
        (1, 'Summer Glow Campaign', 'Digital', 'All Zones', 50000, '2026-05-01', '2026-05-30', 'Upcoming', 8),
        (1, 'Face Serum Launch', 'Print + Digital', 'Zone A, B', 35000, '2026-04-10', '2026-04-25', 'Active', 12),
        (1, 'Dealer Display Kits', 'In-Store', 'Zone C', 20000, '2026-04-01', '2026-04-15', 'Completed', 5)
      `);
      await promiseConn.query(`
        INSERT INTO branding_assets (distributor_id, campaign_id, campaign_title, name, type, file_format, file_size, zone) VALUES
        (1, 1, 'Summer Glow', 'Summer Banner - 6ft x 3ft', 'Print', 'PDF', '4.2 MB', 'All'),
        (1, 2, 'Face Serum Launch', 'Face Serum Social Post', 'Digital', 'PNG', '1.8 MB', 'Zone A, B'),
        (1, 2, 'Face Serum Launch', 'Product Demo Video 60s', 'Video', 'MP4', '48 MB', 'All')
      `);
    }

    // ═══════════════════════════════════════════
    //  AGENT PORTAL TABLES
    // ═══════════════════════════════════════════

    // Agents
    await promiseConn.query(`
      CREATE TABLE IF NOT EXISTS agents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(20),
        city VARCHAR(100),
        address TEXT,
        tier ENUM('Platinum', 'Gold', 'Silver') DEFAULT 'Silver',
        status ENUM('Active', 'Pending', 'Inactive', 'Rejected') DEFAULT 'Pending',
        profile_pic TEXT,
        document_url TEXT,
        admin_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Agent Commissions
    await promiseConn.query(`
      CREATE TABLE IF NOT EXISTS agent_commissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        agent_id INT,
        amount DECIMAL(15, 2),
        source VARCHAR(255),
        status ENUM('Earned', 'Pending', 'Paid') DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
      )
    `);

    // Agent Payouts
    await promiseConn.query(`
      CREATE TABLE IF NOT EXISTS agent_payouts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        agent_id INT,
        amount DECIMAL(15, 2),
        status ENUM('Pending', 'Approved', 'Rejected', 'Paid') DEFAULT 'Pending',
        request_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        payout_time TIMESTAMP NULL,
        FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
      )
    `);

    // Agent Referrals
    await promiseConn.query(`
      CREATE TABLE IF NOT EXISTS agent_referrals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        agent_id INT,
        referral_name VARCHAR(255),
        status ENUM('Lead', 'Converted', 'Inactive') DEFAULT 'Lead',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
      )
    `);

    // Agent Referral Codes
    await promiseConn.query(`
      CREATE TABLE IF NOT EXISTS agent_referral_codes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        agent_id INT,
        code VARCHAR(50) UNIQUE,
        usage_count INT DEFAULT 0,
        status ENUM('Active', 'Expired') DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
      )
    `);

    // Agent Logs
    await promiseConn.query(`
      CREATE TABLE IF NOT EXISTS agent_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        agent_id INT,
        activity_text TEXT,
        activity_type VARCHAR(50),
        status VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
      )
    `);

    // Seed default agents if none exist
    const [agentRows] = await promiseConn.query('SELECT COUNT(*) as cnt FROM agents');
    if (agentRows[0].cnt === 0) {
      await promiseConn.query(`
        INSERT INTO agents (name, email, phone, city, tier, status) VALUES 
        ('Karan Mehra', 'karan@a2p.com', '9988776655', 'Mumbai', 'Platinum', 'Active'),
        ('Surbhi Gupta', 'surbhi@a2p.com', '8877665544', 'Delhi', 'Gold', 'Active')
      `);
      
      await promiseConn.query(`
        INSERT INTO agent_logs (agent_id, activity_text, activity_type, status) VALUES 
        (1, 'Payout request of ₹15,000 created', 'Payout', 'Pending'),
        (2, 'New referral "Amit Shah" onboarded', 'Onboarding', 'Approved')
      `);
    }

    // Testimonials table
    await promiseConn.query(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        rating INT DEFAULT 5,
        content TEXT,
        product_name VARCHAR(255),
        image_url TEXT,
        status ENUM('Active','Inactive') DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed testimonials if empty
    const [testRows] = await promiseConn.query('SELECT COUNT(*) as cnt FROM testimonials');
    if (testRows[0].cnt === 0) {
      await promiseConn.query(`
        INSERT INTO testimonials (name, rating, content, product_name) VALUES 
        ('Sarah Mitchell', 5, '"The Velvet Matte Lipstick is absolutely stunning! The color lasts all day and feels so luxurious."', 'Velvet Matte Lipstick'),
        ('Emily Rodriguez', 5, '"My skin has never looked better! The Radiant Glow Face Wash is a game-changer."', 'Radiant Glow Face Wash'),
        ('Jessica Chen', 5, '"I''m obsessed with the foundation! It gives such a natural, flawless finish."', 'Flawless Finish Foundation')
      `);
      console.log('✅ Default testimonials seeded.');
    }

    // ═══════════════════════════════════════════
    //  CUSTOMER CRM TABLES
    // ═══════════════════════════════════════════
    await promiseConn.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE,
        password VARCHAR(255),
        phone VARCHAR(20),
        location VARCHAR(100),
        status ENUM('Active', 'Inactive') DEFAULT 'Active',
        total_spend DECIMAL(15,2) DEFAULT 0,
        tier ENUM('Bronze', 'Silver', 'Gold', 'Platinum') DEFAULT 'Bronze',
        admin_notes TEXT,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Migration: Add password column to customers if it doesn't exist
    try {
      await promiseConn.query(`
        ALTER TABLE customers ADD password VARCHAR(255) AFTER email
      `);
      console.log('✅ Added password column to customers.');
    } catch (err) {
      if (err.code === 'ER_DUP_COLUMN_NAME' || err.errno === 1060) {
        console.log('ℹ️ Password column already exists in customers.');
      }
    }

    await promiseConn.query(`
      CREATE TABLE IF NOT EXISTS customer_activity (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT,
        type VARCHAR(50),
        product_name VARCHAR(255),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed default customers if empty
    const [custRows] = await promiseConn.query('SELECT COUNT(*) as cnt FROM customers');
    if (custRows[0].cnt === 0) {
      await promiseConn.query(`
        INSERT INTO customers (name, email, phone, location, total_spend, tier) VALUES 
        ('Rahul Verma', 'rahul@example.com', '9876543210', 'Delhi', 4500, 'Gold'),
        ('Anjali Sharma', 'anjali@example.com', '8877665544', 'Mumbai', 1200, 'Silver')
      `);
      
      await promiseConn.query(`
        INSERT INTO customer_activity (customer_id, type, product_name) VALUES 
        (1, 'Cart', 'Face Wash Neem'),
        (1, 'Wishlist', 'Face Serum Vitamin C'),
        (2, 'Cart', 'Body Wash Lavender')
      `);
      console.log('✅ Default CRM data seeded.');
    }

    // ═══════════════════════════════════════════
    //  SUPPORT SYSTEM TABLES
    // ═══════════════════════════════════════════
    await promiseConn.query(`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ticket_id VARCHAR(20) UNIQUE,
        subject VARCHAR(255) NOT NULL,
        user_name VARCHAR(255),
        user_email VARCHAR(255),
        category ENUM('Shipping','Billing','Product','General','Returns') DEFAULT 'General',
        priority ENUM('Low','Medium','High') DEFAULT 'Medium',
        status ENUM('Open','In Progress','Resolved','Closed') DEFAULT 'Open',
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await promiseConn.query(`
      CREATE TABLE IF NOT EXISTS ticket_replies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ticket_id INT,
        agent VARCHAR(255) DEFAULT 'Admin',
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const [supportRows] = await promiseConn.query('SELECT COUNT(*) as cnt FROM support_tickets');
    if (supportRows[0].cnt === 0) {
      await promiseConn.query(`
        INSERT INTO support_tickets (ticket_id, subject, user_name, user_email, category, priority, status, message) VALUES
        ('TIC-2042', 'Late delivery for Order #120', 'Anil Kapoor', 'anil@example.com', 'Shipping', 'High', 'Open', 'My order #120 is still not delivered, it shows on hold. Can you please check?'),
        ('TIC-2041', 'Refund request for Serum', 'Sneha Rao', 'sneha@example.com', 'Billing', 'Medium', 'In Progress', 'I want to return the face serum I ordered last week. It caused irritation.'),
        ('TIC-2040', 'Doubt about Product Expiry', 'Vikram S.', 'vikram@example.com', 'Product', 'Low', 'Open', 'When does the face cream expire? I cannot find the date on the packaging.'),
        ('TIC-2039', 'Unable to track order', 'Pooja J.', 'pooja@example.com', 'Shipping', 'Medium', 'Resolved', 'My tracking link is not working. Please help.')
      `);
      console.log('✅ Support tickets seeded.');
    }

    // Retail Orders table
    await promiseConn.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_number VARCHAR(50) UNIQUE,
        customer_name VARCHAR(255),
        customer_email VARCHAR(255),
        customer_phone VARCHAR(20),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        zip_code VARCHAR(20),
        subtotal DECIMAL(10, 2),
        discount DECIMAL(10, 2) DEFAULT 0,
        total_amount DECIMAL(10, 2),
        payment_status ENUM('Pending', 'Paid', 'Failed') DEFAULT 'Pending',
        order_status ENUM('Processing', 'Shipped', 'Delivered', 'Cancelled') DEFAULT 'Processing',
        payment_method VARCHAR(50) DEFAULT 'Razorpay',
        razorpay_order_id VARCHAR(255),
        razorpay_payment_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Order Items table
    await promiseConn.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT,
        product_name VARCHAR(255),
        price DECIMAL(10, 2),
        quantity INT,
        image_url TEXT,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Retail Orders & Items tables checked/created.');

    console.log('🔄 Initializing Customer Addresses table...');
    // Customer Addresses table
    await promiseConn.query(`
      CREATE TABLE IF NOT EXISTS customer_addresses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT DEFAULT 1,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20) NOT NULL,
        type ENUM('Home', 'Office', 'Other') DEFAULT 'Home',
        address_line TEXT NOT NULL,
        city VARCHAR(100),
        state VARCHAR(100),
        zip_code VARCHAR(20),
        is_default TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Customer Addresses table checked/created.');

    // Migration: Add email column
    try {
      await promiseConn.query(`
        ALTER TABLE customer_addresses ADD email VARCHAR(255) AFTER name
      `);
      console.log('✅ Added email column to customer_addresses.');
    } catch (err) {
      if (err.code === 'ER_DUP_COLUMN_NAME' || err.errno === 1060) {
        console.log('ℹ️ Email column already exists.');
      } else {
        console.error('❌ Error adding email column:', err.message);
      }
    }

    // Migration: Add password column to agents and distributors
    try {
      await promiseConn.query('ALTER TABLE agents ADD password VARCHAR(255) AFTER email');
      console.log('✅ Added password column to agents.');
    } catch (err) {}

    try {
      await promiseConn.query('ALTER TABLE distributors ADD password VARCHAR(255) AFTER email');
      console.log('✅ Added password column to distributors.');
    } catch (err) {}


    // Stock Requests (Distributor to Admin)
    await promiseConn.query(`
      CREATE TABLE IF NOT EXISTS stock_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        distributor_id INT,
        request_number VARCHAR(50) UNIQUE,
        total_amount DECIMAL(15, 2) DEFAULT 0,
        status ENUM('Pending', 'Approved', 'Shipped', 'Delivered', 'Cancelled') DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await promiseConn.query(`
      CREATE TABLE IF NOT EXISTS stock_request_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        request_id INT,
        product_id INT,
        product_name VARCHAR(255),
        quantity INT,
        price DECIMAL(10, 2),
        FOREIGN KEY (request_id) REFERENCES stock_requests(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ Stock Request tables checked/created.');

    // Announcements/Promotions
    await promiseConn.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        message TEXT,
        type ENUM('Info', 'Promotion', 'Alert', 'News') DEFAULT 'Info',
        status ENUM('Active', 'Inactive') DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Announcements table checked/created.');

    console.log('✅ Support System tables checked/created.');


  } catch (error) {
    console.error('❌ Error setting up database:', error);
  }
};

setupDatabase();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool.promise();
