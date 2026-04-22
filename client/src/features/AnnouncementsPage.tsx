import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Send, MessageSquareQuote, Users2, Clock3, AtSign } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNowStrict, parseISO } from 'date-fns';
import { normalizeCollection, normalizeRecord } from './phase4Helpers';

interface AnnouncementRecord {
  id: string;
  title: string;
  message: string;
  targetAudience: 'ALL' | 'LEADERSHIP' | 'SOCIETY';
  createdAt?: string;
  sender?: {
    name?: string;
    role?: string;
  } | null;
}

interface RecipientResponse {
  announcementId: string;
  targetAudience: string;
  emails: string[];
  count: number;
}

const AnnouncementsPage: React.FC = () => {
  const { profile } = useAuth();
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<string>('');
  const [subject, setSubject] = useState('IEEE Society Broadcast');
  const [body, setBody] = useState('');

  const announcementsQuery = useQuery<AnnouncementRecord[]>({
    queryKey: ['announcements-page', profile?.role, profile?.societyId],
    queryFn: async () => {
      const response = await apiClient.get<unknown>('/announcements');
      return normalizeCollection<AnnouncementRecord>(response.data);
    },
  });

  const announcements = announcementsQuery.data ?? [];

  useEffect(() => {
    if (!selectedAnnouncementId && announcements.length > 0) {
      setSelectedAnnouncementId(announcements[0].id);
    }
  }, [announcements, selectedAnnouncementId]);

  const selectedAnnouncement = useMemo(
    () => announcements.find((announcement) => announcement.id === selectedAnnouncementId) ?? announcements[0] ?? null,
    [announcements, selectedAnnouncementId]
  );

  useEffect(() => {
    if (!selectedAnnouncement) {
      return;
    }

    setSubject(selectedAnnouncement.title);
    setBody(selectedAnnouncement.message);
  }, [selectedAnnouncement]);

  const recipientsQuery = useQuery<RecipientResponse | null>({
    queryKey: ['announcement-recipients', selectedAnnouncement?.id],
    queryFn: async () => {
      if (!selectedAnnouncement?.id) {
        return null;
      }

      const response = await apiClient.get<unknown>(`/announcements/${selectedAnnouncement.id}/recipients`);
      return normalizeRecord<RecipientResponse>(response.data);
    },
    enabled: Boolean(selectedAnnouncement?.id),
  });

  const bccList = useMemo(() => {
    return (recipientsQuery.data?.emails ?? []).join(',');
  }, [recipientsQuery.data]);

  const buildMailtoLink = () => {
    const params = new URLSearchParams();
    if (bccList) {
      params.set('bcc', bccList);
    }
    if (subject.trim()) {
      params.set('subject', subject.trim());
    }
    if (body.trim()) {
      params.set('body', body.trim());
    }

    return `mailto:?${params.toString()}`;
  };

  const copyBccList = async () => {
    if (!bccList) {
      toast.error('No recipient emails were resolved for this announcement.');
      return;
    }

    try {
      await globalThis.navigator.clipboard.writeText(bccList);
      toast.success('BCC list copied to clipboard.');
    } catch {
      toast.error('Clipboard access is unavailable in this browser context.');
    }
  };

  const openComposer = () => {
    if (!bccList) {
      toast.error('No recipient emails were resolved for this announcement.');
      return;
    }

    globalThis.location.href = buildMailtoLink();
  };

  return (
    <div className="space-y-8 p-8 technical-grid min-h-screen">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-4xl font-display uppercase tracking-tighter text-white">Announcements_Module</h1>
          <p className="mt-3 text-muted-foreground font-mono text-sm">
            Reverse-chronological branch communication feed with recipient-aware broadcast actions.
          </p>
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/60">
          {recipientsQuery.data?.count ?? 0} recipients resolved
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.9fr]">
        <Card className="brutalist-surface rounded-none">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="font-display text-sm uppercase tracking-[0.25em] text-white">Announcement_Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-5">
            {announcements.map((announcement, index) => {
              const active = announcement.id === selectedAnnouncement?.id;

              return (
                <article
                  key={announcement.id}
                  className={`relative cursor-pointer pl-6 transition-colors ${active ? 'opacity-100' : 'opacity-80 hover:opacity-100'}`}
                  onClick={() => setSelectedAnnouncementId(announcement.id)}
                >
                  {index !== announcements.length - 1 && <div className="absolute left-[7px] top-4 h-full w-px bg-white/10" />}
                  <div className={`absolute left-0 top-1.5 h-3 w-3 rounded-full border ${active ? 'border-[#00629B] bg-[#00629B]' : 'border-white/30 bg-white/70'}`} />
                  <div className={`space-y-2 border p-4 ${active ? 'border-[#00629B]/60 bg-[#00629B]/10' : 'border-white/10 bg-white/5'}`}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h2 className="font-display text-lg uppercase tracking-tighter text-white">{announcement.title}</h2>
                      <Badge className="rounded-none border border-white/10 bg-white/5 text-white/80">{announcement.targetAudience}</Badge>
                    </div>
                    <p className="font-mono text-sm leading-relaxed text-muted-foreground">{announcement.message}</p>
                    <div className="flex flex-wrap items-center gap-4 font-mono text-[10px] uppercase tracking-[0.25em] text-white/50">
                      <span className="inline-flex items-center gap-1"><MessageSquareQuote className="h-3 w-3" /> {announcement.sender?.name ?? 'System'}</span>
                      <span className="inline-flex items-center gap-1"><AtSign className="h-3 w-3" /> {announcement.sender?.role ?? 'Broadcast'}</span>
                      {announcement.createdAt && <span className="inline-flex items-center gap-1"><Clock3 className="h-3 w-3" /> {formatDistanceToNowStrict(parseISO(announcement.createdAt), { addSuffix: true })}</span>}
                    </div>
                  </div>
                </article>
              );
            })}

            {!announcements.length && (
              <div className="border border-white/10 bg-white/5 p-6 text-center">
                <p className="font-display text-sm uppercase tracking-[0.25em] text-white">No Announcements</p>
                <p className="mt-2 font-mono text-xs text-muted-foreground">Broadcast messages will appear here once the branch feed is populated.</p>
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
              <label htmlFor="phase4-mail-subject" className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/60">Subject</label>
              <input
                id="phase4-mail-subject"
                value={subject}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSubject(event.target.value)}
                className="w-full rounded-none border border-white/10 bg-black/30 px-3 py-2 font-mono text-sm text-white outline-none transition-colors focus:border-white/30"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="phase4-mail-body" className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/60">Message Body</label>
              <textarea
                id="phase4-mail-body"
                value={body}
                onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => setBody(event.target.value)}
                className="min-h-[180px] w-full rounded-none border border-white/10 bg-black/30 px-3 py-2 font-mono text-sm text-white outline-none transition-colors focus:border-white/30"
              />
            </div>

            <div className="rounded-none border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/50">Announcement Audience</p>
                  <p className="mt-1 font-display text-sm text-white">{selectedAnnouncement?.targetAudience ?? 'UNSCOPED'}</p>
                </div>
                <Users2 className="h-4 w-4 text-white/70" />
              </div>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.25em] text-white/50">
                {recipientsQuery.isLoading ? 'Resolving recipients...' : `${recipientsQuery.data?.count ?? 0} emails discovered`}
              </p>
              <p className="mt-3 break-all font-mono text-[10px] leading-relaxed text-white/60">
                {bccList || 'No recipient emails available.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button type="button" variant="outline" className="rounded-none border-white/10 bg-transparent text-[10px] uppercase tracking-[0.25em] text-white hover:bg-white/5" onClick={copyBccList}>
                <Copy className="mr-2 h-3 w-3" /> Copy BCC
              </Button>
              <Button type="button" className="rounded-none border border-white bg-white text-black text-[10px] uppercase tracking-[0.25em] hover:bg-white/90" onClick={openComposer}>
                <Send className="mr-2 h-3 w-3" /> Open Mail Client
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnnouncementsPage;
