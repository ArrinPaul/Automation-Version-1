import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getPersonaAlias } from '@/lib/persona';

const ShellHeader: React.FC = () => {
  const { profile } = useAuth();
  const location = useLocation();

  const alias = getPersonaAlias(profile?.role, profile?.email);

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0A0A0C]/95 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 px-6 py-4">
        <div>
          <p className="font-display text-[10px] uppercase tracking-[0.45em] text-white/80">IEEE Finance Pro</p>
          <h2 className="mt-1 font-mono text-xs uppercase tracking-[0.3em] text-white/90">
            {location.pathname === '/' ? 'Command Overview' : location.pathname.replace('/', '').replaceAll('-', ' ')}
          </h2>
        </div>

        <div className="text-right">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Active Operator</p>
          <p className="font-display text-sm uppercase tracking-tighter text-white">
            {alias ?? profile?.name ?? 'Operator'}
          </p>
          <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/60">
            {profile?.role ?? 'SESSION_PENDING'}
          </p>
        </div>
      </div>
    </header>
  );
};

export default ShellHeader;
