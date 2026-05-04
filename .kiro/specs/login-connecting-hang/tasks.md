# Login Connecting Hang — Tasks

## Tasks

- [x] 1. Fix `AuthContext.tsx` — add `finally` to `onAuthStateChange` handler
  - [x] 1.1 Add `finally { if (isMounted.current) setLoading(false); }` to the `onAuthStateChange` callback

- [x] 2. Fix `Login.tsx` — add timeout to hanging async calls
  - [x] 2.1 Add a `withTimeout<T>(promise: Promise<T>, ms: number): Promise<T>` helper
  - [x] 2.2 Wrap `apiClient.post(...)` in `onLogin` with `withTimeout` (15 s)
  - [x] 2.3 Wrap `supabase.auth.setSession(...)` in `onLogin` with `withTimeout` (15 s)
  - [x] 2.4 Apply the same `withTimeout` wrapping in `onSetup` for both calls
  - [x] 2.5 Show `"Connection timed out. Please try again."` toast when timeout fires
