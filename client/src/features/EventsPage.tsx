import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jsPDF } from 'jspdf';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Download, MapPin, Users, Plus, Trash2, Search } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import apiClient from '@/services/apiClient';
import { normalizeCollection } from './phase4Helpers';
import { useAuth } from '@/context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import { motion } from 'framer-motion';

interface EventSpeaker { id: string; name: string; designation?: string | null; organization?: string | null; presentationTitle?: string | null; }
interface EventRecord {
  id: string; title: string; date: string; time?: string | null; venue?: string | null; type: string;
  participants: number; description: string; outcome?: string | null; highlights?: string | null;
  society?: { name?: string; shortName?: string } | null;
  speakers?: EventSpeaker[]; imageUrls?: string[];
}
interface SocietyOption { id: string; name: string; shortName: string; }

const eventSchema = z.object({
  title: z.string().min(1, 'Required'),
  type: z.string().min(1, 'Required'),
  date: z.string().min(1, 'Required'),
  time: z.string().optional(),
  venue: z.string().optional(),
  participants: z.string().min(1, 'Required').refine(v => !isNaN(parseInt(v)) && parseInt(v) >= 0, 'Must be a number'),
  description: z.string().min(1, 'Required'),
  outcome: z.string().optional(),
  societyId: z.string().uuid('Select a society'),
});
type EventFormValues = z.infer<typeof eventSchema>;

const EVENT_TYPES = ['Workshop', 'Seminar', 'Conference', 'Hackathon', 'Webinar', 'Competition', 'Social', 'Technical Talk', 'Field Visit', 'Other'];

const safeText = (v: string | null | undefined) => v ?? 'N/A';

