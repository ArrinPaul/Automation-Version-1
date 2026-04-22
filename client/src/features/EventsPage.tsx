import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { jsPDF } from 'jspdf';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Download, Image as ImageIcon, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import apiClient from '@/services/apiClient';
import { normalizeCollection } from './phase4Helpers';

interface EventSpeaker {
  id: string;
  name: string;
  designation?: string | null;
  organization?: string | null;
  presentationTitle?: string | null;
}

interface EventRecord {
  id: string;
  title: string;
  date: string;
  time?: string | null;
  venue?: string | null;
  type: string;
  participants: number;
  description: string;
  society?: {
    name?: string;
    shortName?: string;
  } | null;
  speakers?: EventSpeaker[];
  imageUrls?: string[];
}

const safeText = (value: string | null | undefined) => value ?? 'N/A';

const loadImageAsDataUrl = async (url: string) => {
  const response = await fetch(url, { mode: 'cors' });
  if (!response.ok) {
    throw new Error(`Image fetch failed: ${response.status}`);
  }

  const blob = await response.blob();
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Image conversion failed'));
      }
    };
    reader.onerror = () => reject(new Error('Image read failed'));
    reader.readAsDataURL(blob);
  });

  return dataUrl;
};

const addSpeakerTable = (doc: jsPDF, startY: number, speakers: EventSpeaker[]) => {
  let y = startY;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Speaker Details', 14, y);
  y += 6;

  doc.setDrawColor(180, 180, 180);
  doc.rect(14, y, 182, 8);
  doc.setFontSize(9);
  doc.text('Name', 16, y + 5);
  doc.text('Designation', 72, y + 5);
  doc.text('Organization', 128, y + 5);
  y += 8;

  doc.setFont('helvetica', 'normal');
  if (!speakers.length) {
    doc.rect(14, y, 182, 8);
    doc.text('No speakers recorded for this event.', 16, y + 5);
    y += 8;
    return y;
  }

  speakers.forEach((speaker) => {
    if (y > 270) {
      doc.addPage();
      y = 16;
    }

    doc.rect(14, y, 182, 8);
    doc.text(safeText(speaker.name).slice(0, 28), 16, y + 5);
    doc.text(safeText(speaker.designation).slice(0, 26), 72, y + 5);
    doc.text(safeText(speaker.organization).slice(0, 26), 128, y + 5);
    y += 8;
  });

  return y;
};

const addGallerySection = async (doc: jsPDF, startY: number, imageUrls: string[]) => {
  let y = startY;

  if (y > 245) {
    doc.addPage();
    y = 16;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Photo Gallery (S3/Supabase)', 14, y);
  y += 6;

  if (!imageUrls.length) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('No gallery images are attached for this event.', 14, y);
    return;
  }

  const topImages = imageUrls.slice(0, 4);
  const cellWidth = 86;
  const cellHeight = 52;

  for (let index = 0; index < topImages.length; index += 1) {
    const imageUrl = topImages[index];
    const column = index % 2;
    const row = Math.floor(index / 2);
    const x = 14 + (column * 92);
    let imageTop = y + (row * 62);

    if (imageTop + cellHeight > 280) {
      doc.addPage();
      y = 16;
      imageTop = y + (row * 62);
    }

    doc.setDrawColor(160, 160, 160);
    doc.rect(x, imageTop, cellWidth, cellHeight);

    try {
      const dataUrl = await loadImageAsDataUrl(imageUrl);
      const formatHint = dataUrl.startsWith('data:image/png') ? 'PNG' : 'JPEG';
      doc.addImage(dataUrl, formatHint, x + 1, imageTop + 1, cellWidth - 2, cellHeight - 8);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`Image ${index + 1}`, x + 2, imageTop + cellHeight - 2);
    } catch {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('Image preview unavailable', x + 2, imageTop + 6);
      doc.text(imageUrl.slice(0, 58), x + 2, imageTop + 11);
    }
  }
};

