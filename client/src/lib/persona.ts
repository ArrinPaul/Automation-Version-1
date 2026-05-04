import type { Role } from '@/context/AuthContext';

export const getPersonaAlias = (role?: Role | null, email?: string | null): string | null => {
  if (!role || !email) return null;
  const normalizedEmail = email.toLowerCase().trim();
  const localPart = normalizedEmail.split('@')[0] ?? '';
  const tokens = localPart.replaceAll(/[^a-z0-9]+/g, '.').split('.').filter(Boolean);
  const lastToken = tokens.at(-1);
  if (lastToken === 'dean') return 'Dean';
  if (lastToken === 'director') return 'Director';
  if (lastToken === 'counselor' || lastToken === 'counsellor') return 'Branch Counselor';
  return null;
};
