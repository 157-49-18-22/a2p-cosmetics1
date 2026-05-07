-- A2P Eco Distributor Portal Database Schema

-- 1. Distributors Table
CREATE TABLE IF NOT EXISTS distributors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    role VARCHAR(100) DEFAULT 'Senior Distributor',
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Dealers / Sub-Dealers Table
CREATE TABLE IF NOT EXISTS dealers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    distributor_id INT,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    zone VARCHAR(100),
    type ENUM('Dealer', 'Sub-Dealer') DEFAULT 'Dealer',
    status ENUM('Active', 'Inactive', 'Pending') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (distributor_id) REFERENCES distributors(id) ON DELETE CASCADE
);

-- 3. Distributor Orders Table
CREATE TABLE IF NOT EXISTS distributor_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    distributor_id INT,
    order_number VARCHAR(50) UNIQUE,
    amount DECIMAL(15, 2),
    status ENUM('Pending', 'Shipped', 'Delivered', 'Cancelled') DEFAULT 'Pending',
    items_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (distributor_id) REFERENCES distributors(id) ON DELETE CASCADE
);

-- 4. Distributor Bills / Invoices Table
CREATE TABLE IF NOT EXISTS distributor_bills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    distributor_id INT,
    bill_number VARCHAR(50) UNIQUE,
    amount DECIMAL(15, 2),
    status ENUM('Paid', 'Unpaid', 'Overdue') DEFAULT 'Unpaid',
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (distributor_id) REFERENCES distributors(id) ON DELETE CASCADE
);

-- 5. Zones / Area Allocation Table
CREATE TABLE IF NOT EXISTS distributor_zones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    distributor_id INT,
    zone_name VARCHAR(100),
    status ENUM('Allocated', 'Vacant') DEFAULT 'Allocated',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (distributor_id) REFERENCES distributors(id) ON DELETE CASCADE
);

-- 6. Super Stockists Table
CREATE TABLE IF NOT EXISTS super_stockists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    distributor_id INT,
    name VARCHAR(255) NOT NULL,
    zone VARCHAR(100),
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (distributor_id) REFERENCES distributors(id) ON DELETE CASCADE
);

-- 7. Distributor Activity Logs Table
CREATE TABLE IF NOT EXISTS distributor_activity (
    id INT AUTO_INCREMENT PRIMARY KEY,
    distributor_id INT,
    activity_text TEXT,
    activity_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (distributor_id) REFERENCES distributors(id) ON DELETE CASCADE
);

-- 8. Branding Campaigns Table
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (distributor_id) REFERENCES distributors(id) ON DELETE CASCADE
);

-- 9. Branding Assets Table
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (distributor_id) REFERENCES distributors(id) ON DELETE CASCADE
);

-- 10. Seed Default Data (Optional)
INSERT INTO distributors (name, email, phone, role) 
VALUES ('Rahul Sharma', 'rahul@a2p.com', '9876543210', 'Senior Distributor')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO dealers (distributor_id, name, zone, status, type) VALUES 
(1, 'Sharma Traders', 'Zone A', 'Active', 'Dealer'),
(1, 'Krishna Stores', 'Zone D', 'Active', 'Sub-Dealer'),
(1, 'Mehta Co.', 'Zone C', 'Pending', 'Dealer');

INSERT INTO distributor_activity (distributor_id, activity_text, activity_type) VALUES 
(1, 'Dealer "Sharma Traders" onboarded in Zone A', 'Success'),
(1, 'Invoice #1042 generated for Ravi Distribution', 'Invoice'),
(1, 'Stock alert: Face Serum inventory below 50 units', 'Warning');

INSERT INTO distributor_bills (distributor_id, bill_number, amount, status, due_date) VALUES 
(1, 'INV-1042', 24500.00, 'Unpaid', '2026-04-30'),
(1, 'INV-1041', 18200.00, 'Paid', '2026-04-28'),
(1, 'INV-1040', 31800.00, 'Overdue', '2026-04-20');

INSERT INTO branding_campaigns (distributor_id, title, type, zone, budget, start_date, end_date, status, assets_count) VALUES
(1, 'Summer Glow Campaign', 'Digital', 'All Zones', 50000.00, '2026-05-01', '2026-05-30', 'Upcoming', 8),
(1, 'Face Serum Launch', 'Print + Digital', 'Zone A, B', 35000.00, '2026-04-10', '2026-04-25', 'Active', 12);

INSERT INTO branding_assets (distributor_id, campaign_id, campaign_title, name, type, file_format, file_size, zone) VALUES
(1, 1, 'Summer Glow', 'Summer Banner - 6ft x 3ft', 'Print', 'PDF', '4.2 MB', 'All'),
(1, 2, 'Face Serum Launch', 'Face Serum Social Post', 'Digital', 'PNG', '1.8 MB', 'Zone A, B');
