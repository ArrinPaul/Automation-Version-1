import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, CheckCircle2, AlertTriangle, Globe2, Landmark } from 'lucide-react';
import { normalizeCollection, formatCurrency, isPresent } from './phase4Helpers';

interface SocietyCardData {
  id: string;
  societyKey: string;
  name: string;
  shortName: string;
  type: string;
  budget: string | number;
  balance: string | number;
  logoUrl?: string | null;
  advisorSigUrl?: string | null;
  ieeePortalUrl?: string | null;
  bangaloreSectionUrl?: string | null;
}

const SocietiesPage: React.FC = () => {
  const { profile } = useAuth();

  const societiesQuery = useQuery<SocietyCardData[]>({
    queryKey: ['societies-page', profile?.role, profile?.societyId],
    queryFn: async () => {
      const response = await apiClient.get<unknown>('/societies');
      return normalizeCollection<SocietyCardData>(response.data);
    },
  });

  const societies = societiesQuery.data ?? [];

  const stats = useMemo(() => {
    const compliant = societies.filter((society) => isPresent(society.logoUrl) && isPresent(society.advisorSigUrl)).length;
    return {
      total: societies.length,
      compliant,
      actionRequired: Math.max(societies.length - compliant, 0),
    };
  }, [societies]);

  return (
    <div className="space-y-8 p-8 technical-grid min-h-screen">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-4xl font-display uppercase tracking-tighter text-white">Societies_Module</h1>
          <p className="mt-3 text-muted-foreground font-mono text-sm">
            Society registry, compliance visibility, and institutional links.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-right font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          <div>
            <p className="text-white text-lg font-display">{stats.total}</p>
            <p>Total</p>
          </div>
          <div>
            <p className="text-white text-lg font-display">{stats.compliant}</p>
            <p>Compliant</p>
          </div>
          <div>
            <p className="text-white text-lg font-display">{stats.actionRequired}</p>
            <p>Action</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 2xl:grid-cols-3">
        {societies.map((society) => {
          const compliant = isPresent(society.logoUrl) && isPresent(society.advisorSigUrl);

          return (
            <Card key={society.id} className="brutalist-surface rounded-none overflow-hidden">
              <CardHeader className="space-y-3 border-b border-white/10">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="font-display text-xl uppercase tracking-tighter text-white">{society.shortName}</CardTitle>
                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/60">{society.name}</p>
                  </div>
                  <Badge className={compliant ? 'rounded-none bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'rounded-none bg-amber-500/20 text-amber-300 border border-amber-500/30'}>
                    {compliant ? (
                      <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Compliant</span>
                    ) : (
                      <span className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Action Required</span>
                    )}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-white/60">
                  <span className="inline-flex items-center gap-1"><Building2 className="h-3 w-3" /> {society.societyKey}</span>
                  <span className="inline-flex items-center gap-1"><Landmark className="h-3 w-3" /> {society.type}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-5">
                <div className="grid grid-cols-2 gap-3 font-mono text-xs text-muted-foreground">
                  <div className="rounded-none border border-white/10 bg-white/5 p-3">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-white/50">Budget</p>
                    <p className="mt-2 text-white font-display text-lg">{formatCurrency(society.budget)}</p>
                  </div>
                  <div className="rounded-none border border-white/10 bg-white/5 p-3">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-white/50">Balance</p>
                    <p className="mt-2 text-white font-display text-lg">{formatCurrency(society.balance)}</p>
                  </div>
                </div>

                <div className="space-y-2 font-mono text-[11px] text-muted-foreground">
                  <p className="flex items-center justify-between gap-4"><span>Logo</span><span className={isPresent(society.logoUrl) ? 'text-emerald-300' : 'text-amber-300'}>{isPresent(society.logoUrl) ? 'Available' : 'Missing'}</span></p>
                  <p className="flex items-center justify-between gap-4"><span>Advisor Signature</span><span className={isPresent(society.advisorSigUrl) ? 'text-emerald-300' : 'text-amber-300'}>{isPresent(society.advisorSigUrl) ? 'Available' : 'Missing'}</span></p>
                  <p className="flex items-center justify-between gap-4"><span>IEEE Portal</span><span className="text-white/70">{isPresent(society.ieeePortalUrl) ? 'Linked' : 'Pending'}</span></p>
                </div>

                <div className="flex flex-wrap gap-2 pt-1 text-[10px] uppercase tracking-[0.25em]">
                  {isPresent(society.ieeePortalUrl) && (
                    <a href={society.ieeePortalUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 border border-white/10 px-3 py-2 text-white/80 hover:text-white hover:border-white/30 transition-colors">
                      <Globe2 className="h-3 w-3" /> Portal
                    </a>
                  )}
                  {isPresent(society.bangaloreSectionUrl) && (
                    <a href={society.bangaloreSectionUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 border border-white/10 px-3 py-2 text-white/80 hover:text-white hover:border-white/30 transition-colors">
                      <Globe2 className="h-3 w-3" /> Section
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SocietiesPage;