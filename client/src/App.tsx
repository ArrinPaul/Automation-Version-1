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
import Login from './features/Login';
import Sidebar from './components/layout/Sidebar';
import { Toaster } from 'sonner';
import './styles/globals.css';

const queryClient = new QueryClient();

const ProtectedRoute: React.FC<{ children: React.ReactNode, roles?: string[] }> = ({ children, roles }) => {
  const { user, profile, loading } = useAuth();

  if (loading) return <div className="bg-background min-h-screen flex items-center justify-center font-mono text-accent animate-pulse">BOOTING_SYSTEM...</div>;

  if (!user) return <Navigate to="/login" />;

  if (roles && profile && !roles.includes(profile.role)) {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" theme="dark" />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/transactions" element={
              <ProtectedRoute>
                <TransactionsPage />
              </ProtectedRoute>
            } />
            <Route path="/societies" element={
              <ProtectedRoute>
                <SocietiesPage />
              </ProtectedRoute>
            } />
            <Route path="/events" element={
              <ProtectedRoute>
                <EventsPage />
              </ProtectedRoute>
            } />
            <Route path="/projects" element={
              <ProtectedRoute>
                <ProjectsPage />
              </ProtectedRoute>
            } />
            <Route path="/announcements" element={
              <ProtectedRoute>
                <AnnouncementsPage />
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
