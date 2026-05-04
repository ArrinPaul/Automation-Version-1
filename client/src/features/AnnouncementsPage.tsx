import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Copy, Send, MessageSquareQuote, Users2, Clock3, AtSign, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNowStrict, parseISO } from 'date-fns';
import { normalizeCollection, normalizeRecord } from './phase4Helpers';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';

interface AnnouncementRecord {
  id: string; title: string; message: string;
  targetAudience: 'ALL' | 'LEADERSHIP' | 'SOCIETY';
  createdAt?: string;
  sender?: { name?: string; role?: string } | null;
}
interface RecipientResponse { announcementId: string; targetAudience: string; emails: string[]; count: number; }

const announcementSchema = z.object({
  title: z.string().min(1, 'Required').max(200),
  message: z.string().min(1, 'Required'),
  targetAudience: z.enum(['ALL', 'LEADERSHIP', 'SOCIETY']),
  societyId: z.string().optional(),
});
type AnnouncementFormValues = z.infer<typeof announcementSchema>;

const AnnouncementsPage: React.FC = () => {
  const { profile } = useAuth();
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState<string>('');
  const [subject, setSubject] = useState('IEEE Society Broadcast');
  const [body, setBody] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const canCreate = ['SB_FACULTY', 'SB_OB', 'SOCIETY_FACULTY', 'SOCIETY_CHAIR', 'SOCIETY_OB'].includes(profile?.role ?? '');

  const announcementsQuery = useQuery<AnnouncementRecord[]>({
    queryKey: ['announcements-page', profile?.role, profile?.societyId],
    queryFn: async () => {
      const res = await apiClient.get<unknown>('/announcements');
      return normalizeCollection<AnnouncementRecord>(res.data);
    },
  });

  const announcements = announcementsQuery.data ?? [];

  useEffect(() => {
    if (!selectedId && announcements.length > 0) setSelectedId(announcements[0].id);
  }, [announcements, selectedId]);

  const selected = useMemo(() => announcements.find(a => a.id === selectedId) ?? announcements[0] ?? null, [announcements, selectedId]);

  useEffect(() => {
    if (!selected) return;
    setSubject(selected.title);
    setBody(selected.message);
  }, [selected]);

  const recipientsQuery = useQuery<RecipientResponse | null>({
    queryKey: ['announcement-recipients', selected?.id],
    queryFn: async () => {
      if (!selected?.id) return null;
      const res = await apiClient.get<unknown>(`/announcements/${selected.id}/recipients`);
      return normalizeRecord<RecipientResponse>(res.data);
    },
    enabled: Boolean(selected?.id),
  });

  const bccList = useMemo(() => (recipientsQuery.data?.emails ?? []).join(','), [recipientsQuery.data]);

  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues: { targetAudience: 'ALL' },
  });

  const createMutation = useMutation({
    mutationFn: (data: AnnouncementFormValues) => apiClient.post('/announcements', {
      ...data,
      societyId: data.targetAudience === 'SOCIETY' && profile?.societyId ? profile.societyId : null,
    }),
    onSuccess: () => {
      toast.success('Announcement created.');
      qc.invalidateQueries({ queryKey: ['announcements-page'] });
      setShowCreate(false);
      form.reset();
    },
    onError: (err) => {
      const msg = axios.isAxiosError(err) ? (err.response?.data?.message ?? err.message) : 'Failed to create announcement';
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/announcements/${id}`),
    onSuccess: () => {
      toast.success('Announcement deleted.');
      qc.invalidateQueries({ queryKey: ['announcements-page'] });
      setDeleteId(null);
      if (selectedId === deleteId) setSelectedId('');
    },
    onError: () => toast.error('Failed to delete announcement.'),
  });

  const copyBcc = async () => {
    if (!bccList) { toast.error('No recipients resolved.'); return; }
    try { await navigator.clipboard.writeText(bccList); toast.success('BCC list copied.'); }
    catch { toast.error('Clipboard unavailable.'); }
  };

  const openComposer = () => {
    if (!bccList) { toast.error('No recipients resolved.'); return; }
    const params = new URLSearchParams();
    if (bccList) params.set('bcc', bccList);
    if (subject.trim()) params.set('subject', subject.trim());
    if (body.trim()) params.set('body', body.trim());
    window.location.href = `mailto:?${params.toString()}`;
  };

  return (
    <div className="space-y-8 p-8 technical-grid min-h-screen">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-4xl font-display uppercase tracking-tighter text-white">Announcements_Module</h1>
          <p className="mt-1 text-muted-foreground font-mono text-sm">Branch communication feed with recipient-aware broadcast actions.</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/60">{recipientsQuery.data?.count ?? 0} recipients</span>
          {canCreate && (
            <Button onClick={() => setShowCreate(true)} className="rounded-none font-mono text-xs uppercase tracking-[0.25em]">
              <Plus className="w-4 h-4 mr-2" /> New Announcement
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.9fr]">
        <Card className="brutalist-surface rounded-none">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="font-display text-sm uppercase tracking-[0.25em] text-white">Announcement_Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-5">
            {announcementsQuery.isLoading && (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 bg-white/5 animate-pulse border border-white/10" />)}
              </div>
            )}
            {announcements.map((a, index) => {
              const active = a.id === selected?.id;
              return (
                <article key={a.id} className={`relative cursor-pointer pl-6 transition-colors ${active ? 'opacity-100' : 'opacity-80 hover:opacity-100'}`} onClick={() => setSelectedId(a.id)}>
                  {index !== announcements.length - 1 && <div className="absolute left-[7px] top-4 h-full w-px bg-white/10" />}
                  <div className={`absolute left-0 top-1.5 h-3 w-3 rounded-full border ${active ? 'border-[#00629B] bg-[#00629B]' : 'border-white/30 bg-white/70'}`} />
                  <div className={`space-y-2 border p-4 ${active ? 'border-[#00629B]/60 bg-[#00629B]/10' : 'border-white/10 bg-white/5'}`}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h2 className="font-display text-lg uppercase tracking-tighter text-white">{a.title}</h2>
                      <div className="flex items-center gap-2">
                        <Badge className="rounded-none border border-white/10 bg-white/5 text-white/80">{a.targetAudience}</Badge>
                        {canCreate && (
                          <button onClick={e => { e.stopPropagation(); setDeleteId(a.id); }} className="text-red-400 hover:text-red-300 transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="font-mono text-sm leading-relaxed text-muted-foreground line-clamp-2">{a.message}</p>
                    <div className="flex flex-wrap items-center gap-4 font-mono text-[10px] uppercase tracking-[0.25em] text-white/50">
                      <span className="inline-flex items-center gap-1"><MessageSquareQuote className="h-3 w-3" /> {a.sender?.name ?? 'System'}</span>
                      <span className="inline-flex items-center gap-1"><AtSign className="h-3 w-3" /> {a.sender?.role ?? 'Broadcast'}</span>
                      {a.createdAt && <span className="inline-flex items-center gap-1"><Clock3 className="h-3 w-3" /> {formatDistanceToNowStrict(parseISO(a.createdAt), { addSuffix: true })}</span>}
                    </div>
                  </div>
                </article>
              );
            })}
            {!announcementsQuery.isLoading && !announcements.length && (
              <div className="border border-white/10 bg-white/5 p-6 text-center">
                <p className="font-display text-sm uppercase tracking-[0.25em] text-white">No Announcements</p>
                <p className="mt-2 font-mono text-xs text-muted-foreground">Broadcast messages will appear here once created.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="brutalist-surface rounded-none">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="font-display text-sm uppercase tracking-[0.25em] text-white">Mailto_Assembler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 pt-5">
            <div className="space-y-2">
              <label className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/60">Subject</label>
              <input value={subject} onChange={e => setSubject(e.target.value)} className="w-full rounded-none border border-white/10 bg-black/30 px-3 py-2 font-mono text-sm text-white outline-none focus:border-white/30" />
            </div>
            <div className="space-y-2">
              <label className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/60">Message Body</label>
              <textarea value={body} onChange={e => setBody(e.target.value)} className="min-h-[140px] w-full rounded-none border border-white/10 bg-black/30 px-3 py-2 font-mono text-sm text-white outline-none focus:border-white/30" />
            </div>
            <div className="rounded-none border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/50">Audience</p>
                  <p className="mt-1 font-display text-sm text-white">{selected?.targetAudience ?? 'UNSCOPED'}</p>
                </div>
                <Users2 className="h-4 w-4 text-white/70" />
              </div>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.25em] text-white/50">
                {recipientsQuery.isLoading ? 'Resolving...' : `${recipientsQuery.data?.count ?? 0} emails`}
              </p>
              <p className="mt-2 break-all font-mono text-[10px] leading-relaxed text-white/60 line-clamp-3">{bccList || 'No recipients available.'}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button type="button" variant="outline" className="rounded-none border-white/10 bg-transparent text-[10px] uppercase tracking-[0.25em] text-white hover:bg-white/5" onClick={copyBcc}>
                <Copy className="mr-2 h-3 w-3" /> Copy BCC
              </Button>
              <Button type="button" className="rounded-none border border-white bg-white text-black text-[10px] uppercase tracking-[0.25em] hover:bg-white/90" onClick={openComposer}>
                <Send className="mr-2 h-3 w-3" /> Open Mail
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Create_Announcement</DialogTitle></DialogHeader>
          <form onSubmit={form.handleSubmit(d => createMutation.mutate(d))} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-accent">Title</label>
              <input {...form.register('title')} className="w-full bg-white/5 border border-white/10 p-2.5 text-white font-mono text-sm focus:outline-none focus:border-primary" placeholder="Announcement title" />
              {form.formState.errors.title && <p className="text-destructive text-[10px] font-mono">{form.formState.errors.title.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-accent">Target Audience</label>
              <select {...form.register('targetAudience')} className="w-full bg-[#0A0A0C] border border-white/10 p-2.5 text-white font-mono text-sm focus:outline-none focus:border-primary">
                <option value="ALL" className="bg-black">ALL — Everyone</option>
                <option value="LEADERSHIP" className="bg-black">LEADERSHIP — Faculty & OBs</option>
                <option value="SOCIETY" className="bg-black">SOCIETY — Scoped to society</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-accent">Message</label>
              <textarea {...form.register('message')} rows={5} className="w-full bg-white/5 border border-white/10 p-2.5 text-white font-mono text-sm focus:outline-none focus:border-primary resize-none" placeholder="Announcement message..." />
              {form.formState.errors.message && <p className="text-destructive text-[10px] font-mono">{form.formState.errors.message.message}</p>}
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1 rounded-none" onClick={() => { setShowCreate(false); form.reset(); }}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending} className="flex-1 rounded-none">{createMutation.isPending ? 'Creating...' : 'Create Announcement'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Confirm_Delete</DialogTitle></DialogHeader>
          <p className="font-mono text-sm text-muted-foreground mb-6">This will permanently delete the announcement.</p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 rounded-none" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" className="flex-1 rounded-none" disabled={deleteMutation.isPending} onClick={() => deleteId && deleteMutation.mutate(deleteId)}>
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnnouncementsPage;
