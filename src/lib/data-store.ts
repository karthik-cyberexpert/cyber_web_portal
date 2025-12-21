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

// Initialization Logic
export function initializeStorage() {
  const keys = [
    'users', 'students', 'faculties', 'tutors', 'admins', 'batches', 'classes', 
    'sections', 'semesters', 'subjects', 'subjectAssignments', 'timetable', 
    'notesQbank', 'assignments', 'submissions', 'notices', 'marksInternal', 
    'marksExternal', 'eca', 'lmsAttempts', 'resumeData', 'leaveRequests'
  ];

  keys.forEach(key => {
    if (!localStorage.getItem(`college_portal_${key}`)) {
      localStorage.setItem(`college_portal_${key}`, JSON.stringify([]));
    }
  });

  // Seed with mock data if students are empty
  if (getData(STUDENTS_KEY).length === 0) {
    saveStudents(generateMockStudents());
  }
  if (getData(FACULTY_KEY).length === 0) {
    saveFaculty(generateMockFaculty());
  }
  if (getData(TUTORS_KEY).length === 0) {
    saveTutors(generateMockTutors());
  }

  // Seed batches if empty
  const BATCHES_KEY = 'college_portal_batches';
  if (getData(BATCHES_KEY).length === 0) {
    saveData(BATCHES_KEY, [
      { id: '1', name: '2021-2025', sem8EndDate: '2025-05-30' },
      { id: '2', name: '2022-2026', sem8EndDate: '2026-05-30' },
      { id: '3', name: '2023-2027', sem8EndDate: '2027-05-30' },
      { id: '4', name: '2024-2028', sem8EndDate: '2028-05-30' },
      { id: '5', name: '2020-2024', sem8EndDate: '2024-05-30' }, // This batch is graduated
    ]);
  }

  checkGraduationLogic();

  if (getData(LEAVE_REQUESTS_KEY).length === 0) {
    saveData(LEAVE_REQUESTS_KEY, [
      { 
        id: '1', 
        student: 'Arun Prasath', 
        rollNo: '21CS001', 
        type: 'Medical', 
        startDate: '2024-03-20', 
        endDate: '2024-03-22', 
        days: 3, 
        reason: 'Severe fever and doctor advised rest.',
        status: 'pending',
        photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop'
      },
      { 
        id: '2', 
        student: 'Priya Sharma', 
        rollNo: '21CS045', 
        type: 'Family Function', 
        startDate: '2024-03-25', 
        endDate: '2024-03-25', 
        days: 1, 
        reason: "Sister's wedding engagement ceremony.",
        status: 'pending',
        photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop'
      }
    ]);
  }

  checkGraduationLogic();
}

