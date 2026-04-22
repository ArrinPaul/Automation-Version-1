import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from './features/Dashboard';
import TransactionsPage from './features/TransactionsPage';
import SocietiesPage from './features/SocietiesPage';
import EventsPage from './features/EventsPage';
import ProjectsPage from './features/ProjectsPage';
import AnnouncementsPage from './features/AnnouncementsPage';
import CalendarPage from './features/CalendarPage';
import CommunicationHubPage from './features/CommunicationHubPage';
import UserManagementPage from './features/UserManagementPage';
import RegistryPage from './features/RegistryPage';
import FinancialReportsPage from './features/FinancialReportsPage';
import QuarterlyStatementPage from './features/QuarterlyStatementPage';
import Login from './features/Login';
import Sidebar from './components/layout/Sidebar';
import ShellHeader from './components/layout/ShellHeader';
import { Toaster } from 'sonner';
import './styles/globals.css';

const queryClient = new QueryClient();

type Role = 'MANAGEMENT' | 'FACULTY_ADVISOR' | 'SOCIETY_OB' | 'MEMBER';

const roleHomeMap: Record<Role, string> = {
  MANAGEMENT: '/transactions',
  FACULTY_ADVISOR: '/societies',
  SOCIETY_OB: '/projects',
  MEMBER: '/events',
};

const ALL_ROLES: Role[] = ['MANAGEMENT', 'FACULTY_ADVISOR', 'SOCIETY_OB', 'MEMBER'];
const OPERATIONS_ROLES: Role[] = ['MANAGEMENT', 'FACULTY_ADVISOR', 'SOCIETY_OB'];

const isRole = (value: string): value is Role => ALL_ROLES.includes(value as Role);

const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: Role[] }> = ({ children, roles }) => {
  const { user, profile, loading } = useAuth();

  if (loading) return <div className="bg-background min-h-screen flex items-center justify-center font-mono text-accent animate-pulse">BOOTING_SYSTEM...</div>;

  if (!user) return <Navigate to="/login" />;

  if (!profile) return <Navigate to="/login" />;

  if (!isRole(profile.role)) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(profile.role)) {
    return <Navigate to={roleHomeMap[profile.role]} replace />;
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <ShellHeader />
        <main className="flex-1 overflow-auto">
        {children}
        </main>
      </div>
    </div>
  );
};

const PublicLoginRoute: React.FC = () => {
  const { user, profile, loading, signOut } = useAuth();

  if (loading) return <div className="bg-background min-h-screen flex items-center justify-center font-mono text-accent animate-pulse">BOOTING_SYSTEM...</div>;

  if (user && profile && isRole(profile.role)) {
    return <Navigate to={roleHomeMap[profile.role]} replace />;
  }

  if (user && !profile) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center p-6">
        <div className="border border-white/10 bg-black/40 p-6 text-center max-w-md">
          <p className="font-mono text-sm text-white mb-3">Profile synchronization pending.</p>
          <p className="font-mono text-xs text-muted-foreground mb-4">If this persists, reset the session and sign in again.</p>
          <button
            type="button"
            className="px-4 py-2 border border-primary text-primary font-mono text-xs uppercase hover:bg-primary hover:text-white transition-all"
            onClick={() => {
              void signOut().catch(() => undefined);
            }}
          >
            Reset Session
          </button>
        </div>
      </div>
    );
  }

  return <Login />;
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" theme="dark" />
          <Routes>
            <Route path="/login" element={<PublicLoginRoute />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/transactions" element={
              <ProtectedRoute roles={["MANAGEMENT"]}>
                <TransactionsPage />
              </ProtectedRoute>
            } />
            <Route path="/societies" element={
              <ProtectedRoute roles={OPERATIONS_ROLES}>
                <SocietiesPage />
              </ProtectedRoute>
            } />
            <Route path="/events" element={
              <ProtectedRoute roles={ALL_ROLES}>
                <EventsPage />
              </ProtectedRoute>
            } />
            <Route path="/calendar" element={
              <ProtectedRoute roles={ALL_ROLES}>
                <CalendarPage />
              </ProtectedRoute>
            } />
            <Route path="/projects" element={
              <ProtectedRoute roles={OPERATIONS_ROLES}>
                <ProjectsPage />
              </ProtectedRoute>
            } />
            <Route path="/announcements" element={
              <ProtectedRoute roles={ALL_ROLES}>
                <AnnouncementsPage />
              </ProtectedRoute>
            } />
            <Route path="/communications" element={
              <ProtectedRoute roles={ALL_ROLES}>
                <CommunicationHubPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute roles={["MANAGEMENT"]}>
                <UserManagementPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/registry" element={
              <ProtectedRoute roles={["MANAGEMENT"]}>
                <RegistryPage />
              </ProtectedRoute>
            } />
            <Route path="/reports/financial" element={
              <ProtectedRoute roles={["MANAGEMENT"]}>
                <FinancialReportsPage />
              </ProtectedRoute>
            } />
            <Route path="/reports/quarterly-print" element={
              <ProtectedRoute roles={["MANAGEMENT"]}>
                <QuarterlyStatementPage />
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
