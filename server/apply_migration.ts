import { pool } from './db.js';
import fs from 'fs';
import path from 'path';

async function migrate(filename: string) {
    try {
        const sql = fs.readFileSync(path.join(process.cwd(), filename), 'utf8');
        const commands = sql.split(';').filter(cmd => cmd.trim());
        
        console.log(`Starting migration from ${filename}... (${commands.length} commands)`);
        
        for (let cmd of commands) {
            try {
                await pool.query(cmd);
                console.log(`SUCCESS: ${cmd.trim().substring(0, 50)}...`);
            } catch (e: any) {
                console.warn(`SKIPPED/ERROR: ${cmd.trim().substring(0, 50)}... | Error: ${e.message}`);
            }
        }
        
        console.log('Migration finished.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        process.exit();
    }
}

const args = process.argv.slice(2);
const file = args[0] || 'circular_enhancements_202603071135.sql';
migrate(file);
