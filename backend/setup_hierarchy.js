const mysql = require('mysql2/promise');
require('dotenv').config();

async function addParentId() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    const [columns] = await connection.query("SHOW COLUMNS FROM agents LIKE 'parent_id'");
    if (columns.length === 0) {
      await connection.query("ALTER TABLE agents ADD COLUMN parent_id INT DEFAULT NULL");
      console.log('parent_id column added.');
    }

    const [agents] = await connection.query("SELECT id FROM agents LIMIT 5");
    if (agents.length >= 3) {
      const id1 = agents[0].id;
      const id2 = agents[1].id;
      const id3 = agents[2].id;
      await connection.query("UPDATE agents SET parent_id = ? WHERE id = ?", [id1, id2]);
      await connection.query("UPDATE agents SET parent_id = ? WHERE id = ?", [id2, id3]);
      console.log('Hierarchy test data linked.');
    }
    
    const [roleCols] = await connection.query("SHOW COLUMNS FROM agents LIKE 'role'");
    if (roleCols.length === 0) {
      await connection.query("ALTER TABLE agents ADD COLUMN role VARCHAR(100) DEFAULT 'Sales Rep'");
      await connection.query("UPDATE agents SET role = 'Master Agent' WHERE parent_id IS NULL");
      await connection.query("UPDATE agents SET role = 'Sub Agent' WHERE parent_id IS NOT NULL");
      console.log('Role column added.');
    }

  } catch (err) {
    console.error('Error:', err.message);
  }
  
  await connection.end();
}
addParentId();
