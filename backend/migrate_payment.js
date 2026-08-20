const db = require('./db');
async function migrate() {
  try {
    await db.query("ALTER TABLE stock_requests ADD COLUMN payment_status VARCHAR(20) DEFAULT 'Pending'");
    console.log('payment_status added');
  } catch(e) { console.log('payment_status:', e.code === 'ER_DUP_FIELDNAME' ? 'already exists' : e.message); }

  try {
    await db.query("ALTER TABLE stock_requests ADD COLUMN payment_id VARCHAR(100) DEFAULT NULL");
    console.log('payment_id added');
  } catch(e) { console.log('payment_id:', e.code === 'ER_DUP_FIELDNAME' ? 'already exists' : e.message); }

  try {
    await db.query("ALTER TABLE stock_requests ADD COLUMN payment_method VARCHAR(50) DEFAULT 'Cash'");
    console.log('payment_method added');
  } catch(e) { console.log('payment_method:', e.code === 'ER_DUP_FIELDNAME' ? 'already exists' : e.message); }

  console.log('Migration complete!');
  process.exit(0);
}
migrate();
