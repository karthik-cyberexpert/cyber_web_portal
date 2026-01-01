import { pool } from './db.js';

async function runMigration() {
  try {
    console.log('Running circulars full migration...');
    
    // Get all existing columns
    const [existingColumns]: any = await pool.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'circulars'
    `);
    
    const columnNames = existingColumns.map((col: any) => col.COLUMN_NAME);
    console.log('Existing columns:', columnNames);
    
    // Add is_published if missing
    if (!columnNames.includes('is_published')) {
      await pool.query(`
        ALTER TABLE circulars 
        ADD COLUMN is_published BOOLEAN DEFAULT TRUE AFTER attachment_url
      `);
      console.log('✓ Added is_published column');
    }
    
    // Add published_at if missing
    if (!columnNames.includes('published_at')) {
      await pool.query(`
        ALTER TABLE circulars 
        ADD COLUMN published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER is_published
      `);
      console.log('✓ Added published_at column');
    }
    
    // Add expiry_date if missing
    if (!columnNames.includes('expiry_date')) {
      await pool.query(`
        ALTER TABLE circulars 
        ADD COLUMN expiry_date DATE NULL AFTER published_at
      `);
      console.log('✓ Added expiry_date column');
    }
    
    console.log('Migration completed successfully!');
  } catch (error: any) {
    console.error('Error running migration:', error.message);
  } finally {
    process.exit();
  }
}

runMigration();
