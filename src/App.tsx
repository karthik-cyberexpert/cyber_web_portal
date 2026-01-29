import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { initializeStorage } from "@/lib/data-store";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import HoverReceiver from "@/visual-edits/VisualEditsMessenger";

// Layout & Auth
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Public Pages
// Public Pages
import LandingPage from "@/pages/LandingPage";
import AboutPage from "@/pages/public/AboutPage";
import FacilitiesPage from "@/pages/public/FacilitiesPage";
import AcademicsPage from "@/pages/public/AcademicsPage";
import ProjectsPage from "@/pages/public/ProjectsPage";
import ContactPage from "@/pages/public/ContactPage";
import LoginPage from "@/pages/LoginPage";
import SetPassword from "@/pages/SetPassword";
import NotFound from "@/pages/NotFound";

// Student Pages
import StudentDashboard from "@/pages/dashboards/StudentDashboard";
import PersonalDetailsStudent from "@/pages/student/PersonalDetails";
import AcademicDetailsStudent from "@/pages/student/AcademicDetails";
import TimetableSyllabusStudent from "@/pages/student/TimetableSyllabus";
import MarksGradesStudent from "@/pages/student/MarksGrades";
import NotesQuestionBankStudent from "@/pages/student/NotesQuestionBank";
import AssignmentsStudent from "@/pages/student/Assignments";
import CircularsStudent from "@/pages/student/Circulars";
import LeavePortalStudent from "@/pages/student/LeavePortal";
import ODPortalStudent from "@/pages/student/ODPortal";
import FeedbackPortalStudent from "@/pages/student/FeedbackPortal";
import GrievancePortalStudent from "@/pages/student/GrievancePortal";
import LostFoundPortalStudent from "@/pages/student/LostFoundPortal";
import LMSQuizStudent from "@/pages/student/LMSQuiz";
import ECAAchievementsStudent from "@/pages/student/ECAAchievements";
import ResumeBuilderStudent from "@/pages/student/ResumeBuilder";

// Faculty Pages
import FacultyDashboard from "@/pages/dashboards/FacultyDashboard";
import PersonalDetailsFaculty from "@/pages/faculty/PersonalDetails";
import MyClassesFaculty from "@/pages/faculty/MyClasses";
import TimetableFaculty from "@/pages/faculty/Timetable";
import MarksEntryFaculty from "@/pages/faculty/MarksEntry";
import NotesUploadFaculty from "@/pages/faculty/NotesUpload";
import AssignmentsFaculty from "@/pages/faculty/Assignments";
import MarksEntry from "@/pages/faculty/MarksEntry";
import MarksEntrySheet from "@/pages/faculty/MarksEntrySheet";
import CircularsFaculty from "@/pages/faculty/Circulars";
import StudentsFaculty from "@/pages/faculty/Students";

// Tutor Pages
import TutorDashboard from "@/pages/dashboards/TutorDashboard";
import PersonalDetails from "@/pages/tutor/PersonalDetails";
import ClassManagement from "@/pages/tutor/ClassManagement";
import StudentProfileView from "@/pages/tutor/StudentProfileView";
import TimetableTutor from "@/pages/tutor/Timetable";
import VerifyMarks from "@/pages/tutor/VerifyMarks";
import ViewMarksTutor from "@/pages/tutor/ViewMarks";
import NotesStatus from "@/pages/tutor/NotesStatus";
import AssignmentStatus from "@/pages/tutor/AssignmentStatus";
import LeaveApprovals from "@/pages/tutor/LeaveApprovals";
import ODApprovals from "@/pages/tutor/ODApprovals";
import GrievancePortalTutor from "@/pages/tutor/GrievancePortal";
import LostFoundPortalTutor from "@/pages/tutor/LostFoundPortal";
import LMSAnalytics from "@/pages/tutor/LMSAnalytics";
import ECAApprovals from "@/pages/tutor/ECAApprovals";
import CircularsTutor from "@/pages/tutor/Circulars";

