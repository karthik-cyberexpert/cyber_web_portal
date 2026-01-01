import { pool } from './db.js';

async function runMigration() {
  try {
    console.log('Running subject_allocations is_active migration...');
    
    // Check if column already exists
    const [columns]: any = await pool.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'subject_allocations' 
      AND COLUMN_NAME = 'is_active'
    `);

    if (columns.length === 0) {
      // Add is_active column
      await pool.query(`
        ALTER TABLE subject_allocations 
        ADD COLUMN is_active BOOLEAN DEFAULT TRUE
      `);
      console.log('✓ Added is_active column to subject_allocations');
    } else {
      console.log('✓ Column is_active already exists');
    }

    // Add index for faster queries
    try {
      await pool.query(`
        CREATE INDEX idx_sa_is_active ON subject_allocations(is_active)
      `);
      console.log('✓ Created index on is_active');
    } catch (e: any) {
      if (e.code === 'ER_DUP_KEYNAME') {
        console.log('✓ Index already exists');
      } else {
        console.error('Index error:', e.message);
      }
    }

    console.log('Migration completed successfully!');
  } catch (error: any) {
    console.error('Error running migration:', error.message);
  } finally {
    process.exit();
  }
}

runMigration();
