
import React, { useState, useEffect } from 'react';
import { User, UserRole, FinancialState, Transaction, Society, TransactionType, EventReport, OfficeBearer, Project, ProjectCategory, SyncSettings, CalendarEvent, Member, Announcement } from './types';
import { ALL_UNITS, MOCK_USERS, MOCK_PROJECTS, MOCK_CALENDAR_EVENTS, MOCK_ANNOUNCEMENTS } from './constants';
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
import TransactionModal from './components/TransactionModal';
import BudgetModal from './components/BudgetModal';
import EventModal from './components/EventModal';
import ProjectModal from './components/ProjectModal';
import CalendarEventModal from './components/CalendarEventModal';
import OfficeBearerModal from './components/OfficeBearerModal';
import MembersModal from './components/MembersModal';
import PasswordResetModal from './components/PasswordResetModal';
import AnnouncementModal from './components/AnnouncementModal';
import { syncLedgerToCloud, initGoogleCloud } from './services/googleDriveService';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
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
  const [selectedUserForReset, setSelectedUserForReset] = useState<User | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingEvent, setEditingEvent] = useState<EventReport | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingCalendarEvent, setEditingCalendarEvent] = useState<CalendarEvent | null>(null);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | undefined>(undefined);
  const [modalPrefill, setModalPrefill] = useState<{societyId?: string, type?: TransactionType}>({});
  const [projectPrefillCategory, setProjectPrefillCategory] = useState<ProjectCategory | undefined>(undefined);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [state, setState] = useState<FinancialState>({
    societies: ALL_UNITS,
    transactions: [],
    events: [],
    projects: MOCK_PROJECTS,
    calendarEvents: MOCK_CALENDAR_EVENTS,
    announcements: MOCK_ANNOUNCEMENTS,
    users: MOCK_USERS,
    currentUser: null,
    institutionLogo: undefined,
    syncSettings: {
      isConnected: false,
      autoSync: false,
      syncFrequency: 'realtime'
    }
  });

  // Load state
  useEffect(() => {
    const saved = localStorage.getItem('ieee_finance_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migration: Ensure members array exists for old data
        if (parsed.societies) {
          parsed.societies = parsed.societies.map((s: any) => ({
            ...s,
            members: s.members || []
          }));
        }
        // Migration: Event image to images array
        if (parsed.events) {
          parsed.events = parsed.events.map((e: any) => ({
            ...e,
            images: e.images || (e.image ? [e.image] : [])
          }));
        }
        // Migration: Ensure new admins are added to existing data
        if (parsed.users) {
            const existingIds = new Set(parsed.users.map((u: any) => u.id));
            const missingUsers = MOCK_USERS.filter(u => !existingIds.has(u.id));
            if (missingUsers.length > 0) {
                parsed.users = [...parsed.users, ...missingUsers];
            }
        }

        setState(prev => ({
          ...prev,
          ...parsed,
          calendarEvents: parsed.calendarEvents || prev.calendarEvents,
          announcements: parsed.announcements || prev.announcements,
          syncSettings: parsed.syncSettings || prev.syncSettings
        }));
      } catch (e) {}
    }
  }, []);

  // Initialize Google Cloud Client whenever the Client ID in settings changes
  useEffect(() => {
    if (state.syncSettings.googleClientId) {
      initGoogleCloud(state.syncSettings.googleClientId, () => console.log("Vault Service Initialized"));
    }
  }, [state.syncSettings.googleClientId]);

  // Save & Auto-Sync
  useEffect(() => {
    localStorage.setItem('ieee_finance_data', JSON.stringify({
      societies: state.societies,
      transactions: state.transactions,
      events: state.events,
      projects: state.projects,
      calendarEvents: state.calendarEvents,
      announcements: state.announcements,
      users: state.users,
      institutionLogo: state.institutionLogo,
      syncSettings: state.syncSettings,
    }));
  }, [state]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setState(prev => ({ ...prev, currentUser: user }));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setState(prev => ({ ...prev, currentUser: null }));
  };

  const updatePassword = (userId: string, newPassword: string) => {
    setState(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === userId ? { ...u, password: newPassword } : u)
    }));
  };

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

  const openPasswordReset = (user: User) => {
    setSelectedUserForReset(user);
    setIsPasswordModalOpen(true);
  };

  const openSocietyPasswordReset = (socId: string) => {
    const targetUser = state.users.find(u => u.societyId === socId);
    if (targetUser) {
      openPasswordReset(targetUser);
    }
  };

  const calculateBalances = (societies: Society[], transactions: Transaction[]) => {
    return societies.map(s => {
      const societyTransactions = transactions.filter(t => t.societyId === s.id);
      const income = societyTransactions.filter(t => t.type === TransactionType.INCOME).reduce((sum, t) => sum + t.amount, 0);
      const expense = societyTransactions.filter(t => t.type === TransactionType.EXPENSE).reduce((sum, t) => sum + t.amount, 0);
      return { ...s, balance: s.budget + income - expense };
    });
  };

  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = { ...t, id: `tx-${Date.now()}` };
    setState(prev => {
      const newTransactions = [newTransaction, ...prev.transactions];
      return {
        ...prev,
        transactions: newTransactions,
        societies: calculateBalances(prev.societies, newTransactions)
      };
    });
  };

  const updateTransaction = (id: string, updatedFields: Partial<Transaction>) => {
    setState(prev => {
      const newTransactions = prev.transactions.map(t => t.id === id ? { ...t, ...updatedFields } : t);
      return {
        ...prev,
        transactions: newTransactions,
        societies: calculateBalances(prev.societies, newTransactions)
      };
    });
  };

  const deleteTransaction = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) return;
    setState(prev => {
      const newTransactions = prev.transactions.filter(t => t.id !== id);
      return {
        ...prev,
        transactions: newTransactions,
        societies: calculateBalances(prev.societies, newTransactions)
      };
    });
  };

  const updateBudget = (societyId: string, newBudget: number) => {
    setState(prev => {
      const updatedSocieties = prev.societies.map(s => s.id === societyId ? { ...s, budget: newBudget } : s);
      return {
        ...prev,
        societies: calculateBalances(updatedSocieties, prev.transactions)
      };
    });
  };

  const updateOfficeBearers = (societyId: string, officeBearers: OfficeBearer[]) => {
    setState(prev => ({
      ...prev,
      societies: prev.societies.map(s => s.id === societyId ? { ...s, officeBearers } : s)
    }));
  };

  const updateMembers = (societyId: string, members: Member[]) => {
    setState(prev => ({
      ...prev,
      societies: prev.societies.map(s => s.id === societyId ? { ...s, members } : s)
    }));
  };

  const updateSocietyLogo = (societyId: string, logo: string | undefined) => {
    setState(prev => ({
      ...prev,
      societies: prev.societies.map(s => s.id === societyId ? { ...s, logo } : s)
    }));
  };

  const updateAdvisorSignature = (societyId: string, signature: string | undefined) => {
    setState(prev => ({
      ...prev,
      societies: prev.societies.map(s => s.id === societyId ? { ...s, advisorSignature: signature } : s)
    }));
  };

  const updateInstitutionLogo = (logo: string | undefined) => {
    setState(prev => ({ ...prev, institutionLogo: logo }));
  };

  const addEvent = (e: Omit<EventReport, 'id'>) => {
    const newEvent: EventReport = { ...e, id: `ev-${Date.now()}` };
    setState(prev => ({ ...prev, events: [newEvent, ...prev.events] }));
  };

  const updateEvent = (id: string, updatedFields: Partial<EventReport>) => {
    setState(prev => ({
      ...prev,
      events: prev.events.map(e => e.id === id ? { ...e, ...updatedFields } : e)
    }));
  };

  const deleteEvent = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this event report?")) return;
    setState(prev => ({ ...prev, events: prev.events.filter(e => e.id !== id) }));
  };

  const handleAddProject = (category?: ProjectCategory) => {
    setEditingProject(null);
    setProjectPrefillCategory(category);
    setIsProjectModalOpen(true);
  };

  const addProject = (p: Omit<Project, 'id'>) => {
    const newProject: Project = { ...p, id: `prj-${Date.now()}` };
    setState(prev => ({ ...prev, projects: [newProject, ...prev.projects] }));
  };

  const updateProject = (id: string, updatedFields: Partial<Project>) => {
    setState(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === id ? { ...p, ...updatedFields } : p)
    }));
  };

  const deleteProject = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this project record?")) return;
    setState(prev => ({ ...prev, projects: prev.projects.filter(p => p.id !== id) }));
  };

  const handleAddCalendarEvent = (date?: string) => {
    setEditingCalendarEvent(null);
    setSelectedCalendarDate(date);
    setIsCalendarModalOpen(true);
  };

  const addCalendarEvent = (e: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = { ...e, id: `cal-${Date.now()}` };
    setState(prev => ({ ...prev, calendarEvents: [newEvent, ...prev.calendarEvents] }));
  };

  const updateCalendarEvent = (id: string, updatedFields: Partial<CalendarEvent>) => {
    setState(prev => ({
      ...prev,
      calendarEvents: prev.calendarEvents.map(e => e.id === id ? { ...e, ...updatedFields } : e)
    }));
  };

  const deleteCalendarEvent = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this calendar event?")) return;
    setState(prev => ({ ...prev, calendarEvents: prev.calendarEvents.filter(e => e.id !== id) }));
  };

  /* Announcements Handlers */
  const addAnnouncement = (a: Omit<Announcement, 'id'>) => {
    const newAnnouncement: Announcement = { ...a, id: `ann-${Date.now()}` };
    setState(prev => ({ ...prev, announcements: [newAnnouncement, ...prev.announcements] }));
  };

  const deleteAnnouncement = (id: string) => {
    if (!window.confirm("Are you sure you want to remove this announcement?")) return;
    setState(prev => ({ ...prev, announcements: prev.announcements.filter(a => a.id !== id) }));
  };

  /* Sync Handlers */
  const handleUpdateSyncSettings = (settings: Partial<SyncSettings>) => {
    setState(prev => ({
      ...prev,
      syncSettings: { ...prev.syncSettings, ...settings }
    }));
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      const lastSyncedAt = await syncLedgerToCloud(state);
      handleUpdateSyncSettings({ lastSyncedAt });
    } catch (err) {
      console.error("Vault Sync failed", err);
      alert("Vault Sync failed. Ensure you are connected to the internet and authenticated.");
    } finally {
      setIsSyncing(false);
    }
  };

  if (!currentUser) return <Login onLogin={handleLogin} />;

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      <Header 
        user={currentUser} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout}
        onChangePassword={() => openPasswordReset(currentUser)}
      />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        {activeTab === 'dashboard' && <Dashboard state={state} onQuickEntry={() => openQuickEntry()} />}
        {activeTab === 'transactions' && (
          <TransactionsPage state={state} onEdit={(tx) => { setEditingTransaction(tx); setIsModalOpen(true); }} onDelete={deleteTransaction} />
        )}
        {activeTab === 'societies' && (
          <SocietiesPage 
            state={state} 
            onEntry={openQuickEntry} 
            onEditBudget={openEditBudget} 
            onManageTeam={openManageTeam}
            onManageMembers={openManageMembers}
            onResetPassword={openSocietyPasswordReset}
          />
        )}
        {activeTab === 'calendar' && (
          <CalendarPage 
            state={state} 
            onAddEvent={handleAddCalendarEvent}
            onEditEvent={(e) => { setEditingCalendarEvent(e); setIsCalendarModalOpen(true); }}
            onDeleteEvent={deleteCalendarEvent}
          />
        )}
        {activeTab === 'events' && (
          <EventsPage state={state} onAddEvent={() => { setEditingEvent(null); setIsEventModalOpen(true); }} onEditEvent={(e) => { setEditingEvent(e); setIsEventModalOpen(true); }} onDeleteEvent={deleteEvent} />
        )}
        {activeTab === 'projects' && (
          <ProjectsPage 
            state={state} 
            onAddProject={handleAddProject} 
            onEditProject={(p) => { setEditingProject(p); setIsProjectModalOpen(true); }} 
            onDeleteProject={deleteProject} 
          />
        )}
        {activeTab === 'announcements' && (
          <AnnouncementsPage 
            state={state} 
            onAddAnnouncement={() => setIsAnnouncementModalOpen(true)}
            onDeleteAnnouncement={deleteAnnouncement}
          />
        )}
        {activeTab === 'reports' && <ReportsPage state={state} />}
        {activeTab === 'repository' && (
          <RepositoryPage 
            state={state} 
            onUpdateLogo={updateSocietyLogo} 
            onUpdateSignature={updateAdvisorSignature} 
            onUpdateInstitutionLogo={updateInstitutionLogo}
          />
        )}
        {/* Vault Page (Previously Backup) */}
        {activeTab === 'sync' && (
          <BackupPage 
            state={state} 
            setState={setState} 
            onSyncNow={handleSyncNow} 
            isSyncing={isSyncing} 
            onUpdateSyncSettings={handleUpdateSyncSettings} 
          />
        )}
        {activeTab === 'users' && currentUser.role === UserRole.ADMIN && (
          <UserManagementPage 
            state={state} 
            onResetPassword={openPasswordReset} 
          />
        )}
      </main>

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
  );
};

export default App;
