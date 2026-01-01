import { pool } from './db.js';

async function checkSchema() {
  try {
    const [cols] = await pool.query('SHOW COLUMNS FROM circulars');
    console.log('Circulars table columns:');
    console.log('=======================');
    (cols as any[]).forEach(c => {
      console.log(`${c.Field.padEnd(25)} ${c.Type}`);
    });
    
    // Get the type enum values
    const typeCol = (cols as any[]).find(c => c.Field === 'type');
    if (typeCol) {
      console.log('\nType ENUM values:', typeCol.Type);
    }
  } catch (error: any) {
    console.error('Error:', error.message);
  } finally {
    process.exit();
  }
}

checkSchema();
