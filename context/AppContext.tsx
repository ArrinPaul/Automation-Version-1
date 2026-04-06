import React, { createContext, useContext, ReactNode } from 'react';
import { FinancialState, Transaction, Society, EventReport, Project, CalendarEvent, Announcement, OfficeBearer, Member, SyncSettings } from '../types';
import { useAppData, useTransactions, useSocieties, useEvents, useProjects, useCalendarEvents, useAnnouncements } from '../hooks/useAppData';

interface AppContextType {
  state: FinancialState;
  isDataLoaded: boolean;
  dataError: string | null;
  fetchAllData: () => Promise<void>;
  
  // Transactions
  addTransaction: (t: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (id: string, fields: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  
  // Societies
  updateBudget: (societyId: string, newBudget: number) => Promise<void>;
  updateOfficeBearers: (societyId: string, officeBearers: OfficeBearer[]) => Promise<void>;
  updateMembers: (societyId: string, members: Member[]) => Promise<void>;
  updateSocietyLogo: (societyId: string, logo: string | undefined) => void;
  updateAdvisorSignature: (societyId: string, signature: string | undefined) => void;
  
  // Events
  addEvent: (e: Omit<EventReport, 'id'>) => Promise<void>;
  updateEvent: (id: string, fields: Partial<EventReport>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  
  // Projects
  addProject: (p: Omit<Project, 'id'>) => Promise<void>;
  updateProject: (id: string, fields: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  
  // Calendar
  addCalendarEvent: (e: Omit<CalendarEvent, 'id'>) => Promise<void>;
  updateCalendarEvent: (id: string, fields: Partial<CalendarEvent>) => Promise<void>;
  deleteCalendarEvent: (id: string) => Promise<void>;
  
  // Announcements
  addAnnouncement: (a: Omit<Announcement, 'id'>) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;
  
  // Core setters
  setState: React.Dispatch<React.SetStateAction<FinancialState>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { state, setState, isDataLoaded, dataError, fetchAllData } = useAppData();
  
  const txHooks = useTransactions(setState);
  const socHooks = useSocieties(setState);
  const eventHooks = useEvents(setState);
  const projectHooks = useProjects(setState);
  const calHooks = useCalendarEvents(setState);
  const annHooks = useAnnouncements(setState);

  const value: AppContextType = {
    state, isDataLoaded, dataError, fetchAllData, setState,
    ...txHooks,
    ...socHooks,
    ...eventHooks,
    ...projectHooks,
    ...calHooks,
    ...annHooks,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within an AppProvider");
  return ctx;
};
