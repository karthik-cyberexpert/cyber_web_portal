import { Request, Response } from 'express';
import { pool } from './db.js';

// Get faculty class statistics
export const getClassStatistics = async (req: Request | any, res: Response) => {
    const facultyId = req.user?.id;

    if (!facultyId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        // Get all allocations with real student counts
        const query = `
            SELECT 
                sa.id as allocation_id,
                sub.id as subject_id,
                sub.name as subject_name,
                sub.code as subject_code,
                s.id as section_id,
                s.name as section_name,
                b.id as batch_id,
                b.name as batch_name,
                (
                    SELECT COUNT(*) 
                    FROM student_profiles sp 
                    WHERE sp.section_id = s.id
                ) as student_count
            FROM subject_allocations sa
            JOIN subjects sub ON sa.subject_id = sub.id
            JOIN sections s ON sa.section_id = s.id
            JOIN batches b ON s.batch_id = b.id
            WHERE sa.faculty_id = ?
            ORDER BY b.name, s.name, sub.name
        `;

        const [allocations]: any = await pool.query(query, [facultyId]);

        console.log('=== CLASS STATS DEBUG ===');
        console.log('Faculty ID:', facultyId);
        console.log('Allocations found:', allocations.length);
        if (allocations.length > 0) {
            console.log('Sample allocation:', allocations[0]);
        }

        // Get next class timing from timetable_slots
        let timetableData: any[] = [];
        try {
            const timetableQuery = `
                SELECT 
                    sa.subject_id,
                    sa.section_id,
                    ts.day_of_week,
                    ts.start_time,
                    ts.period_number,
                    ts.room_number
                FROM timetable_slots ts
                JOIN subject_allocations sa ON ts.subject_allocation_id = sa.id
                WHERE sa.faculty_id = ?
                ORDER BY 
                    CASE 
                        WHEN ts.day_of_week = 'Monday' THEN 1
                        WHEN ts.day_of_week = 'Tuesday' THEN 2
                        WHEN ts.day_of_week = 'Wednesday' THEN 3
                        WHEN ts.day_of_week = 'Thursday' THEN 4
                        WHEN ts.day_of_week = 'Friday' THEN 5
                        WHEN ts.day_of_week = 'Saturday' THEN 6
                        ELSE 7
                    END,
                    ts.start_time
            `;
            const [timetable]: any = await pool.query(timetableQuery, [facultyId]);
            timetableData = timetable;
            console.log('Timetable slots found:', timetableData.length);
            if (timetableData.length > 0) {
                console.log('Sample timetable slot:', timetableData[0]);
            }
        } catch (e: any) {
            // Timetable might not have data yet
            console.error('Timetable query error:', e.message);
        }

        // Create a map of next classes
        const nextClassMap = new Map();
        const roomMap = new Map();
        const today = new Date().getDay();
        const currentTime = new Date().toTimeString().slice(0, 5);

        console.log('Current day index:', today, '(0=Sunday, 1=Monday, ..., 5=Friday)');
        console.log('Current time:', currentTime);

        timetableData.forEach((slot: any) => {
            const key = `${slot.subject_id}_${slot.section_id}`;
            
            // Always set room number if available
            if (slot.room_number && !roomMap.has(key)) {
                roomMap.set(key, slot.room_number);
            }
            
            // Calculate next class only if we don't have one yet
            if (!nextClassMap.has(key)) {
                const dayIndex = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(slot.day_of_week);
                
                let nextClass = '';
                const periodText = slot.period_number ? ` - Period ${slot.period_number}` : '';
                
                if (slot.start_time) {
                    // If we have a start time, calculate properly
                    const timeStr = slot.start_time.slice(0, 5);
                    if (dayIndex === today && slot.start_time > currentTime) {
                        nextClass = `Today, ${timeStr}${periodText}`;
                    } else if (dayIndex > today || (dayIndex < today)) {
                        // Include week wrap-around: Monday (1) after Friday (5)
                        nextClass = `${slot.day_of_week}, ${timeStr}${periodText}`;
                    }
                } else {
                    // If no start time, just show the day and period
                    // For any future day (including next week), show it
                    if (dayIndex === today) {
                        nextClass = `Today${periodText}`;
                    } else {
                        // Show next occurrence of this day
                        nextClass = `${slot.day_of_week}${periodText}`;
                    }
                }
                
                if (nextClass) {
                    nextClassMap.set(key, nextClass);
                }
            }
        });

        console.log('Next class map:', Array.from(nextClassMap.entries()));
        console.log('Room map:', Array.from(roomMap.entries()));

        // Enrich allocations with computed data
        const enrichedAllocations = allocations.map((alloc: any) => {
            const key = `${alloc.subject_id}_${alloc.section_id}`;
            return {
                ...alloc,
                next_class: nextClassMap.get(key) || 'TBA',
                room_number: roomMap.get(key) || 'TBA',
                progress: 0, // Would need assignment tracking to compute
                attendance_rate: 0 // Attendance table needs proper setup
            };
        });

        res.json(enrichedAllocations);
    } catch (error) {
        console.error('Get Class Statistics Error:', error);
        res.status(500).json({ message: 'Error fetching class statistics' });
    }
};
