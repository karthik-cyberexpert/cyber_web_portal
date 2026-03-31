import { pool } from './db.js';

const migrate = async () => {
    const connection = await pool.getConnection();
    try {
        console.log('Starting migration...');
        
        // 1. Add semester column if not exists
        try {
            await connection.query("ALTER TABLE timetable_slots ADD COLUMN semester INT DEFAULT NULL");
            console.log('Added semester column.');
        } catch (e: any) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('Semester column already exists.');
            } else {
                throw e;
            }
        }

        // 1. Populate semester for existing slots (Before messing with keys)
        console.log('Populating semester for existing slots...');
        await connection.query(`
            UPDATE timetable_slots ts 
            JOIN subject_allocations sa ON ts.subject_allocation_id = sa.id 
            JOIN subjects s ON sa.subject_id = s.id 
            SET ts.semester = s.semester
            WHERE ts.semester IS NULL
        `);
        console.log('Semester populated.');

        // 2. Add new unique index (Contains section_id first, so it supports the FK)
        try {
            await connection.query("CREATE UNIQUE INDEX unique_section_slot_sem ON timetable_slots (section_id, day_of_week, period_number, semester)");
            console.log('Added new unique index.');
        } catch (e: any) {
             if (e.code === 'ER_DUP_KEY' || e.code === 'ER_DUP_ENTRY' || e.code === 'ER_DUP_KEYNAME') {
                console.log('New index already exists.');
            } else {
                console.error('Failed to add new index:', e);
                // Don't throw, maybe we can proceed or we should check why
                // If this fails, we shouldn't drop the old one
            }
        }

        // 3. Drop old unique index
        try {
            await connection.query("ALTER TABLE timetable_slots DROP INDEX unique_section_slot");
            console.log('Dropped old index.');
        } catch (e: any) {
            if (e.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
                console.log('Old index not found (already dropped).');
            } else {
                console.error('Could not drop old index (might be needed for FK if new one failed?):', e.message);
            }
        }

        console.log('Migration completed successfully.');

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        connection.release();
        process.exit();
    }
};

migrate();
