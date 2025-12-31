import { db } from './db';
import fs from 'fs';
import path from 'path';

async function runSchema() {
  try {
    const schemaPath = path.join(__dirname, '..', 'schema', 'create_calendar_events_table.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Running schema migration...');
    await db.query(schemaSql);
    console.log('Schema migration completed successfully.');
  } catch (error) {
    console.error('Error running schema migration:', error);
  } finally {
    process.exit();
  }
}

runSchema();
