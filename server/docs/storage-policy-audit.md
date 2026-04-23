# Supabase Storage Policy Audit (Phase 6)

Date: 2026-04-23
Scope: IEEE Finance Pro storage buckets for institutional branding and transaction artifacts.

## Target Policy Matrix

| Bucket | Read Policy | Write Policy | Required Result |
|---|---|---|---|
| institution | authenticated users | management role only | PASS when both rules exist |
| transactions | management role only | management role only | PASS when both rules exist |

## Application Surface Review

Reviewed file: `server/src/services/storageService.ts`

Findings:
- Upload helper calls `supabase.storage.from(bucket).upload(...)` with service-role credentials.
- Bucket-level access control therefore depends on Supabase Storage RLS policies.
- No client-side storage key is exposed by this service implementation.

Risk:
- If bucket policies are missing in Supabase dashboard, service-role uploads can bypass intended role semantics.
- Mitigation is to enforce policy set in Supabase SQL and keep management-only upload routes guarded in API.

## Supabase Policy Verification SQL

Run these in Supabase SQL editor for direct verification:

```sql
select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
order by policyname;
```

### Expected policy intent

Institution bucket:
- Read allowed for authenticated users.
- Write allowed only for role MANAGEMENT.

Transactions bucket:
- Read allowed only for role MANAGEMENT.
- Write allowed only for role MANAGEMENT.

## Recommended Policy Templates

Adjust these to your claim source for role (JWT claims or metadata):

```sql
-- institution: read for authenticated
create policy if not exists "institution_read_authenticated"
on storage.objects for select
using (bucket_id = 'institution' and auth.role() = 'authenticated');

-- institution: write for management
create policy if not exists "institution_write_management"
on storage.objects for insert
with check (
  bucket_id = 'institution'
  and auth.role() = 'authenticated'
  and coalesce(auth.jwt()->'user_metadata'->>'role', '') = 'MANAGEMENT'
);

-- transactions: read for management
create policy if not exists "transactions_read_management"
on storage.objects for select
using (
  bucket_id = 'transactions'
  and auth.role() = 'authenticated'
  and coalesce(auth.jwt()->'user_metadata'->>'role', '') = 'MANAGEMENT'
);

-- transactions: write for management
create policy if not exists "transactions_write_management"
on storage.objects for insert
with check (
  bucket_id = 'transactions'
  and auth.role() = 'authenticated'
  and coalesce(auth.jwt()->'user_metadata'->>'role', '') = 'MANAGEMENT'
);
```

## Audit Verdict

- Codebase-level review: PASS (storage calls are centralized and auditable).
- Runtime policy verification: REQUIRES SUPABASE SQL CONFIRMATION in target environment.
- Phase 6 completion note: Mark as verified once the SQL output confirms the expected policy matrix in production.
