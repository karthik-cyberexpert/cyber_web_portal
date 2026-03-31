
import { pool } from './db.js';

async function checkSchema() {
  try {
    console.log('--- MARKS ---');
    const [c1]: any = await pool.query('DESCRIBE marks');
    console.log(c1.map((c: any) => c.Field));
    
    console.log('--- ASSIGNMENTS ---');
    const [c2]: any = await pool.query('DESCRIBE assignments');
    console.log(c2.map((c: any) => c.Field));
    
    console.log('--- SUBJECT_ALLOCATIONS ---');
    const [c3]: any = await pool.query('DESCRIBE subject_allocations');
    console.log(c3.map((c: any) => c.Field));

    console.log('--- ASSIGNMENT_SUBMISSIONS ---');
    const [c4]: any = await pool.query('DESCRIBE assignment_submissions');
    console.log(c4.map((c: any) => c.Field));

  } catch(e) { console.error('Error:', e); }
  finally { await pool.end(); }
}
checkSchema();
