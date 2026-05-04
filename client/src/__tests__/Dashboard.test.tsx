import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Dashboard from '../features/Dashboard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    profile: { name: 'Test User', role: 'SB_FACULTY', society: { balance: 5000 } },
    loading: false
  })
}));

const queryClient = new QueryClient();

describe('Dashboard Component', () => {
  it('renders system status and welcome message', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Dashboard />
      </QueryClientProvider>
    );
    expect(screen.getByText(/Welcome, Test User/i)).toBeDefined();
    expect(screen.getByText(/TERMINAL_DASHBOARD/i)).toBeDefined();
  });
});
