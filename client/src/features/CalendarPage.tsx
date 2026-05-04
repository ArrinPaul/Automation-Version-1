import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format, isSameMonth, parseISO, startOfMonth, startOfWeek, endOfMonth, endOfWeek, eachDayOfInterval, isToday } from 'date-fns';
import { CalendarDays, Clock3, MapPin, Plus, Trash2 } from 'lucide-react';
import { normalizeCollection } from './phase4Helpers';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import axios from 'axios';

type CalendarStatus = 'PROPOSED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
interface CalendarEventRecord { id: string; title: string; date: string; time?: string | null; venue?: string | null; description?: string | null; status: CalendarStatus; }
interface SocietyOption { id: string; name: string; shortName: string; }

const statusStyles: Record<CalendarStatus, string> = {
  PROPOSED: 'border-amber-500/30 bg-amber-500/15 text-amber-300',
  CONFIRMED: 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300',
  COMPLETED: 'border-sky-500/30 bg-sky-500/15 text-sky-300',
  CANCELLED: 'border-red-500/30 bg-red-500/15 text-red-300',
};

const STATUSES = ['PROPOSED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const;

const calendarSchema = z.object({
  title: z.string().min(1, 'Required'),
  date: z.string().min(1, 'Required'),
  time: z.string().optional(),
  venue: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(STATUSES),
  societyId: z.string().uuid('Select a society'),
});
type CalendarFormValues = z.infer<typeof calendarSchema>;

const CalendarPage: React.FC = () => {
  const { profile } = useAuth();
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const canCreate = ['SB_FACULTY', 'SB_OB', 'SOCIETY_FACULTY', 'SOCIETY_CHAIR', 'SOCIETY_OB'].includes(profile?.role ?? '');

  const calendarQuery = useQuery<CalendarEventRecord[]>({
    queryKey: ['calendar-page', profile?.role, profile?.societyId],
    queryFn: async () => {
      const res = await apiClient.get<unknown>('/calendar-events');
      return normalizeCollection<CalendarEventRecord>(res.data);
    },
  });

  const societiesQuery = useQuery<SocietyOption[]>({
    queryKey: ['societies-for-calendar'],
    queryFn: async () => {
      const res = await apiClient.get<unknown>('/societies');
      return normalizeCollection<SocietyOption>(res.data);
    },
    enabled: canCreate,
  });

  const form = useForm<CalendarFormValues>({
    resolver: zodResolver(calendarSchema),
    defaultValues: { status: 'PROPOSED', date: new Date().toISOString().slice(0, 10) },
  });

  const createMutation = useMutation({
    mutationFn: (data: CalendarFormValues) => apiClient.post('/calendar-events', {
      ...data,
      date: new Date(data.date).toISOString(),
    }),
    onSuccess: () => {
      toast.success('Calendar event created.');
      qc.invalidateQueries({ queryKey: ['calendar-page'] });
      setShowCreate(false);
      form.reset();
    },
    onError: (err) => {
      const msg = axios.isAxiosError(err) ? (err.response?.data?.message ?? err.message) : 'Failed to create event';
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/calendar-events/${id}`),
    onSuccess: () => {
      toast.success('Event removed.');
      qc.invalidateQueries({ queryKey: ['calendar-page'] });
      setDeleteId(null);
    },
    onError: () => toast.error('Failed to remove event.'),
  });

  const events = calendarQuery.data ?? [];
  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = useMemo(() => eachDayOfInterval({ start: calendarStart, end: calendarEnd }), [calendarStart, calendarEnd]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEventRecord[]>();
    events.forEach(e => {
      const key = format(parseISO(e.date), 'yyyy-MM-dd');
      map.set(key, [...(map.get(key) ?? []), e]);
    });
    return map;
  }, [events]);

  const upcomingEvents = useMemo(() => {
    const today = new Date();
    return events.filter(e => parseISO(e.date) >= today).sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime()).slice(0, 6);
  }, [events]);

  const statusCounts = events.reduce<Record<CalendarStatus, number>>((acc, e) => { acc[e.status] += 1; return acc; }, { PROPOSED: 0, CONFIRMED: 0, COMPLETED: 0, CANCELLED: 0 });

  return (
    <div className="space-y-8 p-8 technical-grid min-h-screen">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-4xl font-display uppercase tracking-tighter text-white">Calendar_Module</h1>
          <p className="mt-1 text-muted-foreground font-mono text-sm">Monthly grid view with status-coded event lifecycle tracking.</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="grid grid-cols-4 gap-3 text-right font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            {STATUSES.map(s => (
              <div key={s}><p className="text-white text-lg font-display">{statusCounts[s]}</p><p>{s}</p></div>
            ))}
          </div>
          {canCreate && (
            <Button onClick={() => setShowCreate(true)} className="rounded-none font-mono text-xs uppercase tracking-[0.25em] shrink-0">
              <Plus className="w-4 h-4 mr-2" /> Add Event
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <Card className="brutalist-surface rounded-none overflow-hidden">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="font-display text-sm uppercase tracking-[0.25em] text-white">Monthly_Grid_View — {format(monthStart, 'MMMM yyyy')}</CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="grid grid-cols-7 gap-px bg-white/10 text-[10px] uppercase tracking-[0.3em] text-white/60">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                <div key={d} className="bg-black/60 px-3 py-2 text-center">{d}</div>
              ))}
            </div>
            <div className="mt-px grid grid-cols-7 gap-px bg-white/10">
              {calendarDays.map(day => {
                const dayEvents = eventsByDay.get(format(day, 'yyyy-MM-dd')) ?? [];
                const inMonth = isSameMonth(day, monthStart);
                return (
                  <div key={day.toISOString()} className={`min-h-[120px] bg-black/40 p-2 ${inMonth ? 'text-white' : 'text-white/25'}`}>
                    <div className={`flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.25em] ${isToday(day) ? 'text-white' : 'text-white/60'}`}>
                      <span>{format(day, 'd')}</span>
                      {isToday(day) && <span className="border border-white/20 px-1.5 py-0.5 text-[8px]">Today</span>}
                    </div>
                    <div className="mt-2 space-y-1">
                      {dayEvents.slice(0, 2).map(e => (
                        <div key={e.id} className={`border px-1.5 py-1 text-[9px] leading-tight group/ev relative ${statusStyles[e.status]}`}>
                          <p className="font-display uppercase tracking-tighter text-white truncate">{e.title}</p>
                          {e.time && <p className="flex items-center gap-0.5 font-mono text-white/80"><Clock3 className="h-2.5 w-2.5" /> {e.time}</p>}
                          {canCreate && (
                            <button onClick={() => setDeleteId(e.id)} className="absolute top-0.5 right-0.5 text-red-400 opacity-0 group-hover/ev:opacity-100 transition-opacity">
                              <Trash2 className="h-2.5 w-2.5" />
                            </button>
                          )}
                        </div>
                      ))}
                      {dayEvents.length > 2 && <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/50">+{dayEvents.length - 2}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="brutalist-surface rounded-none">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="font-display text-sm uppercase tracking-[0.25em] text-white">Upcoming_Agenda</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-5">
            {upcomingEvents.map(e => (
              <article key={e.id} className="space-y-2 border border-white/10 bg-white/5 p-4 group relative">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-display text-base uppercase tracking-tighter text-white">{e.title}</h2>
                  <Badge className={`rounded-none border ${statusStyles[e.status]}`}>{e.status}</Badge>
                </div>
                <p className="font-mono text-xs text-muted-foreground">{format(parseISO(e.date), 'EEEE, dd MMM yyyy')}</p>
                {e.venue && <p className="flex items-center gap-2 font-mono text-xs text-white/70"><MapPin className="h-3 w-3" /> {e.venue}</p>}
                {e.description && <p className="font-mono text-sm leading-relaxed text-muted-foreground line-clamp-2">{e.description}</p>}
                {canCreate && (
                  <button onClick={() => setDeleteId(e.id)} className="absolute top-3 right-3 text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </article>
            ))}
            {!upcomingEvents.length && (
              <div className="flex min-h-[180px] items-center justify-center text-center">
                <div>
                  <CalendarDays className="mx-auto h-6 w-6 text-white/40" />
                  <p className="mt-3 font-display text-sm uppercase tracking-[0.25em] text-white">No Upcoming Events</p>
                  <p className="mt-2 font-mono text-xs text-muted-foreground">Calendar entries will appear here once added.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add_Calendar_Event</DialogTitle></DialogHeader>
          <form onSubmit={form.handleSubmit(d => createMutation.mutate(d))} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-accent">Title</label>
              <input {...form.register('title')} className="w-full bg-white/5 border border-white/10 p-2.5 text-white font-mono text-sm focus:outline-none focus:border-primary" placeholder="Event title" />
              {form.formState.errors.title && <p className="text-destructive text-[10px] font-mono">{form.formState.errors.title.message}</p>}
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
                <label className="text-[10px] font-mono uppercase text-accent">Status</label>
                <select {...form.register('status')} className="w-full bg-[#0A0A0C] border border-white/10 p-2.5 text-white font-mono text-sm focus:outline-none focus:border-primary">
                  {STATUSES.map(s => <option key={s} value={s} className="bg-black">{s}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-accent">Venue</label>
                <input {...form.register('venue')} className="w-full bg-white/5 border border-white/10 p-2.5 text-white font-mono text-sm focus:outline-none focus:border-primary" placeholder="Main Hall" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-accent">Society</label>
                <select {...form.register('societyId')} className="w-full bg-[#0A0A0C] border border-white/10 p-2.5 text-white font-mono text-sm focus:outline-none focus:border-primary">
                  <option value="">Select society</option>
                  {societiesQuery.data?.map(s => <option key={s.id} value={s.id} className="bg-black">{s.shortName}</option>)}
                </select>
                {form.formState.errors.societyId && <p className="text-destructive text-[10px] font-mono">{form.formState.errors.societyId.message}</p>}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-accent">Description</label>
              <textarea {...form.register('description')} rows={3} className="w-full bg-white/5 border border-white/10 p-2.5 text-white font-mono text-sm focus:outline-none focus:border-primary resize-none" placeholder="Event description..." />
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
          <DialogHeader><DialogTitle>Confirm_Remove_Event</DialogTitle></DialogHeader>
          <p className="font-mono text-sm text-muted-foreground mb-6">This will permanently remove the calendar event.</p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 rounded-none" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" className="flex-1 rounded-none" disabled={deleteMutation.isPending} onClick={() => deleteId && deleteMutation.mutate(deleteId)}>
              {deleteMutation.isPending ? 'Removing...' : 'Remove'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarPage;
