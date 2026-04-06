import { useState, useCallback } from 'react';
import { FinancialState, Transaction, Society, EventReport, Project, CalendarEvent, Announcement, OfficeBearer, Member, SyncSettings } from '../types';
import { societyApi, transactionApi, eventApi, projectApi, calendarApi, announcementApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

// ── Helper: map API response to frontend shape ───────────────
const mapSociety = (s: any): Society => ({ ...s, id: s.societyKey || s._id, officeBearers: s.officeBearers || [], members: s.members || [] });
const mapItem = (item: any) => ({ ...item, id: item._id });
const mapEvent = (e: any) => ({ ...e, id: e._id, images: e.images || [] });

// ── useAppData: Master data fetcher + state holder ───────────
export function useAppData() {
  const { user, isAuthenticated } = useAuth();

  const [state, setState] = useState<FinancialState>({
    societies: [], transactions: [], events: [], projects: [],
    calendarEvents: [], announcements: [], users: [],
    currentUser: null, institutionLogo: undefined,
    syncSettings: { isConnected: false, autoSync: false, syncFrequency: 'realtime' }
  });

  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  const fetchAllData = useCallback(async () => {
    if (!isAuthenticated) return;
    setDataError(null);
    try {
      const [soc, tx, ev, prj, cal, ann] = await Promise.all([
        societyApi.getAll(), transactionApi.getAll(), eventApi.getAll(),
        projectApi.getAll(), calendarApi.getAll(), announcementApi.getAll(),
      ]);
      setState(prev => ({
        ...prev,
        societies: (soc.data.data || []).map(mapSociety),
        transactions: (tx.data.data || []).map(mapItem),
        events: (ev.data.data || []).map(mapEvent),
        projects: (prj.data.data || []).map(mapItem),
        calendarEvents: (cal.data.data || []).map(mapItem),
        announcements: (ann.data.data || []).map(mapItem),
        currentUser: user ? { id: user.id, name: user.name, email: user.email, role: user.role as any, societyId: user.societyId } : null,
      }));
      setIsDataLoaded(true);
    } catch (err: any) {
      console.error('Failed to load data:', err);
      setDataError(err.response?.data?.error || 'Failed to load data from server');
      setIsDataLoaded(true);
    }
  }, [isAuthenticated, user]);

  return { state, setState, isDataLoaded, dataError, fetchAllData };
}

// ── useTransactions ──────────────────────────────────────────
export function useTransactions(setState: React.Dispatch<React.SetStateAction<FinancialState>>) {
  const addTransaction = async (t: Omit<Transaction, 'id'>) => {
    try {
      const res = await transactionApi.create(t);
      setState(prev => ({ ...prev, transactions: [mapItem(res.data.data), ...prev.transactions] }));
      const socRes = await societyApi.getAll();
      setState(prev => ({ ...prev, societies: (socRes.data.data || []).map(mapSociety) }));
    } catch (err: any) { alert(err.response?.data?.error || 'Failed to add transaction'); }
  };

  const updateTransaction = async (id: string, fields: Partial<Transaction>) => {
    try {
      const res = await transactionApi.update(id, fields);
      setState(prev => ({ ...prev, transactions: prev.transactions.map(t => t.id === id ? mapItem(res.data.data) : t) }));
    } catch (err: any) { alert(err.response?.data?.error || 'Failed to update transaction'); }
  };

  const deleteTransaction = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) return;
    try {
      await transactionApi.delete(id);
      setState(prev => ({ ...prev, transactions: prev.transactions.filter(t => t.id !== id) }));
      const socRes = await societyApi.getAll();
      setState(prev => ({ ...prev, societies: (socRes.data.data || []).map(mapSociety) }));
    } catch (err: any) { alert(err.response?.data?.error || 'Failed to delete transaction'); }
  };

  return { addTransaction, updateTransaction, deleteTransaction };
}

// ── useSocieties ─────────────────────────────────────────────
export function useSocieties(setState: React.Dispatch<React.SetStateAction<FinancialState>>) {
  const updateBudget = async (societyId: string, newBudget: number) => {
    try {
      await societyApi.update(societyId, { budget: newBudget });
      setState(prev => ({ ...prev, societies: prev.societies.map(s => s.id === societyId ? { ...s, budget: newBudget } : s) }));
    } catch (err: any) { alert(err.response?.data?.error || 'Failed to update budget'); }
  };

  const updateOfficeBearers = async (societyId: string, officeBearers: OfficeBearer[]) => {
    try {
      await societyApi.updateOfficeBearers(societyId, officeBearers);
      setState(prev => ({ ...prev, societies: prev.societies.map(s => s.id === societyId ? { ...s, officeBearers } : s) }));
    } catch (err: any) { alert(err.response?.data?.error || 'Failed to update team'); }
  };

  const updateMembers = async (societyId: string, members: Member[]) => {
    try {
      await societyApi.updateMembers(societyId, members);
      setState(prev => ({ ...prev, societies: prev.societies.map(s => s.id === societyId ? { ...s, members } : s) }));
    } catch (err: any) { alert(err.response?.data?.error || 'Failed to update members'); }
  };

  const updateSocietyLogo = (societyId: string, logo: string | undefined) => {
    setState(prev => ({ ...prev, societies: prev.societies.map(s => s.id === societyId ? { ...s, logo } : s) }));
  };

  const updateAdvisorSignature = (societyId: string, signature: string | undefined) => {
    setState(prev => ({ ...prev, societies: prev.societies.map(s => s.id === societyId ? { ...s, advisorSignature: signature } : s) }));
  };

  return { updateBudget, updateOfficeBearers, updateMembers, updateSocietyLogo, updateAdvisorSignature };
}

