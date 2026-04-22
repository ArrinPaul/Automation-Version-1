import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, isSameMonth, parseISO, startOfMonth, startOfWeek, endOfMonth, endOfWeek, eachDayOfInterval, isToday } from 'date-fns';
import { CalendarDays, Clock3, MapPin } from 'lucide-react';
import { normalizeCollection } from './phase4Helpers';

type CalendarStatus = 'PROPOSED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

interface CalendarEventRecord {
  id: string;
  title: string;
  date: string;
  time?: string | null;
  venue?: string | null;
  description?: string | null;
  status: CalendarStatus;
}

const statusStyles: Record<CalendarStatus, string> = {
  PROPOSED: 'border-amber-500/30 bg-amber-500/15 text-amber-300',
  CONFIRMED: 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300',
  COMPLETED: 'border-sky-500/30 bg-sky-500/15 text-sky-300',
  CANCELLED: 'border-red-500/30 bg-red-500/15 text-red-300',
};

const CalendarPage: React.FC = () => {
  const { profile } = useAuth();

  const calendarQuery = useQuery<CalendarEventRecord[]>({
    queryKey: ['calendar-page', profile?.role, profile?.societyId],
    queryFn: async () => {
      const response = await apiClient.get<unknown>('/calendar-events');
      return normalizeCollection<CalendarEventRecord>(response.data);
    },
  });

  const events = calendarQuery.data ?? [];
  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = useMemo(
    () => eachDayOfInterval({ start: calendarStart, end: calendarEnd }),
    [calendarStart, calendarEnd]
  );

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEventRecord[]>();

    events.forEach((event) => {
      const dayKey = format(parseISO(event.date), 'yyyy-MM-dd');
      const dayEvents = map.get(dayKey) ?? [];
      dayEvents.push(event);
      map.set(dayKey, dayEvents);
    });

    return map;
  }, [events]);

  const upcomingEvents = useMemo(() => {
    const today = new Date();
    return events
      .filter((event) => parseISO(event.date) >= today)
      .sort((left, right) => parseISO(left.date).getTime() - parseISO(right.date).getTime())
      .slice(0, 6);
  }, [events]);

  const statusCounts = events.reduce<Record<CalendarStatus, number>>((accumulator, event) => {
    accumulator[event.status] += 1;
    return accumulator;
  }, { PROPOSED: 0, CONFIRMED: 0, COMPLETED: 0, CANCELLED: 0 });

  return (
    <div className="space-y-8 p-8 technical-grid min-h-screen">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-4xl font-display uppercase tracking-tighter text-white">Calendar_Module</h1>
          <p className="mt-3 text-muted-foreground font-mono text-sm">
            Monthly grid view with status-coded event lifecycle tracking.
          </p>
        </div>
        <div className="grid grid-cols-4 gap-3 text-right font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          {(['PROPOSED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as CalendarStatus[]).map((status) => (
            <div key={status}>
              <p className="text-white text-lg font-display">{statusCounts[status]}</p>
              <p>{status}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <Card className="brutalist-surface rounded-none overflow-hidden">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="font-display text-sm uppercase tracking-[0.25em] text-white">Monthly_Grid_View</CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="grid grid-cols-7 gap-px bg-white/10 text-[10px] uppercase tracking-[0.3em] text-white/60">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div key={day} className="bg-black/60 px-3 py-2 text-center">{day}</div>
              ))}
            </div>

            <div className="mt-px grid grid-cols-7 gap-px bg-white/10">
              {calendarDays.map((day) => {
                const dayEvents = eventsByDay.get(format(day, 'yyyy-MM-dd')) ?? [];
                const inCurrentMonth = isSameMonth(day, monthStart);

                return (
                  <div
                    key={day.toISOString()}
                    className={`min-h-[150px] bg-black/40 p-3 ${inCurrentMonth ? 'text-white' : 'text-white/25'}`}
                  >
                    <div className={`flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.25em] ${isToday(day) ? 'text-white' : 'text-white/60'}`}>
                      <span>{format(day, 'd')}</span>
                      {isToday(day) && <span className="border border-white/20 px-2 py-0.5">Today</span>}
                    </div>

                    <div className="mt-3 space-y-2">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div key={event.id} className={`border px-2 py-2 text-[10px] leading-tight ${statusStyles[event.status]}`}>
                          <p className="font-display uppercase tracking-tighter text-white">{event.title}</p>
                          {event.time && <p className="mt-1 flex items-center gap-1 font-mono text-white/80"><Clock3 className="h-3 w-3" /> {event.time}</p>}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/50">+{dayEvents.length - 2} more</p>
                      )}
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
            {upcomingEvents.map((event) => (
              <article key={event.id} className="space-y-2 border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-display text-base uppercase tracking-tighter text-white">{event.title}</h2>
                  <Badge className={`rounded-none border ${statusStyles[event.status]}`}>{event.status}</Badge>
                </div>
                <p className="font-mono text-xs text-muted-foreground">{format(parseISO(event.date), 'EEEE, dd MMM yyyy')}</p>
                {event.venue && <p className="flex items-center gap-2 font-mono text-xs text-white/70"><MapPin className="h-3 w-3" /> {event.venue}</p>}
                {event.description && <p className="font-mono text-sm leading-relaxed text-muted-foreground">{event.description}</p>}
              </article>
            ))}

            {!upcomingEvents.length && (
              <div className="flex min-h-[180px] items-center justify-center text-center">
                <div>
                  <CalendarDays className="mx-auto h-6 w-6 text-white/40" />
                  <p className="mt-3 font-display text-sm uppercase tracking-[0.25em] text-white">No Upcoming Events</p>
                  <p className="mt-2 font-mono text-xs text-muted-foreground">Calendar entries will appear here once the scoped feed is populated.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CalendarPage;
