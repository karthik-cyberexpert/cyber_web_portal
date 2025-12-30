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
                `SELECT linkedin_url, github_url, portfolio_url, education_degree, education_institution FROM student_profiles WHERE user_id = ?`,
                [studentId]
            );
            if (profile.length > 0) {
                profileData = profile[0];
                console.log('SUCCESS: Profile found:', profileData);
            } else {
                console.log('WARNING: No profile found for user_id:', studentId);
            }
        } catch (err: any) {
            console.log('ERROR: student_profiles query failed:', err.message);
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
                linkedin: profileData.linkedin_url || '',
                github: profileData.github_url || '',
                portfolio: profileData.portfolio_url || '',
                batch: 'N/A', 
                section: 'N/A',
                semester: 1
            },
            education: [
                {
                    institution: profileData.education_institution || 'Your Institution',
                    degree: profileData.education_degree || 'B.Tech in Computer Science',
                    batch: 'Current',
                    year: '2023 - 2027'
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
        res.status(500).json({ message: 'Error fetching resume data', error: error.message });
    }
};

export const updatePersonalDetails = async (req: Request | any, res: Response) => {
    const studentId = req.user?.id;
    const { phone, linkedin, github, portfolio } = req.body;

    if (!studentId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Update phone in users table
        await connection.query(
            'UPDATE users SET phone = ? WHERE id = ?',
            [phone, studentId]
        );

        // 2. Update student_profiles table with LinkedIn, GitHub, Portfolio
        await connection.query(
            'UPDATE student_profiles SET linkedin_url = ?, github_url = ?, portfolio_url = ? WHERE user_id = ?',
            [linkedin, github, portfolio, studentId]
        );

        await connection.commit();
        res.json({ message: 'Personal details updated successfully' });
    } catch (error: any) {
        await connection.rollback();
        console.error('Update Personal Details Error:', error);
        res.status(500).json({ message: 'Error updating personal details', error: error.message });
    } finally {
        connection.release();
    }
};