const generateEventPdf = async (event: EventRecord) => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('IEEE Student Branch Christ University', 14, 14);
  doc.setFontSize(11);
  doc.text('Professional Event Report', 14, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toISOString()}`, 14, 26);
  doc.text(`Society: ${event.society?.shortName ?? event.society?.name ?? 'N/A'}`, 14, 32);

  doc.setDrawColor(120, 120, 120);
  doc.line(14, 35, 196, 35);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Event Overview', 14, 42);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Title: ${event.title}`, 14, 48);
  doc.text(`Type: ${event.type}`, 14, 54);
  doc.text(`Date: ${format(new Date(event.date), 'dd MMM yyyy')}`, 14, 60);
  doc.text(`Time: ${safeText(event.time)}`, 100, 60);
  doc.text(`Venue: ${safeText(event.venue)}`, 14, 66);
  doc.text(`Participants: ${event.participants}`, 100, 66);

  const descriptionLines = doc.splitTextToSize(`Description: ${event.description}`, 182);
  doc.text(descriptionLines, 14, 72);
  let y = 72 + (descriptionLines.length * 5) + 4;

  y = addSpeakerTable(doc, y, event.speakers ?? []);
  await addGallerySection(doc, y + 4, event.imageUrls ?? []);

  const fileDate = new Date(event.date).toISOString().slice(0, 10);
  const normalizedTitle = event.title.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-');
  doc.save(`event-report-${normalizedTitle}-${fileDate}.pdf`);
};

const EventsPage: React.FC = () => {
  const eventsQuery = useQuery<EventRecord[]>({
    queryKey: ['events-page'],
    queryFn: async () => {
      const response = await apiClient.get<unknown>('/events');
      return normalizeCollection<EventRecord>(response.data);
    },
  });

  const events = eventsQuery.data ?? [];

  return (
    <div className="space-y-8 p-8 technical-grid min-h-screen">
      <div>
        <h1 className="text-4xl font-display uppercase tracking-tighter text-white">Events_Module</h1>
        <p className="mt-3 text-muted-foreground font-mono text-sm">
          Professional event report export powered by jsPDF with speaker tables and gallery sections.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {events.map((event) => (
          <Card key={event.id} className="brutalist-surface rounded-none overflow-hidden">
            <CardHeader className="border-b border-white/10 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="font-display text-lg uppercase tracking-tighter text-white">{event.title}</CardTitle>
                <Badge className="rounded-none border border-white/20 bg-white/5 text-white/80">{event.type}</Badge>
              </div>
              <div className="flex flex-wrap gap-3 font-mono text-[10px] uppercase tracking-[0.25em] text-white/60">
                <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {format(new Date(event.date), 'dd MMM yyyy')}</span>
                <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {safeText(event.venue)}</span>
                <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {event.participants}</span>
                <span className="inline-flex items-center gap-1"><ImageIcon className="h-3 w-3" /> {(event.imageUrls ?? []).length}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
              <p className="font-mono text-sm leading-relaxed text-muted-foreground">{event.description}</p>

              <div className="font-mono text-xs text-white/70">
                Speakers: {(event.speakers ?? []).length} • Society: {event.society?.shortName ?? event.society?.name ?? 'N/A'}
              </div>

              <Button
                type="button"
                className="rounded-none border border-white bg-white text-black text-[10px] uppercase tracking-[0.25em] hover:bg-white/90"
                onClick={() => {
                  void generateEventPdf(event)
                    .then(() => {
                      toast.success('Event report PDF generated successfully.');
                    })
                    .catch(() => {
                      toast.error('Unable to generate event report PDF.');
                    });
                }}
              >
                <Download className="mr-2 h-3 w-3" /> Export Event PDF
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {!events.length && !eventsQuery.isLoading && (
        <Card className="brutalist-surface rounded-none">
          <CardContent className="py-12 text-center">
            <p className="font-display text-lg uppercase tracking-[0.25em] text-white">No Events Found</p>
            <p className="mt-2 font-mono text-sm text-muted-foreground">Create events to enable professional report generation.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EventsPage;