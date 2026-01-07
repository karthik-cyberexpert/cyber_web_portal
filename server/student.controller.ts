import { Request, Response } from 'express';
import { pool } from './db.js';
import bcrypt from 'bcrypt';
import { getStudentAttendancePercentage } from './attendance.utils.js';

// Get All Students
export const getStudents = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query(`
      SELECT 
        u.id, u.email, u.name, u.role, u.phone, u.avatar_url, u.address,
        sp.roll_number, sp.register_number, sp.dob, sp.gender, sp.blood_group,
        sp.guardian_name, sp.guardian_phone,
        b.name as batch_name, sp.batch_id,
        s.name as section_name, sp.section_id
      FROM users u
      JOIN student_profiles sp ON u.id = sp.user_id
      LEFT JOIN batches b ON sp.batch_id = b.id
      LEFT JOIN sections s ON sp.section_id = s.id
      WHERE u.role = 'student'
      ORDER BY u.name ASC
    `);

    // Calculate attendance for each student
    const studentsWithAttendance = await Promise.all(
      rows.map(async (student: any) => {
        const attendance = await getStudentAttendancePercentage(student.id);
        return {
          ...student,
          attendance_percentage: attendance.attendancePercentage
        };
      })
    );

    res.json(studentsWithAttendance);
  } catch (error: any) {
    console.error('Get Students Error:', error);
    res.status(500).json({ message: 'Error fetching students' });
  }
};

