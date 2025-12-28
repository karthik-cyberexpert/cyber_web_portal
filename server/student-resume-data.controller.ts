import { Request, Response } from 'express';
import { pool } from './db.js';

// Get comprehensive resume data for a student
export const getStudentResumeData = async (req: Request | any, res: Response) => {
    const studentId = req.user?.id;

    if (!studentId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        // 1. Personal & Academic Details - simplified to use only users table
        const [personalData]: any = await pool.query(
            `SELECT 
                u.id, u.name, u.email, u.phone
             FROM users u
             WHERE u.id = ?`,
            [studentId]
        );

        if (personalData.length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const student = personalData[0];

        // Try to get additional data from student_profiles if it exists
        let profileData: any = {};
        try {
            const [profile]: any = await pool.query(
                `SELECT roll_number FROM student_profiles WHERE user_id = ?`,
                [studentId]
            );
            if (profile.length > 0) {
                profileData = profile[0];
            }
        } catch (err) {
            console.log('student_profiles table may not exist or may not have expected columns');
        }


        // 2. ECA Achievements - with error handling
        let achievements: any[] = [];
        try {
            const [results]: any = await pool.query(
                `SELECT * FROM eca_achievements WHERE student_id = ? ORDER BY id DESC LIMIT 10`,
                [studentId]
            );
            achievements = results;
        } catch (err) {
            console.log('eca_achievements table query error:', err);
            // Continue with empty achievements
        }

        // 3. Skills - Extract from achievements if we have them
        const skills = achievements.length > 0 ? 
            [...new Set(achievements.map((a: any) => a.category).filter(Boolean))] : 
            [];

        // Aggregate resume data
        const resumeData = {
            personalInfo: {
                fullName: student.name || 'Student',
                email: student.email || '',
                phone: student.phone || '',
                rollNumber: profileData.roll_number || 'N/A',
                batch: 'N/A', // Will be populated when batch data is available
                section: 'N/A',
                semester: 1
            },
            education: [
                {
                    institution: 'Your Institution',
                    degree: 'B.Tech in Computer Science',
                    batch: 'Current',
                    year: 'In Progress'
                }
            ],
            achievements: achievements.map((a: any) => ({
                title: a.title || a.achievement_title || 'Achievement',
                organizer: a.organizer || a.organization || a.institution || '',
                category: a.category || 'General',
                level: a.level || '',
                date: a.event_date || a.date || new Date().toISOString(),
                position: a.place_secured || a.position || '',
                points: a.points_awarded || a.points || 0
            })),
            skills: skills.length > 0 ? skills : ['Technical', 'Communication', 'Leadership'],
            projects: [],
            certifications: []
        };

        console.log('=== RESUME DATA DEBUG ===');
        console.log('Student ID:', studentId);
        console.log('Achievements:', achievements.length);
        console.log('Student data:', student);

        res.json(resumeData);
    } catch (error: any) {
        console.error('Get Resume Data Error:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({ message: 'Error fetching resume data', error: error.message });
    }
};
