# Bugfix Requirements Document

## Introduction

After submitting the login form, the submit button displays "CONNECTING..." indefinitely and never resolves. The user cannot retry or proceed, effectively locking them out of the application. Two distinct failure paths cause this: (1) the `onAuthStateChange` handler in `AuthContext` sets `loading` to `true` but never resets it to `false` when `refreshProfile()` throws or hangs, and (2) if the backend API call or `supabase.auth.setSession()` never resolves, the `submitting` state is never cleared.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the login API call succeeds and `supabase.auth.setSession()` is called THEN the `onAuthStateChange` event fires, sets `loading` to `true`, and if `refreshProfile()` subsequently throws or never resolves, `loading` is never reset to `false`, leaving the app in a permanent loading state.

1.2 WHEN the backend API request or `supabase.auth.setSession()` call hangs indefinitely without resolving or rejecting THEN `setSubmitting(false)` in the `finally` block is never reached, leaving the button stuck on "CONNECTING...".

1.3 WHEN `refreshProfile()` fails inside the `onAuthStateChange` handler THEN `setLoading(false)` is never called after the error, blocking the authenticated view from rendering.

### Expected Behavior (Correct)

2.1 WHEN `onAuthStateChange` fires and `refreshProfile()` throws or hangs THEN the system SHALL reset `loading` to `false` in a `finally` block so the app does not remain in a permanent loading state.

2.2 WHEN the login API call or `supabase.auth.setSession()` does not resolve within a reasonable timeout THEN the system SHALL reject the pending promise, allowing the `finally` block to run and `setSubmitting(false)` to be called.

2.3 WHEN `refreshProfile()` fails inside the `onAuthStateChange` handler THEN the system SHALL call `setLoading(false)` regardless of the error so the UI can recover.

### Unchanged Behavior (Regression Prevention)

3.1 WHEN valid credentials are submitted and the full login flow completes successfully THEN the system SHALL CONTINUE TO authenticate the user and navigate to the dashboard.

3.2 WHEN invalid credentials are submitted THEN the system SHALL CONTINUE TO display an appropriate error message and re-enable the submit button.

3.3 WHEN the backend returns a 404 with "profile not found" THEN the system SHALL CONTINUE TO switch the form to setup mode.

3.4 WHEN the user is already authenticated on page load THEN the system SHALL CONTINUE TO restore the session and profile without requiring re-login.

3.5 WHEN `refreshProfile()` succeeds inside the `onAuthStateChange` handler THEN the system SHALL CONTINUE TO set the user profile and transition `loading` to `false` normally.
