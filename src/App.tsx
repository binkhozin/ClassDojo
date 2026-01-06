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
import LogBehaviorPage from "./pages/teacher/LogBehaviorPage";
import BehaviorLogPage from "./pages/teacher/BehaviorLogPage";
import LeaderboardPage from "./pages/teacher/LeaderboardPage";
import StudentPerformancePage from "./pages/teacher/StudentPerformancePage";
import RewardsManagementPage from "./pages/teacher/RewardsManagementPage";
import BadgesPage from "./pages/teacher/BadgesPage";
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
                <Route path="behaviors/log" element={<LogBehaviorPage />} />
                <Route path="behaviors/history" element={<BehaviorLogPage />} />
                <Route path="leaderboard" element={<LeaderboardPage />} />
                <Route path="performance" element={<StudentPerformancePage />} />
                <Route path="rewards" element={<RewardsManagementPage />} />
                <Route path="badges" element={<BadgesPage />} />
              </Route>
              <Route
                path="/parent/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["parent"]}>
                    <ParentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
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
