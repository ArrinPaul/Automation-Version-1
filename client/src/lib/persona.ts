type PersonaRole = 'MANAGEMENT' | 'FACULTY_ADVISOR' | 'SOCIETY_OB' | 'MEMBER';

export const getPersonaAlias = (role?: PersonaRole | null, email?: string | null) => {
  if (role !== 'MANAGEMENT' || !email) {
    return null;
  }

  const normalizedEmail = email.toLowerCase().trim();
  const localPart = normalizedEmail.split('@')[0] ?? '';
  const normalizedLocalPart = localPart.replaceAll(/[^a-z0-9]+/g, '.');
  const tokens = normalizedLocalPart.split('.').filter(Boolean);
  const lastToken = tokens.at(-1);

  if (lastToken === 'dean') {
    return 'Dean';
  }

  if (lastToken === 'director') {
    return 'Director';
  }

  if (lastToken === 'counselor' || lastToken === 'counsellor') {
    return 'Branch Counselor';
  }

  return null;
};
