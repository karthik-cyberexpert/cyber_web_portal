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
        d.name as department_name,
        d.code as department_code,
        ta.assigned_at
      FROM tutor_assignments ta
      JOIN users u ON ta.faculty_id = u.id
      JOIN sections s ON ta.section_id = s.id
      JOIN batches b ON ta.batch_id = b.id
      JOIN departments d ON b.department_id = d.id
      WHERE ta.is_active = TRUE
      ORDER BY b.start_year DESC, s.name ASC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Get Tutors Error:', error);
    res.status(500).json({ message: 'Error fetching tutors' });
  }
};

// Assign Tutor (Faculty -> Section)
export const assignTutor = async (req: Request, res: Response) => {
  const { facultyId, sectionId, batchId } = req.body;
  // academic_year could be derived or passed. For now, we'll keep it simple or null.
  
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Check if section already has an active tutor?
    // Ideally, a section has only one active class in-charge.
    const [existing]: any = await connection.query(
      'SELECT id FROM tutor_assignments WHERE section_id = ? AND is_active = TRUE',
      [sectionId]
    );

    if (existing.length > 0) {
      // Deactivate previous tutor for this section? Or block?
      // Let's block for now, or auto-revoke. Auto-revoke is better UX usually, or explicit replace.
      // We'll throw error to let user decide, or just deactivate old one.
      // Let's deactivate old one.
      await connection.query(
        'UPDATE tutor_assignments SET is_active = FALSE, revoked_at = NOW() WHERE section_id = ? AND is_active = TRUE',
        [sectionId]
      );
      
      // Also update section table to NULL
      await connection.query('UPDATE sections SET class_incharge_id = NULL WHERE id = ?', [sectionId]);
    }

    // 2. Create new assignment
    await connection.execute(
      'INSERT INTO tutor_assignments (faculty_id, section_id, batch_id) VALUES (?, ?, ?)',
      [facultyId, sectionId, batchId]
    );

    // 3. Update sections table denormalized column
    await connection.execute(
      'UPDATE sections SET class_incharge_id = ? WHERE id = ?',
      [facultyId, sectionId]
    );
    
    // 4. Also Ensure user has 'tutor' role? 
    // The requirement says "faculty = tutor". So maybe we don't strictly need 'tutor' role in users table 
    // unless we want to distinguish. But users.role is ENUM.
    // If we want them to have tutor privileges, we might need to handle roles. 
    // For now, checks are often `role IN ('faculty', 'tutor')`.
    // We won't change their primary role to 'tutor' because they are still 'faculty'.
    
    await connection.commit();
    res.status(201).json({ message: 'Tutor assigned successfully' });

  } catch (error) {
    await connection.rollback();
    console.error('Assign Tutor Error:', error);
    res.status(500).json({ message: 'Error assigning tutor' });
  } finally {
    connection.release();
  }
};

// Revoke Tutor (Delete Assignment)
export const deleteTutor = async (req: Request, res: Response) => {
  const { id } = req.params; // assignment id

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Get details to clean up sections table
    const [rows]: any = await connection.query('SELECT section_id FROM tutor_assignments WHERE id = ?', [id]);
    
    if (rows.length > 0) {
        const { section_id } = rows[0];
        
        // Soft delete / Deactivate
        await connection.query(
            'UPDATE tutor_assignments SET is_active = FALSE, revoked_at = NOW() WHERE id = ?',
            [id]
        );
        
        // Clean up section
        await connection.query(
            'UPDATE sections SET class_incharge_id = NULL WHERE id = ?',
            [section_id]
        );
    }

    await connection.commit();
    res.json({ message: 'Tutor assignment revoked successfully' });

  } catch (error) {
    await connection.rollback();
    console.error('Revoke Tutor Error:', error);
    res.status(500).json({ message: 'Error revoking tutor assignment' });
  } finally {
    connection.release();
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
                s.name as section_name
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
                message: "You are not assigned as a Class In-charge." 
            });
        }

        const assignment = assignments[0];

        // 2. Fetch Students in that Batch & Section
        const [rows]: any = await pool.query(`
             SELECT 
                u.id, 
                u.name, 
                u.email, 
                u.phone,
                u.avatar_url as avatar,
                sp.roll_number as rollNumber,
                sp.register_number as registerNumber,
                sp.cgpa
            FROM users u
            JOIN student_profiles sp ON u.id = sp.user_id
            WHERE sp.batch_id = ? AND sp.section_id = ? AND u.role = 'student'
            ORDER BY sp.roll_number ASC
        `, [assignment.batch_id, assignment.section_id]);

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
