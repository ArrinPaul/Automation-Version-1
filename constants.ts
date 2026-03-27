
import { Society, User, UserRole, Project, CalendarEvent, Announcement } from './types';

export const INSTITUTION_NAME = "CHRIST (Deemed to be University), Bangalore";
export const SCHOOL_NAME = "School of Engineering and Technology";

export const POSITIONS = [
  'Faculty Advisor',
  'Branch Counselor',
  'Chair',
  'Vice-Chair',
  'Secretary',
  'Treasurer',
  'Webmaster',
  'Publicity Lead',
  'Technical Lead',
  'Membership Development',
  'Volunteer'
];

export const IEEE_SOCIETIES: Society[] = [
  { id: 'sb', name: 'IEEE Student Branch', shortName: 'IEEE SB', budget: 100000, balance: 85000, officeBearers: [], members: [] },
  { id: 'aess', name: 'Aerospace and Electronic Systems Society', shortName: 'AESS', budget: 15000, balance: 12000, officeBearers: [], members: [] },
  { id: 'aps', name: 'Antennas and Propagation Society', shortName: 'APS', budget: 12000, balance: 9500, officeBearers: [], members: [] },
  { id: 'bts', name: 'Broadcast Technology Society', shortName: 'BTS', budget: 8000, balance: 7200, officeBearers: [], members: [] },
  { id: 'cas', name: 'Circuits and Systems Society', shortName: 'CAS', budget: 20000, balance: 18500, officeBearers: [], members: [] },
  { id: 'comsoc', name: 'Communications Society', shortName: 'ComSoc', budget: 25000, balance: 21000, officeBearers: [], members: [] },
  { id: 'cis', name: 'Computational Intelligence Society', shortName: 'CIS', budget: 18000, balance: 14000, officeBearers: [], members: [] },
  { id: 'cs', name: 'Computer Society', shortName: 'IEEE CS', budget: 40000, balance: 32000, officeBearers: [], members: [] },
  { id: 'ctsoc', name: 'Consumer Technology Society', shortName: 'CTSoc', budget: 10000, balance: 8500, officeBearers: [], members: [] },
  { id: 'css', name: 'Control Systems Society', shortName: 'CSS', budget: 15000, balance: 13200, officeBearers: [], members: [] },
  { id: 'deis', name: 'Dielectrics and Electrical Insulation Society', shortName: 'DEIS', budget: 9000, balance: 8000, officeBearers: [], members: [] },
  { id: 'eds', name: 'Electron Devices Society', shortName: 'EDS', budget: 14000, balance: 11000, officeBearers: [], members: [] },
  { id: 'emcs', name: 'Electromagnetic Compatibility Society', shortName: 'EMCS', budget: 11000, balance: 9800, officeBearers: [], members: [] },
  { id: 'eps', name: 'Electronics Packaging Society', shortName: 'EPS', budget: 10000, balance: 9200, officeBearers: [], members: [] },
  { id: 'embs', name: 'Engineering in Medicine and Biology Society', shortName: 'EMBS', budget: 22000, balance: 19500, officeBearers: [], members: [] },
  { id: 'edsoc', name: 'Education Society', shortName: 'EdSoc', budget: 12000, balance: 10500, officeBearers: [], members: [] },
  { id: 'grss', name: 'Geoscience and Remote Sensing Society', shortName: 'GRSS', budget: 16000, balance: 14200, officeBearers: [], members: [] },
  { id: 'ies', name: 'Industrial Electronics Society', shortName: 'IES', budget: 20000, balance: 17800, officeBearers: [], members: [] },
  { id: 'ias', name: 'Industry Applications Society', shortName: 'IAS', budget: 22000, balance: 20000, officeBearers: [], members: [] },
  { id: 'it', name: 'Information Theory Society', shortName: 'ITS', budget: 13000, balance: 11500, officeBearers: [], members: [] },
  { id: 'ims', name: 'Instrumentation and Measurement Society', shortName: 'IMS', budget: 12500, balance: 10200, officeBearers: [], members: [] },
  { id: 'itss', name: 'Intelligent Transportation Systems Society', shortName: 'ITSS', budget: 14000, balance: 12500, officeBearers: [], members: [] },
  { id: 'mag', name: 'Magnetics Society', shortName: 'MAG', budget: 10000, balance: 8800, officeBearers: [], members: [] },
  { id: 'mtt', name: 'Microwave Theory and Technology Society', shortName: 'MTT-S', budget: 18000, balance: 15500, officeBearers: [], members: [] },
  { id: 'npss', name: 'Nuclear and Plasma Sciences Society', shortName: 'NPSS', budget: 15000, balance: 14000, officeBearers: [], members: [] },
  { id: 'oes', name: 'Oceanic Engineering Society', shortName: 'OES', budget: 12000, balance: 10800, officeBearers: [], members: [] },
  { id: 'pho', name: 'Photonics Society', shortName: 'PHO', budget: 17000, balance: 14500, officeBearers: [], members: [] },
  { id: 'pels', name: 'Power Electronics Society', shortName: 'PELS', budget: 24000, balance: 21000, officeBearers: [], members: [] },
  { id: 'pes', name: 'Power & Energy Society', shortName: 'PES', budget: 30000, balance: 26500, officeBearers: [], members: [] },
  { id: 'pses', name: 'Product Safety Engineering Society', shortName: 'PSES', budget: 8500, balance: 7900, officeBearers: [], members: [] },
  { id: 'pcs', name: 'Professional Communication Society', shortName: 'PCS', budget: 7000, balance: 6200, officeBearers: [], members: [] },
  { id: 'rs', name: 'Reliability Society', shortName: 'RS', budget: 9500, balance: 8800, officeBearers: [], members: [] },
  { id: 'ras', name: 'Robotics and Automation Society', shortName: 'RAS', budget: 35000, balance: 28000, officeBearers: [], members: [] },
  { id: 'sps', name: 'Signal Processing Society', shortName: 'SPS', budget: 26000, balance: 22500, officeBearers: [], members: [] },
  { id: 'ssit', name: 'Society on Social Implications of Technology', shortName: 'SSIT', budget: 9000, balance: 8400, officeBearers: [], members: [] },
  { id: 'sscs', name: 'Solid-State Circuits Society', shortName: 'SSCS', budget: 20000, balance: 17500, officeBearers: [], members: [] },
  { id: 'smc', name: 'Systems, Man, and Cybernetics Society', shortName: 'SMC', budget: 15000, balance: 13500, officeBearers: [], members: [] },
  { id: 'tems', name: 'Technology and Engineering Management Society', shortName: 'TEMS', budget: 11000, balance: 9800, officeBearers: [], members: [] },
  { id: 'uffc', name: 'Ultrasonics, Ferroelectrics, and Frequency Control Society', shortName: 'UFFC', budget: 13000, balance: 11800, officeBearers: [], members: [] },
  { id: 'vts', name: 'Vehicular Technology Society', shortName: 'VTS', budget: 14500, balance: 12800, officeBearers: [], members: [] }
];