// Generate mock students
const generateMockStudents = (): Student[] => {
  const batches = ['2021-2025', '2022-2026', '2023-2027', '2024-2028'];
  const sections = ['A', 'B', 'C', 'D'];
  const names = [
    'Arun Prasath', 'Priya Sharma', 'Karthik Raja', 'Divya Lakshmi', 'Rahul Kumar',
    'Sneha Patel', 'Vikram Singh', 'Anitha Devi', 'Suresh Babu', 'Meena Kumari',
    'Rajesh Kannan', 'Lakshmi Priya', 'Ganesh Murthy', 'Kavitha Rani', 'Mohan Das',
    'Revathi Subramaniam', 'Senthil Kumar', 'Uma Maheswari', 'Venkat Raman', 'Yamini Krishnan',
    'Arjun Reddy', 'Bhavani Devi', 'Chandru Mohan', 'Deepa Sundaram', 'Ezhil Arasan',
    'Fathima Begum', 'Gokul Nath', 'Harini Venkatesan', 'Ibrahim Khan', 'Janani Ramesh'
  ];

  return names.map((name, index) => {
    const batchIndex = Math.floor(index / 8);
    const batch = batches[batchIndex] || batches[0];
    const year = 4 - batchIndex;
    const semester = year * 2 - (Math.random() > 0.5 ? 0 : 1);
    const section = sections[index % 4];

    return {
      id: `student-${index + 1}`,
      rollNumber: `21CSE${String(index + 1).padStart(3, '0')}`,
      name,
      email: `${name.toLowerCase().replace(' ', '.')}@student.college.edu`,
      phone: `+91 ${Math.floor(7000000000 + Math.random() * 3000000000)}`,
      batch,
      year: Math.max(1, Math.min(4, year)),
      semester: Math.max(1, Math.min(8, semester)),
      section,
      enrollmentType: Math.random() > 0.2 ? 'Regular' : 'Lateral',
      admissionType: Math.random() > 0.7 ? 'Management' : Math.random() > 0.5 ? 'Government' : 'NRI',
      status: Math.random() > 0.9 ? 'On Leave' : 'Active',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      dateOfBirth: `${2000 + Math.floor(Math.random() * 4)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      address: 'Chennai, Tamil Nadu',
      guardianName: `Mr/Mrs ${name.split(' ')[1] || 'Parent'}`,
      guardianPhone: `+91 ${Math.floor(7000000000 + Math.random() * 3000000000)}`,
      attendance: Math.floor(75 + Math.random() * 25),
      cgpa: Number((6 + Math.random() * 4).toFixed(2)),
      createdAt: new Date().toISOString(),
    };
  });
};

// Generate mock faculty
const generateMockFaculty = (): Faculty[] => {
  const designations: Faculty['designation'][] = ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer'];
  const subjects = ['Data Structures', 'DBMS', 'Operating Systems', 'Computer Networks', 'Machine Learning', 'Web Development', 'Cloud Computing', 'Cyber Security'];
  const sections = ['CSE-A', 'CSE-B', 'CSE-C', 'CSE-D'];
  
  const names = [
    'Dr. Rajesh Kumar', 'Prof. Lakshmi Devi', 'Mr. Senthil Murugan', 'Dr. Anand Sharma',
    'Prof. Kavitha Sundaram', 'Dr. Ramesh Babu', 'Ms. Priya Krishnan', 'Mr. Vijay Anand',
    'Dr. Uma Maheswari', 'Prof. Suresh Kumar', 'Dr. Meena Rani', 'Mr. Karthik Raja',
    'Dr. Ganesh Iyer', 'Prof. Revathi Subramaniam', 'Ms. Deepa Venkat'
  ];

  return names.map((name, index) => ({
    id: `faculty-${index + 1}`,
    employeeId: `EMP${String(index + 1).padStart(4, '0')}`,
    name,
    email: `${name.toLowerCase().replace(/[^a-z]/g, '.').replace(/\.+/g, '.')}@college.edu`,
    phone: `+91 ${Math.floor(7000000000 + Math.random() * 3000000000)}`,
    designation: designations[index % designations.length],
    qualification: index < 5 ? 'Ph.D in Computer Science' : index < 10 ? 'M.Tech in CSE' : 'M.Sc in Computer Science',
    specialization: subjects[index % subjects.length],
    experience: Math.floor(5 + Math.random() * 20),
    subjects: [subjects[index % subjects.length], subjects[(index + 1) % subjects.length]],
    sections: [sections[index % sections.length], sections[(index + 1) % sections.length]],
    status: 'Active' as const,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
    dateOfJoining: `${2010 + Math.floor(Math.random() * 14)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-01`,
    address: 'Chennai, Tamil Nadu',
    createdAt: new Date().toISOString(),
  }));
};

// Generate mock tutors
const generateMockTutors = (): Tutor[] => {
  const batches = ['2021-2025', '2022-2026', '2023-2027', '2024-2028'];
  const sections = ['A', 'B', 'C', 'D'];
  
  const tutorNames = [
    'Prof. Lakshmi Devi', 'Dr. Ramesh Babu', 'Mr. Senthil Murugan', 'Dr. Anand Sharma',
    'Prof. Kavitha Sundaram', 'Ms. Priya Krishnan', 'Mr. Vijay Anand', 'Dr. Uma Maheswari'
  ];

  return tutorNames.map((name, index) => ({
    id: `tutor-${index + 1}`,
    facultyId: `faculty-${index + 2}`,
    name,
    email: `${name.toLowerCase().replace(/[^a-z]/g, '.').replace(/\.+/g, '.')}@college.edu`,
    phone: `+91 ${Math.floor(7000000000 + Math.random() * 3000000000)}`,
    designation: index % 2 === 0 ? 'Associate Professor' : 'Assistant Professor',
    batch: batches[Math.floor(index / 2)],
    section: sections[index % 4],
    studentsCount: Math.floor(55 + Math.random() * 10),
    status: 'Active',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
    createdAt: new Date().toISOString(),
  }));
};

// Graduation Logic
export function checkGraduationLogic() {
  const students = getData<Student>(STUDENTS_KEY);
  const batches = getData<{ id: string, name: string, sem8EndDate: string }>('college_portal_batches');
  
  let updated = false;
  const now = new Date();

  const updatedStudents = students.map(student => {
    const batch = batches.find(b => b.name === student.batch);
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
    if (stored) {
      return JSON.parse(stored);
    }
    const mockData = generateMockStudents();
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(mockData));
    return mockData;
  } catch {
    return generateMockStudents();
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
    if (stored) {
      return JSON.parse(stored);
    }
    const mockData = generateMockFaculty();
    localStorage.setItem(FACULTY_KEY, JSON.stringify(mockData));
    return mockData;
  } catch {
    return generateMockFaculty();
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

export function getTutors(): Tutor[] {
  try {
    const stored = localStorage.getItem(TUTORS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    const mockData = generateMockTutors();
    localStorage.setItem(TUTORS_KEY, JSON.stringify(mockData));
    return mockData;
  } catch {
    return generateMockTutors();
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
