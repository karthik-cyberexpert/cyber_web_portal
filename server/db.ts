import mysql, { Pool, PoolConnection } from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Load environment variables from various possible locations
const envPaths = [
  path.join(process.cwd(), '.env'),
  path.join(__dirname, '.env'),
  path.join(__dirname, '../.env'),
  path.join(__dirname, '../../.env')
];

for (const envPath of envPaths) {
  dotenv.config({ path: envPath });
}


/**
 * Enhanced Database Connection Pool
 * Normalized context and robust error handling
 */
class Database {
    private static instance: Database;
    private pool: Pool;

    private constructor() {
        const config = {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'cyber_dept_portal',
            waitForConnections: true,
            connectionLimit: 15,
            queueLimit: 0,
            dateStrings: true,
            enableKeepAlive: true,
            keepAliveInitialDelay: 10000
        };

        console.log(`[DB] Initializing Pool for ${config.database} at ${config.host}`);
        this.pool = mysql.createPool(config);

        // Test Connection
        this.pool.getConnection()
            .then(conn => {
                console.log('[DB] Connection established successfully.');
                conn.release();
            })
            .catch(err => {
                console.error('[DB] Failed to connect to database:', err.message);
            });
    }

    public static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    public async query<T = any>(sql: string, params?: any[]): Promise<[T[], any]> {
        try {
            return await this.pool.query(sql, params) as [T[], any];
        } catch (error: any) {
            console.error('[DB] Query Error:', { sql, params, error: error.message });
            throw error;
        }
    }

    public async execute(sql: string, params?: any[]): Promise<any> {
        try {
            const [result] = await this.pool.execute(sql, params);
            return result;
        } catch (error: any) {
            console.error('[DB] Execute Error:', { sql, params, error: error.message });
            throw error;
        }
    }

    public async getConnection(): Promise<PoolConnection> {
        return await this.pool.getConnection();
    }

    public getPool(): Pool {
        return this.pool;
    }
}

export const db = Database.getInstance();
export const pool = db.getPool(); // Maintain export for legacy compatibility
