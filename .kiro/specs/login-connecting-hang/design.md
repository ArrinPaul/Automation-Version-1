# Login Connecting Hang Bugfix Design

## Overview

After a successful login API call, the UI can get permanently stuck showing "CONNECTING..." with no way to recover. Two distinct failure paths cause this:

1. `AuthContext.tsx` — the `onAuthStateChange` handler sets `loading` to `true` but has no `finally` block, so if `refreshProfile()` throws or hangs, `loading` is never reset to `false`.
2. `Login.tsx` — if the backend API call or `supabase.auth.setSession()` hangs indefinitely, the `finally` block is never reached and `submitting` stays `true`.

The fix adds a `finally` block to the `onAuthStateChange` handler and wraps the two async calls in `Login.tsx` with a `Promise.race` timeout so they cannot hang forever.

## Glossary

- **Bug_Condition (C)**: The condition that triggers the hang — either `refreshProfile()` throws/hangs inside `onAuthStateChange`, or the backend API / `setSession()` call never resolves.
- **Property (P)**: The desired behavior — `loading` and `submitting` are always reset to `false` after any login attempt, regardless of success or failure.
- **Preservation**: Existing successful-login, invalid-credentials, profile-not-found, and session-restore flows that must remain unchanged by the fix.
- **`onAuthStateChange` handler**: The Supabase auth event listener in `client/src/context/AuthContext.tsx` that calls `refreshProfile()` and manages `loading` state.
- **`onLogin` / `onSetup`**: The form submit handlers in `client/src/features/Login.tsx` that call the backend and then `supabase.auth.setSession()`.
- **`submitting`**: React state in `Login.tsx` that controls the "CONNECTING..." button state.
- **`loading`**: React state in `AuthContext.tsx` that controls the full-screen loading overlay.

## Bug Details

### Fault Condition

The bug manifests in two related paths:

**Path A** — `onAuthStateChange` in `AuthContext.tsx` sets `loading = true` then calls `refreshProfile()`. If `refreshProfile()` throws or never resolves, there is no `finally` block to reset `loading`, so the app is permanently blocked.

**Path B** — `onLogin`/`onSetup` in `Login.tsx` calls `apiClient.post(...)` then `supabase.auth.setSession(...)`. If either call hangs indefinitely, the `finally { setSubmitting(false) }` is never reached.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input — a login attempt event
  OUTPUT: boolean

  path_a := input.trigger = SUPABASE_AUTH_STATE_CHANGE
            AND input.sessionUser IS NOT NULL
            AND (refreshProfile THROWS OR refreshProfile NEVER_RESOLVES)
            AND onAuthStateChange HAS NO finally BLOCK

  path_b := input.trigger = FORM_SUBMIT
            AND (apiClient.post NEVER_RESOLVES OR supabase.auth.setSession NEVER_RESOLVES)

  RETURN path_a OR path_b
