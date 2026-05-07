const mysql = require('mysql2/promise');
require('dotenv').config();

async function setup() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS agent_commission_rules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category_name VARCHAR(255) NOT NULL,
        base_rate VARCHAR(50),
        bonus_margin VARCHAR(50),
        status VARCHAR(50) DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS agent_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        referral_bonus_percent INT DEFAULT 0,
        min_payout_threshold INT DEFAULT 0,
        commission_cycle_days INT DEFAULT 30,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    const [rules] = await connection.query('SELECT COUNT(*) as cnt FROM agent_commission_rules');
    if (rules[0].cnt === 0) {
      await connection.query(`
        INSERT INTO agent_commission_rules (category_name, base_rate, bonus_margin) VALUES 
        ('Face Serum', '15%', '5%'),
        ('Moisturizers', '12%', '3%')
      `);
    }

    const [settings] = await connection.query('SELECT COUNT(*) as cnt FROM agent_settings');
    if (settings[0].cnt === 0) {
      await connection.query(`
        INSERT INTO agent_settings (referral_bonus_percent, min_payout_threshold, commission_cycle_days) VALUES 
        (0, 0, 30)
      `);
    }

    console.log('Tables created and seeded successfully.');
  } catch (err) {
    console.error('Error:', err.message);
  }
  
  await connection.end();
}
setup();
