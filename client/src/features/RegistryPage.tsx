import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users, UserCheck, Phone, Mail, GraduationCap, Plus, Trash2, Search } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import apiClient from '@/services/apiClient';
import { normalizeCollection } from './phase4Helpers';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import axios from 'axios';

interface MemberRecord { id: string; ieeeId?: string | null; name: string; email: string; contactNumber?: string | null; grade?: string | null; society?: { name?: string; shortName?: string } | null; }
interface OfficeBearerRecord { id: string; name: string; position: string; email: string; phone?: string | null; society?: { name?: string; shortName?: string } | null; }
interface SocietyOption { id: string; name: string; shortName: string; }

type Tab = 'members' | 'officers';

const memberSchema = z.object({
  name: z.string().min(1, 'Required'),
  email: z.string().email('Valid email required'),
  ieeeId: z.string().optional(),
  contactNumber: z.string().optional(),
  grade: z.string().optional(),
  societyId: z.string().uuid('Select a society'),
});

const officerSchema = z.object({
  name: z.string().min(1, 'Required'),
  position: z.string().min(1, 'Required'),
  email: z.string().email('Valid email required'),
  phone: z.string().optional(),
  societyId: z.string().uuid('Select a society'),
});

type MemberFormValues = z.infer<typeof memberSchema>;
type OfficerFormValues = z.infer<typeof officerSchema>;

