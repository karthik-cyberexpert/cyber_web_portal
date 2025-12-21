import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import LoginPage from "@/pages/LoginPage";
import StudentDashboard from "@/pages/dashboards/StudentDashboard";
import FacultyDashboard from "@/pages/dashboards/FacultyDashboard";
import TutorDashboard from "@/pages/dashboards/TutorDashboard";

// Student Imports
import PersonalDetailsStudent from "@/pages/student/PersonalDetails";
import AcademicDetailsStudent from "@/pages/student/AcademicDetails";
import TimetableSyllabusStudent from "@/pages/student/TimetableSyllabus";
import MarksGradesStudent from "@/pages/student/MarksGrades";
import NotesQuestionBankStudent from "@/pages/student/NotesQuestionBank";
import AssignmentsStudent from "@/pages/student/Assignments";
import CircularsStudent from "@/pages/student/Circulars";
import LeavePortalStudent from "@/pages/student/LeavePortal";
import LMSQuizStudent from "@/pages/student/LMSQuiz";
import ECAAchievementsStudent from "@/pages/student/ECAAchievements";
import ResumeBuilderStudent from "@/pages/student/ResumeBuilder";

// Faculty Imports
import PersonalDetailsFaculty from "@/pages/faculty/PersonalDetails";
import MyClassesFaculty from "@/pages/faculty/MyClasses";
import TimetableFaculty from "@/pages/faculty/Timetable";
import MarksEntryFaculty from "@/pages/faculty/MarksEntry";
import NotesUploadFaculty from "@/pages/faculty/NotesUpload";
import AssignmentsFaculty from "@/pages/faculty/Assignments";
import CircularsFaculty from "@/pages/faculty/Circulars";

// Tutor Imports
import PersonalDetails from "@/pages/tutor/PersonalDetails";
import ClassManagement from "@/pages/tutor/ClassManagement";
import TimetableTutor from "@/pages/tutor/Timetable";
import VerifyMarks from "@/pages/tutor/VerifyMarks";
import NotesStatus from "@/pages/tutor/NotesStatus";
import AssignmentStatus from "@/pages/tutor/AssignmentStatus";
import LeaveApprovals from "@/pages/tutor/LeaveApprovals";
import LMSAnalytics from "@/pages/tutor/LMSAnalytics";
import ECAApprovals from "@/pages/tutor/ECAApprovals";
import CircularsTutor from "@/pages/tutor/Circulars";
import ClassAnalytics from "@/pages/tutor/ClassAnalytics";
import AdminDashboard from "@/pages/dashboards/AdminDashboard";
import ManageStudents from "@/pages/admin/ManageStudents";
import ManageFaculty from "@/pages/admin/ManageFaculty";
import ManageTutors from "@/pages/admin/ManageTutors";
import BatchesClasses from "@/pages/admin/BatchesClasses";
import TimetableAdmin from "@/pages/admin/Timetable";
import ApproveMarks from "@/pages/admin/ApproveMarks";
import NotesAnalytics from "@/pages/admin/NotesAnalytics";
import Assignments from "@/pages/admin/Assignments";
import CircularsAdmin from "@/pages/admin/Circulars";
import LMSManagement from "@/pages/admin/LMSManagement";
import ECAAnalytics from "@/pages/admin/ECAAnalytics";
import Settings from "@/pages/admin/Settings";
import Profile from "@/pages/admin/Profile";
import LeaveApprovalsAdmin from "@/pages/admin/LeaveApprovals";
import NotFound from "./pages/NotFound";
import HoverReceiver from "@/visual-edits/VisualEditsMessenger";

const queryClient = new QueryClient();

const App = () => (
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
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<LoginPage />} />
              
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
                  <Route path="lms" element={<LMSQuizStudent />} />
                  <Route path="eca" element={<ECAAchievementsStudent />} />
                  <Route path="resume" element={<ResumeBuilderStudent />} />
                </Route>
              
              {/* Faculty Routes */}
              <Route
                path="/faculty"
                element={
                  <ProtectedRoute allowedRoles={['faculty']}>
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
                  <Route path="analytics" element={<ClassAnalytics />} />
                    <Route path="personal" element={<PersonalDetails />} />
                    <Route path="class" element={<ClassManagement />} />
                    <Route path="timetable" element={<TimetableTutor />} />
                    <Route path="marks" element={<VerifyMarks />} />
                  <Route path="notes" element={<NotesStatus />} />
                  <Route path="assignments" element={<AssignmentStatus />} />
                  <Route path="leave" element={<LeaveApprovals />} />
                  <Route path="lms" element={<LMSAnalytics />} />
                  <Route path="eca" element={<ECAApprovals />} />
                  <Route path="circulars" element={<CircularsTutor />} />
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
                <Route path="batches" element={<BatchesClasses />} />
                  <Route path="timetable" element={<TimetableAdmin />} />
                  <Route path="marks" element={<ApproveMarks />} />
                  <Route path="notes" element={<NotesAnalytics />} />
                  <Route path="assignments" element={<Assignments />} />
                  <Route path="circulars" element={<CircularsAdmin />} />
                <Route path="lms" element={<LMSManagement />} />
                <Route path="eca" element={<ECAAnalytics />} />
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

export default App;