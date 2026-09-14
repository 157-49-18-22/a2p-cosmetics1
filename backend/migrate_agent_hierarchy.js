const db = require('./db');

async function migrateAgentHierarchy() {
  console.log('🚀 Running Agent Hierarchy Migration...');
  try {
    // Add role column if missing
    try {
      await db.query(`ALTER TABLE agents ADD COLUMN role VARCHAR(100) DEFAULT 'Sales Rep' AFTER status`);
      console.log('✅ Added "role" column to agents table.');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME' || err.errno === 1060) {
        console.log('ℹ️ "role" column already exists in agents table.');
      } else {
        console.error('❌ Error adding "role" column:', err.message);
      }
    }

    // Add parent_id column if missing
    try {
      await db.query(`ALTER TABLE agents ADD COLUMN parent_id INT DEFAULT NULL AFTER role`);
      console.log('✅ Added "parent_id" column to agents table.');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME' || err.errno === 1060) {
        console.log('ℹ️ "parent_id" column already exists in agents table.');
      } else {
        console.error('❌ Error adding "parent_id" column:', err.message);
      }
    }

    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateAgentHierarchy();
