const mysql = require('mysql2/promise');
require('dotenv').config();

async function check() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    const [rows] = await connection.query('DESCRIBE agent_commissions');
    console.log(rows);
  } catch (err) {
    console.error(err);
  }
  await connection.end();
}
check();
