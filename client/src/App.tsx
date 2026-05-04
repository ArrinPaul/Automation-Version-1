import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, isRole, type Role } from './context/AuthContext';
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

const queryClient = new QueryClient();

const roleHomeMap: Record<Role, string> = {
  SB_FACULTY: '/transactions',
  SB_OB: '/transactions',
  SOCIETY_FACULTY: '/societies',
  SOCIETY_CHAIR: '/projects',
  SOCIETY_OB: '/projects',
  MEMBER: '/events',
};

const ALL_ROLES: Role[] = ['SB_FACULTY','SB_OB','SOCIETY_FACULTY','SOCIETY_CHAIR','SOCIETY_OB','MEMBER'];
const SUPER_ADMIN: Role[] = ['SB_FACULTY','SB_OB'];
const SOCIETY_OPS: Role[] = ['SB_FACULTY','SB_OB','SOCIETY_FACULTY','SOCIETY_CHAIR','SOCIETY_OB'];

const Spinner: React.FC = () => (
  <div className='min-h-screen bg-[#0A0A0C] flex items-center justify-center'>
    <div className='animate-spin rounded-full' style={{width:28,height:28,border:'2px solid rgba(255,255,255,0.08)',borderTopColor:'#00629B'}} />
  </div>
);

const ProtectedRoute: React.FC<{children:React.ReactNode;roles?:Role[]}> = ({children,roles}) => {
  const {user,profile,loading} = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to='/login' />;
  if (!profile) return <Navigate to='/login' />;
  if (!isRole(profile.role)) return <Navigate to='/login' replace />;
  if (roles && !roles.includes(profile.role)) return <Navigate to={roleHomeMap[profile.role]} replace />;
  return (
    <div className='flex min-h-screen bg-background text-foreground'>
      <Sidebar />
      <div className='flex-1 flex flex-col min-w-0'>
        <ShellHeader />
        <main className='flex-1 overflow-auto'>{children}</main>
      </div>
    </div>
  );
};

const PublicLoginRoute: React.FC = () => {
  const {user,profile,loading,signOut} = useAuth();
  if (!loading && user && profile && isRole(profile.role)) return <Navigate to={roleHomeMap[profile.role]} replace />;
  if (!loading && user && !profile) {
    return (
      <div className='min-h-screen bg-[#0A0A0C] flex items-center justify-center p-6'>
        <div className='border border-white/10 bg-black/40 p-6 text-center max-w-sm'>
          <p className='font-mono text-sm text-white mb-4'>Profile sync pending.</p>
          <button type='button' className='px-4 py-2 border border-[#00629B] text-[#00629B] font-mono text-xs uppercase cursor-pointer bg-transparent' onClick={() => void signOut().catch(()=>undefined)}>Reset Session</button>
        </div>
      </div>
    );
  }
  return <Login />;
};

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BrowserRouter>
        <Toaster position='top-right' theme='dark' />
        <Routes>
          <Route path='/login' element={<PublicLoginRoute />} />
          <Route path='/' element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path='/transactions' element={<ProtectedRoute roles={SUPER_ADMIN}><TransactionsPage /></ProtectedRoute>} />
          <Route path='/reports/financial' element={<ProtectedRoute roles={SUPER_ADMIN}><FinancialReportsPage /></ProtectedRoute>} />
          <Route path='/reports/quarterly-print' element={<ProtectedRoute roles={SUPER_ADMIN}><QuarterlyStatementPage /></ProtectedRoute>} />
          <Route path='/admin/users' element={<ProtectedRoute roles={['SB_FACULTY']}><UserManagementPage /></ProtectedRoute>} />
          <Route path='/admin/registry' element={<ProtectedRoute roles={SUPER_ADMIN}><RegistryPage /></ProtectedRoute>} />
          <Route path='/societies' element={<ProtectedRoute roles={SOCIETY_OPS}><SocietiesPage /></ProtectedRoute>} />
          <Route path='/projects' element={<ProtectedRoute roles={SOCIETY_OPS}><ProjectsPage /></ProtectedRoute>} />
          <Route path='/events' element={<ProtectedRoute roles={ALL_ROLES}><EventsPage /></ProtectedRoute>} />
          <Route path='/calendar' element={<ProtectedRoute roles={ALL_ROLES}><CalendarPage /></ProtectedRoute>} />
          <Route path='/announcements' element={<ProtectedRoute roles={ALL_ROLES}><AnnouncementsPage /></ProtectedRoute>} />
          <Route path='/communications' element={<ProtectedRoute roles={ALL_ROLES}><CommunicationHubPage /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