// Create Student
export const createStudent = async (req: Request, res: Response) => {
  const { 
    email, name, password, phone, 
    roll_number, register_number, batch_id, section_id, dob, gender 
  } = req.body;

  if (!register_number) {
    return res.status(400).json({ message: 'Register Number is required' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Create User
    const hashedPassword = await bcrypt.hash(password || 'password123', 10);
    const [userResult]: any = await connection.execute(
      'INSERT INTO users (email, name, password_hash, role, phone, password_changed) VALUES (?, ?, ?, ?, ?, ?)',
      [email, name, hashedPassword, 'student', phone, false]
    );
    const userId = userResult.insertId;

    // 2. Create Profile
    const validDob = dob || null;
    const validGender = gender || null;
    const validBatchId = batch_id || null;
    const validSectionId = section_id || null;

    await connection.execute(
      `INSERT INTO student_profiles (
        user_id, name, roll_number, register_number, batch_id, section_id, dob, gender
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, name, roll_number, register_number, validBatchId, validSectionId, validDob, validGender]
    );

    await connection.commit();
    res.status(201).json({ id: userId, message: 'Student created successfully' });

  } catch (error: any) {
    await connection.rollback();
    console.error('Create Student Error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ message: 'Email or Roll Number already exists' });
    } else {
      res.status(500).json({ message: 'Error creating student' });
    }
  } finally {
    connection.release();
  }
};

// Update Student
export const updateStudent = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { 
    name, phone, email, roll_number, register_number, batch_id, section_id,
    dob, gender, address, guardian_name, guardian_phone
  } = req.body;

  if (!register_number) {
    return res.status(400).json({ message: 'Register Number is required' });
  }

  const connection = await pool.getConnection();

  try {
    // Check for duplicates (Email)
    const [existingEmail]: any = await connection.query(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, id]
    );
    if (existingEmail.length > 0) {
        connection.release();
        return res.status(409).json({ message: 'Email already in use by another student' });
    }

    // Check for duplicates (Roll Number / Register Number)
    const [existingRoll]: any = await connection.query(
        'SELECT user_id FROM student_profiles WHERE (roll_number = ? OR register_number = ?) AND user_id != ?',
        [roll_number, register_number, id]
    );
    if (existingRoll.length > 0) {
        connection.release();
        return res.status(409).json({ message: 'Roll Number or Register Number already assigned to another student' });
    }

    // Sanitize parameters (undefined -> null)
    const validDob = dob ? new Date(dob) : null;
    const sanitizedDob = validDob && !isNaN(validDob.getTime()) ? dob : null;
    
    // Helper to ensure no undefined values pass to SQL
    const s_address = address !== undefined ? address : null;
    const s_gender = gender !== undefined ? gender : null;
    const s_guardian_name = guardian_name !== undefined ? guardian_name : null;
    const s_guardian_phone = guardian_phone !== undefined ? guardian_phone : null;
    const s_batch_id = batch_id !== undefined ? batch_id : null;
    const s_section_id = section_id !== undefined ? section_id : null;

    await connection.beginTransaction();

    await connection.execute(
      'UPDATE users SET name = ?, phone = ?, email = ?, address = ? WHERE id = ?',
      [name, phone, email, s_address, id]
    );

    // Use INSERT ... ON DUPLICATE KEY UPDATE to handle missing profile rows
    await connection.execute(
      `INSERT INTO student_profiles (
         user_id, name, roll_number, register_number, batch_id, section_id, 
         dob, gender, guardian_name, guardian_phone
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         roll_number = VALUES(roll_number),
         register_number = VALUES(register_number),
         batch_id = VALUES(batch_id),
         section_id = VALUES(section_id),
         dob = VALUES(dob),
         gender = VALUES(gender),
         guardian_name = VALUES(guardian_name),
         guardian_phone = VALUES(guardian_phone)`,
      [
        id, name, roll_number, register_number, s_batch_id, s_section_id, 
        sanitizedDob, s_gender, s_guardian_name, s_guardian_phone
      ]
    );

    await connection.commit();
    res.json({ message: 'Student updated successfully' });

  } catch (error: any) {
     await connection.rollback();
     console.error('Update Student Error:', error);
     if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: error.sqlMessage || 'Duplicate entry for Email or Roll/Register Number' });
     }
     res.status(500).json({ message: error.message || 'Error updating student' });
  } finally {
    connection.release();
  }
};

// Delete Student
export const deleteStudent = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await pool.execute('DELETE FROM users WHERE id = ?', [id]);
        res.json({ message: 'Student deleted successfully' });
    } catch (error: any) {
        console.error('Delete Student Error:', error);
        res.status(500).json({ message: 'Error deleting student' });
    }
};

// Get Student Profile (Self)
export const getStudentProfile = async (req: Request | any, res: Response) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const [rows]: any = await pool.query(`
            SELECT 
                u.id, u.email, u.name, u.phone, u.avatar_url as avatar,
                sp.roll_number as rollNumber, 
                sp.register_number as registerNumber, 
                sp.dob as dateOfBirth, 
                sp.gender, 
                sp.blood_group as bloodGroup,
                'Indian' as nationality, 
                u.address,
                sp.guardian_name as guardianName,
                sp.guardian_phone as guardianPhone,
                b.name as batch, 
                b.id as batchId,
                s.name as section,
                s.id as sectionId,
                'Cyber Security' as department,
                'B.Tech' as programme,  
                'Active' as status,     
                'Regular' as admissionType,
                'Full Time' as enrollmentType,
                IFNULL(b.start_year, 2023) as batchStartYear,
                IFNULL(b.end_year, 2027) as batchEndYear,
                IFNULL(b.current_semester, 1) as semester,
                (year(curdate()) - b.start_year + 1) as year, 
                sp.cgpa,             
                sp.attendance_percentage as attendance,
                sp.linkedin_url as linkedinUrl,
                sp.github_url as githubUrl,
                sp.portfolio_url as portfolioUrl,
                0 as backlogs            
            FROM users u
            JOIN student_profiles sp ON u.id = sp.user_id
            LEFT JOIN batches b ON sp.batch_id = b.id
            LEFT JOIN sections s ON sp.section_id = s.id
            WHERE u.id = ?
        `, [userId]);

        if (rows.length === 0) return res.status(404).json({ message: 'Profile not found' });
        
        // Transform fields if needed to match frontend Expected Student Interface
        const profile = rows[0];
        // Mock semester history for now or fetch real if table exists
        profile.semesterHistory = [
             { sem: 1, gpa: 8.2, credits: 24, status: 'Completed' },
             { sem: 2, gpa: 8.5, credits: 24, status: 'Completed' }
        ];

        res.json(profile);
    } catch (error: any) {
        console.error('Detailed Get Profile Error:', {
            error: error.message,
            code: error.code,
            sql: error.sql,
            userId
        });
        res.status(500).json({ message: 'Error fetching profile' });
    }
};

// Get Student Marks (Self)
export const getStudentMarks = async (req: Request | any, res: Response) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const [rows]: any = await pool.query(`
            SELECT 
                s.name as subjectName,
                s.code as subjectCode,
                sc.category as examType,
                sc.title as examName,
                m.marks_obtained as marks,
                m.max_marks as maxMarks
            FROM marks m
            JOIN schedules sc ON m.schedule_id = sc.id
            JOIN subjects s ON m.subject_id = s.id
            WHERE m.student_id = ? AND m.status = 'approved'
        `, [userId]);
        
        // Transform mapped ExamTypes to frontend keys if needed (ia1, ia2...)
        // Currently DB stores 'Internal' and Name 'IA1'. 
        // Frontend expects 'ia1' etc in 'examType' or we map logic in frontend.
        // Let's pass raw data and let helper function in frontend map it, or map here.
        // Better to normailze here if possible, but frontend logic uses 'examType' string matching 'ia1'
        // Let's assume the inserted data uses lowercase codes or we map them.
        
        const mapped = rows.map((r: any) => {
            let type = 'unknown';
            const category = r.examType;
            if (category === 'CIA 1') type = 'ia1';
            else if (category === 'CIA 2') type = 'ia2';
            else if (category === 'CIA 3') type = 'cia3';
            else if (category === 'Model') type = 'model';
            else if (category === 'Semester') type = 'semester';

            return {
                subjectCode: r.subjectCode,
                subject: r.subjectName,
                examType: type, 
                marks: r.marks,
                maxMarks: r.maxMarks
            };
        });

        res.json(mapped);
    } catch (error: any) {
        console.error('Get Student Marks Error:', error);
        res.status(500).json({ message: 'Error fetching marks' });
    }
};

// Update Student Profile (Self)
export const updateStudentProfile = async (req: Request | any, res: Response) => {
    const userId = req.user?.id;
    const { 
        phone, address, dob, gender, bloodGroup, 
        guardianName, guardianPhone,
        linkedinUrl, githubUrl, portfolioUrl 
    } = req.body;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Update users table
        const [userUpdate]: any = await connection.query(
            'UPDATE users SET phone = ?, address = ? WHERE id = ?',
            [phone, address, userId]
        );
        console.log('User Update Result:', { userId, affectedRows: userUpdate.affectedRows });

        // 2. Update student_profiles table
        const [profileUpdate]: any = await connection.query(
            `UPDATE student_profiles SET 
                dob = ?, 
                gender = ?, 
                blood_group = ?, 
                guardian_name = ?, 
                guardian_phone = ?,
                linkedin_url = ?,
                github_url = ?,
                portfolio_url = ? 
             WHERE user_id = ?`,
            [dob, gender, bloodGroup, guardianName, guardianPhone, linkedinUrl, githubUrl, portfolioUrl, userId]
        );
        console.log('Profile Update Result:', { userId, affectedRows: profileUpdate.affectedRows });

        await connection.commit();
        res.json({ message: 'Profile updated successfully' });
    } catch (error: any) {
        await connection.rollback();
        console.error('Detailed Update Profile Error:', {
            error: error.message,
            code: error.code,
            sql: error.sql,
            userId,
            body: req.body
        });
        res.status(500).json({ message: 'Error updating profile' });
    } finally {
        connection.release();
    }
};

// Get Student's Current Semester Subjects
export const getStudentSubjects = async (req: Request | any, res: Response) => {
    const studentId = req.user?.id;

    if (!studentId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        // Get student's section and batch info
        const [students]: any = await pool.query(
            `SELECT sp.section_id, s.batch_id, b.current_semester 
             FROM student_profiles sp
             JOIN sections s ON sp.section_id = s.id
             JOIN batches b ON s.batch_id = b.id
             WHERE sp.user_id = ?`,
            [studentId]
        );

        if (students.length === 0) {
            return res.status(404).json({ message: 'Student profile not found' });
        }

        const { section_id, batch_id, current_semester } = students[0];

        // Fetch subjects for current semester that are allocated to student's section
        const [subjects]: any = await pool.query(
            `SELECT DISTINCT 
                sub.id,
                sub.name,
                sub.code,
                sub.semester,
                sub.credits
             FROM subjects sub
             JOIN subject_allocations sa ON sub.id = sa.subject_id
             WHERE sa.section_id = ?
               AND sa.is_active = TRUE
               AND sub.semester = ?
             ORDER BY sub.name ASC`,
            [section_id, current_semester]
        );

        res.json(subjects);

    } catch (error: any) {
        console.error('Get Student Subjects Error:', error);
        res.status(500).json({ message: 'Error fetching subjects' });
    }
};

// Get student attendance percentage

export const getStudentAttendance = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const attendance = await getStudentAttendancePercentage(userId);
        
        res.json({
            totalDays: attendance.totalDays,
            presentDays: attendance.totalDays - attendance.leaveDays,
            leaveDays: attendance.leaveDays,
            odDays: attendance.odDays,
            attendancePercentage: attendance.attendancePercentage,
            semesterStartDate: attendance.semesterStartDate,
            canApplyCasualLeave: attendance.attendancePercentage >= 80,
            minimumAttendanceForCasualLeave: 80
        });
    } catch (error: any) {
        console.error('Get Student Attendance Error:', error);
        res.status(500).json({ message: 'Error fetching attendance' });
    }
};
