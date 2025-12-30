// Mock data and localStorage utilities for the college portal

export interface Student {
  id: string;
  rollNumber: string;
  name: string;
  email: string;
  phone: string;
  batch: string;
  year: number;
  semester: number;
  section: string;
  enrollmentType: 'Regular' | 'Lateral';
  admissionType: 'Management' | 'Government' | 'NRI';
  status: 'Active' | 'Graduated' | 'Dismissed' | 'On Leave';
  avatar: string;
  dateOfBirth: string;
  address: string;
  guardianName: string;
  guardianPhone: string;
  attendance: number;
  cgpa: number;
  programme: string;
  class: string;
  backlogs: number;
  gender: string;
  bloodGroup: string;
  nationality: string;
  linkedin?: string;
  github?: string;
  semesterHistory: { sem: number; gpa: number; credits: number; status: string }[];
  createdAt: string;
}

export interface Faculty {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  designation: 'Professor' | 'Associate Professor' | 'Assistant Professor' | 'Lecturer';
  qualification: string;
  specialization: string;
  experience: number;
  subjects: string[];
  sections: string[];
  status: 'Active' | 'On Leave' | 'Resigned';
  avatar: string;
  dateOfJoining: string;
  address: string;
  office: string;
  department?: string;
  education: { degree: string; institution: string; year: string }[];
  createdAt: string;
}

export interface Tutor {
  id: string;
  facultyId: string;
  name: string;
  email: string;
  phone: string;
  designation: string;
  batch: string;
  section: string;
  studentsCount: number;
  status: 'Active' | 'On Leave';
  avatar: string;
  createdAt: string;
}

const STUDENTS_KEY = 'college_portal_students';
const FACULTY_KEY = 'college_portal_faculty';
const TUTORS_KEY = 'college_portal_tutors';
const LEAVE_REQUESTS_KEY = 'college_portal_leave_requests';

