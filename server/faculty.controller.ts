import { Request, Response } from 'express';
import { pool } from './db.js';

// Get Faculty Profile
export const getFacultyProfile = async (req: Request | any, res: Response) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    try {
        console.log('Fetching Profile for UserID:', userId);
        // 1. Fetch Basic Info & Profile
        const [rows]: any = await pool.query(`
            SELECT 
                u.id, u.name, u.email, u.phone, u.avatar_url as avatar,
                fp.qualification,
                fp.specialization,
                fp.experience_years as experience,
                fp.joining_date as dateOfJoining,
                fp.employment_type as employmentType,
                fp.current_status as status,
                fp.cabin_location as office,
                d.name as department,
                u.address -- Assuming address is in users
            FROM users u
            LEFT JOIN faculty_profiles fp ON u.id = fp.user_id
            LEFT JOIN departments d ON fp.department_id = d.id
            WHERE u.id = ?
        `, [userId]);

        console.log('Profile Query Result:', rows.length, 'rows');
        
        let profile;
        if (rows.length === 0) {
             console.log('User completely missing from DB for ID:', userId);
             return res.status(404).json({ message: 'User not found' });
        }
        
        profile = rows[0];
        
        // If profile is partial (no qualification due to LEFT JOIN missing), we can set defaults or just return partial.
        // The LEFT JOIN ensures we at least have user details (name, email).
        if (!profile.qualification) {
             console.log('User found but Faculty Profile missing. Returning partial.');
             profile.qualification = 'N/A';
             profile.specialization = 'N/A';
             profile.department = 'General';
             profile.designation = 'Staff';
        }

        // 2. Fetch Education
        // For now, we'll return a static list if DB table doesn't exist, or simple split if in string
        profile.education = [
            { degree: profile.qualification || 'PhD', institution: 'University', year: '2015' } 
        ];

        // 3. Fetch Subject Allocations (What they teach) - Only active ones
        const [allocations]: any = await pool.query(`
            SELECT 
                s.name as subject,
                s.code as subjectCode,
                sec.name as section,
                b.name as batch
            FROM subject_allocations sa
            JOIN subjects s ON sa.subject_id = s.id
            LEFT JOIN sections sec ON sa.section_id = sec.id
            LEFT JOIN batches b ON sec.batch_id = b.id
            WHERE sa.faculty_id = ? AND sa.is_active = TRUE
        `, [userId]);
        
        profile.allocations = allocations;

        res.json(profile);
    } catch (error) {
        console.error('Get Faculty Profile Error:', error);
        res.status(500).json({ message: 'Error fetching profile' });
    }
};

// Get All Faculty (for student material requests, etc.)
export const getAllFaculty = async (req: Request, res: Response) => {
    try {
        const [faculty]: any = await pool.query(
            `SELECT 
                u.id,
                u.name,
                u.email,
                fp.designation,
                fp.department_id
             FROM users u
             JOIN faculty_profiles fp ON u.id = fp.user_id
             WHERE u.role = 'faculty'
             ORDER BY u.name ASC`
        );

        console.log('=== FACULTY LIST DEBUG ===');
        console.log('Total faculty:', faculty.length);

        res.json({ faculty });
    } catch (error) {
        console.error('Get All Faculty Error:', error);
        res.status(500).json({ message: 'Error fetching faculty list' });
    }
};

// Get Faculty Timetable
export const getFacultyTimetable = async (req: Request | any, res: Response) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const [slots]: any = await pool.query(`
            SELECT 
                ts.day_of_week as day,
                ts.period_number as period,
                ts.room_number as room,
                ts.start_time as startTime,
                ts.end_time as endTime,
                s.name as subject,
                s.code as subjectCode,
                sec.name as section,
                b.name as batch
            FROM timetable_slots ts
            JOIN subject_allocations sa ON ts.subject_allocation_id = sa.id
            JOIN subjects s ON sa.subject_id = s.id
            JOIN sections sec ON sa.section_id = sec.id
            JOIN batches b ON sec.batch_id = b.id
            WHERE sa.faculty_id = ? AND sa.is_active = TRUE
            ORDER BY FIELD(day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'), ts.period_number
        `, [userId]);

        res.json(slots);
    } catch (error) {
        console.error('Get Faculty Timetable Error:', error);
        res.status(500).json({ message: 'Error fetching timetable' });
    }
};

// Update Faculty Profile
export const updateFacultyProfile = async (req: Request | any, res: Response) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { phone, address, qualification, specialization, office } = req.body;

    try {
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();

            // Update users table
            if (phone || address) {
                const updateFields: string[] = [];
                const updateValues: any[] = [];

                if (phone) {
                    updateFields.push('phone = ?');
                    updateValues.push(phone);
                }
                if (address) {
                    updateFields.push('address = ?');
                    updateValues.push(address);
                }

                if (updateFields.length > 0) {
                    updateValues.push(userId);
                    await connection.execute(
                        `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
                        updateValues
                    );
                }
            }

            // Update faculty_profiles table
            if (qualification || specialization || office) {
                const profileFields: string[] = [];
                const profileValues: any[] = [];

                if (qualification) {
                    profileFields.push('qualification = ?');
                    profileValues.push(qualification);
                }
                if (specialization) {
                    profileFields.push('specialization = ?');
                    profileValues.push(specialization);
                }
                if (office) {
                    profileFields.push('cabin_location = ?');
                    profileValues.push(office);
                }

                if (profileFields.length > 0) {
                    profileValues.push(userId);
                    await connection.execute(
                        `UPDATE faculty_profiles SET ${profileFields.join(', ')} WHERE user_id = ?`,
                        profileValues
                    );
                }
            }

            await connection.commit();

            // Fetch updated profile
            const [rows]: any = await connection.query(`
                SELECT 
                    u.id, u.name, u.email, u.phone, u.avatar_url as avatar,
                    fp.qualification,
                    fp.specialization,
                    fp.experience_years as experience,
                    fp.joining_date as dateOfJoining,
                    fp.employment_type as employmentType,
                    fp.current_status as status,
                    fp.cabin_location as office,
                    d.name as department,
                    u.address
                FROM users u
                LEFT JOIN faculty_profiles fp ON u.id = fp.user_id
                LEFT JOIN departments d ON fp.department_id = d.id
                WHERE u.id = ?
            `, [userId]);

            res.json(rows[0]);
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Update Faculty Profile Error:', error);
        res.status(500).json({ message: 'Error updating profile' });
    }
};
