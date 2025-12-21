import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { initializeStorage } from "@/lib/data-store";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

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
                  <Route path="leave" element={<LeaveApprovalsAdmin />} />
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