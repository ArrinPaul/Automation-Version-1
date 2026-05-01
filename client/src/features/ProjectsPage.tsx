import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import apiClient from '@/services/apiClient';
import { normalizeCollection, formatCurrency } from './phase4Helpers';

interface ProjectRecord {
  id: string;
  title: string;
  category: string;
  sanctioningBody: string;
  amountSanctioned: string | number;
  startDate: string;
  status: 'PROPOSED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED' | 'ANNOUNCED' | 'AWARDED';
  description: string;
  society?: { name?: string; shortName?: string } | null;
}

const STATUS_COLORS: Record<string, string> = {
  PROPOSED: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  ONGOING: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  COMPLETED: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  CANCELLED: 'bg-red-500/20 text-red-300 border-red-500/30',
  ANNOUNCED: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  AWARDED: 'bg-[hsl(75,100%,50%)]/20 text-[hsl(75,100%,50%)] border-[hsl(75,100%,50%)]/30',
};

const CATEGORY_LABELS: Record<string, string> = {
  TECHNICAL_PROJECT: 'Technical Project',
  TRAVEL_GRANT: 'Travel Grant',
  SCHOLARSHIP: 'Scholarship',
  AWARD: 'Award',
};

const ProjectsPage: React.FC = () => {
  const projectsQuery = useQuery<ProjectRecord[]>({
    queryKey: ['projects-page'],
    queryFn: async () => {
      const response = await apiClient.get<unknown>('/projects');
      return normalizeCollection<ProjectRecord>(response.data);
    },
  });

  const projects = projectsQuery.data ?? [];

  const stats = useMemo(() => {
    const active = projects.filter((p) => p.status === 'ONGOING' || p.status === 'PROPOSED').length;
    const completed = projects.filter((p) => p.status === 'COMPLETED' || p.status === 'AWARDED').length;
    const total = projects.reduce(
      (sum, p) => sum + Number.parseFloat(String(p.amountSanctioned ?? 0)),
      0
    );
    return { active, completed, total };
  }, [projects]);

  return (
    <div className="space-y-8 p-8 technical-grid min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between"
      >
        <div>
          <h1 className="text-4xl font-display uppercase tracking-tighter text-white">Projects_Module</h1>
          <p className="mt-3 text-muted-foreground font-mono text-sm">
            Grants, scholarships, travel awards, and technical projects registry.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4 text-right font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          <div>
            <p className="text-white text-lg font-display flex items-center gap-1 justify-end">
              <Clock className="w-4 h-4" />{stats.active}
            </p>
            <p>Active</p>
          </div>
          <div>
            <p className="text-white text-lg font-display flex items-center gap-1 justify-end">
              <CheckCircle className="w-4 h-4" />{stats.completed}
            </p>
            <p>Completed</p>
          </div>
          <div>
            <p className="text-white text-lg font-display flex items-center gap-1 justify-end">
              <TrendingUp className="w-4 h-4" />{formatCurrency(stats.total)}
            </p>
            <p>Sanctioned</p>
          </div>
        </div>
      </motion.div>

      {projectsQuery.isLoading && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 2xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-white/5 border border-white/10 animate-pulse" />
          ))}
        </div>
      )}

      {!projectsQuery.isLoading && projects.length === 0 && (
        <Card className="brutalist-surface rounded-none">
          <CardContent className="py-12 text-center">
            <Award className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="font-display text-lg uppercase tracking-[0.25em] text-white">No Projects Found</p>
            <p className="mt-2 font-mono text-sm text-muted-foreground">
              Projects and grants will appear here once added.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 2xl:grid-cols-3">
        {projects.map((project, i) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Card className="brutalist-surface rounded-none overflow-hidden h-full flex flex-col">
              <CardHeader className="border-b border-white/10 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="font-display text-base uppercase tracking-tighter text-white leading-tight">
                    {project.title}
                  </CardTitle>
                  <Badge className={`rounded-none border text-[10px] shrink-0 ${STATUS_COLORS[project.status] ?? 'bg-white/10 text-white'}`}>
                    {project.status}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-white/60">
                  <span>{CATEGORY_LABELS[project.category] ?? project.category}</span>
                  {project.society?.shortName && <span>• {project.society.shortName}</span>}
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-5 flex-1 flex flex-col">
                <p className="font-mono text-sm text-muted-foreground leading-relaxed flex-1">
                  {project.description}
                </p>
                <div className="grid grid-cols-2 gap-3 font-mono text-xs text-muted-foreground mt-auto">
                  <div className="border border-white/10 bg-white/5 p-3">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-white/50">Sanctioned</p>
                    <p className="mt-1 text-white font-display">{formatCurrency(project.amountSanctioned)}</p>
                  </div>
                  <div className="border border-white/10 bg-white/5 p-3">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-white/50">Start Date</p>
                    <p className="mt-1 text-white font-display text-sm">
                      {format(new Date(project.startDate), 'dd MMM yyyy')}
                    </p>
                  </div>
                </div>
                <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
                  Body: {project.sanctioningBody}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsPage;