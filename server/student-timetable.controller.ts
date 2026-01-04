import { Request, Response } from 'express';
import { pool } from './db.js';

// Get student timetable based on their section
export const getStudentTimetable = async (req: Request | any, res: Response) => {
    const studentId = req.user?.id;

    if (!studentId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        // Get student's section
        const [students]: any = await pool.query(
            `SELECT section_id FROM student_profiles WHERE user_id = ?`,
            [studentId]
        );

        if (students.length === 0) {
            return res.status(404).json({ message: 'Student profile not found' });
        }

        const sectionId = students[0].section_id;

        // Fetch timetable slots for the student's section
        // FIX: Strict Filter - Active allocations & Current Semester
        const [timetable]: any = await pool.query(
            `SELECT 
                ts.id,
                ts.day_of_week,
                ts.period_number,
                ts.room_number,
                ts.start_time,
                ts.end_time,
                s.name as subject_name,
                s.code as subject_code,
                s.type as subject_type,
                u.name as faculty_name
             FROM timetable_slots ts
             LEFT JOIN subject_allocations sa ON ts.subject_allocation_id = sa.id
             LEFT JOIN subjects s ON sa.subject_id = s.id
             LEFT JOIN users u ON sa.faculty_id = u.id
             JOIN sections sec ON ts.section_id = sec.id
             JOIN batches b ON sec.batch_id = b.id
             WHERE ts.section_id = ?
               AND sa.is_active = TRUE
               AND s.semester = b.current_semester
             ORDER BY 
                FIELD(ts.day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'),
                ts.period_number`,
            [sectionId]
        );

        // Format time table data by day and period
        const formattedTimetable: any = {
            Monday: [],
            Tuesday: [],
            Wednesday: [],
            Thursday: [],
            Friday: [],
            Saturday: []
        };

        timetable.forEach((slot: any) => {
            if (formattedTimetable[slot.day_of_week]) { // Safety check
                formattedTimetable[slot.day_of_week].push({
                    period: slot.period_number,
                    subject: slot.subject_name || 'Free Period',
                    code: slot.subject_code || '',
                    type: slot.subject_type || '',
                    faculty: slot.faculty_name || '',
                    room: slot.room_number || '',
                    startTime: slot.start_time,
                    endTime: slot.end_time
                });
            }
        });

        // Get syllabus - all subjects allocated to student's section with faculty
        // FIX: Strict Filter - Active allocations & Current Semester
        const [syllabusData]: any = await pool.query(
            `SELECT DISTINCT
                s.id,
                s.name as subject_name,
                s.code as subject_code,
                s.type as subject_type,
                s.credits,
                u.name as faculty_name
             FROM subject_allocations sa
             JOIN subjects s ON sa.subject_id = s.id
             JOIN users u ON sa.faculty_id = u.id
             JOIN sections sec ON sa.section_id = sec.id
             JOIN batches b ON sec.batch_id = b.id
             WHERE sa.section_id = ?
               AND sa.is_active = TRUE
               AND s.semester = b.current_semester
             ORDER BY s.name`,
            [sectionId]
        );

        console.log('=== STUDENT TIMETABLE DEBUG ===');
        console.log('Student ID:', studentId);
        console.log('Section ID:', sectionId);
        console.log('Total slots:', timetable.length);
        console.log('Syllabus subjects:', syllabusData.length);

        res.json({
            sectionId,
            timetable: formattedTimetable,
            syllabus: syllabusData
        });
    } catch (error) {
        console.error('Get Student Timetable Error:', error);
        res.status(500).json({ message: 'Error fetching timetable' });
    }
};