// Generic LocalStorage helpers
export function getData<T>(key: string): T[] {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveData<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export function addItem<T extends { id: string }>(key: string, item: Omit<T, 'id'>): T {
  const items = getData<T>(key);
  const newItem = { ...item, id: Date.now().toString() } as T;
  items.push(newItem);
  saveData(key, items);
  return newItem;
}

export function updateItem<T extends { id: string }>(key: string, id: string, updates: Partial<T>): T | null {
  const items = getData<T>(key);
  const index = items.findIndex(item => item.id === id);
  if (index === -1) return null;
  items[index] = { ...items[index], ...updates };
  saveData(key, items);
  return items[index];
}

export function deleteItem<T extends { id: string }>(key: string, id: string): boolean {
  const items = getData<T>(key);
  const filtered = items.filter(item => item.id !== id);
  if (filtered.length === items.length) return false;
  saveData(key, filtered);
  return true;
}

// Hierarchical Storage Keys
export const BATCHES_KEY = 'batches';
export const CLASSES_KEY = 'classes';
export const SECTIONS_KEY = 'sections';

export interface BatchData {
  id: string;
  startYear?: number;
  endYear?: number;
  label: string;
  name?: string; // Legacy/Alias support
  sem8EndDate?: string;
  status?: 'Active' | 'Graduated';
  currentSemester?: 'Odd' | 'Even';
  semesterStartDate?: string;
  semesterEndDate?: string;
}

export interface ClassData {
  id: string;
  batchId: string;
  yearNumber: number;
  yearLabel: string;
  isActive: boolean;
}

export interface SectionData {
  id: string;
  classId: string;
  sectionName: string;
}

// Initialization Logic
export function initializeStorage() {
  const portalKeys = [
    'users', 'students', 'faculties', 'tutors', 'admins', 'batches', 'classes', 
    'sections', 'semesters', 'subjects', 'subjectAssignments', 'timetable', 
    'notesQbank', 'assignments', 'submissions', 'notices', 'marksInternal', 
    'marksExternal', 'eca', 'lmsAttempts', 'resumeData', 'leaveRequests'
  ];

  portalKeys.forEach(key => {
    const storageKey = (key === 'batches' || key === 'classes' || key === 'sections') ? key : `college_portal_${key}`;
    if (!localStorage.getItem(storageKey)) {
      localStorage.setItem(storageKey, JSON.stringify([]));
    }
  });

  // Seed with mock data - REMOVED
  // const currentStudents = getData<Student>(STUDENTS_KEY);
  // if (currentStudents.length === 0 || !(currentStudents[0] as any).programme) {
  //   saveStudents(generateMockStudents());
  // }
  // const currentFaculty = getData<Faculty>(FACULTY_KEY);
  // if (currentFaculty.length === 0 || !(currentFaculty[0] as any).education) {
  //   saveFaculty(generateMockFaculty());
  // }
  // if (getData(TUTORS_KEY).length === 0) {
  //   saveTutors(generateMockTutors());
  // }

  // Seed batches if empty - REMOVED
  // const BATCHES_KEY = 'college_portal_batches';
  // if (getData(BATCHES_KEY).length === 0) {
  //   saveData(BATCHES_KEY, [
  //     { id: '1', name: '2021-2025', sem8EndDate: '2025-05-30' },
  //     { id: '2', name: '2022-2026', sem8EndDate: '2026-05-30' },
  //     { id: '3', name: '2023-2027', sem8EndDate: '2027-05-30' },
  //     { id: '4', name: '2024-2028', sem8EndDate: '2028-05-30' },
  //     { id: '5', name: '2020-2024', sem8EndDate: '2024-05-30' }, // This batch is graduated
  //   ]);
  // }

  // checkGraduationLogic();

  // if (getData(LEAVE_REQUESTS_KEY).length === 0) {
  //   saveData(LEAVE_REQUESTS_KEY, [
  //     { 
  //       id: '1', 
  //       student: 'Arun Prasath', 
  //       rollNo: '21CS001', 
  //       type: 'Medical', 
  //       startDate: '2024-03-20', 
  //       endDate: '2024-03-22', 
  //       days: 3, 
  //       reason: 'Severe fever and doctor advised rest.',
  //       status: 'pending',
  //       photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop'
  //     },
  //     { 
  //       id: '2', 
  //       student: 'Priya Sharma', 
  //       rollNo: '21CS045', 
  //       type: 'Family Function', 
  //       startDate: '2024-03-25', 
  //       endDate: '2024-03-25', 
  //       days: 1, 
  //       reason: "Sister's wedding engagement ceremony.",
  //       status: 'pending',
  //       photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop'
  //     }
  //   ]);
  // }

  // Perform one-time purge of previously seeded dummy data
  purgeDummyData();
  
  // Initialize default batches if empty - REMOVED to prevent dummy data
  // const BATCHES_KEY = 'batches';
  // if (getData<BatchData>(BATCHES_KEY).length === 0) {
  //   saveData(BATCHES_KEY, [
  //     { id: '1', label: '2021-2025', name: '2021-2025', sem8EndDate: '2025-05-30' },
  //     { id: '2', label: '2022-2026', name: '2022-2026', sem8EndDate: '2026-05-30' },
  //     { id: '3', label: '2023-2027', name: '2023-2027', sem8EndDate: '2027-05-30' },
  //     { id: '4', label: '2024-2028', name: '2024-2028', sem8EndDate: '2028-05-30' },
  //     // { id: '5', label: '2020-2024', name: '2020-2024', sem8EndDate: '2024-05-30' }, // Graduated
  //   ]);
  // }

  checkAutoPromotionLogic();
  // checkGraduationLogic(); // Replaced by checkAutoPromotionLogic
}

// Helper to clean up persistent dummy data from local storage
function purgeDummyData() {
  const students = getData<Student>(STUDENTS_KEY);
  if (students.length === 30 && students.some(s => s.name === 'Arun Prasath')) {
    console.log('Purging dummy students...');
    saveStudents([]);
  }

  const faculty = getData<Faculty>(FACULTY_KEY);
  if (faculty.length === 15 && faculty.some(f => f.name === 'Dr. Rajesh Kumar')) {
    console.log('Purging dummy faculty...');
    saveFaculty([]);
  }

  const tutors = getData(TUTORS_KEY);
  // Tutors might be 8 or 0 depending on previous partial cleanups
  if (tutors.length === 8 && tutors.some((t: any) => t.name === 'Prof. Lakshmi Devi')) {
    console.log('Purging dummy tutors...');
    saveTutors([]);
  }

  const BATCHES_KEY = 'college_portal_batches';
  const batches = getData<any>(BATCHES_KEY);
  if (batches.length === 5 && batches.some((b: any) => b.name === '2021-2025')) {
    console.log('Purging dummy batches...');
    saveData(BATCHES_KEY, []);
  }

  const LEAVE_REQUESTS_KEY = 'college_portal_leave_requests';
  const leaves = getData<any>(LEAVE_REQUESTS_KEY);
  if (leaves.length === 2 && leaves.some((l: any) => l.student === 'Arun Prasath')) {
    console.log('Purging dummy leave requests...');
    saveData(LEAVE_REQUESTS_KEY, []);
  }
}

export function checkAutoPromotionLogic() {
    const batches = getData<BatchData>(BATCHES_KEY);
    const classes = getData<ClassData>(CLASSES_KEY);
    const sections = getData<SectionData>(SECTIONS_KEY);
    let batchesUpdated = false;
    let classesUpdated = false;
    let sectionsUpdated = false;

    const now = new Date();
    const currentMonth = now.getMonth(); // 0-11. June is 5.
    const currentYear = now.getFullYear();

    batches.forEach(batch => {
        if (!batch.startYear) return;
        if (batch.status === 'Graduated') return;

        // Calculate Theoretical Year
        // June 2024 to May 2025 = Year 1
        // June 2025 to May 2026 = Year 2
        
        let theoreticalYear = currentYear - batch.startYear;
        // If before June, we are still in the previous academic cycle year
        if (currentMonth < 5) { // Jan(0) to May(4)
             // e.g. Feb 2025 (start 2024). 2025-2024=1. Correct (Year 1).
             // e.g. Feb 2026 (start 2024). 2026-2024=2. Correct (Year 2).
        } else { // June(5) to Dec(11)
             // e.g. June 2024 (start 2024). 2024-2024=0. Need +1 -> Year 1.
             // e.g. Dec 2024 (start 2024). 2024-2024=0. Need +1 -> Year 1.
             theoreticalYear += 1;
        }

        if (theoreticalYear <= 0) theoreticalYear = 1; // Safety

        // Check Graduation
        if (theoreticalYear > 4) {
            batch.status = 'Graduated';
            batchesUpdated = true;
            
            // Deactivate all classes
             const activeClasses = classes.filter(c => c.batchId === batch.id && c.isActive);
             activeClasses.forEach(c => {
                 c.isActive = false;
                 classesUpdated = true;
             });
            return;
        }

        // Check Promotion
        const activeClass = classes.find(c => c.batchId === batch.id && c.isActive);
        
        // If no active class found (maybe just created or logic error), we might need to handle it.
        // But usually there is one.
        
        if (activeClass && activeClass.yearNumber < theoreticalYear) {
            // Needed Promotion
            console.log(`Promoting Batch ${batch.label} from Year ${activeClass.yearNumber} to ${theoreticalYear}`);
            
            // 1. Deactivate current
            activeClass.isActive = false;
            classesUpdated = true;

            // 2. Create new Active Class
            const labels = ["", "1st Year", "2nd Year", "3rd Year", "4th Year"];
            const newClass: ClassData = {
                id: `cls-${Date.now()}-${Math.random()}`,
                batchId: batch.id,
                yearNumber: theoreticalYear,
                yearLabel: labels[theoreticalYear] || `${theoreticalYear}th Year`,
                isActive: true
            };
            classes.push(newClass);
            classesUpdated = true;

            // 3. Copy Sections from previous active class
            const oldSections = sections.filter(s => s.classId === activeClass.id);
            oldSections.forEach(os => {
                sections.push({
                    id: `sec-${Date.now()}-${Math.random()}`,
                    classId: newClass.id,
                    sectionName: os.sectionName
                });
                sectionsUpdated = true;
            });
        }
    });

    if (batchesUpdated) saveData(BATCHES_KEY, batches);
    if (classesUpdated) saveData(CLASSES_KEY, classes);
    if (sectionsUpdated) saveData(SECTIONS_KEY, sections);
    
    // cleanup graduated students logic could go here
}

// Student generation functions removed to prevent dummy data

// Faculty generation functions removed to prevent dummy data

// Graduation Logic
export function checkGraduationLogic() {
  const students = getData<Student>(STUDENTS_KEY);
  const batches = getData<BatchData>(BATCHES_KEY); // Use safe interface
  
  let updated = false;
  const now = new Date();

  const updatedStudents = students.map(student => {
    // Check both label and name for compatibility
    const batch = batches.find(b => b.label === student.batch || b.name === student.batch);
    if (batch && batch.sem8EndDate && new Date(batch.sem8EndDate) < now) {
      if (student.status !== 'Graduated') {
        updated = true;
        return { ...student, status: 'Graduated' as const };
      }
    }
    return student;
  });

  if (updated) {
    saveStudents(updatedStudents);
  }
}

// Storage functions
export function getStudents(): Student[] {
  try {
    const stored = localStorage.getItem(STUDENTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveStudents(students: Student[]): void {
  localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
}

export function addStudent(student: Omit<Student, 'id' | 'createdAt'>): Student {
  const students = getStudents();
  const newStudent: Student = {
    ...student,
    id: `student-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  students.push(newStudent);
  saveStudents(students);
  return newStudent;
}

export function updateStudent(id: string, updates: Partial<Student>): Student | null {
  const students = getStudents();
  const index = students.findIndex(s => s.id === id);
  if (index === -1) return null;
  students[index] = { ...students[index], ...updates };
  saveStudents(students);
  return students[index];
}

export function deleteStudent(id: string): boolean {
  const students = getStudents();
  const filtered = students.filter(s => s.id !== id);
  if (filtered.length === students.length) return false;
  saveStudents(filtered);
  return true;
}

export function getFaculty(): Faculty[] {
  try {
    const stored = localStorage.getItem(FACULTY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveFaculty(faculty: Faculty[]): void {
  localStorage.setItem(FACULTY_KEY, JSON.stringify(faculty));
}

export function addFaculty(faculty: Omit<Faculty, 'id' | 'createdAt'>): Faculty {
  const allFaculty = getFaculty();
  const newFaculty: Faculty = {
    ...faculty,
    id: `faculty-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  allFaculty.push(newFaculty);
  saveFaculty(allFaculty);
  return newFaculty;
}

export function updateFaculty(id: string, updates: Partial<Faculty>): Faculty | null {
  const allFaculty = getFaculty();
  const index = allFaculty.findIndex(f => f.id === id);
  if (index === -1) return null;
  allFaculty[index] = { ...allFaculty[index], ...updates };
  saveFaculty(allFaculty);
  return allFaculty[index];
}

export function deleteFaculty(id: string): boolean {
  const allFaculty = getFaculty();
  const filtered = allFaculty.filter(f => f.id !== id);
  if (filtered.length === allFaculty.length) return false;
  saveFaculty(filtered);
  return true;
}

// Tutor generation functions removed to prevent dummy data

export function getTutors(): Tutor[] {
  try {
    const stored = localStorage.getItem(TUTORS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveTutors(tutors: Tutor[]): void {
  localStorage.setItem(TUTORS_KEY, JSON.stringify(tutors));
}

export function addTutor(tutor: Omit<Tutor, 'id' | 'createdAt'>): Tutor {
  const allTutors = getTutors();
  const newTutor: Tutor = {
    ...tutor,
    id: `tutor-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  allTutors.push(newTutor);
  saveTutors(allTutors);
  return newTutor;
}

export function updateTutor(id: string, updates: Partial<Tutor>): Tutor | null {
  const allTutors = getTutors();
  const index = allTutors.findIndex(t => t.id === id);
  if (index === -1) return null;
  allTutors[index] = { ...allTutors[index], ...updates };
  saveTutors(allTutors);
  return allTutors[index];
}


export function deleteTutor(id: string): boolean {
  const allTutors = getTutors();
  const filtered = allTutors.filter(t => t.id !== id);
  if (filtered.length === allTutors.length) return false;
  saveTutors(filtered);
  return true;
}

// Marks Management
export const MARKS_KEY = 'college_portal_marks';

export interface MarkEntry {
  id: string;
  studentId: string;
  subjectCode: string;
  examType: 'ia1' | 'ia2' | 'model' | 'semester' | string;
  marks: number;
  maxMarks: number;
  date: string;
  status: 'saved' | 'submitted' | 'verified' | 'approved' | 'rejected';
  submittedBy?: string;
  verifiedBy?: string;
  createdAt: string;
  updatedAt: string;
  breakdown?: any;
}

export function getMarks(): MarkEntry[] {
  return getData<MarkEntry>(MARKS_KEY);
}

export function saveMarks(marks: MarkEntry[]): void {
  saveData(MARKS_KEY, marks);
}

export function addOrUpdateMark(mark: Omit<MarkEntry, 'id' | 'createdAt' | 'updatedAt'>): MarkEntry {
  const allMarks = getMarks();
  const existingIndex = allMarks.findIndex(
    m => m.studentId === mark.studentId && m.subjectCode === mark.subjectCode && m.examType === mark.examType
  );

  const now = new Date().toISOString();

  if (existingIndex >= 0) {
    allMarks[existingIndex] = { ...allMarks[existingIndex], ...mark, updatedAt: now };
    saveMarks(allMarks);
    return allMarks[existingIndex];
  } else {
    const newMark = { ...mark, id: `mark-${Date.now()}-${Math.random()}`, createdAt: now, updatedAt: now };
    allMarks.push(newMark);
    saveMarks(allMarks);
    return newMark;
  }
}

export function updateMarkStatus(id: string, status: 'submitted' | 'verified' | 'approved' | 'rejected', processedBy: string): void {
  const all = getMarks();
  const index = all.findIndex(m => m.id === id);
  if (index !== -1) {
    all[index].status = status;
    if (status === 'verified') all[index].verifiedBy = processedBy;
    all[index].updatedAt = new Date().toISOString();
    saveMarks(all);
  }
}

export function getStudentMarks(studentId: string): MarkEntry[] {
  return getMarks().filter(m => m.studentId === studentId);
}

// Timetable Management
export const TIMETABLE_KEY = 'college_portal_timetable';

export interface TimetableSlot {
  id: string;
  day: string;
  period: number;
  subject: string;
  subjectCode: string;
  facultyId: string; // Changed from faculty name to ID for relation
  facultyName: string; // Kept for easy display, but should ideally be joined
  sectionId: string; // e.g., "A", "B" or complex ID
  classId: string; // e.g., "1st Year", "2021-2025"
  room: string;
  type: 'theory' | 'lab' | 'tutorial' | 'free';
}

export function getTimetable(): TimetableSlot[] {
  return getData<TimetableSlot>(TIMETABLE_KEY);
}

export function saveTimetable(timetable: TimetableSlot[]): void {
  saveData(TIMETABLE_KEY, timetable);
}

export function addTimetableSlot(slot: Omit<TimetableSlot, 'id'>): TimetableSlot {
  const allSlots = getTimetable();
  const newSlot = { ...slot, id: `slot-${Date.now()}-${Math.random()}` };
  allSlots.push(newSlot);
  saveTimetable(allSlots);
  return newSlot;
}

export function deleteTimetableSlot(id: string): void {
  const allSlots = getTimetable();
  saveTimetable(allSlots.filter(s => s.id !== id));
}

// Assignments Management
export const ASSIGNMENTS_KEY = 'college_portal_assignments';
export const SUBMISSIONS_KEY = 'college_portal_submissions';

export interface Assignment {
  id: string;
  title: string;
  description: string;
  subject: string;
  subjectCode: string;
  facultyId: string;
  facultyName: string;
  classId: string; // Year
  sectionId: string;
  dueDate: string;
  maxMarks: number;
  createdAt: string;
  status: 'active' | 'completed' | 'overdue'; // Derived or stored
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  fileUrl?: string; // Mock URL
  status: 'submitted' | 'late' | 'graded';
  obtainedMarks?: number;
  feedback?: string;
}

export function getAssignments(): Assignment[] {
  return getData<Assignment>(ASSIGNMENTS_KEY);
}

export function saveAssignments(assignments: Assignment[]): void {
  saveData(ASSIGNMENTS_KEY, assignments);
}

export function addAssignment(assignment: Omit<Assignment, 'id' | 'createdAt'>): Assignment {
  const allAssignments = getAssignments();
  const newAssignment = { 
    ...assignment, 
    id: `asg-${Date.now()}-${Math.random()}`,
    createdAt: new Date().toISOString()
  };
  allAssignments.push(newAssignment);
  saveAssignments(allAssignments);
  return newAssignment;
}

export function getSubmissions(): Submission[] {
  return getData<Submission>(SUBMISSIONS_KEY);
}

export function saveSubmissions(submissions: Submission[]): void {
  saveData(SUBMISSIONS_KEY, submissions);
}

export function submitAssignment(submission: Omit<Submission, 'id' | 'submittedAt' | 'status'>): Submission {
  const all = getSubmissions();
  // Check if already submitted
  const existingIndex = all.findIndex(s => s.assignmentId === submission.assignmentId && s.studentId === submission.studentId);
  
  const newSubmission: Submission = {
    ...submission,
    id: existingIndex >= 0 ? all[existingIndex].id : `sub-${Date.now()}-${Math.random()}`,
    submittedAt: new Date().toISOString(),
    status: 'submitted', // logic for 'late' can be added later
  };

  if (existingIndex >= 0) {
    all[existingIndex] = { ...all[existingIndex], ...newSubmission };
  } else {
    all.push(newSubmission);
  }
  
  saveSubmissions(all);
  return newSubmission;
}

export function gradeSubmission(submissionId: string, marks: number, feedback: string): Submission | null {
  const all = getSubmissions();
  const index = all.findIndex(s => s.id === submissionId);
  if (index === -1) return null;
  
  all[index].obtainedMarks = marks;
  all[index].feedback = feedback;
  all[index].status = 'graded';
  
  saveSubmissions(all);
  return all[index];
}

// Syllabus Management
export const SYLLABUS_KEY = 'college_portal_syllabus';

export interface Unit {
  title: string;
  status: 'completed' | 'in-progress' | 'pending';
}

export interface Syllabus {
  id: string;
  subjectCode: string;
  subjectName: string;
  credits: number;
  type: string;
  units: Unit[];
}

export function getSyllabus(): Syllabus[] {
  return getData<Syllabus>(SYLLABUS_KEY);
}

export function saveSyllabus(syllabus: Syllabus[]): void {
  saveData(SYLLABUS_KEY, syllabus);
}
// Resources Management (Notes, Question Banks, Manuals)
export const RESOURCES_KEY = 'college_portal_resources';

export interface Resource {
  id: string;
  title: string;
  subject: string;
  subjectCode: string;
  classId: string;
  sectionId?: string;
  type: 'Note' | 'QP' | 'Manual';
  fileType: string; // PDF, PPTX, etc.
  fileSize: string;
  facultyId: string;
  facultyName: string;
  downloads: number;
  createdAt: string;
}

export function getResources(): Resource[] {
  return getData<Resource>(RESOURCES_KEY);
}

export function saveResources(resources: Resource[]): void {
  saveData(RESOURCES_KEY, resources);
}

export function addResource(resource: Omit<Resource, 'id' | 'createdAt' | 'downloads'>): Resource {
  const all = getResources();
  const newResource: Resource = {
    ...resource,
    id: `res-${Date.now()}-${Math.random()}`,
    createdAt: new Date().toISOString(),
    downloads: 0
  };
  all.push(newResource);
  saveResources(all);
  return newResource;
}

export function deleteResource(id: string): boolean {
  const all = getResources();
  const filtered = all.filter(r => r.id !== id);
  if (filtered.length === all.length) return false;
  saveResources(filtered);
  return true;
}

export function incrementDownload(id: string): void {
  const all = getResources();
  const index = all.findIndex(r => r.id === id);
  if (index !== -1) {
    all[index].downloads += 1;
    saveResources(all);
  }
}

// Circulars & Notices
export const CIRCULARS_KEY = 'college_portal_circulars';

export interface Circular {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  audience: 'all' | 'students' | 'faculty' | 'tutors';
  attachment?: string;
  createdAt: string;
}

export function getCirculars(): Circular[] {
  return getData<Circular>(CIRCULARS_KEY);
}

export function saveCirculars(circulars: Circular[]): void {
  saveData(CIRCULARS_KEY, circulars);
}

export function addCircular(circular: Omit<Circular, 'id' | 'createdAt'>): Circular {
  const all = getCirculars();
  const newCircular: Circular = {
    ...circular,
    id: `circ-${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  all.push(newCircular);
  saveCirculars(all);
  return newCircular;
}

// Leave Management
export const LEAVE_KEY = 'college_portal_leave';

export interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  user_name?: string; // Support for backend casing
  roll_number?: string;
  batch_id?: string;
  batch_name?: string;
  current_semester?: number;
  section_id?: string;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  contact: string;
  status: 'pending' | 'pending_admin' | 'approved' | 'rejected' | 'cancel_requested' | 'cancelled';
  processedBy?: string;
  processedDate?: string;
  durationType?: string;
  approvedBy?: string;
  approved_by?: string;
  workingDays?: number;
  working_days?: number;
  placeToVisit?: string;
  place_to_visit?: string;
  forwarded_by_name?: string;
  approver_name?: string;
  approved_at?: string;
  rejection_reason?: string;
  proofUrl?: string;
  createdAt: string;
}

export function getLeaveRequests(): LeaveRequest[] {
  return getData<LeaveRequest>(LEAVE_KEY);
}

export function addLeaveRequest(request: Omit<LeaveRequest, 'id' | 'status' | 'createdAt'>): LeaveRequest {
  const all = getLeaveRequests();
  const newRequest: LeaveRequest = {
    ...request,
    id: `lv-${Date.now()}`,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  all.push(newRequest);
  saveData(LEAVE_KEY, all);
  return newRequest;
}

export function updateLeaveStatus(id: string, status: 'approved' | 'rejected', processedBy: string): void {
  const all = getLeaveRequests();
  const index = all.findIndex(l => l.id === id);
  if (index !== -1) {
    all[index].status = status;
    all[index].processedBy = processedBy;
    all[index].processedDate = new Date().toISOString();
    saveData(LEAVE_KEY, all);
  }
}

// LMS Quizzes
export const QUIZZES_KEY = 'college_portal_quizzes';

export interface Quiz {
  id: string;
  title: string;
  subject: string;
  subjectCode: string;
  duration: string;
  questions: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  deadline: string;
  assignedTo?: string;
  status: 'active' | 'scheduled' | 'expired';
  createdAt: string;
}

export function getQuizzes(): Quiz[] {
  return getData<Quiz>(QUIZZES_KEY);
}

export function addQuiz(quiz: Omit<Quiz, 'id' | 'createdAt'>): Quiz {
  const all = getQuizzes();
  const newQuiz: Quiz = {
    ...quiz,
    id: `qz-${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  all.push(newQuiz);
  saveData(QUIZZES_KEY, all);
  return newQuiz;
}

// ECA & Achievements
export const ACHIEVEMENTS_KEY = 'college_portal_achievements';

export interface Achievement {
  id: string;
  userId: string;
  userName: string;
  title: string;
  organization: string;
  date: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  points: number;
  certificateUrl?: string;
  link?: string;
  remarks?: string;
  createdAt: string;
}

export function getAchievements(): Achievement[] {
  return getData<Achievement>(ACHIEVEMENTS_KEY);
}

export function addAchievement(achievement: Omit<Achievement, 'id' | 'status' | 'points' | 'createdAt'>): Achievement {
  const all = getAchievements();
  const newAchievement: Achievement = {
    ...achievement,
    id: `ach-${Date.now()}`,
    status: 'pending',
    points: 0,
    createdAt: new Date().toISOString()
  };
  all.push(newAchievement);
  saveData(ACHIEVEMENTS_KEY, all);
  return newAchievement;
}

export function updateAchievementStatus(id: string, status: 'approved' | 'rejected', points: number = 0, remarks?: string): void {
  const all = getAchievements();
  const index = all.findIndex(a => a.id === id);
  if (index !== -1) {
    all[index].status = status;
    all[index].points = points;
    all[index].remarks = remarks;
    saveData(ACHIEVEMENTS_KEY, all);
  }
}

// Resume Builder
export const RESUME_KEY = 'college_portal_resumes';

export interface Resume {
  userId: string;
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    summary: string;
  };
  sections: {
    name: string;
    completion: number;
    data: any;
  }[];
  template: string;
  lastUpdated: string;
}

export function getResume(userId: string): Resume | null {
  const all = getData<Resume>(RESUME_KEY);
  return all.find(r => r.userId === userId) || null;
}

export function saveResume(resume: Resume): void {
  const all = getData<Resume>(RESUME_KEY);
  const index = all.findIndex(r => r.userId === resume.userId);
  if (index !== -1) {
    all[index] = resume;
  } else {
    all.push(resume);
  }
  saveData(RESUME_KEY, all);
}

// Quiz Results (for Leaderboard)
export const QUIZ_RESULTS_KEY = 'college_portal_quiz_results';

export interface QuizResult {
  id: string;
  quizId: string;
  userId: string;
  userName: string;
  score: number;
  timeTaken: string;
  completedAt: string;
}

export function getQuizResults(): QuizResult[] {
  return getData<QuizResult>(QUIZ_RESULTS_KEY);
}

export function addQuizResult(result: Omit<QuizResult, 'id' | 'completedAt'>): QuizResult {
  const all = getQuizResults();
  const newResult: QuizResult = {
    ...result,
    id: `qr-${Date.now()}`,
    completedAt: new Date().toISOString()
  };
  all.push(newResult);
  saveData(QUIZ_RESULTS_KEY, all);
  return newResult;
}

// Notifications
export const NOTIFICATIONS_KEY = 'college_portal_notifications';

export interface Notification {
  id: string;
  recipientId: string; // Faculty ID
  senderId: string;
  senderName: string;
  title: string;
  message: string;
  type: 'request' | 'system' | 'alert';
  read: boolean;
  createdAt: string;
  metadata?: any;
}

export function getNotifications(userId: string): Notification[] {
  const all = getData<Notification>(NOTIFICATIONS_KEY);
  return all.filter(n => n.recipientId === userId);
}

export function addNotification(notification: Omit<Notification, 'id' | 'read' | 'createdAt'>): Notification {
  const all = getData<Notification>(NOTIFICATIONS_KEY);
  const newNotification: Notification = {
    ...notification,
    id: `notif-${Date.now()}-${Math.random()}`,
    read: false,
    createdAt: new Date().toISOString()
  };
  all.push(newNotification);
  saveData(NOTIFICATIONS_KEY, all);
  return newNotification;
}

export function markNotificationRead(id: string): void {
  const all = getData<Notification>(NOTIFICATIONS_KEY);
  const index = all.findIndex(n => n.id === id);
  if (index !== -1) {
    all[index].read = true;
    saveData(NOTIFICATIONS_KEY, all);
  }
}


