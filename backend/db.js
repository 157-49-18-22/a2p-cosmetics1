const mysql = require('mysql2');
require('dotenv').config();

console.log('Attempting to connect to database with user:', process.env.DB_USER);
console.log('Password provided:', process.env.DB_PASSWORD ? 'YES' : 'NO');

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 3306,
  ssl: process.env.DB_HOST !== 'localhost' ? {
    rejectUnauthorized: false
  } : null
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
        delivery_pincodes TEXT DEFAULT NULL,
        all_india_delivery TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Products table checked/created.');

    // Migration: add delivery_pincodes column to existing products table
    try {
      await promiseConn.query(`ALTER TABLE products ADD COLUMN delivery_pincodes TEXT DEFAULT NULL`);
      console.log('✅ delivery_pincodes column added to products.');
    } catch (err) {
      console.log('ℹ️ delivery_pincodes column already exists or error:', err.message);
    }

    // Migration: add all_india_delivery column to existing products table
    try {
      await promiseConn.query(`ALTER TABLE products ADD COLUMN all_india_delivery TINYINT(1) DEFAULT 0`);
      console.log('✅ all_india_delivery column added to products.');
    } catch (err) {
      console.log('ℹ️ all_india_delivery column already exists or error:', err.message);
    }

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

    // Testimonials table
    await promiseConn.query(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        rating INT DEFAULT 5,
        content TEXT,
        product_name VARCHAR(255) DEFAULT '',
        image_url TEXT,
        status ENUM('Active','Inactive') DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Testimonials table checked/created.');

    // Announcements table
    await promiseConn.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        message TEXT,
        type VARCHAR(50) DEFAULT 'Info',
        status ENUM('Active','Inactive') DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Announcements table checked/created.');

    // Articles / Journal table with Comprehensive SEO fields
    await promiseConn.query(`
      CREATE TABLE IF NOT EXISTS articles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        excerpt TEXT,
        content LONGTEXT,
        category VARCHAR(100) DEFAULT 'Skincare 101',
        author VARCHAR(150) DEFAULT 'Dr. Ananya Sharma',
        read_time VARCHAR(50) DEFAULT '5 min read',
        image_url TEXT,
        featured TINYINT(1) DEFAULT 0,
        status ENUM('Published','Draft','Archived') DEFAULT 'Published',
        meta_title VARCHAR(255) DEFAULT NULL,
        meta_description TEXT DEFAULT NULL,
        meta_keywords TEXT DEFAULT NULL,
        canonical_url TEXT DEFAULT NULL,
        og_image TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Articles table checked/created.');

    // Seed default articles if empty
    const [articleCount] = await promiseConn.query('SELECT COUNT(*) as cnt FROM articles');
    if (articleCount[0].cnt === 0) {
      await promiseConn.query(`
        INSERT INTO articles (title, slug, excerpt, content, category, author, read_time, image_url, featured, status, meta_title, meta_description, meta_keywords) VALUES
        (
          'The Ultimate Guide to Glow: Morning vs Evening Routine',
          'the-ultimate-guide-to-glow-morning-vs-evening-routine',
          'Learn why swapping your Vitamin C serum with Retinol at night is the secret to waking up with radiant skin...',
          'Learn why swapping your Vitamin C serum with Retinol at night is the secret to waking up with radiant skin.\\n\\nMorning Routine Essentials:\\n1. Gentle Cleanser: Wash away overnight impurities without stripping essential moisture.\\n2. Vitamin C Serum: Protects against free radicals and environmental stressors throughout the day.\\n3. Hydrating Moisturizer: Locks in hydration and creates a smooth base.\\n4. Broad-Spectrum Sunscreen (SPF 50+): Non-negotiable defense against UV rays.\\n\\nEvening Routine Essentials:\\n1. Double Cleanse: Remove sunscreen, pollution, and makeup thoroughly.\\n2. Active Treatment (Retinol / Exfoliating Acids): Stimulates collagen and cellular renewal overnight.\\n3. Barrier Repair Night Cream: Nourishes deep skin layers for wake-up glow.',
          'Skincare 101',
          'Dr. Ananya Sharma',
          '5 min read',
          'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=800',
          1,
          'Published',
          'Morning vs Evening Skincare Routine Guide | A2P Cosmetics',
          'Master your morning and nighttime skincare regimen with expert dermatological advice. Discover when to use Vitamin C and Retinol for glowing skin.',
          'skincare routine, morning skincare, evening skincare, vitamin c serum, retinol tips'
        ),
        (
          '5 Himalayan Herbs That Revive Dull Skin',
          '5-himalayan-herbs-that-revive-dull-skin',
          'We dive deep into the botanical treasures of the North to bring you the purest extracts for your skin...',
          'We dive deep into the botanical treasures of the Himalayas to bring you the purest extracts for revitalizing tired, dull skin.\\n\\n1. Ashwagandha: Powerful adaptogen that combats stress-induced skin fatigue.\\n2. Seabuckthorn Berry: Loaded with rare Omega-7 and Vitamin C for intense cellular repair.\\n3. Himalayan Rose: Deeply hydrating floral distillate that balances skin pH naturally.\\n4. Turmeric Extract: Natural brightening agent that fades pigmentation and evens skin tone.\\n5. Brahmi: Calms inflammation and promotes natural skin barrier elasticity.',
          'Ingredients',
          'Rohan Varma',
          '8 min read',
          'https://images.unsplash.com/photo-1556228578-8c7c2f23d0b2?auto=format&fit=crop&q=80&w=800',
          0,
          'Published',
          '5 Pure Himalayan Herbs for Radiant & Glowing Skin | A2P Journal',
          'Explore the ancient botanical secrets of the Himalayas. Discover how Ashwagandha, Seabuckthorn, and Himalayan Rose can rejuvenate dull skin.',
          'himalayan herbs, natural skincare, ayurvedic herbs, dull skin remedies, botanical beauty'
        ),
        (
          'Why pH Balance Matters More Than You Think',
          'why-ph-balance-matters-more-than-you-think',
          'Your skin\\'s acid mantle is its first line of defense. Here is how to keep it perfectly balanced at 5.5...',
          'Your skin\\'s acid mantle is its first line of defense against bacteria, pollution, and moisture loss.\\n\\nThe optimal pH for human facial skin is slightly acidic, sitting comfortably between 4.7 and 5.5.\\n\\nWhat happens when pH is unbalanced?\\n- Too Alkaline (pH > 6.0): Leads to dryness, sensitivity, irritation, and premature fine lines.\\n- Too Acidic (pH < 4.0): Can cause inflammation, breakouts, and redness.\\n\\nHow to maintain 5.5 pH balance:\\n- Use gentle, sulfate-free cleansers.\\n- Avoid overly harsh physical scrubs.\\n- Apply balancing toner with soothing botanicals.\\n- Protect with antioxidant-rich serums.',
          'Science',
          'Dr. Ananya Sharma',
          '6 min read',
          'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800',
          0,
          'Published',
          'Understanding Skin pH Balance: Why 5.5 is The Golden Rule',
          'Learn the science behind your skin\\'s acid mantle and why maintaining a 5.5 pH level is crucial for acne prevention and hydration.',
          'skin ph balance, acid mantle, skincare science, 5.5 ph cleanser'
        ),
        (
          'Debunking Organic Skincare Myths',
          'debunking-organic-skincare-myths',
          'Does \\'natural\\' always mean better? We separate facts from marketing buzz in this deep dive...',
          'Does \\'natural\\' always mean safer or more effective? We separate scientific facts from marketing hype in this deep dive into clean beauty.\\n\\nMyth 1: All synthetic ingredients are harmful.\\nFact: Many synthetic compounds like Hyaluronic Acid and Niacinamide are bio-identical, stable, and highly beneficial.\\n\\nMyth 2: Preservative-free skincare is always better.\\nFact: Without safe preservatives, water-based skincare products can harbor dangerous mold and bacteria within weeks.\\n\\nMyth 3: Natural oils never clog pores.\\nFact: Some natural oils (like Coconut oil) are highly comedogenic, while others (like Jojoba and Squalane) are pore-friendly.',
          'Lifestyle',
          'Sarah Jenkins',
          '4 min read',
          'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&q=80&w=800',
          0,
          'Published',
          'Organic Skincare Myths vs Facts: What Science Really Says',
          'Separating fact from fiction in clean beauty. Discover the truth about organic labels, natural ingredients, and skincare preservatives.',
          'organic skincare myths, clean beauty truth, natural vs synthetic skincare'
        )
      `);
      console.log('✅ Default articles seeded.');
    }

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
        status ENUM('Active','Inactive','Pending','Rejected') DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Migration: allow Pending/Rejected on existing dealers.status
    try {
      await promiseConn.query(
        "ALTER TABLE dealers MODIFY COLUMN status ENUM('Active','Inactive','Pending','Rejected') DEFAULT 'Pending'"
      );
    } catch (err) {
      console.log('ℹ️ dealers.status migration skipped:', err.message);
    }

    // Distributor Allocated Inventory
    await promiseConn.query(`
      CREATE TABLE IF NOT EXISTS distributor_inventory (
        id INT AUTO_INCREMENT PRIMARY KEY,
        distributor_id INT NOT NULL,
        product_id INT NOT NULL,
        stock_quantity INT DEFAULT 0,
        stock INT DEFAULT 0,
        min_stock INT DEFAULT 50,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY dist_prod_uniq (distributor_id, product_id)
      )
    `);
    try {
      await promiseConn.query("ALTER TABLE distributor_inventory ADD COLUMN stock_quantity INT DEFAULT 0");
    } catch(e) {}
    try {
      await promiseConn.query("ALTER TABLE distributor_inventory ADD COLUMN stock INT DEFAULT 0");
    } catch(e) {}
    try {
      await promiseConn.query("ALTER TABLE distributor_inventory ADD COLUMN min_stock INT DEFAULT 50");
    } catch(e) {}
    try {
      // Clean up duplicate inventory rows if any exist
      await promiseConn.query(`
        DELETE d1 FROM distributor_inventory d1
        INNER JOIN distributor_inventory d2 
        WHERE d1.id > d2.id AND d1.distributor_id = d2.distributor_id AND d1.product_id = d2.product_id
      `);
      try {
        await promiseConn.query('ALTER TABLE distributor_inventory DROP INDEX unique_distributor_product');
      } catch(e) {}
      try {
        await promiseConn.query('ALTER TABLE distributor_inventory ADD UNIQUE KEY dist_prod_uniq (distributor_id, product_id)');
      } catch(e) {}
      console.log('✅ Cleaned up duplicate distributor_inventory entries & enforced unique constraint.');
    } catch(e) {}
    console.log('✅ Distributor Inventory table checked/created.');

    // Auto-sync approved stock requests into distributor_inventory (without overwriting modified stocks)
    try {
      const [approvedRows] = await promiseConn.query(`
        SELECT sr.distributor_id, sri.product_id, sri.product_name, SUM(sri.quantity) as total_qty
        FROM stock_requests sr
        JOIN stock_request_items sri ON sri.request_id = sr.id
        WHERE sr.status = 'Approved'
        GROUP BY sr.distributor_id, sri.product_id, sri.product_name
      `);
      for (const row of approvedRows) {
        let pId = row.product_id;
        if (!pId && row.product_name) {
          const [[p]] = await promiseConn.query('SELECT id FROM products WHERE name = ?', [row.product_name]);
          if (p) pId = p.id;
        }
        if (row.distributor_id && pId) {
          const qty = parseInt(row.total_qty) || 0;
          await promiseConn.query(`
            INSERT INTO distributor_inventory (distributor_id, product_id, stock_quantity, stock)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
              stock_quantity = IF(stock_quantity = 0 AND stock = 0, VALUES(stock_quantity), stock_quantity),
              stock = IF(stock_quantity = 0 AND stock = 0, VALUES(stock), stock)
          `, [row.distributor_id, pId, qty, qty]);
        }
      }
      console.log('✅ Approved stock requests synced to distributor_inventory.');
    } catch (syncErr) {
      console.log('ℹ️ Stock sync notice:', syncErr.message);
    }

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

    // Migration: Add new fields to distributor_bills for enhanced invoice
    const billMigrations = [
      { col: 'buyer_name', sql: "ALTER TABLE distributor_bills ADD COLUMN buyer_name VARCHAR(255)" },
      { col: 'buyer_company', sql: "ALTER TABLE distributor_bills ADD COLUMN buyer_company VARCHAR(255)" },
      { col: 'buyer_address', sql: "ALTER TABLE distributor_bills ADD COLUMN buyer_address TEXT" },
      { col: 'buyer_city', sql: "ALTER TABLE distributor_bills ADD COLUMN buyer_city VARCHAR(100)" },
      { col: 'buyer_state', sql: "ALTER TABLE distributor_bills ADD COLUMN buyer_state VARCHAR(100)" },
      { col: 'buyer_pincode', sql: "ALTER TABLE distributor_bills ADD COLUMN buyer_pincode VARCHAR(20)" },
      { col: 'buyer_contact', sql: "ALTER TABLE distributor_bills ADD COLUMN buyer_contact VARCHAR(20)" },
      { col: 'buyer_email', sql: "ALTER TABLE distributor_bills ADD COLUMN buyer_email VARCHAR(255)" },
      { col: 'buyer_gstin', sql: "ALTER TABLE distributor_bills ADD COLUMN buyer_gstin VARCHAR(50)" },
      { col: 'products', sql: "ALTER TABLE distributor_bills ADD COLUMN products JSON" },
      { col: 'bank_account_holder', sql: "ALTER TABLE distributor_bills ADD COLUMN bank_account_holder VARCHAR(255)" },
      { col: 'bank_account_number', sql: "ALTER TABLE distributor_bills ADD COLUMN bank_account_number VARCHAR(50)" },
      { col: 'bank_name', sql: "ALTER TABLE distributor_bills ADD COLUMN bank_name VARCHAR(255)" },
      { col: 'bank_ifsc', sql: "ALTER TABLE distributor_bills ADD COLUMN bank_ifsc VARCHAR(20)" },
      { col: 'bank_branch', sql: "ALTER TABLE distributor_bills ADD COLUMN bank_branch VARCHAR(255)" }
    ];

    for (const m of billMigrations) {
      try {
        await promiseConn.query(m.sql);
        console.log(`✅ Added ${m.col} to distributor_bills.`);
      } catch (err) {
        if (err.errno === 1060) {
          console.log(`ℹ️ Column ${m.col} already exists in distributor_bills.`);
        } else {
          console.log(`ℹ️ Migration skipped for distributor_bills.${m.col}: ${err.message}`);
        }
      }
    }

    try {
      await promiseConn.query("ALTER TABLE dealer_orders MODIFY COLUMN status VARCHAR(50) DEFAULT 'Pending'");
      console.log('✅ dealer_orders status updated to VARCHAR(50).');
    } catch (e) {
      console.log('ℹ️ dealer_orders status check/migration:', e.message);
    }
    try {
      await promiseConn.query("ALTER TABLE dealer_orders ADD COLUMN stock_deducted TINYINT(1) DEFAULT 0");
      console.log('✅ dealer_orders added stock_deducted column.');
    } catch (e) {
      // already exists
    }

    // Zones / Area Allocation
    await promiseConn.query(`
      CREATE TABLE IF NOT EXISTS distributor_zones (
        id INT AUTO_INCREMENT PRIMARY KEY,
        distributor_id INT,
        zone_name VARCHAR(100),
        region VARCHAR(100),
        assigned_to VARCHAR(255),
        status ENUM('Allocated','Vacant') DEFAULT 'Allocated',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    try { await promiseConn.query("ALTER TABLE distributor_zones ADD COLUMN region VARCHAR(100)"); } catch(e) {}
    try { await promiseConn.query("ALTER TABLE distributor_zones ADD COLUMN assigned_to VARCHAR(255)"); } catch(e) {}

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

    // Migration: Add role column to customers if it doesn't exist
    try {
      await promiseConn.query(`
        ALTER TABLE customers ADD role VARCHAR(50) DEFAULT 'Customer' AFTER password
      `);
      console.log('✅ Added role column to customers.');
    } catch (err) {
      if (err.code === 'ER_DUP_COLUMN_NAME' || err.errno === 1060) {
        console.log('ℹ️ Role column already exists in customers.');
      }
    }

    try {
      // Ensure existing admin users retain Admin role
      await promiseConn.query(`
        UPDATE customers SET role = 'Admin' WHERE email LIKE '%admin%' AND (role IS NULL OR role = '' OR role = 'Customer')
      `);
    } catch (e) {}

    await promiseConn.query(`
      CREATE TABLE IF NOT EXISTS customer_activity (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT,
        type VARCHAR(50),
        product_name VARCHAR(255),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await promiseConn.query(`
      CREATE TABLE IF NOT EXISTS email_otps (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        otp VARCHAR(10) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME NOT NULL
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
        user_phone VARCHAR(30),
        category VARCHAR(100) DEFAULT 'General',
        priority VARCHAR(50) DEFAULT 'Medium',
        status VARCHAR(50) DEFAULT 'Open',
        message TEXT,
        assigned_to VARCHAR(255) DEFAULT NULL,
        tags VARCHAR(500) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Add missing columns & modify types on existing support_tickets table
    try { await promiseConn.query("ALTER TABLE support_tickets ADD COLUMN user_phone VARCHAR(30) DEFAULT NULL"); } catch(e) {}
    try { await promiseConn.query("ALTER TABLE support_tickets ADD COLUMN assigned_to VARCHAR(255) DEFAULT NULL"); } catch(e) {}
    try { await promiseConn.query("ALTER TABLE support_tickets ADD COLUMN tags VARCHAR(500) DEFAULT NULL"); } catch(e) {}
    try { await promiseConn.query("ALTER TABLE support_tickets ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"); } catch(e) {}
    try { await promiseConn.query("ALTER TABLE support_tickets MODIFY COLUMN category VARCHAR(100) DEFAULT 'General'"); } catch(e) {}
    try { await promiseConn.query("ALTER TABLE support_tickets MODIFY COLUMN priority VARCHAR(50) DEFAULT 'Medium'"); } catch(e) {}
    try { await promiseConn.query("ALTER TABLE support_tickets MODIFY COLUMN status VARCHAR(50) DEFAULT 'Open'"); } catch(e) {}

    await promiseConn.query(`
      CREATE TABLE IF NOT EXISTS ticket_replies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ticket_id INT,
        agent VARCHAR(255) DEFAULT 'Admin',
        message TEXT,
        sender_type ENUM('admin','user') DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add sender_type to existing ticket_replies table
    try { await promiseConn.query("ALTER TABLE ticket_replies ADD COLUMN sender_type ENUM('admin','user') DEFAULT 'admin'"); } catch(e) {}

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

    // Product Reviews table
    await promiseConn.query(`
      CREATE TABLE IF NOT EXISTS product_reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        customer_id VARCHAR(255),
        user_name VARCHAR(255) NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        review_text TEXT NOT NULL,
        helpful_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_product_id (product_id),
        INDEX idx_customer_id (customer_id),
        INDEX idx_rating (rating)
      )
    `);
    console.log('✅ Product Reviews table checked/created.');

    // Testimonials table
    await promiseConn.query(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        rating INT DEFAULT 5,
        content TEXT NOT NULL,
        product_name VARCHAR(255) DEFAULT '',
        image_url TEXT,
        status ENUM('Active','Inactive') DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Testimonials table checked/created.');

    // Seed default testimonials if empty
    const [testCount] = await promiseConn.query('SELECT COUNT(*) as cnt FROM testimonials');
    if (testCount[0].cnt === 0) {
      await promiseConn.query(`
        INSERT INTO testimonials (name, rating, content, product_name, status, created_at) VALUES 
        ('SARAH MITCHELL', 5, 'The Velvet Matte Lipstick is absolutely stunning! The color lasts all day and feels so luxurious.', 'Velvet Matte Lipstick', 'Active', '2026-09-10 10:00:00'),
        ('EMILY RODRIGUEZ', 5, 'My skin has never looked better! The Radiant Glow Face Wash is a game-changer.', 'Radiant Glow Face Wash', 'Active', '2026-09-11 11:30:00'),
        ('JESSICA CHEN', 5, 'I am obsessed with the foundation! It gives such a natural, flawless finish.', 'Flawless Foundation', 'Active', '2026-09-12 14:15:00'),
        ('AMANDA FOSTER', 5, 'The Hydra-Luxe Moisturizer keeps my skin hydrated all day. Worth every penny!', 'Hydra-Luxe Moisturizer', 'Active', '2026-09-13 16:45:00')
      `);
      console.log('✅ Default testimonials seeded.');
    }

    console.log('✅ Support System tables checked/created.');

    // ═══════════════════════════════════════════
    //  USER WISHLIST TRACKING TABLE
    // ═══════════════════════════════════════════
    await promiseConn.query(`
      CREATE TABLE IF NOT EXISTS user_wishlists (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT NOT NULL,
        product_id INT NOT NULL,
        notes TEXT,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_wishlist (customer_id, product_id)
      )
    `);
    console.log('✅ User Wishlists tracking table checked/created.');

    // ═══════════════════════════════════════════
    //  SEO & SKU MIGRATIONS
    // ═══════════════════════════════════════════
    const seoMigrations = [
      { table: 'products', col: 'sku', sql: "ALTER TABLE products ADD COLUMN sku VARCHAR(100) DEFAULT ''" },
      { table: 'products', col: 'meta_title', sql: "ALTER TABLE products ADD COLUMN meta_title VARCHAR(255) DEFAULT ''" },
      { table: 'products', col: 'meta_description', sql: "ALTER TABLE products ADD COLUMN meta_description TEXT" },
      { table: 'products', col: 'meta_keywords', sql: "ALTER TABLE products ADD COLUMN meta_keywords VARCHAR(500) DEFAULT ''" },
      { table: 'products', col: 'images_360', sql: "ALTER TABLE products ADD COLUMN images_360 JSON" },
      { table: 'products', col: 'images', sql: "ALTER TABLE products ADD COLUMN images JSON" },
      { table: 'categories', col: 'meta_title', sql: "ALTER TABLE categories ADD COLUMN meta_title VARCHAR(255) DEFAULT ''" },
      { table: 'categories', col: 'meta_description', sql: "ALTER TABLE categories ADD COLUMN meta_description TEXT" },
      { table: 'categories', col: 'meta_keywords', sql: "ALTER TABLE categories ADD COLUMN meta_keywords VARCHAR(500) DEFAULT ''" },
    ];
    for (const m of seoMigrations) {
      try {
        await promiseConn.query(m.sql);
        console.log(`✅ Added ${m.col} to ${m.table}.`);
      } catch (err) {
        if (err.errno === 1060) {
          // column already exists — skip silently
        } else {
          console.log(`ℹ️ Migration skipped for ${m.table}.${m.col}: ${err.message}`);
        }
      }
    }

    // ═══════════════════════════════════════════
    //  USER WISHLIST TRACKING TABLE
    // ═══════════════════════════════════════════
    await promiseConn.query(`
      CREATE TABLE IF NOT EXISTS user_wishlists (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT NOT NULL,
        product_id INT NOT NULL,
        notes TEXT,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_wishlist (customer_id, product_id)
      )
    `);
    console.log('✅ User Wishlists tracking table checked/created.');

    // ═══════════════════════════════════════════
    //  COLUMN MIGRATIONS (safe - skip if exists)
    // ═══════════════════════════════════════════

    // Products: images column
    try { await promiseConn.query("ALTER TABLE products ADD COLUMN images JSON"); } catch(e) {}
    // Products: images_360 column
    try { await promiseConn.query("ALTER TABLE products ADD COLUMN images_360 JSON"); } catch(e) {}
    // Products: SKU & Likes
    try { await promiseConn.query("ALTER TABLE products ADD COLUMN sku VARCHAR(100) DEFAULT ''"); } catch(e) {}
    try { await promiseConn.query("ALTER TABLE products ADD COLUMN likes INT DEFAULT 0"); } catch(e) {}
    // Products: SEO
    try { await promiseConn.query("ALTER TABLE products ADD COLUMN meta_title VARCHAR(255) DEFAULT ''"); } catch(e) {}
    try { await promiseConn.query("ALTER TABLE products ADD COLUMN meta_description TEXT"); } catch(e) {}
    try { await promiseConn.query("ALTER TABLE products ADD COLUMN meta_keywords VARCHAR(500) DEFAULT ''"); } catch(e) {}
    // Products: Sirv 360 View URL
    try { await promiseConn.query("ALTER TABLE products ADD COLUMN sirv_spin_url VARCHAR(500) DEFAULT ''"); } catch(e) {}

    // Categories: SEO
    try { await promiseConn.query("ALTER TABLE categories ADD COLUMN meta_title VARCHAR(255) DEFAULT ''"); } catch(e) {}
    try { await promiseConn.query("ALTER TABLE categories ADD COLUMN meta_description TEXT"); } catch(e) {}
    try { await promiseConn.query("ALTER TABLE categories ADD COLUMN meta_keywords VARCHAR(500) DEFAULT ''"); } catch(e) {}

    // Agent Commissions table (auto-calculated earnings)
    await promiseConn.query(`
      CREATE TABLE IF NOT EXISTS agent_commissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        agent_id INT NOT NULL,
        order_id INT,
        order_amount DECIMAL(10,2) NOT NULL,
        commission_amount DECIMAL(10,2) NOT NULL,
        commission_rate VARCHAR(20) NOT NULL,
        category_name VARCHAR(255),
        referral_level VARCHAR(100),
        level_number INT DEFAULT 1,
        status ENUM('Earned','Pending','Paid') DEFAULT 'Earned',
        triggered_by INT COMMENT 'Agent ID who made the sale',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Agent Commissions table checked/created.');

    // Promo Codes table
    await promiseConn.query(`
      CREATE TABLE IF NOT EXISTS promo_codes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        discount_type ENUM('percentage', 'fixed') NOT NULL,
        discount_value DECIMAL(10,2) NOT NULL,
        min_order_value DECIMAL(10,2) DEFAULT 0,
        max_discount DECIMAL(10,2) DEFAULT NULL,
        usage_limit INT DEFAULT NULL,
        used_count INT DEFAULT 0,
        start_date DATETIME DEFAULT NULL,
        end_date DATETIME DEFAULT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        applicable_to ENUM('all', 'specific_products') DEFAULT 'all',
        applicable_product_ids JSON DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Promo Usage Logs
    await promiseConn.query(`
      CREATE TABLE IF NOT EXISTS promo_usage_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        promo_id INT NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        order_id VARCHAR(100),
        discount_applied DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (promo_id) REFERENCES promo_codes(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Promo & Discount tables checked/created.');

    console.log('✅ All column migrations applied.');

    // Migration: referral_level in agent_commission_rules
    try { await promiseConn.query("ALTER TABLE agent_commission_rules ADD COLUMN referral_level VARCHAR(100) DEFAULT 'All Levels'"); } catch(e) {}
    // Migration: tier in agents
    try { await promiseConn.query("ALTER TABLE agents ADD COLUMN tier VARCHAR(50) DEFAULT 'Bronze'"); } catch(e) {}
    // Migration: parent_id in agents
    try { await promiseConn.query("ALTER TABLE agents ADD COLUMN parent_id INT DEFAULT NULL"); } catch(e) {}

    // Migration: discount_type and discount_value in agent_referral_codes
    try { await promiseConn.query("ALTER TABLE agent_referral_codes ADD COLUMN discount_type ENUM('percentage', 'fixed') DEFAULT 'percentage'"); } catch(e) {}
    try { await promiseConn.query("ALTER TABLE agent_referral_codes ADD COLUMN discount_value DECIMAL(10,2) DEFAULT 10.00"); } catch(e) {}

    console.log('✅ Agent schema migrations applied.');

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
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: process.env.DB_HOST !== 'localhost' ? {
    rejectUnauthorized: false
  } : null
});

module.exports = pool.promise();
