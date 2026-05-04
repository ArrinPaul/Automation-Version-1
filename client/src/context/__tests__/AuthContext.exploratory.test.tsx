/**
 * Exploratory tests for AuthContext — run on UNFIXED code to confirm root cause.
 *
 * These tests are EXPECTED TO FAIL on the current (unfixed) code.
 * Failure confirms the bug exists.
 *
 * Bug Path A:
 *   onAuthStateChange sets loading=true, then calls refreshProfile().
 *   If refreshProfile() hangs (never resolves), the finally block is never reached
 *   and loading stays true forever.
 *
 *   Note: if refreshProfile() *throws*, it catches its own error internally and
 *   returns normally, so the outer finally DOES run — loading resets correctly.
 *   Test 1.1 documents this nuance (it may pass on unfixed code).
 *
 * Test 1.2 (hang) is the true bug condition for Path A.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import React from 'react';

// ─── Module mocks ────────────────────────────────────────────────────────────

// Capture the onAuthStateChange callback so we can fire it manually.
let capturedAuthStateCallback: ((event: string, session: unknown) => Promise<void>) | null = null;

vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn((cb: (event: string, session: unknown) => Promise<void>) => {
        capturedAuthStateCallback = cb;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
  },
}));

vi.mock('../../services/apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
  },
}));

// ─── Imports (after mocks) ────────────────────────────────────────────────────

import apiClient from '../../services/apiClient';
import { AuthProvider, useAuth } from '../AuthContext';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** A simple consumer component that exposes loading state via a data-testid */
const LoadingProbe: React.FC = () => {
  const { loading } = useAuth();
  return <div data-testid="loading-state">{loading ? 'true' : 'false'}</div>;
};

const renderWithAuth = () =>
  render(
    <AuthProvider>
      <LoadingProbe />
    </AuthProvider>
  );

const TIMEOUT_MS = 2000;

// Fake session object used to simulate a signed-in user
const fakeSession = {
  user: { id: 'user-1', email: 'test@example.com' },
  access_token: 'token',
  refresh_token: 'refresh',
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('AuthContext exploratory tests (expected to fail on unfixed code)', () => {
  beforeEach(() => {
    capturedAuthStateCallback = null;
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Test 1.1 — refreshProfile throws → loading should reset to false
   *
   * NOTE: refreshProfile() catches its own errors internally and does NOT re-throw.
   * So the onAuthStateChange handler's try block completes normally and the finally
   * block DOES run. This test is expected to PASS on unfixed code, documenting that
   * the "throws" path is NOT the primary bug condition for Path A.
   *
   * The real bug is the "hangs" path (test 1.2).
   */
  it('1.1 — refreshProfile throws → loading resets to false (documents throw path behavior)', async () => {
    // Mock apiClient.get (used by fetchProfile) to throw an error
    vi.mocked(apiClient.get).mockRejectedValue(new Error('Network error'));

    renderWithAuth();

    // Wait for initial auth to settle (no session → loading becomes false)
    await waitFor(() => {
      expect(screen.getByTestId('loading-state').textContent).toBe('false');
    }, { timeout: TIMEOUT_MS });

    // Now fire onAuthStateChange with a non-null session
    act(() => {
      if (capturedAuthStateCallback) {
        void capturedAuthStateCallback('SIGNED_IN', fakeSession);
      }
    });

    // loading should become true immediately after the callback starts
    await waitFor(() => {
      expect(screen.getByTestId('loading-state').textContent).toBe('true');
    }, { timeout: 500 });

    // loading should reset to false after refreshProfile catches its own error
    // (refreshProfile swallows the error, so the outer finally runs normally)
    await waitFor(() => {
      expect(screen.getByTestId('loading-state').textContent).toBe('false');
    }, { timeout: TIMEOUT_MS });
  });

  /**
   * Test 1.2 — refreshProfile hangs → loading should reset to false within timeout
   *
   * This IS the primary bug condition for Path A.
   * On unfixed code: refreshProfile never resolves → onAuthStateChange handler
   * never reaches its finally block → loading stays true forever.
   *
   * EXPECTED TO FAIL on unfixed code.
   */
  it('1.2 — refreshProfile hangs → loading resets to false within 2s (EXPECTED FAIL on unfixed code)', async () => {
    // Mock apiClient.get (used by fetchProfile) to return a never-resolving promise
    vi.mocked(apiClient.get).mockReturnValue(new Promise<never>(() => { /* never resolves */ }));

    renderWithAuth();

    // Wait for initial auth to settle (no session → loading becomes false)
    await waitFor(() => {
      expect(screen.getByTestId('loading-state').textContent).toBe('false');
    }, { timeout: TIMEOUT_MS });

    // Fire the callback but do NOT await it — it will hang forever on unfixed code
    act(() => {
      if (capturedAuthStateCallback) {
        void capturedAuthStateCallback('SIGNED_IN', fakeSession);
      }
    });

    // loading should become true immediately after the callback starts
    await waitFor(() => {
      expect(screen.getByTestId('loading-state').textContent).toBe('true');
    }, { timeout: 500 });

    // On UNFIXED code: loading stays true forever → this assertion FAILS (timeout)
    // On FIXED code: loading resets to false within the timeout
    await waitFor(() => {
      expect(screen.getByTestId('loading-state').textContent).toBe('false');
    }, { timeout: TIMEOUT_MS });
  });
});
