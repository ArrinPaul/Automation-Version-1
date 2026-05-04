/**
 * Exploratory tests for Login.tsx - verify the fix for Path B of the hang bug.
 *
 * Bug Path B:
 *   onLogin calls apiClient.post(...) then supabase.auth.setSession(...).
 *   If either call hangs indefinitely (never resolves or rejects), the
 *   finally { setSubmitting(false) } block is never reached, leaving the
 *   button stuck on "Connecting..." forever.
 *
 * These tests use fake timers to advance past the 15s withTimeout threshold
 * and assert that submitting is reset to false on the fixed code.
 *
 * Test 1.3: apiClient.post hangs -> withTimeout fires -> submitting resets
 * Test 1.4: apiClient.post resolves but supabase.auth.setSession hangs -> withTimeout fires -> submitting resets
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import React from 'react';

// Module mocks

vi.mock('@/services/apiClient', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: { initialized: true } }),
    post: vi.fn(),
  },
}));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      setSession: vi.fn(),
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
  },
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<object>) =>
      React.createElement('div', props, children),
    form: ({ children, ...props }: React.PropsWithChildren<object>) =>
      React.createElement('form', props, children),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren<object>) =>
    React.createElement(React.Fragment, null, children),
}));

// Imports (after mocks)

import apiClient from '@/services/apiClient';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import Login from '../features/Login';

// Helpers

/** Fill in and submit the login form */
const submitLoginForm = (email = 'admin@ieee.org', password = 'password123') => {
  const emailInput = screen.getByLabelText(/email address/i);
  const passwordInput = screen.getByLabelText(/password/i);
  const submitButton = screen.getByRole('button', { name: /establish connection/i });

  fireEvent.change(emailInput, { target: { value: email } });
  fireEvent.change(passwordInput, { target: { value: password } });
  fireEvent.click(submitButton);
};

// Tests

describe('Login exploratory tests (Path B hang fix verification)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Default: check-initialized returns initialized=true (stay in login mode)
    vi.mocked(apiClient.get).mockResolvedValue({ data: { initialized: true } });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  /**
   * Test 1.3 - apiClient.post hangs -> withTimeout fires after 15s -> submitting resets to false
   *
   * On unfixed code: apiClient.post never resolves -> onLogin's await never returns
   * -> finally { setSubmitting(false) } is never reached -> button stays "Connecting..."
   *
   * On fixed code: withTimeout races the hanging promise and rejects after 15s,
   * the catch block shows a timeout toast, and finally resets submitting to false.
   */
  it('1.3 - apiClient.post hangs -> submitting resets to false after timeout fires', async () => {
    // Mock apiClient.post to return a never-resolving promise
    vi.mocked(apiClient.post).mockReturnValue(new Promise(() => { /* never resolves */ }));

    render(<Login />);

    // Flush the check-initialized microtask
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    // Submit the form
    await act(async () => {
      submitLoginForm();
    });

    // Button should show "Connecting..." immediately after submit
    expect(screen.getByRole('button', { name: /connecting/i })).toBeDefined();

    // Advance time past the 15s withTimeout threshold and flush all resulting microtasks
    await act(async () => {
      await vi.advanceTimersByTimeAsync(16000);
    });

    // Button should now re-enable (submitting reset to false by finally block)
    expect(screen.getByRole('button', { name: /establish connection/i })).toBeDefined();

    // Timeout toast should have been shown
    expect(vi.mocked(toast.error)).toHaveBeenCalledWith('Connection timed out. Please try again.');
  }, 30000);

  /**
   * Test 1.4 - apiClient.post resolves but supabase.auth.setSession hangs ->
   *            withTimeout fires after 15s -> submitting resets to false
   *
   * On unfixed code: setSession never resolves -> onLogin's await never returns
   * -> finally { setSubmitting(false) } is never reached -> button stays "Connecting..."
   *
   * On fixed code: withTimeout races the hanging setSession and rejects after 15s,
   * the catch block shows a timeout toast, and finally resets submitting to false.
   */
  it('1.4 - supabase.auth.setSession hangs -> submitting resets to false after timeout fires', async () => {
    // Mock apiClient.post to resolve successfully with a valid session
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        session: {
          access_token: 'fake-access-token',
          refresh_token: 'fake-refresh-token',
        },
      },
    });

    // Mock supabase.auth.setSession to return a never-resolving promise
    vi.mocked(supabase.auth.setSession).mockReturnValue(new Promise(() => { /* never resolves */ }));

    render(<Login />);

    // Flush the check-initialized microtask
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    // Submit the form
    await act(async () => {
      submitLoginForm();
    });

    // Button should show "Connecting..." immediately after submit
    expect(screen.getByRole('button', { name: /connecting/i })).toBeDefined();

    // Advance time past the 15s withTimeout threshold and flush all resulting microtasks
    await act(async () => {
      await vi.advanceTimersByTimeAsync(16000);
    });

    // Button should now re-enable (submitting reset to false by finally block)
    expect(screen.getByRole('button', { name: /establish connection/i })).toBeDefined();

    // Timeout toast should have been shown
    expect(vi.mocked(toast.error)).toHaveBeenCalledWith('Connection timed out. Please try again.');
  }, 30000);
});
