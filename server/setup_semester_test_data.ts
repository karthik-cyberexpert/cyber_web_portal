import { pool } from './db.js';

async function setupTestData() {
  try {
    console.log('Setting up semester test data...');
    
    // Set batch 2024-2028 to semester 3 with end date Dec 31, 2025
    await pool.query(`
      UPDATE batches 
      SET current_semester = 3,
          semester_start_date = '2025-07-01',
          semester_end_date = '2025-12-31',
          semester_dates_pending = FALSE
      WHERE name = '2024-2028'
    `);
    console.log('✓ Updated 2024-2028 to semester 3 (ends Dec 31, 2025)');

    // Set batch 2025-2029 to semester 1 with end date Dec 31, 2025
    await pool.query(`
      UPDATE batches 
      SET current_semester = 1,
          semester_start_date = '2025-07-01',
          semester_end_date = '2025-12-31',
          semester_dates_pending = FALSE
      WHERE name = '2025-2029'
    `);
    console.log('✓ Updated 2025-2029 to semester 1 (ends Dec 31, 2025)');

    // List all batches to verify
    const [batches]: any = await pool.query(`
      SELECT name, current_semester, semester_start_date, semester_end_date, semester_dates_pending
      FROM batches
      ORDER BY name
    `);
    console.log('\nCurrent batch status:');
    console.table(batches);

    console.log('\nTest data setup completed!');
    console.log('Now when admin loads dashboard on Jan 1, 2026:');
    console.log('- 2024-2028 will auto-increment to semester 4 and show popup');
    console.log('- 2025-2029 will auto-increment to semester 2 and show popup');
  } catch (error: any) {
    console.error('Error setting up test data:', error.message);
  } finally {
    process.exit();
  }
}

setupTestData();
