import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuth } from '../context/AuthContext';

// Auth Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';

// Layouts
import { AdminLayout } from '../components/layout/AdminLayout';
import { MemberLayout } from '../components/layout/MemberLayout';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { MembersPage } from '../pages/admin/MembersPage';
import { AddMemberPage } from '../pages/admin/AddMemberPage';
import { MemberDetailsPage } from '../pages/admin/MemberDetailsPage';
import { ContributionsPage } from '../pages/admin/ContributionsPage';
import { ContributionDetailsPage } from '../pages/admin/ContributionDetailsPage';
import { WelfareCasesPage } from '../pages/admin/WelfareCasesPage';
import { WelfareCaseDetailsPage } from '../pages/admin/WelfareCaseDetailsPage';
import { FundManagementPage } from '../pages/admin/FundManagementPage';
import { BankTransactionsPage } from '../pages/admin/BankTransactionsPage';
import { CashTransactionsPage } from '../pages/admin/CashTransactionsPage';
import { SocietyTransactionsPage } from '../pages/admin/SocietyTransactionsPage';
import { NotificationsPage } from '../pages/admin/NotificationsPage';
import { ReportsPage } from '../pages/admin/ReportsPage';
import { EligibleRelationshipsPage } from '../pages/admin/EligibleRelationshipsPage';
import { SettingsPage } from '../pages/admin/SettingsPage';
import { AuditLogsPage } from '../pages/admin/AuditLogsPage';

// Member Pages
import { MemberDashboard } from '../pages/member/MemberDashboard';
import { MyProfilePage } from '../pages/member/MyProfilePage';
import { MyContributionsPage } from '../pages/member/MyContributionsPage';
import { SocietyFundPage } from '../pages/member/SocietyFundPage';
import { MemberTransactionsPage } from '../pages/member/MemberTransactionsPage';
import { MyNotificationsPage } from '../pages/member/MyNotificationsPage';

export const AppRoutes: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  const getHomeRedirect = () => {
    if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
    return user.role === 'ADMIN' ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/member/dashboard" replace />;
  };

  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={getHomeRedirect()} />

      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Admin Protected Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="members" element={<MembersPage />} />
        <Route path="members/new" element={<AddMemberPage />} />
        <Route path="members/:id" element={<MemberDetailsPage />} />
        <Route path="contributions" element={<ContributionsPage />} />
        <Route path="contributions/:id" element={<ContributionDetailsPage />} />
        <Route path="welfare" element={<WelfareCasesPage />} />
        <Route path="welfare/:id" element={<WelfareCaseDetailsPage />} />
        <Route path="fund" element={<FundManagementPage />} />
        <Route path="bank" element={<BankTransactionsPage />} />
        <Route path="cash" element={<CashTransactionsPage />} />
        <Route path="transactions" element={<SocietyTransactionsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="relationships" element={<EligibleRelationshipsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
      </Route>

      {/* Member Protected Routes */}
      <Route
        path="/member"
        element={
          <ProtectedRoute allowedRoles={['MEMBER']}>
            <MemberLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/member/dashboard" replace />} />
        <Route path="dashboard" element={<MemberDashboard />} />
        <Route path="profile" element={<MyProfilePage />} />
        <Route path="contributions" element={<MyContributionsPage />} />
        <Route path="fund" element={<SocietyFundPage />} />
        <Route path="transactions" element={<MemberTransactionsPage />} />
        <Route path="notifications" element={<MyNotificationsPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={getHomeRedirect()} />
    </Routes>
  );
};