END FUNCTION
```

### Examples

- User submits valid credentials → backend responds → `setSession()` hangs → `finally` never runs → button stuck on "CONNECTING..." forever. *(Path B)*
- User submits valid credentials → `setSession()` succeeds → `onAuthStateChange` fires → `refreshProfile()` throws a network error → no `finally` → `loading` stays `true` → app shows loading overlay forever. *(Path A)*
- User submits valid credentials → `setSession()` succeeds → `onAuthStateChange` fires → `refreshProfile()` hangs (server unresponsive) → `loading` stays `true`. *(Path A)*
- User submits invalid credentials → backend returns 401 → `catch` block runs → `finally` runs → `setSubmitting(false)` called → button re-enabled. *(Not a bug — works correctly today.)*

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Successful login with valid credentials must still authenticate the user and navigate to the dashboard.
- Invalid credentials must still display an error message and re-enable the submit button.
- A 404 "profile not found" response must still switch the form to setup mode.
- Session restore on page load (`initializeAuth`) must still work without requiring re-login.
- When `refreshProfile()` succeeds inside `onAuthStateChange`, `loading` must still transition to `false` normally.

**Scope:**
All inputs that do NOT involve a hanging or throwing `refreshProfile()` call, or a hanging API/`setSession()` call, must be completely unaffected by this fix. This includes:
- Normal successful login flows
- Normal error/rejection flows (network errors, 401, 403, 404)
- Mouse/keyboard interactions unrelated to form submission
- Session restoration on app load

## Hypothesized Root Cause

1. **Missing `finally` in `onAuthStateChange`**: The handler in `AuthContext.tsx` wraps its body in `try` but not `try/finally`. If `refreshProfile()` rejects, the `catch` in `refreshProfile` itself swallows the error and returns, but `setLoading(false)` is never called because there is no `finally` in the outer handler. If `refreshProfile()` hangs (e.g., the `/auth/me` request never resolves), neither `try` nor any error path ever calls `setLoading(false)`.

2. **No timeout on `apiClient.post` or `supabase.auth.setSession` in Login.tsx**: Both calls are plain `await` with no timeout. If the server accepts the TCP connection but never sends a response, or if the Supabase JS client stalls, the `await` hangs indefinitely and the `finally` block is unreachable.

3. **`refreshProfile` error handling swallows the error silently**: `refreshProfile` catches its own errors and sets `profile` to `null`, but does not re-throw. This means the `onAuthStateChange` handler's `try` block completes without error — but `setLoading(false)` is still never called because it only exists in the (missing) `finally`.

## Correctness Properties

Property 1: Fault Condition - Loading and Submitting Always Reset

_For any_ login attempt where the bug condition holds (either `refreshProfile()` throws or hangs inside `onAuthStateChange`, or the API/`setSession()` call never resolves), the fixed code SHALL reset `loading` to `false` (AuthContext) and `submitting` to `false` (Login) within a bounded time, so the UI is never permanently stuck.

**Validates: Requirements 2.1, 2.2, 2.3**

Property 2: Preservation - Successful and Error Flows Unchanged

_For any_ login attempt where the bug condition does NOT hold (normal success, normal error/rejection, session restore), the fixed code SHALL produce exactly the same observable behavior as the original code — same navigation, same error messages, same state transitions — preserving all existing functionality.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

## Fix Implementation

### Changes Required

**File**: `client/src/context/AuthContext.tsx`

**Function**: `onAuthStateChange` callback (inside `useEffect` in `useSupabaseAuth`)

**Specific Changes**:
1. **Add `finally` block**: Wrap the handler body in `try/finally` (it currently has `try` with no `catch` or `finally`). In the `finally` block, call `if (isMounted.current) setLoading(false)`.
   - The existing code already has a `try` with no `catch` — add `finally { if (isMounted.current) setLoading(false); }`.

---

**File**: `client/src/features/Login.tsx`

**Functions**: `onLogin`, `onSetup`

**Specific Changes**:
2. **Add timeout wrapper for `apiClient.post`**: Wrap the `apiClient.post(...)` call with a `Promise.race` against a timeout promise (e.g., 15 seconds) that rejects with a descriptive error. This ensures the `finally` block is always reached.
3. **Add timeout wrapper for `supabase.auth.setSession`**: Similarly wrap `supabase.auth.setSession(...)` with a `Promise.race` timeout.
4. **Shared timeout utility**: Extract a small `withTimeout<T>(promise: Promise<T>, ms: number): Promise<T>` helper (can be inline or in a utils file) to avoid duplication between `onLogin` and `onSetup`.
5. **Error message for timeout**: When the timeout fires, show a user-friendly toast: `"Connection timed out. Please try again."` so the user knows what happened.

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Fault Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm or refute the root cause analysis.

**Test Plan**: Write tests that mock `refreshProfile` to throw or hang, and mock `apiClient.post`/`supabase.auth.setSession` to hang, then assert that `loading` and `submitting` are eventually reset. Run these tests on the UNFIXED code to observe failures.

**Test Cases**:
1. **AuthContext hang test**: Mock `refreshProfile` to return a never-resolving promise; fire `onAuthStateChange`; assert `loading` becomes `false` within timeout. *(Will fail on unfixed code — `loading` stays `true`.)*
2. **AuthContext throw test**: Mock `refreshProfile` to throw; fire `onAuthStateChange`; assert `loading` becomes `false`. *(Will fail on unfixed code.)*
3. **Login API hang test**: Mock `apiClient.post` to return a never-resolving promise; submit the login form; assert `submitting` becomes `false` within timeout. *(Will fail on unfixed code.)*
4. **Login setSession hang test**: Mock `apiClient.post` to resolve successfully but mock `supabase.auth.setSession` to hang; submit the form; assert `submitting` becomes `false`. *(Will fail on unfixed code.)*

**Expected Counterexamples**:
- `loading` remains `true` indefinitely after `refreshProfile` throws/hangs in `onAuthStateChange`.
- `submitting` remains `true` indefinitely when API or `setSession` hangs.

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed code resets state within a bounded time.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := triggerLoginFlow_fixed(input)
  ASSERT loading = false WITHIN timeout
  ASSERT submitting = false WITHIN timeout
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed code produces the same result as the original.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT originalFlow(input) = fixedFlow(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because it generates many input combinations automatically and catches edge cases that manual tests miss.

**Test Cases**:
1. **Successful login preservation**: Verify that a fully successful login still navigates to the dashboard after the fix.
2. **Invalid credentials preservation**: Verify that a 401 response still shows an error toast and re-enables the button.
3. **Profile-not-found preservation**: Verify that a 404 "profile not found" still switches to setup mode.
4. **Session restore preservation**: Verify that `initializeAuth` on page load still restores the session correctly.
5. **`refreshProfile` success preservation**: Verify that when `refreshProfile` succeeds inside `onAuthStateChange`, `loading` still transitions to `false` and the profile is set.

### Unit Tests

- Test that `onAuthStateChange` handler calls `setLoading(false)` when `refreshProfile` throws.
- Test that `onAuthStateChange` handler calls `setLoading(false)` when `refreshProfile` hangs past the timeout.
- Test that `onLogin` calls `setSubmitting(false)` when `apiClient.post` hangs past the timeout.
- Test that `onLogin` calls `setSubmitting(false)` when `supabase.auth.setSession` hangs past the timeout.
- Test edge case: `onAuthStateChange` fires with `session = null` (sign-out) — `loading` still resets correctly.

### Property-Based Tests

- Generate random auth event sequences and verify `loading` is always `false` after each handler completes.
- Generate random API response delays (including infinite) and verify `submitting` is always eventually `false`.
- Generate random combinations of success/failure for `apiClient.post` and `setSession` and verify state is always cleaned up.

### Integration Tests

- Full login flow with real (mocked) backend: valid credentials → dashboard navigation works after fix.
- Full login flow with hanging server: button re-enables after timeout, user can retry.
- Full login flow with `refreshProfile` failure: app does not show permanent loading overlay after fix.
