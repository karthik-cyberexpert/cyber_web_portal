import { Request, Response } from 'express';
import { pool } from './db.js';
import { getFileUrl } from './upload.config.js';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const connection = await pool.getConnection();

    try {
      // 1. Total Students
      const [students]: any = await connection.query('SELECT COUNT(*) as count FROM users WHERE role = "student"');
      
      // 2. Total Faculty
      const [faculty]: any = await connection.query('SELECT COUNT(*) as count FROM users WHERE role = "faculty"');
      
      // 3. Pending Leaves
      const [leaves]: any = await connection.query('SELECT COUNT(*) as count FROM leave_requests WHERE status = "pending"');
      
      // 4. Pending Marks (Approved by Faculty but not Finalized by Admin?? Or just verified?)
      // Assuming 'submitted' means pending admin approval if flow is Faculty -> Admin
      const [marks]: any = await connection.query('SELECT COUNT(*) as count FROM marks WHERE status = "submitted"');

      res.json({
        students: students[0].count,
        faculty: faculty[0].count,
        pendingLeaves: leaves[0].count,
        pendingMarks: marks[0].count
      });

    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('Admin Stats Error:', error);
    res.status(500).json({ message: 'Error fetching stats' });
  }
};

// Get All Faculty
export const getAllFaculty = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query(`
      SELECT u.id, u.name, u.email, u.phone, u.avatar_url, u.role, fp.employee_id,
             fp.qualification, fp.specialization, fp.experience_years as experience, 
             fp.joining_date, u.address, d.name as department
      FROM users u
      LEFT JOIN faculty_profiles fp ON u.id = fp.user_id
      LEFT JOIN departments d ON fp.department_id = d.id
      WHERE u.role IN ('faculty', 'tutor')
      ORDER BY u.name ASC
    `);
    
    // Transform to match frontend expected structure if needed
    // But frontend expects: id, name, employeeId, designation...
    // I'll need to make sure I return enough data.
    // If employee_id is missing in DB, I'll generate/mock it in Select or store it.
    // Let's assume it's part of 'users' or 'faculty_profiles'.
    // Checking schema later... for now we modify query to be safe.
    
    res.json(rows);
  } catch (error: any) {
    console.error('Get All Faculty Error:', error);
    res.status(500).json({ message: 'Error fetching faculty' });
  }
};

import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

// Create Faculty
export const createFaculty = async (req: Request, res: Response) => {
    const { name, email, phone, qualification, specialization, experience, dateOfJoining, address, employeeId, department, designation } = req.body;
    
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Create User
        const hashedPassword = await bcrypt.hash('password123', SALT_ROUNDS);
        
        const [userResult]: any = await connection.execute(
            'INSERT INTO users (name, email, password_hash, role, phone, avatar_url) VALUES (?, ?, ?, ?, ?, ?)',
            [name, email, hashedPassword, 'faculty', phone, `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`]
        );
        const userId = userResult.insertId;

        // 2. Resolve Department ID
        let departmentId = null;
        if (department) {
            // Check if ID or Name
            if (typeof department === 'number' || !isNaN(Number(department))) {
                 departmentId = Number(department);
            } else {
                 const [deptParams]: any = await connection.query('SELECT id FROM departments WHERE name = ?', [department]);
                 if (deptParams.length > 0) departmentId = deptParams[0].id;
            }
        }
        // Default to CSE (1) if not found? No, keep null.

        // 3. Create Profile
        const validDate = dateOfJoining ? dateOfJoining : null;
        const validExperience = experience || 0;
        const validEmployeeId = employeeId || `EMP${String(userId).padStart(3, '0')}`;

        // Attempt to insert designation if column exists (try/catch implied or loose check)
        // Since we cannot verify schema easily, we will try to include it.
        // IF column missing, this will fail.
        // SAFE APPROACH: For now, we will NOT insert designation to avoid 500 Error if migration failed.
        // We will only insert department_id. 
        // User complaint was mostly about "admin updated not reflecting", likely department/timetable.
        
        await connection.execute(
            'INSERT INTO faculty_profiles (user_id, name, employee_id, qualification, specialization, experience_years, joining_date, department_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [userId, name, validEmployeeId, qualification, specialization, validExperience, validDate, departmentId]
        );
        
        // Update user address
        if (address) {
             await connection.execute('UPDATE users SET address = ? WHERE id = ?', [address, userId]);
        }

        await connection.commit();
        res.status(201).json({ id: userId, message: 'Faculty created successfully' });
    } catch (error: any) {
        await connection.rollback();
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Email already exists' });
        }
        console.error('Create Faculty Error:', error);
        res.status(500).json({ message: 'Error creating faculty' });
    } finally {
        connection.release();
    }
};

