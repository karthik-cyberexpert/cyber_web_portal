import { pool } from './db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  try {
    console.log('Running semester pending migration...');
    
    // Check if column already exists
    const [columns]: any = await pool.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'batches' 
      AND COLUMN_NAME = 'semester_dates_pending'
    `);

    if (columns.length === 0) {
      // Add semester_dates_pending column
      await pool.query(`
        ALTER TABLE batches 
        ADD COLUMN semester_dates_pending BOOLEAN DEFAULT FALSE
      `);
      console.log('✓ Added semester_dates_pending column');
    } else {
      console.log('✓ Column already exists, skipping ADD');
    }

    // Update existing batches where semester has ended but flag not set
    const [result]: any = await pool.query(`
      UPDATE batches 
      SET semester_dates_pending = TRUE 
      WHERE semester_end_date IS NOT NULL 
        AND semester_end_date < CURDATE()
        AND semester_dates_pending = FALSE
    `);
    console.log(`✓ Updated ${result.affectedRows || 0} batches with pending semester status`);

    console.log('Migration completed successfully!');
  } catch (error: any) {
    console.error('Error running migration:', error.message);
  } finally {
    process.exit();
  }
}

runMigration();
