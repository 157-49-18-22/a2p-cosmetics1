-- A2P Eco Agent Dashboard Database Schema

-- 1. Agents Table
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Agent Commissions Table
CREATE TABLE IF NOT EXISTS agent_commissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    agent_id INT,
    amount DECIMAL(15, 2),
    source VARCHAR(255), -- Order ID or Referral Name
    status ENUM('Earned', 'Pending', 'Paid') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
);

-- 3. Agent Payouts Table
CREATE TABLE IF NOT EXISTS agent_payouts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    agent_id INT,
    amount DECIMAL(15, 2),
    status ENUM('Pending', 'Approved', 'Rejected', 'Paid') DEFAULT 'Pending',
    request_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payout_time TIMESTAMP NULL,
    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
);

-- 4. Agent Referrals Table
CREATE TABLE IF NOT EXISTS agent_referrals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    agent_id INT,
    referral_name VARCHAR(255),
    status ENUM('Lead', 'Converted', 'Inactive') DEFAULT 'Lead',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
);

-- 5. Agent Referral Codes
CREATE TABLE IF NOT EXISTS agent_referral_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    agent_id INT,
    code VARCHAR(50) UNIQUE,
    usage_count INT DEFAULT 0,
    status ENUM('Active', 'Expired') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
);

-- 6. Agent Logs / Activity
CREATE TABLE IF NOT EXISTS agent_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    agent_id INT,
    activity_text TEXT,
    activity_type VARCHAR(50), -- 'Payout', 'Onboarding', 'Commission'
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
);

-- 7. Commission Rules Table
CREATE TABLE IF NOT EXISTS commission_rules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(255),
    base_rate VARCHAR(20),
    bonus_margin VARCHAR(20),
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Global Settings Table
CREATE TABLE IF NOT EXISTS agent_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE,
    setting_value VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Seed Initial Data
INSERT INTO agents (name, email, phone, city, tier, status) VALUES 
('Karan Mehra', 'karan@a2p.com', '9988776655', 'Mumbai', 'Platinum', 'Active'),
('Surbhi Gupta', 'surbhi@a2p.com', '8877665544', 'Delhi', 'Gold', 'Active'),
('Sneha Rao', 'sneha@a2p.com', '7766554433', 'Bangalore', 'Silver', 'Pending');

INSERT INTO agent_commissions (agent_id, amount, source, status) VALUES 
(1, 2500.00, 'Order #A2P-9901', 'Earned'),
(2, 1800.00, 'Referral: Amit Shah', 'Pending'),
(1, 4500.00, 'Order #A2P-9902', 'Earned'),
(3, 1200.00, 'Order #A2P-9903', 'Pending');

INSERT INTO agent_payouts (agent_id, amount, status) VALUES 
(1, 15000.00, 'Pending'),
(2, 8200.00, 'Approved'),
(1, 12450.00, 'Paid'),
(3, 5000.00, 'Rejected');

INSERT INTO agent_referral_codes (agent_id, code, usage_count, status) VALUES 
(1, 'A2P-KARAN-24', 124, 'Active'),
(2, 'A2P-GOLD-007', 86, 'Active'),
(3, 'A2P-SNEHA-X', 42, 'Expired');

INSERT INTO agent_logs (agent_id, activity_text, activity_type, status) VALUES 
(1, 'Payout request of ₹15,000 created', 'Payout', 'Pending'),
(2, 'New referral "Amit Shah" onboarded', 'Onboarding', 'Approved'),
(3, 'Commission of ₹2,500 earned from Order #9921', 'Commission', 'Rejected'),
(1, 'Login successful from Mumbai', 'Security', 'Success'),
(2, 'Referral code A2P-GOLD-007 generated', 'Marketing', 'Success');

INSERT INTO commission_rules (category_name, base_rate, bonus_margin, status) VALUES 
('Core Product', '10%', '2%', 'Active'),
('New Launches', '12%', '3%', 'Active'),
('Accessories', '8%', '1%', 'Inactive'),
('Skincare Premium', '15%', '5%', 'Active');

INSERT INTO agent_settings (setting_key, setting_value) VALUES 
('referral_bonus_percent', '2'),
('min_payout_threshold', '5000'),
('commission_cycle_days', '15');
