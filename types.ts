
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  SB_TREASURER = 'SB_TREASURER',
  SOCIETY_ADMIN = 'SOCIETY_ADMIN',
  VIEWER = 'VIEWER',
  // Legacy aliases for backward compatibility during migration
  ADMIN = 'SUPER_ADMIN',
  OFFICE_BEARER = 'SOCIETY_ADMIN',
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  societyId?: string;
  name: string;
}

export interface OfficeBearer {
  id: string;
  name: string;
  position: string;
  email: string;
  phone: string;
}

export interface Member {
  id: string;
  ieeeId: string;
  name: string;
  email: string;
  contactNumber?: string;
  grade: string;
}

export interface Society {
  id: string;
  name: string;
  shortName: string;
  budget: number;
  balance: number;
  officeBearers: OfficeBearer[];
  members: Member[];
  logo?: string;
  advisorSignature?: string;
}

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export interface Transaction {
  id: string;
  societyId: string;
  amount: number;
  type: TransactionType;
  category: string;
  description: string;
  date: string;
  approvedBy?: string;
}

export interface Speaker {
  id: string;
  name: string;
  designation: string;
  organization: string;
  presentationTitle: string;
  profileText?: string;
}

export interface EventReport {
  id: string;
  societyId: string;
  title: string;
  date: string;
  type: string;
  participants: number;
  description: string; // Summary of the Activity
  outcome: string; // Kept for legacy, but UI will use Highlights/Takeaways
  images: string[];
  /* Added new fields for General Information Table */
  time?: string;
  venue?: string;
  collaboration?: string;
  /* New fields for detailed tables */
  speakers?: Speaker[];
  participantType?: string;
  highlights?: string;
  takeaways?: string;
  followUpPlan?: string;
  organizerName?: string;
  organizerDesignation?: string;
}

export type ProjectStatus = 'PROPOSED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED' | 'ANNOUNCED' | 'AWARDED';
export type ProjectCategory = 'TECHNICAL_PROJECT' | 'TRAVEL_GRANT' | 'SCHOLARSHIP' | 'AWARD';

export interface Project {
  id: string;
  societyId: string;
  title: string;
  category: ProjectCategory;
  sanctioningBody: string;
  amountSanctioned: number;
  startDate: string;
  status: ProjectStatus;
  description: string;
}

export type CalendarEventStatus = 'PROPOSED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface CalendarEvent {
  id: string;
  societyId: string;
  title: string;
  date: string;
  time?: string;
  venue?: string;
  description: string;
  status: CalendarEventStatus;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  date: string;
  senderName: string;
  societyId?: string; // origin society
  targetAudience: 'ALL' | 'LEADERSHIP' | 'SOCIETY'; // 'ALL' = All Members, 'LEADERSHIP' = Office Bearers, 'SOCIETY' = Members of societyId
}

/* Added SyncSettings interface for Cloud Synchronization features */
export interface SyncSettings {
  isConnected: boolean;
  autoSync: boolean;
  syncFrequency: 'realtime' | 'daily' | 'weekly';
  lastSyncedAt?: string;
  googleClientId?: string; /* User provided Client ID */
  cloudUser?: {
    name: string;
    email: string;
  };
}

export interface FinancialState {
  societies: Society[];
  transactions: Transaction[];
  events: EventReport[];
  projects: Project[];
  calendarEvents: CalendarEvent[];
  announcements: Announcement[];
  users: User[];
  currentUser: User | null;
  institutionLogo?: string;
  /* Added syncSettings to root state to resolve BackupPage errors */
  syncSettings: SyncSettings;
}