export const AFFINITY_GROUPS: Society[] = [
  { id: 'wie', name: 'Women in Engineering', shortName: 'WIE', budget: 15000, balance: 12000, officeBearers: [], members: [] },
  { id: 'yp', name: 'Young Professionals', shortName: 'YP', budget: 10000, balance: 8000, officeBearers: [], members: [] },
  { id: 'sight', name: 'Special Interest Group on Humanitarian Technology', shortName: 'SIGHT', budget: 12000, balance: 10000, officeBearers: [], members: [] },
  { id: 'lm', name: 'Life Members', shortName: 'LM', budget: 5000, balance: 4500, officeBearers: [], members: [] }
];

export const IEEE_COUNCILS: Society[] = [
  { id: 'sensors', name: 'Sensors Council', shortName: 'Sensors', budget: 12000, balance: 11000, officeBearers: [], members: [] },
  { id: 'biometrics', name: 'Biometrics Council', shortName: 'Biometrics', budget: 8000, balance: 7500, officeBearers: [], members: [] },
  { id: 'nanotech', name: 'Nanotechnology Council', shortName: 'Nano', budget: 10000, balance: 9200, officeBearers: [], members: [] },
  { id: 'systems', name: 'Systems Council', shortName: 'Systems', budget: 15000, balance: 14000, officeBearers: [], members: [] },
  { id: 'ceda', name: 'Council on Electronic Design Automation', shortName: 'CEDA', budget: 11000, balance: 10500, officeBearers: [], members: [] }
];

export const ALL_UNITS = [...IEEE_SOCIETIES, ...AFFINITY_GROUPS, ...IEEE_COUNCILS];

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'prj-1',
    societyId: 'ras',
    category: 'TECHNICAL_PROJECT',
    title: 'Autonomous Agricultural Drone',
    sanctioningBody: 'IEEE R10 HAC',
    amountSanctioned: 45000,
    startDate: '2024-01-15',
    status: 'ONGOING',
    description: 'Developing a low-cost drone for small-scale farmers to monitor crop health.'
  },
  {
    id: 'prj-2',
    societyId: 'wie',
    category: 'TECHNICAL_PROJECT',
    title: 'STEM Outreach for Rural Girls',
    sanctioningBody: 'IEEE WIE HQ',
    amountSanctioned: 15000,
    startDate: '2023-11-20',
    status: 'COMPLETED',
    description: 'Mentorship program and workshops for girls in grade 8-10 in rural Bangalore.'
  },
  {
    id: 'prj-3',
    societyId: 'sb',
    category: 'TRAVEL_GRANT',
    title: 'IEEE R10 SYWL Congress Travel',
    sanctioningBody: 'IEEE Region 10',
    amountSanctioned: 65000,
    startDate: '2024-03-10',
    status: 'ANNOUNCED',
    description: 'Travel grant for Student Branch Chair to attend the Regional Congress in Tokyo.'
  },
  {
    id: 'prj-4',
    societyId: 'cs',
    category: 'SCHOLARSHIP',
    title: 'IEEE CS Richard E. Merwin Scholarship',
    sanctioningBody: 'IEEE Computer Society',
    amountSanctioned: 82000,
    startDate: '2024-02-01',
    status: 'AWARDED',
    description: 'Prestigious scholarship recognized for active involvement in student branch leadership and academic excellence.'
  },
  {
    id: 'prj-5',
    societyId: 'sb',
    category: 'AWARD',
    title: 'Outstanding Student Branch Award',
    sanctioningBody: 'IEEE Bangalore Section',
    amountSanctioned: 25000,
    startDate: '2024-05-15',
    status: 'AWARDED',
    description: 'Award recognized for the best performing Student Branch in the section for the academic year 2023-24.'
  }
];

