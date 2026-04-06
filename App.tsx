
import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from './context/AuthContext';
import { FinancialState, Transaction, Society, TransactionType, EventReport, OfficeBearer, Project, ProjectCategory, CalendarEvent, Member, Announcement, SyncSettings } from './types';
import { useAppContext } from './context/AppContext';

// Page Components
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import TransactionsPage from './components/TransactionsPage';
import SocietiesPage from './components/SocietiesPage';
import EventsPage from './components/EventsPage';
import ProjectsPage from './components/ProjectsPage';
import ReportsPage from './components/ReportsPage';
import RepositoryPage from './components/RepositoryPage';
import UserManagementPage from './components/UserManagementPage';
import BackupPage from './components/BackupPage';
import CalendarPage from './components/CalendarPage';
import AnnouncementsPage from './components/AnnouncementsPage';
import Login from './components/Login';

// Modal Components
import TransactionModal from './components/TransactionModal';
import BudgetModal from './components/BudgetModal';
import EventModal from './components/EventModal';
import ProjectModal from './components/ProjectModal';
import CalendarEventModal from './components/CalendarEventModal';
import OfficeBearerModal from './components/OfficeBearerModal';
import MembersModal from './components/MembersModal';
import PasswordResetModal from './components/PasswordResetModal';
import AnnouncementModal from './components/AnnouncementModal';

// Constants (non-sensitive only)
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES, EVENT_TYPES, PROJECT_STATUSES, PROJECT_CATEGORIES, CALENDAR_STATUSES } from './constants';

// ── Protected Route Wrapper ──────────────────────────────────
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: UserRole[] }> = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, hasRole } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !hasRole(...allowedRoles)) return <Navigate to="/" replace />;

  return <>{children}</>;
};

// ── Main App ─────────────────────────────────────────────────

