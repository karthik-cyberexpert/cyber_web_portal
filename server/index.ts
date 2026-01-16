import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './db.js';
import { authenticateToken } from './auth.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3007;

console.log(`Starting Server... Time: ${new Date().toISOString()} - Restart 19`);
import authRoutes from './auth.routes.js';
import adminRoutes from './admin.routes.js';
import academicRoutes from './academic.routes.js';
import studentRoutes from './student.routes.js';

app.use(cors());
app.use(express.json());

// Serve uploaded files statically (Corrected path)
// Serve uploaded files statically (Corrected path)
const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));
app.use('/api/uploads', express.static(uploadsPath));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/students', studentRoutes);
import tutorRoutes from './tutor.routes.js';
app.use('/api/tutors', tutorRoutes);

import facultyRoutes from './faculty.routes.js';
app.use('/api/faculty', facultyRoutes);

import notesRoutes from './notes.routes.js';
app.use('/api/notes', notesRoutes);

import avatarRoutes from './avatar.routes.js';
app.use('/api/avatar', avatarRoutes);

import assignmentRoutes from './assignment.routes.js';
app.use('/api/assignments', assignmentRoutes);

import circularRoutes from './circular.routes.js';
app.use('/api/circulars', circularRoutes);

import classStatsRoutes from './class-stats.routes.js';
app.use('/api/class-stats', classStatsRoutes);

import facultyStudentsRoutes from './faculty-students.routes.js';
app.use('/api/faculty-students', facultyStudentsRoutes);

import studentStatsRoutes from './student-stats.routes.js';
app.use('/api/student-stats', studentStatsRoutes);

import academicDetailsRoutes from './academic-details.routes.js';
app.use('/api/academic-details', academicDetailsRoutes);

import studentTimetableRoutes from './student-timetable.routes.js';
app.use('/api/student-timetable', studentTimetableRoutes);

import studentMarksRoutes from './student-marks.routes.js';
app.use('/api/student-marks', studentMarksRoutes);

import studentNotesRoutes from './student-notes.routes.js';
app.use('/api/student-notes', studentNotesRoutes);

import materialRequestRoutes from './material-request.routes.js';
app.use('/api/material-request', materialRequestRoutes);

import studentAssignmentsRoutes from './student-assignments.routes.js';
app.use('/api/student-assignments', studentAssignmentsRoutes);

import assignmentSubmissionRoutes from './assignment-submission.routes.js';
app.use('/api/assignment-submission', assignmentSubmissionRoutes);

// Uploads already served above

import gradeSubmissionRoutes from './grade-submission.routes.js';
app.use('/api/grade-submission', gradeSubmissionRoutes);

import studentResumeDataRoutes from './student-resume-data.routes.js';
app.use('/api/student-resume-data', studentResumeDataRoutes);

import tutorAnalyticsRoutes from './tutor-analytics.routes.js';
app.use('/api/tutor-analytics', tutorAnalyticsRoutes);

import leaveRoutes from './leave.routes.js';
app.use('/api/leave', leaveRoutes);

import odRoutes from './od.routes.js';
app.use('/api/od', odRoutes);

import feedbackRoutes from './feedback.routes.js';
app.use('/api/feedback', feedbackRoutes);

import grievanceRoutes from './grievance.routes.js';
app.use('/api/grievance', grievanceRoutes);

import lostAndFoundRoutes from './lost-and-found.routes.js';
app.use('/api/lost-and-found', lostAndFoundRoutes);

import marksRoutes from './marks.routes.js';
app.use('/api/marks', marksRoutes);

import { calendarRouter } from './calendar.routes.js';
app.use('/api/calendar', calendarRouter);

import attendanceTrendRoutes from './attendance-trend.routes.js';
app.use('/api/attendance-trend', attendanceTrendRoutes);

import notificationRoutes from './notifications.routes.js';
app.use('/api/notifications', notificationRoutes);

import syllabusRoutes from './syllabus.routes.js';
app.use('/api/syllabus', syllabusRoutes);

import { debugRouter } from './debug.routes.js';
app.use('/api', debugRouter);

// Health Check
app.get('/api/health', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    connection.release();
    res.json({ status: 'ok', database: 'connected' });
  } catch (error: any) {
    console.error('Database Connection Error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Catchall 404 handler
app.use((req, res) => {
  console.log('[404] Route not found:', req.method, req.url);
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT,  () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Calendar Routes registered at /api/calendar');
});