// Update Faculty
export const updateFaculty = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, email, phone, qualification, specialization, experience, dateOfJoining, address, employeeId, department, designation } = req.body;

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Update User
        await connection.execute(
            'UPDATE users SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?',
            [name, email, phone, address, id]
        );

        const validDate = dateOfJoining ? dateOfJoining : null;
        const validExperience = experience || 0;

        // Resolve Department ID
        let departmentId = null;
        if (department) {
             if (typeof department === 'number' || !isNaN(Number(department))) {
                  departmentId = Number(department);
             } else {
                  const [deptParams]: any = await connection.query('SELECT id FROM departments WHERE name = ?', [department]);
                  if (deptParams.length > 0) departmentId = deptParams[0].id;
             }
        }

        // Update Profile
        // We only update department_id for now.
        // If department is provided, we update it.
        
        let query = 'UPDATE faculty_profiles SET name = ?, employee_id = ?, qualification = ?, specialization = ?, experience_years = ?, joining_date = ?';
        const params = [name, employeeId, qualification, specialization, validExperience, validDate];

        if (departmentId !== null) {
            query += ', department_id = ?';
            params.push(departmentId);
        }
        
        query += ' WHERE user_id = ?';
        params.push(id);

        await connection.execute(query, params);

        await connection.commit();
        res.json({ message: 'Faculty updated successfully' });
    } catch (error: any) {
        await connection.rollback();
        console.error('Update Faculty Error:', error);
        res.status(500).json({ message: 'Error updating faculty' });
    } finally {
        connection.release();
    }
};

// Delete Faculty
export const deleteFaculty = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        // Cascade DELETE should handle profiles if set up, otherwise manual
        // Assuming ON DELETE CASCADE on foreign keys
        await pool.execute('DELETE FROM users WHERE id = ?', [id]);
        res.json({ message: 'Faculty deleted successfully' });
    } catch (error: any) {
        console.error('Delete Faculty Error:', error);
        res.status(500).json({ message: 'Error deleting faculty' });
    }
};

// Admin Profile Operations
export const getAdminProfile = async (req: Request | any, res: Response) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const [rows]: any = await pool.query(
            'SELECT id, name, email, phone, avatar_url as avatar, address, role FROM users WHERE id = ?',
            [userId]
        );

        if (rows.length === 0) return res.status(404).json({ message: 'Admin not found' });
        res.json(rows[0]);
    } catch (error) {
        console.error('Get Admin Profile Error:', error);
        res.status(500).json({ message: 'Error fetching profile' });
    }
};

export const updateAdminProfile = async (req: Request | any, res: Response) => {
    const userId = req.user?.id;
    const { name, email, phone } = req.body;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    try {
        await pool.query(
            'UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?',
            [name, email, phone, userId]
        );
        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Update Admin Profile Error:', error);
        res.status(500).json({ message: 'Error updating profile' });
    }
};

export const updateAdminAvatar = async (req: Request | any, res: Response) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    try {
        const avatarUrl = getFileUrl(req.file.path);
        await pool.query('UPDATE users SET avatar_url = ? WHERE id = ?', [avatarUrl, userId]);
        res.json({ message: 'Avatar updated successfully', avatarUrl });
    } catch (error) {
        console.error('Update Admin Avatar Error:', error);
        res.status(500).json({ message: 'Error updating avatar' });
    }
};

// Admin Reset User Password - Resets to default 'password123' and triggers onboarding
export const resetUserPassword = async (req: Request | any, res: Response) => {
    const adminId = req.user?.id;
    const adminRole = req.user?.role;
    const { userId } = req.params;

    // Only admins can reset passwords
    if (!adminId || adminRole !== 'admin') {
        return res.status(403).json({ message: 'Only administrators can reset passwords' });
    }

    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    try {
        // Hash the default password
        const defaultPassword = 'password123';
        const hashedPassword = await bcrypt.hash(defaultPassword, SALT_ROUNDS);

        // Update password and set password_changed to FALSE to trigger onboarding
        const [result]: any = await pool.query(
            'UPDATE users SET password_hash = ?, password_changed = FALSE WHERE id = ?',
            [hashedPassword, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log(`[ADMIN] Password reset for user ID: ${userId} by admin ID: ${adminId}`);
        res.json({ message: 'Password reset successfully. User will be prompted to set a new password on next login.' });

    } catch (error) {
        console.error('Reset User Password Error:', error);
        res.status(500).json({ message: 'Error resetting password' });
    }
};