const RegistryPage: React.FC = () => {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>('members');
  const [showCreate, setShowCreate] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const membersQuery = useQuery<MemberRecord[]>({
    queryKey: ['registry-members'],
    queryFn: async () => {
      const res = await apiClient.get<unknown>('/members');
      return normalizeCollection<MemberRecord>(res.data);
    },
  });

  const officersQuery = useQuery<OfficeBearerRecord[]>({
    queryKey: ['registry-officers'],
    queryFn: async () => {
      const res = await apiClient.get<unknown>('/office-bearers');
      return normalizeCollection<OfficeBearerRecord>(res.data);
    },
  });

  const societiesQuery = useQuery<SocietyOption[]>({
    queryKey: ['registry-societies'],
    queryFn: async () => {
      const res = await apiClient.get<unknown>('/societies');
      return normalizeCollection<SocietyOption>(res.data);
    },
  });

  const memberForm = useForm<MemberFormValues>({ resolver: zodResolver(memberSchema) });
  const officerForm = useForm<OfficerFormValues>({ resolver: zodResolver(officerSchema) });

  const createMemberMutation = useMutation({
    mutationFn: (data: MemberFormValues) => apiClient.post('/members', data),
    onSuccess: () => {
      toast.success('Member added.');
      qc.invalidateQueries({ queryKey: ['registry-members'] });
      setShowCreate(false);
      memberForm.reset();
    },
    onError: (err) => {
      const msg = axios.isAxiosError(err) ? (err.response?.data?.message ?? err.message) : 'Failed to add member';
      toast.error(msg);
    },
  });

  const createOfficerMutation = useMutation({
    mutationFn: (data: OfficerFormValues) => apiClient.post('/office-bearers', data),
    onSuccess: () => {
      toast.success('Office bearer added.');
      qc.invalidateQueries({ queryKey: ['registry-officers'] });
      setShowCreate(false);
      officerForm.reset();
    },
    onError: (err) => {
      const msg = axios.isAxiosError(err) ? (err.response?.data?.message ?? err.message) : 'Failed to add office bearer';
      toast.error(msg);
    },
  });

  const deleteMemberMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/members/${id}`),
    onSuccess: () => { toast.success('Member removed.'); qc.invalidateQueries({ queryKey: ['registry-members'] }); setDeleteId(null); },
    onError: () => toast.error('Failed to remove member.'),
  });

  const deleteOfficerMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/office-bearers/${id}`),
    onSuccess: () => { toast.success('Office bearer removed.'); qc.invalidateQueries({ queryKey: ['registry-officers'] }); setDeleteId(null); },
    onError: () => toast.error('Failed to remove office bearer.'),
  });

  const members = membersQuery.data ?? [];
  const officers = officersQuery.data ?? [];
  const societies = societiesQuery.data ?? [];
  const isLoading = activeTab === 'members' ? membersQuery.isLoading : officersQuery.isLoading;

  const filteredMembers = members.filter(m => !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase()) || (m.ieeeId ?? '').toLowerCase().includes(search.toLowerCase()));
  const filteredOfficers = officers.filter(o => !search || o.name.toLowerCase().includes(search.toLowerCase()) || o.position.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = () => {
    if (!deleteId) return;
    if (activeTab === 'members') deleteMemberMutation.mutate(deleteId);
    else deleteOfficerMutation.mutate(deleteId);
  };

  return (
    <div className="space-y-8 p-8 technical-grid min-h-screen">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-display uppercase tracking-tighter text-white">Registry_Module</h1>
          <p className="mt-1 text-muted-foreground font-mono text-sm">Member and office-bearer directory across all societies.</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="rounded-none font-mono text-xs uppercase tracking-[0.25em]">
          <Plus className="w-4 h-4 mr-2" /> Add {activeTab === 'members' ? 'Member' : 'Office Bearer'}
        </Button>
      </motion.div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-0 border border-white/10">
          <Button type="button" onClick={() => { setActiveTab('members'); setSearch(''); }} className={`flex-1 h-10 rounded-none font-mono text-xs uppercase tracking-[0.25em] border-none ${activeTab === 'members' ? 'bg-white text-black' : 'bg-transparent text-muted-foreground hover:text-white hover:bg-white/5'}`}>
            <Users className="w-3 h-3 mr-2" /> Members ({members.length})
          </Button>
          <Button type="button" onClick={() => { setActiveTab('officers'); setSearch(''); }} className={`flex-1 h-10 rounded-none font-mono text-xs uppercase tracking-[0.25em] border-none ${activeTab === 'officers' ? 'bg-white text-black' : 'bg-transparent text-muted-foreground hover:text-white hover:bg-white/5'}`}>
            <UserCheck className="w-3 h-3 mr-2" /> Office Bearers ({officers.length})
          </Button>
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${activeTab}...`} className="w-full bg-white/5 border border-white/10 pl-8 pr-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-white/30" />
        </div>
      </div>

      {activeTab === 'members' && (
        <Card className="bg-black/40 border-white/10 rounded-none overflow-hidden">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="font-mono text-xs uppercase tracking-[0.25em] text-accent">Member_Directory</CardTitle>
          </CardHeader>
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="font-mono text-[10px] uppercase text-accent">Name</TableHead>
                <TableHead className="font-mono text-[10px] uppercase text-accent">IEEE ID</TableHead>
                <TableHead className="font-mono text-[10px] uppercase text-accent">Email</TableHead>
                <TableHead className="font-mono text-[10px] uppercase text-accent">Grade</TableHead>
                <TableHead className="font-mono text-[10px] uppercase text-accent">Society</TableHead>
                <TableHead className="font-mono text-[10px] uppercase text-accent">Contact</TableHead>
                <TableHead className="font-mono text-[10px] uppercase text-accent text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i} className="border-white/5">
                    {Array.from({ length: 7 }).map((_, j) => <TableCell key={j}><div className="h-4 bg-white/5 animate-pulse rounded" /></TableCell>)}
                  </TableRow>
                ))
              ) : filteredMembers.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center font-mono py-8 text-muted-foreground">{members.length === 0 ? 'No members found.' : 'No members match search.'}</TableCell></TableRow>
              ) : filteredMembers.map((m, i) => (
                <motion.tr key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-white/5 hover:bg-white/5 transition-colors group">
                  <TableCell className="font-mono text-sm text-white">{m.name}</TableCell>
                  <TableCell className="font-mono text-[10px] text-accent">{m.ieeeId ?? <span className="text-muted-foreground">—</span>}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground"><span className="inline-flex items-center gap-1"><Mail className="w-3 h-3" />{m.email}</span></TableCell>
                  <TableCell>{m.grade ? <Badge variant="outline" className="rounded-none border-white/20 text-[10px] text-muted-foreground"><GraduationCap className="w-3 h-3 mr-1" />{m.grade}</Badge> : <span className="text-muted-foreground font-mono text-[10px]">—</span>}</TableCell>
                  <TableCell className="font-mono text-xs text-white/70">{m.society?.shortName ?? '—'}</TableCell>
                  <TableCell className="font-mono text-[10px] text-muted-foreground">{m.contactNumber ? <span className="inline-flex items-center gap-1"><Phone className="w-3 h-3" />{m.contactNumber}</span> : '—'}</TableCell>
                  <TableCell className="text-right">
                    <button onClick={() => setDeleteId(m.id)} className="text-red-400 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-3.5 h-3.5" /></button>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {activeTab === 'officers' && (
        <Card className="bg-black/40 border-white/10 rounded-none overflow-hidden">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="font-mono text-xs uppercase tracking-[0.25em] text-accent">Office_Bearers_Directory</CardTitle>
          </CardHeader>
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="font-mono text-[10px] uppercase text-accent">Name</TableHead>
                <TableHead className="font-mono text-[10px] uppercase text-accent">Position</TableHead>
                <TableHead className="font-mono text-[10px] uppercase text-accent">Society</TableHead>
                <TableHead className="font-mono text-[10px] uppercase text-accent">Email</TableHead>
                <TableHead className="font-mono text-[10px] uppercase text-accent">Phone</TableHead>
                <TableHead className="font-mono text-[10px] uppercase text-accent text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i} className="border-white/5">
                    {Array.from({ length: 6 }).map((_, j) => <TableCell key={j}><div className="h-4 bg-white/5 animate-pulse rounded" /></TableCell>)}
                  </TableRow>
                ))
              ) : filteredOfficers.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center font-mono py-8 text-muted-foreground">{officers.length === 0 ? 'No office bearers found.' : 'No office bearers match search.'}</TableCell></TableRow>
              ) : filteredOfficers.map((o, i) => (
                <motion.tr key={o.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} className="border-white/5 hover:bg-white/5 transition-colors group">
                  <TableCell className="font-mono text-sm text-white">{o.name}</TableCell>
                  <TableCell><Badge className="rounded-none bg-primary/20 text-primary border-primary/30 border text-[10px]">{o.position}</Badge></TableCell>
                  <TableCell className="font-mono text-xs text-white/70">{o.society?.shortName ?? '—'}</TableCell>
                  <TableCell className="font-mono text-[10px] text-muted-foreground"><span className="inline-flex items-center gap-1"><Mail className="w-3 h-3" />{o.email}</span></TableCell>
                  <TableCell className="font-mono text-[10px] text-muted-foreground">{o.phone ? <span className="inline-flex items-center gap-1"><Phone className="w-3 h-3" />{o.phone}</span> : '—'}</TableCell>
                  <TableCell className="text-right">
                    <button onClick={() => setDeleteId(o.id)} className="text-red-400 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-3.5 h-3.5" /></button>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Create Member Dialog */}
      <Dialog open={showCreate && activeTab === 'members'} onOpenChange={v => !v && setShowCreate(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add_Member</DialogTitle></DialogHeader>
          <form onSubmit={memberForm.handleSubmit(d => createMemberMutation.mutate(d))} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-accent">Full Name</label>
                <input {...memberForm.register('name')} className="w-full bg-white/5 border border-white/10 p-2.5 text-white font-mono text-sm focus:outline-none focus:border-primary" placeholder="John Doe" />
                {memberForm.formState.errors.name && <p className="text-destructive text-[10px] font-mono">{memberForm.formState.errors.name.message}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-accent">Email</label>
                <input {...memberForm.register('email')} type="email" className="w-full bg-white/5 border border-white/10 p-2.5 text-white font-mono text-sm focus:outline-none focus:border-primary" placeholder="member@ieee.org" />
                {memberForm.formState.errors.email && <p className="text-destructive text-[10px] font-mono">{memberForm.formState.errors.email.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-accent">IEEE ID</label>
                <input {...memberForm.register('ieeeId')} className="w-full bg-white/5 border border-white/10 p-2.5 text-white font-mono text-sm focus:outline-none focus:border-primary" placeholder="12345678" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-accent">Grade</label>
                <input {...memberForm.register('grade')} className="w-full bg-white/5 border border-white/10 p-2.5 text-white font-mono text-sm focus:outline-none focus:border-primary" placeholder="Student" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-accent">Contact</label>
                <input {...memberForm.register('contactNumber')} className="w-full bg-white/5 border border-white/10 p-2.5 text-white font-mono text-sm focus:outline-none focus:border-primary" placeholder="+91..." />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-accent">Society</label>
              <select {...memberForm.register('societyId')} className="w-full bg-[#0A0A0C] border border-white/10 p-2.5 text-white font-mono text-sm focus:outline-none focus:border-primary">
                <option value="">Select society</option>
                {societies.map(s => <option key={s.id} value={s.id} className="bg-black">{s.shortName} — {s.name}</option>)}
              </select>
              {memberForm.formState.errors.societyId && <p className="text-destructive text-[10px] font-mono">{memberForm.formState.errors.societyId.message}</p>}
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1 rounded-none" onClick={() => { setShowCreate(false); memberForm.reset(); }}>Cancel</Button>
              <Button type="submit" disabled={createMemberMutation.isPending} className="flex-1 rounded-none">{createMemberMutation.isPending ? 'Adding...' : 'Add Member'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Officer Dialog */}
      <Dialog open={showCreate && activeTab === 'officers'} onOpenChange={v => !v && setShowCreate(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add_Office_Bearer</DialogTitle></DialogHeader>
          <form onSubmit={officerForm.handleSubmit(d => createOfficerMutation.mutate(d))} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-accent">Full Name</label>
                <input {...officerForm.register('name')} className="w-full bg-white/5 border border-white/10 p-2.5 text-white font-mono text-sm focus:outline-none focus:border-primary" placeholder="Jane Doe" />
                {officerForm.formState.errors.name && <p className="text-destructive text-[10px] font-mono">{officerForm.formState.errors.name.message}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-accent">Position</label>
                <input {...officerForm.register('position')} className="w-full bg-white/5 border border-white/10 p-2.5 text-white font-mono text-sm focus:outline-none focus:border-primary" placeholder="Chairperson" />
                {officerForm.formState.errors.position && <p className="text-destructive text-[10px] font-mono">{officerForm.formState.errors.position.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-accent">Email</label>
                <input {...officerForm.register('email')} type="email" className="w-full bg-white/5 border border-white/10 p-2.5 text-white font-mono text-sm focus:outline-none focus:border-primary" placeholder="officer@ieee.org" />
                {officerForm.formState.errors.email && <p className="text-destructive text-[10px] font-mono">{officerForm.formState.errors.email.message}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-accent">Phone</label>
                <input {...officerForm.register('phone')} className="w-full bg-white/5 border border-white/10 p-2.5 text-white font-mono text-sm focus:outline-none focus:border-primary" placeholder="+91..." />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-accent">Society</label>
              <select {...officerForm.register('societyId')} className="w-full bg-[#0A0A0C] border border-white/10 p-2.5 text-white font-mono text-sm focus:outline-none focus:border-primary">
                <option value="">Select society</option>
                {societies.map(s => <option key={s.id} value={s.id} className="bg-black">{s.shortName} — {s.name}</option>)}
              </select>
              {officerForm.formState.errors.societyId && <p className="text-destructive text-[10px] font-mono">{officerForm.formState.errors.societyId.message}</p>}
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1 rounded-none" onClick={() => { setShowCreate(false); officerForm.reset(); }}>Cancel</Button>
              <Button type="submit" disabled={createOfficerMutation.isPending} className="flex-1 rounded-none">{createOfficerMutation.isPending ? 'Adding...' : 'Add Office Bearer'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Confirm_Remove</DialogTitle></DialogHeader>
          <p className="font-mono text-sm text-muted-foreground mb-6">This will permanently remove the record from the registry.</p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 rounded-none" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" className="flex-1 rounded-none" disabled={deleteMemberMutation.isPending || deleteOfficerMutation.isPending} onClick={handleDelete}>
              {(deleteMemberMutation.isPending || deleteOfficerMutation.isPending) ? 'Removing...' : 'Remove'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RegistryPage;