export const MOCK_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'cal-1',
    societyId: 'cs',
    title: 'CodeSprint 2024 Hackathon',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 15).toISOString().split('T')[0],
    time: '09:00',
    venue: 'Block 4, 3rd Floor Labs',
    status: 'CONFIRMED',
    description: '24-hour hackathon focused on sustainable development goals.'
  },
  {
    id: 'cal-2',
    societyId: 'ras',
    title: 'Robotics Workshop: Line Follower',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 22).toISOString().split('T')[0],
    time: '14:00',
    venue: 'Auditorium Block 1',
    status: 'PROPOSED',
    description: 'Introductory workshop for first year students on basic robotics.'
  },
  {
    id: 'cal-3',
    societyId: 'wie',
    title: 'Women in Tech Panel Discussion',
    date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 5).toISOString().split('T')[0],
    time: '10:00',
    venue: 'Seminar Hall',
    status: 'CONFIRMED',
    description: 'Panel discussion with industry leaders from top tech companies.'
  }
];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'General Body Meeting',
    message: 'All office bearers are requested to attend the GBM on Friday at 4 PM in Block 1 Auditorium. We will discuss the upcoming tech fest roadmap.',
    date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString().split('T')[0],
    senderName: 'CHRIST SBC',
    targetAudience: 'LEADERSHIP'
  },
  {
    id: 'ann-2',
    title: 'Membership Drive Extended',
    message: 'The early bird membership drive has been extended by one week due to high demand. Please inform your peers and encourage them to sign up.',
    date: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString().split('T')[0],
    senderName: 'Dean of Engineering',
    targetAudience: 'ALL'
  }
];

// Generate mock users for all units automatically
export const MOCK_USERS: User[] = [
  { id: 'u1', email: 'admin@ieee.org', password: 'admin', role: UserRole.ADMIN, name: 'CHRIST SBC' },
  { id: 'u-dean', email: 'dean@ieee.org', password: 'admin', role: UserRole.ADMIN, name: 'Dean of Engineering' },
  { id: 'u-director', email: 'director@ieee.org', password: 'admin', role: UserRole.ADMIN, name: 'Director' },
  { id: 'u-assoc-dean', email: 'associate.dean@ieee.org', password: 'admin', role: UserRole.ADMIN, name: 'Associate Dean' },
  { id: 'u-assoc-director', email: 'associate.director@ieee.org', password: 'admin', role: UserRole.ADMIN, name: 'Associate Director' },
  ...ALL_UNITS.map((unit) => ({
    id: `u-chair-${unit.id}`,
    email: `${unit.id}@ieee.org`,
    password: 'office',
    role: UserRole.OFFICE_BEARER,
    societyId: unit.id,
    name: `${unit.shortName} Chair`
  }))
];

export const INCOME_CATEGORIES = [
  'Grants', 'Donations', 'Event Registrations', 'Sponsorships', 'Others'
];

export const EXPENSE_CATEGORIES = [
  'Venue & Logistics', 'Publicity', 'Refreshments', 'Speaker Fees', 'Prizes', 'Travel', 'Office Supplies', 'Others'
];

export const EVENT_TYPES = [
  'Workshop', 'Seminar', 'Conference', 'Competition', 'Field Trip', 'Outreach', 'Social Event', 'Other'
];

export const PROJECT_STATUSES: { value: Project['status'], label: string }[] = [
  { value: 'PROPOSED', label: 'Proposed' },
  { value: 'ONGOING', label: 'Ongoing' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'ANNOUNCED', label: 'Announced' },
  { value: 'AWARDED', label: 'Awarded' }
];

export const PROJECT_CATEGORIES: { value: Project['category'], label: string }[] = [
  { value: 'TECHNICAL_PROJECT', label: 'Technical Project' },
  { value: 'TRAVEL_GRANT', label: 'Travel Grant' },
  { value: 'SCHOLARSHIP', label: 'Scholarship' },
  { value: 'AWARD', label: 'Award' }
];

export const CALENDAR_STATUSES: { value: CalendarEvent['status'], label: string, color: string }[] = [
  { value: 'PROPOSED', label: 'Proposed', color: 'bg-amber-100 text-amber-700' },
  { value: 'CONFIRMED', label: 'Confirmed', color: 'bg-green-100 text-green-700' },
  { value: 'COMPLETED', label: 'Completed', color: 'bg-blue-100 text-blue-700' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-100 text-red-700' }
];
