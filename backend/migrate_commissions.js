const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    // We will try to add missing columns. If they exist, it will throw, so we catch and ignore or do it step by step
    const queries = [
      "ALTER TABLE agent_commissions ADD COLUMN order_id INT;",
      "ALTER TABLE agent_commissions ADD COLUMN order_amount DECIMAL(15,2);",
      "ALTER TABLE agent_commissions CHANGE COLUMN amount commission_amount DECIMAL(15,2);",
      "ALTER TABLE agent_commissions ADD COLUMN commission_rate VARCHAR(50);",
      "ALTER TABLE agent_commissions ADD COLUMN category_name VARCHAR(100);",
      "ALTER TABLE agent_commissions ADD COLUMN referral_level VARCHAR(100);",
      "ALTER TABLE agent_commissions ADD COLUMN level_number INT;",
      "ALTER TABLE agent_commissions ADD COLUMN triggered_by INT;"
    ];

    for (let q of queries) {
      try {
        await connection.query(q);
        console.log("Success:", q);
      } catch (e) {
        console.log("Skipped or Error:", q, e.message);
      }
    }
    console.log("Migration complete.");
  } catch (err) {
    console.error(err);
  }
  await connection.end();
}
migrate();
