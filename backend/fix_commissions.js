const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixAll() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    const [orders] = await connection.query(`
      SELECT o.id as orderId, o.total_amount, o.referral_agent_id 
      FROM orders o 
      WHERE o.referral_code IS NOT NULL 
      AND o.id NOT IN (SELECT order_id FROM agent_commissions)
    `);
    
    for (let order of orders) {
      const { orderId, total_amount, referral_agent_id } = order;
      if (!referral_agent_id) continue;
      
      const category = 'General';
      await connection.query(
        `INSERT INTO agent_commissions 
         (agent_id, order_id, order_amount, commission_amount, commission_rate, category_name, referral_level, level_number, status, triggered_by)
         SELECT 
           a.id, ?, ?,
           ROUND(? * CAST(REPLACE(r.base_rate, '%', '') AS DECIMAL(5,2)) / 100, 2),
           r.base_rate, ?, 'Level 1 (Sales Rep)', 1, 'Earned', ?
         FROM agents a
         JOIN agent_commission_rules r ON (
           r.status = 'Active'
           AND (r.referral_level = 'Level 1 (Sales Rep)' OR r.referral_level = 'All Levels')
         )
         WHERE a.id = ?
         LIMIT 1`,
        [orderId, total_amount, total_amount, category, referral_agent_id, referral_agent_id]
      );
    }
    console.log("Fixed all missing commissions");
  } catch (err) {
    console.error(err);
  }
  await connection.end();
}
fixAll();