// Admin Pages
import AdminDashboard from "@/pages/dashboards/AdminDashboard";
import ManageStudents from "@/pages/admin/ManageStudents";
import ManageFaculty from "@/pages/admin/ManageFaculty";
import ManageTutors from "@/pages/admin/ManageTutors";
import PromoteStudents from "@/pages/admin/PromoteStudents";
import ManageSubjects from "@/pages/admin/ManageSubjects";
import BatchesClasses from "@/pages/admin/BatchesClasses";
import TimetableAdmin from "@/pages/admin/Timetable";
import ApproveMarks from "@/pages/admin/ApproveMarks";
import NotesAnalytics from "@/pages/admin/NotesAnalytics";
import Assignments from "@/pages/admin/Assignments";
import CircularsAdmin from "@/pages/admin/Circulars";
import LMSManagement from "@/pages/admin/LMSManagement";
import ECAAnalytics from "@/pages/admin/ECAAnalytics";
import LeaveApprovalsAdmin from "@/pages/admin/LeaveApprovals";
import FeedbackPortalAdmin from "@/pages/admin/FeedbackPortal";
import FeedbackResults from "@/pages/admin/FeedbackResults";
import GrievancePortalAdmin from "@/pages/admin/GrievancePortal";
import AdminLostFoundPortal from './pages/admin/LostFoundPortal';
import ExamSchedule from './pages/admin/schedules/ExamSchedule';
import HolidaysSchedule from './pages/admin/schedules/HolidaysSchedule';
import Settings from "@/pages/admin/Settings";
import Profile from "@/pages/admin/Profile";
import LeaveReport from "@/pages/admin/reports/LeaveReport";
import ODReport from "@/pages/admin/reports/ODReport";
import MarksReport from "@/pages/admin/reports/MarksReport";
import ViewMarks from "@/pages/admin/ViewMarks";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    initializeStorage();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
      <Toaster />
      <Sonner />
      <HoverReceiver />
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/facilities" element={<FacilitiesPage />} />
              <Route path="/academics" element={<AcademicsPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/set-password" element={<SetPassword />} />
              
                {/* Student Routes */}
                <Route
                  path="/student"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<StudentDashboard />} />
                  <Route path="personal" element={<PersonalDetailsStudent />} />
                  <Route path="academic" element={<AcademicDetailsStudent />} />
                  <Route path="timetable" element={<TimetableSyllabusStudent />} />
                  <Route path="marks" element={<MarksGradesStudent />} />
                  <Route path="notes" element={<NotesQuestionBankStudent />} />
                  <Route path="assignments" element={<AssignmentsStudent />} />
                  <Route path="circulars" element={<CircularsStudent />} />
                  <Route path="leave" element={<LeavePortalStudent />} />
                  <Route path="od" element={<ODPortalStudent />} />
                  <Route path="feedback" element={<FeedbackPortalStudent />} />
                  <Route path="grievance" element={<GrievancePortalStudent />} />
                  <Route path="lost-found" element={<LostFoundPortalStudent />} />
                  <Route path="lms" element={<LMSQuizStudent />} />
                  <Route path="eca" element={<ECAAchievementsStudent />} />
                  <Route path="resume" element={<ResumeBuilderStudent />} />
                </Route>
              
              {/* Faculty Routes */}
              <Route
                path="/faculty"
                element={
                  <ProtectedRoute allowedRoles={['faculty', 'tutor']}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<FacultyDashboard />} />
                <Route path="personal" element={<PersonalDetailsFaculty />} />
                <Route path="classes" element={<MyClassesFaculty />} />
                <Route path="timetable" element={<TimetableFaculty />} />
                <Route path="marks" element={<MarksEntryFaculty />} />
                <Route path="notes" element={<NotesUploadFaculty />} />
                <Route path="assignments" element={<AssignmentsFaculty />} />
                <Route path="circulars" element={<CircularsFaculty />} />
                <Route path="students" element={<StudentsFaculty />} />
                <Route path="marks/entry" element={<MarksEntry />} />
                <Route path="marks/sheet" element={<MarksEntrySheet />} />
              </Route>
              
                {/* Tutor Routes */}
                <Route
                  path="/tutor"
                  element={
                    <ProtectedRoute allowedRoles={['tutor']}>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<TutorDashboard />} />
                    <Route path="personal" element={<PersonalDetails />} />
                    <Route path="class" element={<ClassManagement />} />
                    <Route path="student/:id" element={<StudentProfileView />} />
                    <Route path="timetable" element={<TimetableTutor />} />
                    <Route path="marks" element={<VerifyMarks />} />
                    <Route path="view-marks" element={<ViewMarksTutor />} />
                  <Route path="notes" element={<NotesStatus />} />
                  <Route path="assignments" element={<AssignmentStatus />} />
                  <Route path="leave" element={<LeaveApprovals />} />
                  <Route path="od" element={<ODApprovals />} />
                  <Route path="grievance" element={<GrievancePortalTutor />} />
                  <Route path="lost-found" element={<LostFoundPortalTutor />} />
                  <Route path="lms" element={<LMSAnalytics />} />
                  <Route path="eca" element={<ECAApprovals />} />
                  <Route path="circulars" element={<CircularsTutor />} />
                  <Route path="reports" element={<Navigate to="/tutor/reports/leave" replace />} />
                  <Route path="reports/leave" element={<LeaveReport />} />
                  <Route path="reports/od" element={<ODReport />} />
                  <Route path="reports/marks" element={<MarksReport />} />
                </Route>
              
              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="students" element={<ManageStudents />} />
                <Route path="faculty" element={<ManageFaculty />} />
                <Route path="tutors" element={<ManageTutors />} />
                <Route path="promote" element={<PromoteStudents />} />
                <Route path="subjects" element={<ManageSubjects />} />
                <Route path="batches" element={<BatchesClasses />} />

                  <Route path="timetable" element={<Navigate to="/admin/timetable/students" replace />} />
                  <Route path="timetable/students" element={<TimetableAdmin view="students" />} />
                  <Route path="timetable/faculty" element={<TimetableAdmin view="faculty" />} />
                  <Route path="marks" element={<ApproveMarks />} />
                  <Route path="requests" element={<Navigate to="/admin/requests/leave" replace />} />
                  <Route path="requests/leave" element={<LeaveApprovalsAdmin filterType="leave" />} />
                  <Route path="requests/od" element={<LeaveApprovalsAdmin filterType="od" />} />
                  <Route path="requests/od" element={<LeaveApprovalsAdmin filterType="od" />} />
                  <Route path="feedback" element={<FeedbackPortalAdmin />} />
                  <Route path="feedback/:id/results" element={<FeedbackResults />} />
                  <Route path="grievance" element={<GrievancePortalAdmin />} />
                  <Route path="lost-found" element={<AdminLostFoundPortal />} />
                  <Route path="schedule/exams" element={<ExamSchedule />} />
                  <Route path="schedule/holidays" element={<HolidaysSchedule />} />

                  <Route path="marks" element={<ApproveMarks />} />
                  <Route path="view-marks" element={<ViewMarks />} />
                  <Route path="notes" element={<NotesAnalytics />} />
                  <Route path="assignments" element={<Assignments />} />
                  <Route path="circulars" element={<CircularsAdmin />} />
                <Route path="lms" element={<LMSManagement />} />
                  <Route path="eca" element={<ECAAnalytics />} />
                  <Route path="leave" element={<LeaveApprovalsAdmin />} />
                  <Route path="reports" element={<Navigate to="/admin/reports/leave" replace />} />
                  <Route path="reports/leave" element={<LeaveReport />} />
                  <Route path="reports/od" element={<ODReport />} />
                  <Route path="reports/marks" element={<MarksReport />} />
                  <Route path="settings" element={<Settings />} />
                <Route path="profile" element={<Profile />} />
              </Route>
              
              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;