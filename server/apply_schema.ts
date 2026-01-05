
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function applySchema() {
    console.log('=== APPLYING SCHEMA & SEEDS ===');
    
    try {
        const schemaPath = path.join(__dirname, '../schema/final_schema.sql');
        const seedAcademicPath = path.join(__dirname, '../schema/seed_academic_data.sql');
        const seedAdminPath = path.join(__dirname, '../schema/seed_admin.sql');

        const schema = fs.readFileSync(schemaPath, 'utf8');
        const seedAcademic = fs.readFileSync(seedAcademicPath, 'utf8');
        const seedAdmin = fs.readFileSync(seedAdminPath, 'utf8');

        // Split by semicolon but ignore inside quotes/comments if possible
        // For simplicity, we split and filter empty
        const commands = schema.split(';').map(c => c.trim()).filter(c => c.length > 0);
        const seeds = [
           ...seedAcademic.split(';').map(c => c.trim()).filter(c => c.length > 0),
           ...seedAdmin.split(';').map(c => c.trim()).filter(c => c.length > 0)
        ];

        console.log(`Executing ${commands.length} schema commands and ${seeds.length} seed commands...`);

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

        for (const seed of seeds) {
            try {
                await connection.query(seed);
            } catch (err: any) {
                console.error(`Error in seed command: ${seed.substring(0, 50)}...`);
                console.error(err.message);
            }
        }

        await connection.query('SET FOREIGN_KEY_CHECKS = 1');
        connection.release();
        
        console.log('=== SCHEMA & SEEDING COMPLETED ===');
        process.exit(0);

    } catch (error) {
        console.error('Fatal Error:', error);
        process.exit(1);
    }
}

applySchema();
