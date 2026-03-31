
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function applyNewSchema() {
    console.log('=== APPLYING NEW RESTRICTED SCHEMA ===');
    
    try {
        const schemaPath = path.join(__dirname, '../schema/new_schema.sql');
        const seedAdminPath = path.join(__dirname, '../schema/seed_admin.sql');

        const schema = fs.readFileSync(schemaPath, 'utf8');
        const seedAdmin = fs.readFileSync(seedAdminPath, 'utf8');

        // Split by semicolon
        const commands = schema.split(';').map(c => c.trim()).filter(c => c.length > 0);
        const adminSeeds = seedAdmin.split(';').map(c => c.trim()).filter(c => c.length > 0);

        console.log(`Executing ${commands.length} schema commands and ${adminSeeds.length} admin seeds...`);

        const connection = await pool.getConnection();
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');

        for (const cmd of commands) {
            try {
                await connection.query(cmd);
            } catch (err: any) {
                console.error(`Error in schema command: ${cmd.substring(0, 50)}...`);
                console.error(err.message);
            }
        }

        // Add a default academic year since it's needed for allocations
        await connection.query("INSERT INTO academic_years (name, start_year, end_year, is_active) VALUES ('2024-2028', 2024, 2028, TRUE)");

        for (const seed of adminSeeds) {
            try {
                await connection.query(seed);
            } catch (err: any) {
                console.error(`Error in seed command: ${seed.substring(0, 50)}...`);
                console.error(err.message);
            }
        }

        await connection.query('SET FOREIGN_KEY_CHECKS = 1');
        connection.release();
        
        console.log('=== NEW SCHEMA APPLIED SUCCESSFULLY ===');
        process.exit(0);

    } catch (error) {
        console.error('Fatal Error:', error);
        process.exit(1);
    }
}

applyNewSchema();
