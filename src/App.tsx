import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeProvider";
import { Toaster } from "sonner";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import SignUpPage from "./pages/auth/SignUpPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import VerifyEmailPage from "./pages/auth/VerifyEmailPage";
import Dashboard from "./pages/Dashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherLayout from "./components/layout/TeacherLayout";
import TeacherDashboardPage from "./pages/teacher/DashboardPage";
import CreateClassPage from "./pages/teacher/CreateClassPage";
import ClassDashboardPage from "./pages/teacher/ClassDashboardPage";
import EditClassPage from "./pages/teacher/EditClassPage";
import ManageStudentPage from "./pages/teacher/ManageStudentPage";
import ManageParentsPage from "./pages/teacher/ManageParentsPage";
import ParentMessagesPage from "./pages/teacher/ParentMessagesPage";
import GenerateReportPage from "./pages/teacher/GenerateReportPage";
import AnnouncementsPage from "./pages/teacher/AnnouncementsPage";
import ParentLayout from "./components/layout/ParentLayout";
import ParentDashboardPage from "./pages/parent/DashboardPage";
import StudentDetailsPage from "./pages/parent/StudentDetailsPage";
import MessagesPage from "./pages/parent/MessagesPage";
import ConversationView from "./components/parent/ConversationView";
import ParentReportsPage from "./pages/parent/ReportsPage";
import ParentAnnouncementsPage from "./pages/parent/AnnouncementsPage";
import ParentSettingsPage from "./pages/parent/SettingsPage";
import ParentChildrenPage from "./pages/parent/ChildrenPage";
import ParentSchedulePage from "./pages/parent/SchedulePage";
import ParentProfilePage from "./pages/parent/ProfilePage";
import ParentDashboard from "./pages/ParentDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
});

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="classdojo-theme">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* Teacher Routes */}
              <Route
                path="/teacher"
                element={
                  <ProtectedRoute allowedRoles={["teacher"]}>
                    <TeacherLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<TeacherDashboardPage />} />
                <Route path="classes/create" element={<CreateClassPage />} />
                <Route path="classes/:classId" element={<ClassDashboardPage />} />
                <Route path="classes/:classId/edit" element={<EditClassPage />} />
                <Route path="classes/:classId/students/add" element={<ManageStudentPage />} />
                <Route path="classes/:classId/students/:studentId" element={<ManageStudentPage />} />
                <Route path="classes/:classId/students/:studentId/parents" element={<ManageParentsPage />} />
                <Route path="messages" element={<ParentMessagesPage />} />
                <Route path="messages/:conversationId" element={<ParentMessagesPage />} />
                <Route path="reports/generate" element={<GenerateReportPage />} />
                <Route path="announcements" element={<AnnouncementsPage />} />
                <Route path="announcements/create" element={<AnnouncementsPage />} />
              </Route>

              {/* Parent Routes */}
              <Route
                path="/parent"
                element={
                  <ProtectedRoute allowedRoles={["parent"]}>
                    <ParentLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<ParentDashboardPage />} />
                <Route path="children" element={<ParentChildrenPage />} />
                <Route path="children/:childId" element={<StudentDetailsPage />} />
                <Route path="messages" element={<MessagesPage />} />
                <Route path="messages/:conversationId" element={<ConversationView />} />
                <Route path="reports" element={<ParentReportsPage />} />
                <Route path="announcements" element={<ParentAnnouncementsPage />} />
                <Route path="schedule" element={<ParentSchedulePage />} />
                <Route path="settings" element={<ParentSettingsPage />} />
                <Route path="profile" element={<ParentProfilePage />} />
                <Route path="activity" element={<ParentDashboardPage />} />
              </Route>

              {/* Student Routes */}
              <Route
                path="/student/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Legacy Routes - Redirect to new structure */}
              <Route
                path="/parent/dashboard"
                element={<Navigate to="/parent/dashboard" replace />}
              />
              <Route
                path="/student/dashboard"
                element={<Navigate to="/student/dashboard" replace />}
              />

              {/* Catch-all Route */}
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </BrowserRouter>
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
