import { Request, Response } from 'express';
import { pool } from './db.js';
import { RowDataPacket } from 'mysql2';
import { getStudentAttendancePercentage } from './attendance.utils.js';

// Get All Tutors (Assignments)
export const getAllTutors = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        ta.id,
        ta.faculty_id,
        u.name as faculty_name,
        u.email as faculty_email,
        u.phone as faculty_phone,
        u.avatar_url as faculty_avatar,
        ta.section_id,
        s.name as section_name,
        ta.batch_id,
        b.name as batch_name,
        ta.reg_number_start,
        ta.reg_number_end,
        ta.assigned_at,
        ta.is_active
      FROM tutor_assignments ta
      JOIN users u ON ta.faculty_id = u.id
      JOIN sections s ON ta.section_id = s.id
      JOIN batches b ON ta.batch_id = b.id
      WHERE ta.is_active = TRUE
      ORDER BY b.start_year DESC, s.name ASC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Get Tutors Error:', error);
    res.status(500).json({ message: 'Error fetching tutors' });
  }
};

// Assign Tutor (Faculty -> Section with Range)
export const assignTutor = async (req: Request, res: Response) => {
  const { facultyId, sectionId, batchId, reg_number_start, reg_number_end } = req.body;
  
  try {
    // We allow multiple tutors per section now based on ranges.
    // Overlap check could be added here later if needed.
    
    await pool.execute(
      'INSERT INTO tutor_assignments (faculty_id, section_id, batch_id, reg_number_start, reg_number_end) VALUES (?, ?, ?, ?, ?)',
      [
        facultyId || null, 
        sectionId || null, 
        batchId || null, 
        reg_number_start || null, 
        reg_number_end || null
      ]
    );

    res.status(201).json({ message: 'Tutor assigned successfully' });
  } catch (error) {
    console.error('Assign Tutor Error:', error);
    res.status(500).json({ message: 'Error assigning tutor' });
  }
};

// Revoke Tutor (Delete Assignment)
export const deleteTutor = async (req: Request, res: Response) => {
  const { id } = req.params; // assignment id

  try {
    await pool.query('UPDATE tutor_assignments SET is_active = FALSE WHERE id = ?', [id]);
    res.json({ message: 'Tutor assignment revoked successfully' });
  } catch (error) {
    console.error('Revoke Tutor Error:', error);
    res.status(500).json({ message: 'Error revoking tutor assignment' });
  }
};

// Get Tutor's Class List
export const getTutorClass = async (req: Request | any, res: Response) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    try {
        // 1. Find Active Assignment
        const [assignments]: any = await pool.query(`
            SELECT 
                ta.batch_id, 
                b.name as batch_name,
                ta.section_id, 
                s.name as section_name,
                ta.reg_number_start,
                ta.reg_number_end
            FROM tutor_assignments ta
            JOIN batches b ON ta.batch_id = b.id
            JOIN sections s ON ta.section_id = s.id
            WHERE ta.faculty_id = ? AND ta.is_active = TRUE
            LIMIT 1
        `, [userId]);

        if (assignments.length === 0) {
            return res.json({ 
                hasAssignment: false, 
                students: [],
                message: "You are not assigned as a Tutor." 
            });
        }

        const assignment = assignments[0];

        // 2. Fetch Students in that Batch & Section within the Range
        let studentQuery = `
             SELECT * FROM (
                 SELECT 
                    u.id, 
                    u.name, 
                    u.email, 
                    u.phone,
                    u.avatar_url as avatar,
                    sp.roll_number as rollNumber,
                    sp.register_number as registerNumber,
                    sp.cgpa,
                    ROW_NUMBER() OVER (ORDER BY sp.roll_number ASC) as row_num
                FROM users u
                JOIN student_profiles sp ON u.id = sp.user_id
                WHERE sp.batch_id = ? AND sp.section_id = ? AND u.role = 'student'
            ) as ranked_students
        `;
        const queryParams: any[] = [assignment.batch_id, assignment.section_id];

        if (assignment.reg_number_start && assignment.reg_number_end) {
            studentQuery += ` WHERE row_num >= ? AND row_num <= ?`;
            queryParams.push(parseInt(assignment.reg_number_start), parseInt(assignment.reg_number_end));
        }

        studentQuery += ` ORDER BY rollNumber ASC`;

        const [rows]: any = await pool.query(studentQuery, queryParams);

        // Calculate attendance and certifications for each student
        const studentsWithData = await Promise.all(
            rows.map(async (student: any) => {
                const attendanceData = await getStudentAttendancePercentage(student.id);
                // Count approved certifications
                const [certRows]: any = await pool.query(
                    'SELECT COUNT(*) as certCount FROM eca_achievements WHERE student_id = ? AND status = "Approved"',
                    [student.id]
                );
                return {
                    ...student,
                    attendance: attendanceData.attendancePercentage,
                    cgpa: Number(student.cgpa || 0),
                    certifications: certRows[0].certCount || 0
                };
            })
        );

        res.json({
            hasAssignment: true,
            batch: assignment.batch_name,
            section: assignment.section_name,
            batchId: assignment.batch_id,
            sectionId: assignment.section_id,
            students: studentsWithData
        });

    } catch (error) {
        console.error('Get Tutor Class Error:', error);
        res.status(500).json({ message: 'Error fetching class data' });
    }
};
// Get Tutor's Class Timetable
export const getTutorTimetable = async (req: Request | any, res: Response) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    try {
        // 1. Find Active Assignment to get Batch/Section
        const [assignments]: any = await pool.query(`
            SELECT batch_id, section_id FROM tutor_assignments 
            WHERE faculty_id = ? AND is_active = TRUE 
            LIMIT 1
        `, [userId]);

        if (assignments.length === 0) {
            return res.json([]); // No assignment, empty timetable
        }

        const { batch_id, section_id } = assignments[0];

        // 2. Fetch Timetable Slots for this Section
        const [slots]: any = await pool.query(`
            SELECT 
                ts.day_of_week as day,
                ts.period_number as period,
                ts.room_number as room,
                ts.start_time as startTime,
                ts.end_time as endTime,
                s.name as subject,
                s.code as subjectCode,
                s.type as type,
                u.name as facultyName,
                u.id as facultyId
            FROM timetable_slots ts
            JOIN subject_allocations sa ON ts.subject_allocation_id = sa.id
            JOIN subjects s ON sa.subject_id = s.id
            JOIN users u ON sa.faculty_id = u.id
            JOIN sections sec ON ts.section_id = sec.id
            JOIN batches b ON sec.batch_id = b.id
            WHERE ts.section_id = ?
              AND sa.is_active = TRUE 
              AND s.semester = b.current_semester -- Key: Sync with Batch Semester
            ORDER BY FIELD(day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'), ts.period_number
        `, [section_id]);

        res.json(slots);

    } catch (error) {
        console.error('Get Tutor Timetable Error:', error);
        res.status(500).json({ message: 'Error fetching timetable' });
    }
};
