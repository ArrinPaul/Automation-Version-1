import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Building2, CheckCircle2, AlertTriangle, Globe2, Landmark, Plus, Pencil } from 'lucide-react';
import { normalizeCollection, formatCurrency, isPresent } from './phase4Helpers';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import axios from 'axios';

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

const SOCIETY_TYPES = ['TECHNICAL_SOCIETY', 'AFFINITY_GROUP', 'COUNCIL'] as const;

const societySchema = z.object({
  societyKey: z.string().min(1, 'Required').max(50),
  name: z.string().min(1, 'Required').max(255),
  shortName: z.string().min(1, 'Required').max(50),
  type: z.enum(SOCIETY_TYPES),
  budget: z.string().min(1, 'Required').refine(v => !isNaN(parseFloat(v)) && parseFloat(v) >= 0, 'Must be non-negative'),
  logoUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  advisorSigUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  ieeePortalUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  bangaloreSectionUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
});
type SocietyFormValues = z.infer<typeof societySchema>;

const SocietiesPage: React.FC = () => {
  const { profile } = useAuth();
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editSociety, setEditSociety] = useState<SocietyCardData | null>(null);

  const societiesQuery = useQuery<SocietyCardData[]>({
    queryKey: ['societies-page', profile?.role, profile?.societyId],
    queryFn: async () => {
      const response = await apiClient.get<unknown>('/societies');
      return normalizeCollection<SocietyCardData>(response.data);
    },
  });

  const societies = societiesQuery.data ?? [];

  const stats = useMemo(() => {
    const compliant = societies.filter(s => isPresent(s.logoUrl) && isPresent(s.advisorSigUrl)).length;
    return { total: societies.length, compliant, actionRequired: Math.max(societies.length - compliant, 0) };
  }, [societies]);

  const form = useForm<SocietyFormValues>({
    resolver: zodResolver(societySchema),
    defaultValues: { type: 'TECHNICAL_SOCIETY', budget: '0' },
  });

  const editForm = useForm<SocietyFormValues>({ resolver: zodResolver(societySchema) });

  const createMutation = useMutation({
    mutationFn: (data: SocietyFormValues) => apiClient.post('/societies', { ...data, budget: parseFloat(data.budget), balance: parseFloat(data.budget) }),
    onSuccess: () => {
      toast.success('Society created.');
      qc.invalidateQueries({ queryKey: ['societies-page'] });
      qc.invalidateQueries({ queryKey: ['dashboard-societies'] });
      setShowCreate(false);
      form.reset();
    },
    onError: (err) => {
      const msg = axios.isAxiosError(err) ? (err.response?.data?.message ?? err.message) : 'Failed to create society';
      toast.error(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: SocietyFormValues }) =>
      apiClient.put(`/societies/${id}`, { ...data, budget: parseFloat(data.budget) }),
    onSuccess: () => {
      toast.success('Society updated.');
      qc.invalidateQueries({ queryKey: ['societies-page'] });
      qc.invalidateQueries({ queryKey: ['dashboard-societies'] });
      setEditSociety(null);
    },
    onError: (err) => {
      const msg = axios.isAxiosError(err) ? (err.response?.data?.message ?? err.message) : 'Failed to update society';
      toast.error(msg);
    },
  });

  const openEdit = (society: SocietyCardData) => {
    setEditSociety(society);
    editForm.reset({
      societyKey: society.societyKey,
      name: society.name,
      shortName: society.shortName,
      type: society.type as typeof SOCIETY_TYPES[number],
      budget: String(society.budget),
      logoUrl: society.logoUrl ?? '',
      advisorSigUrl: society.advisorSigUrl ?? '',
      ieeePortalUrl: society.ieeePortalUrl ?? '',
      bangaloreSectionUrl: society.bangaloreSectionUrl ?? '',
    });
  };

  const SocietyForm = ({ form: f, onSubmit, isPending, onCancel }: { form: ReturnType<typeof useForm<SocietyFormValues>>; onSubmit: (d: SocietyFormValues) => void; isPending: boolean; onCancel: () => void }) => (
    <form onSubmit={f.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-mono uppercase text-accent">Society Key</label>
          <input {...f.register('societyKey')} className="w-full bg-white/5 border border-white/10 p-2.5 text-white font-mono text-sm focus:outline-none focus:border-primary" placeholder="cs" />
          {f.formState.errors.societyKey && <p className="text-destructive text-[10px] font-mono">{f.formState.errors.societyKey.message}</p>}
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-mono uppercase text-accent">Short Name</label>
          <input {...f.register('shortName')} className="w-full bg-white/5 border border-white/10 p-2.5 text-white font-mono text-sm focus:outline-none focus:border-primary" placeholder="CS" />
          {f.formState.errors.shortName && <p className="text-destructive text-[10px] font-mono">{f.formState.errors.shortName.message}</p>}
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-[10px] font-mono uppercase text-accent">Full Name</label>
        <input {...f.register('name')} className="w-full bg-white/5 border border-white/10 p-2.5 text-white font-mono text-sm focus:outline-none focus:border-primary" placeholder="Computer Society" />
        {f.formState.errors.name && <p className="text-destructive text-[10px] font-mono">{f.formState.errors.name.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-mono uppercase text-accent">Type</label>
          <select {...f.register('type')} className="w-full bg-[#0A0A0C] border border-white/10 p-2.5 text-white font-mono text-sm focus:outline-none focus:border-primary">
            {SOCIETY_TYPES.map(t => <option key={t} value={t} className="bg-black">{t.replace(/_/g, ' ')}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-mono uppercase text-accent">Budget (₹)</label>
          <input {...f.register('budget')} className="w-full bg-white/5 border border-white/10 p-2.5 text-white font-mono text-sm focus:outline-none focus:border-primary" placeholder="50000" />
          {f.formState.errors.budget && <p className="text-destructive text-[10px] font-mono">{f.formState.errors.budget.message}</p>}
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-[10px] font-mono uppercase text-accent">Logo URL (optional)</label>
        <input {...f.register('logoUrl')} className="w-full bg-white/5 border border-white/10 p-2.5 text-white font-mono text-sm focus:outline-none focus:border-primary" placeholder="https://..." />
      </div>
      <div className="space-y-1">
        <label className="text-[10px] font-mono uppercase text-accent">Advisor Signature URL (optional)</label>
        <input {...f.register('advisorSigUrl')} className="w-full bg-white/5 border border-white/10 p-2.5 text-white font-mono text-sm focus:outline-none focus:border-primary" placeholder="https://..." />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-mono uppercase text-accent">IEEE Portal URL</label>
          <input {...f.register('ieeePortalUrl')} className="w-full bg-white/5 border border-white/10 p-2.5 text-white font-mono text-sm focus:outline-none focus:border-primary" placeholder="https://..." />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-mono uppercase text-accent">Bangalore Section URL</label>
          <input {...f.register('bangaloreSectionUrl')} className="w-full bg-white/5 border border-white/10 p-2.5 text-white font-mono text-sm focus:outline-none focus:border-primary" placeholder="https://..." />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" className="flex-1 rounded-none" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isPending} className="flex-1 rounded-none">{isPending ? 'Saving...' : 'Save Society'}</Button>
      </div>
    </form>
  );

  return (
    <div className="space-y-8 p-8 technical-grid min-h-screen">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-4xl font-display uppercase tracking-tighter text-white">Societies_Module</h1>
          <p className="mt-1 text-muted-foreground font-mono text-sm">Society registry, compliance visibility, and institutional links.</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="grid grid-cols-3 gap-4 text-right font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            <div><p className="text-white text-lg font-display">{stats.total}</p><p>Total</p></div>
            <div><p className="text-emerald-300 text-lg font-display">{stats.compliant}</p><p>Compliant</p></div>
            <div><p className="text-amber-300 text-lg font-display">{stats.actionRequired}</p><p>Action</p></div>
          </div>
          {(profile?.role === 'SB_FACULTY' || profile?.role === 'SB_OB') && (
            <Button onClick={() => setShowCreate(true)} className="rounded-none font-mono text-xs uppercase tracking-[0.25em] shrink-0">
              <Plus className="w-4 h-4 mr-2" /> New Society
            </Button>
          )}
        </div>
      </div>

      {societiesQuery.isLoading && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 2xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-64 bg-white/5 border border-white/10 animate-pulse" />)}
        </div>
      )}

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
                  <div className="flex items-center gap-2">
                    <Badge className={compliant ? 'rounded-none bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'rounded-none bg-amber-500/20 text-amber-300 border border-amber-500/30'}>
                      {compliant ? <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Compliant</span> : <span className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Action</span>}
                    </Badge>
                    {(profile?.role === 'SB_FACULTY' || profile?.role === 'SB_OB' || profile?.role === 'SOCIETY_FACULTY') && (
                      <button onClick={() => openEdit(society)} className="text-muted-foreground hover:text-white transition-colors p-1">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-white/60">
                  <span className="inline-flex items-center gap-1"><Building2 className="h-3 w-3" /> {society.societyKey}</span>
                  <span className="inline-flex items-center gap-1"><Landmark className="h-3 w-3" /> {society.type.replace(/_/g, ' ')}</span>
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

      {!societiesQuery.isLoading && societies.length === 0 && (
        <Card className="brutalist-surface rounded-none">
          <CardContent className="py-12 text-center">
            <Building2 className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="font-display text-lg uppercase tracking-[0.25em] text-white">No Societies Found</p>
            <p className="mt-2 font-mono text-sm text-muted-foreground">Create your first society to get started.</p>
            {(profile?.role === 'SB_FACULTY' || profile?.role === 'SB_OB') && (
              <Button onClick={() => setShowCreate(true)} className="mt-4 rounded-none font-mono text-xs uppercase tracking-[0.25em]">
                <Plus className="w-4 h-4 mr-2" /> Create Society
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Create_New_Society</DialogTitle></DialogHeader>
          <SocietyForm form={form} onSubmit={d => createMutation.mutate(d)} isPending={createMutation.isPending} onCancel={() => { setShowCreate(false); form.reset(); }} />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editSociety} onOpenChange={() => setEditSociety(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit_Society — {editSociety?.shortName}</DialogTitle></DialogHeader>
          <SocietyForm form={editForm} onSubmit={d => editSociety && updateMutation.mutate({ id: editSociety.id, data: d })} isPending={updateMutation.isPending} onCancel={() => setEditSociety(null)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SocietiesPage;
