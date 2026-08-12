import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { PendingApprovalPage } from '../pages/auth/PendingApprovalPage';
import { RejectedPage } from '../pages/auth/RejectedPage';
import { HodActivatePage } from '../pages/auth/HodActivatePage';

import { HODLayout } from '../components/layout/HODLayout';
import { FacultyLayout } from '../components/layout/FacultyLayout';
import { useAuth } from '../context/AuthContext';

// HOD Pages
import { DashboardPage } from '../pages/hod/DashboardPage';
import { FacultyVerificationPage } from '../pages/hod/FacultyVerificationPage';
import { FacultyPage } from '../pages/hod/FacultyPage';
import { TasksPage } from '../pages/hod/TasksPage';
import { WorkloadPage } from '../pages/hod/WorkloadPage';
import { AssignmentsPage } from '../pages/hod/AssignmentsPage';
import { RecommendationsPage } from '../pages/hod/RecommendationsPage';
import { SimulatorPage } from '../pages/hod/SimulatorPage';
import { AnalyticsPage } from '../pages/hod/AnalyticsPage';

// Faculty Pages
import { MyDashboardPage } from '../pages/faculty/MyDashboardPage';
import { MyTasksPage } from '../pages/faculty/MyTasksPage';
import { MyWorkloadPage } from '../pages/faculty/MyWorkloadPage';
import { SchedulePage } from '../pages/faculty/SchedulePage';
import { ProfilePage } from '../pages/faculty/ProfilePage';

export const AppRoutes: React.FC = () => {
  const { isAuthenticated, role } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/pending-approval" element={<PendingApprovalPage />} />
      <Route path="/rejected" element={<RejectedPage />} />
      <Route path="/hod-activate" element={<HodActivatePage />} />

      {/* HOD Protected Group */}
      <Route element={<ProtectedRoute allowedRole="HOD" />}>
        <Route path="/hod" element={<HODLayout />}>
          <Route index element={<Navigate to="/hod/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="verification" element={<FacultyVerificationPage />} />
          <Route path="faculty" element={<FacultyPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="workload" element={<WorkloadPage />} />
          <Route path="assignments" element={<AssignmentsPage />} />
          <Route path="recommendations" element={<RecommendationsPage />} />
          <Route path="simulator" element={<SimulatorPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
        </Route>
      </Route>

      {/* Faculty Protected Group */}
      <Route element={<ProtectedRoute allowedRole="FACULTY" />}>
        <Route path="/faculty" element={<FacultyLayout />}>
          <Route index element={<Navigate to="/faculty/dashboard" replace />} />
          <Route path="dashboard" element={<MyDashboardPage />} />
          <Route path="tasks" element={<MyTasksPage />} />
          <Route path="workload" element={<MyWorkloadPage />} />
          <Route path="schedule" element={<SchedulePage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Fallback Catch-all */}
      <Route
        path="*"
        element={
          <Navigate
            to={
              isAuthenticated
                ? role === 'HOD'
                  ? '/hod/dashboard'
                  : '/faculty/dashboard'
                : '/login'
            }
            replace
          />
        }
      />
    </Routes>
  );
};

