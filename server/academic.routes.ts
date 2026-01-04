import express from 'express';
import { 
  getBatches, createBatch, getSections, createSection, 
  updateBatch, deleteBatch, updateSection, deleteSection,
  getPendingSemesterUpdates, setSemesterDates
} from './academic.controller.js';
import { authenticateToken } from './auth.middleware.js';

const router = express.Router();

router.get('/batches', authenticateToken, getBatches);
router.post('/batches', authenticateToken, createBatch);
router.get('/batches/:batchId/sections', authenticateToken, getSections);
router.post('/sections', authenticateToken, createSection);
router.put('/batches/:id', authenticateToken, updateBatch);
router.delete('/batches/:id', authenticateToken, deleteBatch);
router.put('/sections/:id', authenticateToken, updateSection);
router.delete('/sections/:id', authenticateToken, deleteSection);

// Semester Management Routes
router.get('/pending-semester-updates', authenticateToken, getPendingSemesterUpdates);
router.post('/batches/:id/semester-dates', authenticateToken, setSemesterDates);

// Subject Routes
import { 
  getSubjects, 
  createSubject, 
  updateSubject, 
  deleteSubject, 
  updateSubjectFaculties 
} from './academic.controller.js';

router.get('/subjects', authenticateToken, getSubjects);
router.post('/subjects', authenticateToken, createSubject);
router.put('/subjects/:id', authenticateToken, updateSubject);
router.delete('/subjects/:id', authenticateToken, deleteSubject);
router.post('/subjects/:id/faculties', authenticateToken, updateSubjectFaculties);

// Timetable Routes
import { getTimetable, saveTimetableSlot } from './academic.controller.js';
import { getMarksByBatch, getTheoryInternalMarks } from './marks.controller.js';

router.get('/marks/report', authenticateToken, getMarksByBatch);
router.get('/marks/internals/theory', authenticateToken, getTheoryInternalMarks);

console.log('Registering Timetable Routes');
router.get('/timetable', authenticateToken, (req, res, next) => {
    console.log('GET /timetable hit');
    getTimetable(req, res).catch(next);
});
router.post('/timetable', authenticateToken, (req, res, next) => {
    console.log('POST /timetable hit');
    saveTimetableSlot(req, res).catch(next);
});

export default router;