const generateEventPdf = async (event: EventRecord) => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
  doc.text('IEEE Student Branch Christ University', 14, 14);
  doc.setFontSize(11); doc.text('Professional Event Report', 14, 20);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toISOString()}`, 14, 26);
  doc.text(`Society: ${event.society?.shortName ?? 'N/A'}`, 14, 32);
  doc.setDrawColor(120, 120, 120); doc.line(14, 35, 196, 35);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.text('Event Overview', 14, 42);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
  doc.text(`Title: ${event.title}`, 14, 48);
  doc.text(`Type: ${event.type}`, 14, 54);
  doc.text(`Date: ${format(new Date(event.date), 'dd MMM yyyy')}`, 14, 60);
  doc.text(`Time: ${safeText(event.time)}`, 100, 60);
  doc.text(`Venue: ${safeText(event.venue)}`, 14, 66);
  doc.text(`Participants: ${event.participants}`, 100, 66);
  const descLines = doc.splitTextToSize(`Description: ${event.description}`, 182);
  doc.text(descLines, 14, 72);
  let y = 72 + descLines.length * 5 + 4;
  if (event.outcome) { const lines = doc.splitTextToSize(`Outcome: ${event.outcome}`, 182); doc.text(lines, 14, y); y += lines.length * 5 + 4; }
  doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.text('Speakers', 14, y + 4); y += 10;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
  (event.speakers ?? []).forEach(s => { doc.text(`• ${s.name} — ${safeText(s.designation)}, ${safeText(s.organization)}`, 14, y); y += 6; });
  if (!(event.speakers ?? []).length) { doc.text('No speakers recorded.', 14, y); }
  const fileDate = new Date(event.date).toISOString().slice(0, 10);
  doc.save(`event-${event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${fileDate}.pdf`);
};

const EventsPage: React.FC = () => {
  const { profile } = useAuth();
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const canCreate = ['SB_FACULTY', 'SB_OB', 'SOCIETY_FACULTY', 'SOCIETY_CHAIR', 'SOCIETY_OB'].includes(profile?.role ?? '');

  const eventsQuery = useQuery<EventRecord[]>({
    queryKey: ['events-page'],
    queryFn: async () => {
      const res = await apiClient.get<unknown>('/events');
      return normalizeCollection<EventRecord>(res.data);
    },
  });

  const societiesQuery = useQuery<SocietyOption[]>({
    queryKey: ['societies-for-events'],
    queryFn: async () => {
      const res = await apiClient.get<unknown>('/societies');
      return normalizeCollection<SocietyOption>(res.data);
    },
    enabled: canCreate,
  });

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: { date: new Date().toISOString().slice(0, 10), participants: '0' },
  });

  const createMutation = useMutation({
    mutationFn: (data: EventFormValues) => apiClient.post('/events', {
      ...data,
      participants: parseInt(data.participants),
      date: new Date(data.date).toISOString(),
    }),
    onSuccess: () => {
      toast.success('Event created.');
      qc.invalidateQueries({ queryKey: ['events-page'] });
      setShowCreate(false);
      form.reset();
    },
    onError: (err) => {
      const msg = axios.isAxiosError(err) ? (err.response?.data?.message ?? err.message) : 'Failed to create event';
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/events/${id}`),
    onSuccess: () => {
      toast.success('Event deleted.');
      qc.invalidateQueries({ queryKey: ['events-page'] });
      setDeleteId(null);
    },
    onError: () => toast.error('Failed to delete event.'),
  });

  const events = eventsQuery.data ?? [];
  const filtered = events.filter(e => !search || e.title.toLowerCase().includes(search.toLowerCase()) || e.type.toLowerCase().includes(search.toLowerCase()) || (e.society?.shortName ?? '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 p-8 technical-grid min-h-screen">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-display uppercase tracking-tighter text-white">Events_Module</h1>
          <p className="mt-1 text-muted-foreground font-mono text-sm">Event registry with PDF report generation.</p>
        </div>
        {canCreate && (
          <Button onClick={() => setShowCreate(true)} className="rounded-none font-mono text-xs uppercase tracking-[0.25em]">
            <Plus className="w-4 h-4 mr-2" /> New Event
          </Button>
        )}
      </motion.div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events..." className="w-full bg-white/5 border border-white/10 pl-8 pr-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-white/30" />
        </div>
        <span className="font-mono text-[10px] text-muted-foreground uppercase">{filtered.length} events</span>
      </div>

      {eventsQuery.isLoading && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-48 bg-white/5 border border-white/10 animate-pulse" />)}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {filtered.map((event, i) => (
          <motion.div key={event.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="brutalist-surface rounded-none overflow-hidden group">
              <CardHeader className="border-b border-white/10 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="font-display text-lg uppercase tracking-tighter text-white">{event.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className="rounded-none border border-white/20 bg-white/5 text-white/80">{event.type}</Badge>
                    {canCreate && (
                      <button onClick={() => setDeleteId(event.id)} className="text-red-400 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 font-mono text-[10px] uppercase tracking-[0.25em] text-white/60">
                  <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {format(new Date(event.date), 'dd MMM yyyy')}</span>
                  {event.venue && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {event.venue}</span>}
                  <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {event.participants} participants</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-5">
                <p className="font-mono text-sm leading-relaxed text-muted-foreground line-clamp-3">{event.description}</p>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-white/70">
                    {(event.speakers ?? []).length} speakers • {event.society?.shortName ?? 'N/A'}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    className="rounded-none border border-white bg-white text-black text-[10px] uppercase tracking-[0.25em] hover:bg-white/90"
                    onClick={() => {
                      void generateEventPdf(event).then(() => toast.success('PDF generated.')).catch(() => toast.error('PDF generation failed.'));
                    }}
                  >
                    <Download className="mr-1.5 h-3 w-3" /> Export PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {!eventsQuery.isLoading && filtered.length === 0 && (
        <Card className="brutalist-surface rounded-none">
          <CardContent className="py-12 text-center">
            <Calendar className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="font-display text-lg uppercase tracking-[0.25em] text-white">{events.length === 0 ? 'No Events Found' : 'No Events Match Search'}</p>
            <p className="mt-2 font-mono text-sm text-muted-foreground">
              {events.length === 0 ? 'Create your first event to get started.' : 'Try a different search term.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Create_New_Event</DialogTitle></DialogHeader>
          <form onSubmit={form.handleSubmit(d => createMutation.mutate(d))} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-accent">Event Title</label>
              <input {...form.register('title')} className="w-full bg-white/5 border border-white/10 p-2.5 text-white font-mono text-sm focus:outline-none focus:border-primary" placeholder="Annual Technical Symposium" />
              {form.formState.errors.title && <p className="text-destructive text-[10px] font-mono">{form.formState.errors.title.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-accent">Type</label>
                <select {...form.register('type')} className="w-full bg-[#0A0A0C] border border-white/10 p-2.5 text-white font-mono text-sm focus:outline-none focus:border-primary">
                  <option value="">Select type</option>
                  {EVENT_TYPES.map(t => <option key={t} value={t} className="bg-black">{t}</option>)}
                </select>
                {form.formState.errors.type && <p className="text-destructive text-[10px] font-mono">{form.formState.errors.type.message}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-accent">Society</label>
                <select {...form.register('societyId')} className="w-full bg-[#0A0A0C] border border-white/10 p-2.5 text-white font-mono text-sm focus:outline-none focus:border-primary">
                  <option value="">Select society</option>
                  {societiesQuery.data?.map(s => <option key={s.id} value={s.id} className="bg-black">{s.shortName} — {s.name}</option>)}
                </select>
                {form.formState.errors.societyId && <p className="text-destructive text-[10px] font-mono">{form.formState.errors.societyId.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-accent">Date</label>
                <input {...form.register('date')} type="date" className="w-full bg-[#0A0A0C] border border-white/10 p-2.5 text-white font-mono text-sm focus:outline-none focus:border-primary" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-accent">Time</label>
                <input {...form.register('time')} className="w-full bg-white/5 border border-white/10 p-2.5 text-white font-mono text-sm focus:outline-none focus:border-primary" placeholder="10:00 AM" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-accent">Participants</label>
                <input {...form.register('participants')} type="number" min="0" className="w-full bg-white/5 border border-white/10 p-2.5 text-white font-mono text-sm focus:outline-none focus:border-primary" placeholder="0" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-accent">Venue</label>
              <input {...form.register('venue')} className="w-full bg-white/5 border border-white/10 p-2.5 text-white font-mono text-sm focus:outline-none focus:border-primary" placeholder="Main Auditorium" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-accent">Description</label>
              <textarea {...form.register('description')} rows={3} className="w-full bg-white/5 border border-white/10 p-2.5 text-white font-mono text-sm focus:outline-none focus:border-primary resize-none" placeholder="Event description..." />
              {form.formState.errors.description && <p className="text-destructive text-[10px] font-mono">{form.formState.errors.description.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-accent">Outcome (optional)</label>
              <textarea {...form.register('outcome')} rows={2} className="w-full bg-white/5 border border-white/10 p-2.5 text-white font-mono text-sm focus:outline-none focus:border-primary resize-none" placeholder="Key outcomes and takeaways..." />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1 rounded-none" onClick={() => { setShowCreate(false); form.reset(); }}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending} className="flex-1 rounded-none">{createMutation.isPending ? 'Creating...' : 'Create Event'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Confirm_Delete_Event</DialogTitle></DialogHeader>
          <p className="font-mono text-sm text-muted-foreground mb-6">This will permanently delete the event and all associated speaker records.</p>
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

export default EventsPage;