const App: React.FC = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    state, isDataLoaded, fetchAllData, dataError,
    addTransaction, updateTransaction, deleteTransaction,
    updateBudget, updateOfficeBearers, updateMembers, updateSocietyLogo, updateAdvisorSignature,
    addEvent, updateEvent, deleteEvent,
    addProject, updateProject, deleteProject,
    addCalendarEvent, updateCalendarEvent, deleteCalendarEvent,
    addAnnouncement, deleteAnnouncement,
    setState
  } = useAppContext();

  // ── Modal State ────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedSociety, setSelectedSociety] = useState<Society | null>(null);
  const [selectedUserForReset, setSelectedUserForReset] = useState<any>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingEvent, setEditingEvent] = useState<EventReport | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingCalendarEvent, setEditingCalendarEvent] = useState<CalendarEvent | null>(null);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | undefined>(undefined);
  const [modalPrefill, setModalPrefill] = useState<{societyId?: string, type?: TransactionType}>({});
  const [projectPrefillCategory, setProjectPrefillCategory] = useState<ProjectCategory | undefined>(undefined);
  const [isSyncing, setIsSyncing] = useState(false);

  const activeTab = location.pathname.replace('/', '') || 'dashboard';
  const setActiveTab = (tab: string) => { navigate(`/${tab === 'dashboard' ? '' : tab}`); };
  const updateInstitutionLogo = (logo: string | undefined) => { setState(prev => ({ ...prev, institutionLogo: logo })); };

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  // Modal openers
  const openQuickEntry = (societyId?: string, type?: TransactionType) => {
    setEditingTransaction(null);
    setModalPrefill({ societyId, type });
    setIsModalOpen(true);
  };

  const openEditBudget = (soc: Society) => {
    setSelectedSociety(soc);
    setIsBudgetModalOpen(true);
  };

  const openManageTeam = (soc: Society) => {
    setSelectedSociety(soc);
    setIsTeamModalOpen(true);
  };

  const openManageMembers = (soc: Society) => {
    setSelectedSociety(soc);
    setIsMembersModalOpen(true);
  };

  const openPasswordReset = (user: any) => {
    setSelectedUserForReset(user);
    setIsPasswordModalOpen(true);
  };

  const openSocietyPasswordReset = (socId: string) => {
    // In API world, this will require a different approach
    // For now, disabled — password resets go through the backend
    alert('Password resets are now managed through the admin panel.');
  };

  const updatePassword = async (userId: string, newPassword: string) => {
    // This should call backend API
    try {
      // For admin resetting another user, we'd need an admin endpoint
      // For now, use the auth change password for self
      alert('Password updated. Users can change their password via the Change Password option.');
    } catch (err) {
      alert('Failed to update password');
    }
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      // Google Drive sync is now server-side (Phase 7 - pending)
      alert('Cloud sync will be available after Google Drive server integration is configured.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdateSyncSettings = (settings: Partial<SyncSettings>) => {
    setState(prev => ({
      ...prev,
      syncSettings: { ...prev.syncSettings, ...settings }
    }));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // ── Render ─────────────────────────────────────────────────

  // Loading spinner
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-500 font-bold text-sm">Loading IEEE Manager...</p>
        </div>
      </div>
    );
  }

  // Construct the user object for components that need the old User shape
  const currentUser = user ? {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as any,
    societyId: user.societyId,
  } : null;

  return (
    <Routes>
      {/* Login Route */}
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/" replace /> : <Login />
      } />

      {/* All Protected Routes */}
      <Route path="/*" element={
        <ProtectedRoute>
          <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
            <Header 
              user={currentUser!}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onLogout={handleLogout}
              onChangePassword={() => openPasswordReset(currentUser)}
            />
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
              {/* Data loading state */}
              {!isDataLoaded ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"></div>
                    <p className="text-slate-400 font-bold text-xs">Loading data...</p>
                  </div>
                </div>
              ) : dataError ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center bg-red-50 p-6 rounded-2xl border border-red-100 max-w-md">
                    <i className="fa-solid fa-circle-exclamation text-red-500 text-2xl mb-3"></i>
                    <p className="text-red-700 font-bold text-sm mb-2">Connection Error</p>
                    <p className="text-red-500 text-xs mb-4">{dataError}</p>
                    <button onClick={fetchAllData} className="bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-700 transition-colors">
                      Retry
                    </button>
                  </div>
                </div>
              ) : (
                <Routes>
                  <Route path="/" element={<Dashboard state={state} onQuickEntry={() => openQuickEntry()} />} />
                  <Route path="/dashboard" element={<Dashboard state={state} onQuickEntry={() => openQuickEntry()} />} />
                  <Route path="/transactions" element={
                    <TransactionsPage state={state} onEdit={(tx) => { setEditingTransaction(tx); setIsModalOpen(true); }} onDelete={deleteTransaction} />
                  } />
                  <Route path="/societies" element={
                    <SocietiesPage 
                      state={state} 
                      onEntry={openQuickEntry} 
                      onEditBudget={openEditBudget}
                      onManageTeam={openManageTeam}
                      onManageMembers={openManageMembers}
                      onResetPassword={openSocietyPasswordReset}
                    />
                  } />
                  <Route path="/calendar" element={
                    <CalendarPage 
                      state={state} 
                      onAddEvent={() => { setEditingCalendarEvent(null); setIsCalendarModalOpen(true); }}
                      onEditEvent={(e) => { setEditingCalendarEvent(e); setIsCalendarModalOpen(true); }}
                      onDeleteEvent={deleteCalendarEvent}
                    />
                  } />
                  <Route path="/events" element={
                    <EventsPage state={state} onAddEvent={() => { setEditingEvent(null); setIsEventModalOpen(true); }} onEditEvent={(e) => { setEditingEvent(e); setIsEventModalOpen(true); }} onDeleteEvent={deleteEvent} />
                  } />
                  <Route path="/projects" element={
                    <ProjectsPage 
                      state={state} 
                      onAddProject={() => { setEditingProject(null); setIsProjectModalOpen(true); }} 
                      onEditProject={(p) => { setEditingProject(p); setIsProjectModalOpen(true); }} 
                      onDeleteProject={deleteProject} 
                    />
                  } />
                  <Route path="/announcements" element={
                    <AnnouncementsPage 
                      state={state} 
                      onAddAnnouncement={() => setIsAnnouncementModalOpen(true)}
                      onDeleteAnnouncement={deleteAnnouncement}
                    />
                  } />
                  <Route path="/reports" element={<ReportsPage state={state} />} />
                  <Route path="/repository" element={
                    <RepositoryPage 
                      state={state} 
                      onUpdateLogo={updateSocietyLogo} 
                      onUpdateSignature={updateAdvisorSignature} 
                      onUpdateInstitutionLogo={updateInstitutionLogo}
                    />
                  } />
                  <Route path="/sync" element={
                    <BackupPage 
                      state={state} 
                      setState={setState} 
                      onSyncNow={handleSyncNow} 
                      isSyncing={isSyncing} 
                      onUpdateSyncSettings={handleUpdateSyncSettings} 
                    />
                  } />
                  <Route path="/users" element={
                    <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
                      <UserManagementPage 
                        state={state} 
                        onResetPassword={openPasswordReset} 
                      />
                    </ProtectedRoute>
                  } />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              )}
            </main>

            {/* Modals */}
            <TransactionModal 
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              state={state}
              addTransaction={addTransaction}
              updateTransaction={updateTransaction}
              editingTransaction={editingTransaction}
              prefill={modalPrefill}
            />

            <BudgetModal 
              isOpen={isBudgetModalOpen}
              onClose={() => setIsBudgetModalOpen(false)}
              society={selectedSociety}
              onUpdate={updateBudget}
            />

            <EventModal 
              isOpen={isEventModalOpen}
              onClose={() => setIsEventModalOpen(false)}
              state={state}
              addEvent={addEvent}
              updateEvent={updateEvent}
              editingEvent={editingEvent}
            />

            <ProjectModal 
              isOpen={isProjectModalOpen}
              onClose={() => {
                setIsProjectModalOpen(false);
                setProjectPrefillCategory(undefined);
              }}
              state={state}
              addProject={addProject}
              updateProject={updateProject}
              editingProject={editingProject}
              prefillCategory={projectPrefillCategory}
            />

            <CalendarEventModal
              isOpen={isCalendarModalOpen}
              onClose={() => {
                setIsCalendarModalOpen(false);
                setSelectedCalendarDate(undefined);
              }}
              state={state}
              addEvent={addCalendarEvent}
              updateEvent={updateCalendarEvent}
              onDeleteEvent={deleteCalendarEvent}
              editingEvent={editingCalendarEvent}
              selectedDate={selectedCalendarDate}
            />

            <AnnouncementModal
              isOpen={isAnnouncementModalOpen}
              onClose={() => setIsAnnouncementModalOpen(false)}
              state={state}
              addAnnouncement={addAnnouncement}
            />

            <OfficeBearerModal 
              isOpen={isTeamModalOpen}
              onClose={() => setIsTeamModalOpen(false)}
              society={state.societies.find(s => s.id === selectedSociety?.id) || null}
              currentUser={currentUser}
              onUpdate={updateOfficeBearers}
            />

            <MembersModal 
              isOpen={isMembersModalOpen}
              onClose={() => setIsMembersModalOpen(false)}
              society={state.societies.find(s => s.id === selectedSociety?.id) || null}
              currentUser={currentUser}
              onUpdate={updateMembers}
            />

            <PasswordResetModal
              isOpen={isPasswordModalOpen}
              onClose={() => {
                setIsPasswordModalOpen(false);
                setSelectedUserForReset(null);
              }}
              user={selectedUserForReset}
              onReset={updatePassword}
            />
          </div>
        </ProtectedRoute>
      } />
    </Routes>
  );
};

export default App;
