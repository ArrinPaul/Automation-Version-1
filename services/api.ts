import apiClient from './apiClient';

// ── Societies ────────────────────────────────────────────────
export const societyApi = {
  getAll: () => apiClient.get('/societies'),
  getOne: (id: string) => apiClient.get(`/societies/${id}`),
  create: (data: any) => apiClient.post('/societies', data),
  update: (id: string, data: any) => apiClient.put(`/societies/${id}`, data),
  updateOfficeBearers: (id: string, officeBearers: any[]) =>
    apiClient.put(`/societies/${id}/office-bearers`, { officeBearers }),
  updateMembers: (id: string, members: any[]) =>
    apiClient.put(`/societies/${id}/members`, { members }),
  delete: (id: string) => apiClient.delete(`/societies/${id}`),
};

// ── Transactions ─────────────────────────────────────────────
export const transactionApi = {
  getAll: (params?: any) => apiClient.get('/transactions', { params }),
  getOne: (id: string) => apiClient.get(`/transactions/${id}`),
  create: (data: any) => apiClient.post('/transactions', data),
  update: (id: string, data: any) => apiClient.put(`/transactions/${id}`, data),
  approve: (id: string, status: 'APPROVED' | 'REJECTED') =>
    apiClient.patch(`/transactions/${id}/approve`, { status }),
  delete: (id: string) => apiClient.delete(`/transactions/${id}`),
};

// ── Events ───────────────────────────────────────────────────
export const eventApi = {
  getAll: (params?: any) => apiClient.get('/events', { params }),
  getOne: (id: string) => apiClient.get(`/events/${id}`),
  create: (data: any) => apiClient.post('/events', data),
  update: (id: string, data: any) => apiClient.put(`/events/${id}`, data),
  delete: (id: string) => apiClient.delete(`/events/${id}`),
};

// ── Projects ─────────────────────────────────────────────────
export const projectApi = {
  getAll: (params?: any) => apiClient.get('/projects', { params }),
  getOne: (id: string) => apiClient.get(`/projects/${id}`),
  create: (data: any) => apiClient.post('/projects', data),
  update: (id: string, data: any) => apiClient.put(`/projects/${id}`, data),
  delete: (id: string) => apiClient.delete(`/projects/${id}`),
};

// ── Calendar Events ──────────────────────────────────────────
export const calendarApi = {
  getAll: (params?: any) => apiClient.get('/calendar', { params }),
  create: (data: any) => apiClient.post('/calendar', data),
  update: (id: string, data: any) => apiClient.put(`/calendar/${id}`, data),
  delete: (id: string) => apiClient.delete(`/calendar/${id}`),
};

// ── Announcements ────────────────────────────────────────────
export const announcementApi = {
  getAll: () => apiClient.get('/announcements'),
  create: (data: any) => apiClient.post('/announcements', data),
  delete: (id: string) => apiClient.delete(`/announcements/${id}`),
};