// ── useEvents ────────────────────────────────────────────────
export function useEvents(setState: React.Dispatch<React.SetStateAction<FinancialState>>) {
  const addEvent = async (e: Omit<EventReport, 'id'>) => {
    try {
      const res = await eventApi.create(e);
      setState(prev => ({ ...prev, events: [mapEvent(res.data.data), ...prev.events] }));
    } catch (err: any) { alert(err.response?.data?.error || 'Failed to add event'); }
  };

  const updateEvent = async (id: string, fields: Partial<EventReport>) => {
    try {
      const res = await eventApi.update(id, fields);
      setState(prev => ({ ...prev, events: prev.events.map(e => e.id === id ? mapEvent(res.data.data) : e) }));
    } catch (err: any) { alert(err.response?.data?.error || 'Failed to update event'); }
  };

  const deleteEvent = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this event report?")) return;
    try {
      await eventApi.delete(id);
      setState(prev => ({ ...prev, events: prev.events.filter(e => e.id !== id) }));
    } catch (err: any) { alert(err.response?.data?.error || 'Failed to delete event'); }
  };

  return { addEvent, updateEvent, deleteEvent };
}

// ── useProjects ──────────────────────────────────────────────
export function useProjects(setState: React.Dispatch<React.SetStateAction<FinancialState>>) {
  const addProject = async (p: Omit<Project, 'id'>) => {
    try {
      const res = await projectApi.create(p);
      setState(prev => ({ ...prev, projects: [mapItem(res.data.data), ...prev.projects] }));
    } catch (err: any) { alert(err.response?.data?.error || 'Failed to add project'); }
  };

  const updateProject = async (id: string, fields: Partial<Project>) => {
    try {
      const res = await projectApi.update(id, fields);
      setState(prev => ({ ...prev, projects: prev.projects.map(p => p.id === id ? mapItem(res.data.data) : p) }));
    } catch (err: any) { alert(err.response?.data?.error || 'Failed to update project'); }
  };

  const deleteProject = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this project record?")) return;
    try {
      await projectApi.delete(id);
      setState(prev => ({ ...prev, projects: prev.projects.filter(p => p.id !== id) }));
    } catch (err: any) { alert(err.response?.data?.error || 'Failed to delete project'); }
  };

  return { addProject, updateProject, deleteProject };
}

// ── useCalendarEvents ────────────────────────────────────────
export function useCalendarEvents(setState: React.Dispatch<React.SetStateAction<FinancialState>>) {
  const addCalendarEvent = async (e: Omit<CalendarEvent, 'id'>) => {
    try {
      const res = await calendarApi.create(e);
      setState(prev => ({ ...prev, calendarEvents: [mapItem(res.data.data), ...prev.calendarEvents] }));
    } catch (err: any) { alert(err.response?.data?.error || 'Failed to add calendar event'); }
  };

  const updateCalendarEvent = async (id: string, fields: Partial<CalendarEvent>) => {
    try {
      const res = await calendarApi.update(id, fields);
      setState(prev => ({ ...prev, calendarEvents: prev.calendarEvents.map(e => e.id === id ? mapItem(res.data.data) : e) }));
    } catch (err: any) { alert(err.response?.data?.error || 'Failed to update calendar event'); }
  };

  const deleteCalendarEvent = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this calendar event?")) return;
    try {
      await calendarApi.delete(id);
      setState(prev => ({ ...prev, calendarEvents: prev.calendarEvents.filter(e => e.id !== id) }));
    } catch (err: any) { alert(err.response?.data?.error || 'Failed to delete calendar event'); }
  };

  return { addCalendarEvent, updateCalendarEvent, deleteCalendarEvent };
}

// ── useAnnouncements ─────────────────────────────────────────
export function useAnnouncements(setState: React.Dispatch<React.SetStateAction<FinancialState>>) {
  const addAnnouncement = async (a: Omit<Announcement, 'id'>) => {
    try {
      const res = await announcementApi.create(a);
      setState(prev => ({ ...prev, announcements: [mapItem(res.data.data), ...prev.announcements] }));
    } catch (err: any) { alert(err.response?.data?.error || 'Failed to add announcement'); }
  };

  const deleteAnnouncement = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this announcement?")) return;
    try {
      await announcementApi.delete(id);
      setState(prev => ({ ...prev, announcements: prev.announcements.filter(a => a.id !== id) }));
    } catch (err: any) { alert(err.response?.data?.error || 'Failed to delete announcement'); }
  };

  return { addAnnouncement, deleteAnnouncement };
}
