import { Request, Response } from 'express';
import { pool } from './db.js';

// Get student notes based on their section
export const getStudentNotes = async (req: Request | any, res: Response) => {
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

        // Fetch notes - either for specific section or all published notes accessible to students
        const [notes]: any = await pool.query(
            `SELECT 
                n.id,
                n.title,
                n.description,
                n.file_url,
                n.file_type,
                n.file_size,
                n.created_at,
                s.name as subject_name,
                s.code as subject_code,
                u.name as uploaded_by_name,
                n.type as category
             FROM notes n
             JOIN subjects s ON n.subject_id = s.id
             LEFT JOIN users u ON n.uploaded_by = u.id
             WHERE (n.section_id = ? OR n.section_id IS NULL) AND n.is_published = 1
             ORDER BY n.created_at DESC`,
            [sectionId]
        );

        // Group notes by subject
        const notesBySubject: any = {};
        
        notes.forEach((note: any) => {
            if (!notesBySubject[note.subject_code]) {
                notesBySubject[note.subject_code] = {
                    subjectName: note.subject_name,
                    subjectCode: note.subject_code,
                    notes: []
                };
            }
            
            notesBySubject[note.subject_code].notes.push({
                id: note.id,
                title: note.title,
                description: note.description,
                fileUrl: note.file_url,
                fileType: note.file_type,
                fileSize: note.file_size,
                uploadedAt: note.created_at,
                uploadedBy: note.uploaded_by_name,
                category: note.category
            });
        });

        console.log('=== STUDENT NOTES DEBUG ===');
        console.log('Student ID:', studentId);
        console.log('Section ID:', sectionId);
        console.log('Total notes:', notes.length);
        console.log('Subjects with notes:', Object.keys(notesBySubject).length);

        res.json({
            sectionId,
            notesBySubject,
            totalNotes: notes.length
        });
    } catch (error) {
        console.error('Get Student Notes Error:', error);
        res.status(500).json({ message: 'Error fetching notes' });
    }
};
