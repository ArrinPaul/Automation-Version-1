import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Award, TrendingUp, Clock, CheckCircle, Plus, Trash2, Search, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import apiClient from '@/services/apiClient';
import { normalizeCollection, formatCurrency } from './phase4Helpers';
import { useAuth } from '@/context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import axios from 'axios';

interface ProjectRecord {
  id: string; title: string; category: string; sanctioningBody: string;
  amountSanctioned: string | number; startDate: string;
  status: 'PROPOSED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED' | 'ANNOUNCED' | 'AWARDED';
  description: string;
  society?: { name?: string; shortName?: string } | null;
}
interface SocietyOption { id: string; name: string; shortName: string; }

const STATUS_COLORS: Record<string, string> = {
  PROPOSED: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  ONGOING: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  COMPLETED: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  CANCELLED: 'bg-red-500/20 text-red-300 border-red-500/30',
  ANNOUNCED: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  AWARDED: 'bg-[hsl(75,100%,50%)]/20 text-[hsl(75,100%,50%)] border-[hsl(75,100%,50%)]/30',
};

const CATEGORIES = ['TECHNICAL_PROJECT', 'TRAVEL_GRANT', 'SCHOLARSHIP', 'AWARD'] as const;
const STATUSES = ['PROPOSED', 'ONGOING', 'COMPLETED', 'CANCELLED', 'ANNOUNCED', 'AWARDED'] as const;
const CATEGORY_LABELS: Record<string, string> = { TECHNICAL_PROJECT: 'Technical Project', TRAVEL_GRANT: 'Travel Grant', SCHOLARSHIP: 'Scholarship', AWARD: 'Award' };

const projectSchema = z.object({
  title: z.string().min(1, 'Required'),
  category: z.enum(CATEGORIES),
  sanctioningBody: z.string().min(1, 'Required'),
  amountSanctioned: z.string().min(1, 'Required').refine(v => !isNaN(parseFloat(v)) && parseFloat(v) >= 0, 'Must be non-negative'),
  startDate: z.string().min(1, 'Required'),
  status: z.enum(STATUSES),
  description: z.string().min(1, 'Required'),
  societyId: z.string().uuid('Select a society'),
});
type ProjectFormValues = z.infer<typeof projectSchema>;

const ProjectsPage: React.FC = () => {
  const { profile } = useAuth();
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editProject, setEditProject] = useState<ProjectRecord | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const canCreate = ['SB_FACULTY', 'SB_OB', 'SOCIETY_FACULTY', 'SOCIETY_CHAIR', 'SOCIETY_OB'].includes(profile?.role ?? '');

  const projectsQuery = useQuery<ProjectRecord[]>({
    queryKey: ['projects-page'],
    queryFn: async () => {
      const res = await apiClient.get<unknown>('/projects');
      return normalizeCollection<ProjectRecord>(res.data);
    },
  });

  const societiesQuery = useQuery<SocietyOption[]>({
    queryKey: ['societies-for-projects'],
    queryFn: async () => {
      const res = await apiClient.get<unknown>('/societies');
      return normalizeCollection<SocietyOption>(res.data);
    },
    enabled: canCreate,
  });

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: { category: 'TECHNICAL_PROJECT', status: 'PROPOSED', startDate: new Date().toISOString().slice(0, 10), amountSanctioned: '0' },
  });

  const editForm = useForm<ProjectFormValues>({ resolver: zodResolver(projectSchema) });

  const createMutation = useMutation({
    mutationFn: (data: ProjectFormValues) => apiClient.post('/projects', {
      ...data,
      amountSanctioned: parseFloat(data.amountSanctioned),
      startDate: new Date(data.startDate).toISOString(),
    }),
    onSuccess: () => {
      toast.success('Project created.');
      qc.invalidateQueries({ queryKey: ['projects-page'] });
      setShowCreate(false);
      form.reset();
    },
    onError: (err) => {
      const msg = axios.isAxiosError(err) ? (err.response?.data?.message ?? err.message) : 'Failed to create project';
      toast.error(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProjectFormValues }) => apiClient.put(`/projects/${id}`, {
      ...data,
      amountSanctioned: parseFloat(data.amountSanctioned),
      startDate: new Date(data.startDate).toISOString(),
    }),
    onSuccess: () => {
      toast.success('Project updated.');
      qc.invalidateQueries({ queryKey: ['projects-page'] });
      setEditProject(null);
    },
    onError: (err) => {
      const msg = axios.isAxiosError(err) ? (err.response?.data?.message ?? err.message) : 'Failed to update project';
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/projects/${id}`),
    onSuccess: () => {
      toast.success('Project deleted.');
      qc.invalidateQueries({ queryKey: ['projects-page'] });
      setDeleteId(null);
    },
    onError: () => toast.error('Failed to delete project.'),
  });

  const openEdit = (p: ProjectRecord) => {
    setEditProject(p);
    editForm.reset({
      title: p.title, category: p.category as typeof CATEGORIES[number],
      sanctioningBody: p.sanctioningBody, amountSanctioned: String(p.amountSanctioned),
      startDate: p.startDate.slice(0, 10), status: p.status,
      description: p.description, societyId: '',
    });
  };

  const projects = projectsQuery.data ?? [];
  const filtered = useMemo(() => projects.filter(p => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.sanctioningBody.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchSearch && matchStatus;
  }), [projects, search, statusFilter]);

  const stats = useMemo(() => ({
    active: projects.filter(p => p.status === 'ONGOING' || p.status === 'PROPOSED').length,
    completed: projects.filter(p => p.status === 'COMPLETED' || p.status === 'AWARDED').length,
    total: projects.reduce((s, p) => s + parseFloat(String(p.amountSanctioned ?? 0)), 0),
  }), [projects]);

  const ProjectForm = ({ f, onSubmit, isPending, onCancel }: { f: ReturnType<typeof useForm<ProjectFormValues>>; onSubmit: (d: ProjectFormValues) => void; isPending: boolean; onCancel: () => void }) => (
    <form onSubmit={f.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <label className="text-[10px] font-mono uppercase text-accent">Title</label>
        <input {...f.register('title')} className="w-full bg-white/5 border border-white/10 p-2.5 text-white font-mono text-sm focus:outline-none focus:border-primary" placeholder="Project title" />
        {f.formState.errors.title && <p className="text-destructive text-[10px] font-mono">{f.formState.errors.title.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-mono uppercase text-accent">Category</label>
          <select {...f.register('category')} className="w-full bg-[#0A0A0C] border border-white/10 p-2.5 text-white font-mono text-sm focus:outline-none focus:border-primary">
            {CATEGORIES.map(c => <option key={c} value={c} className="bg-black">{CATEGORY_LABELS[c]}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-mono uppercase text-accent">Status</label>
          <select {...f.register('status')} className="w-full bg-[#0A0A0C] border border-white/10 p-2.5 text-white font-mono text-sm focus:outline-none focus:border-primary">
            {STATUSES.map(s => <option key={s} value={s} className="bg-black">{s}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-mono uppercase text-accent">Sanctioning Body</label>
          <input {...f.register('sanctioningBody')} className="w-full bg-white/5 border border-white/10 p-2.5 text-white font-mono text-sm focus:outline-none focus:border-primary" placeholder="IEEE HQ" />
          {f.formState.errors.sanctioningBody && <p className="text-destructive text-[10px] font-mono">{f.formState.errors.sanctioningBody.message}</p>}
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-mono uppercase text-accent">Amount Sanctioned (₹)</label>
          <input {...f.register('amountSanctioned')} className="w-full bg-white/5 border border-white/10 p-2.5 text-white font-mono text-sm focus:outline-none focus:border-primary" placeholder="0" />
          {f.formState.errors.amountSanctioned && <p className="text-destructive text-[10px] font-mono">{f.formState.errors.amountSanctioned.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-mono uppercase text-accent">Start Date</label>
          <input {...f.register('startDate')} type="date" className="w-full bg-[#0A0A0C] border border-white/10 p-2.5 text-white font-mono text-sm focus:outline-none focus:border-primary" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-mono uppercase text-accent">Society</label>
          <select {...f.register('societyId')} className="w-full bg-[#0A0A0C] border border-white/10 p-2.5 text-white font-mono text-sm focus:outline-none focus:border-primary">
            <option value="">Select society</option>
            {societiesQuery.data?.map(s => <option key={s.id} value={s.id} className="bg-black">{s.shortName}</option>)}
          </select>
          {f.formState.errors.societyId && <p className="text-destructive text-[10px] font-mono">{f.formState.errors.societyId.message}</p>}
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-[10px] font-mono uppercase text-accent">Description</label>
        <textarea {...f.register('description')} rows={3} className="w-full bg-white/5 border border-white/10 p-2.5 text-white font-mono text-sm focus:outline-none focus:border-primary resize-none" placeholder="Project description..." />
        {f.formState.errors.description && <p className="text-destructive text-[10px] font-mono">{f.formState.errors.description.message}</p>}
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" className="flex-1 rounded-none" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isPending} className="flex-1 rounded-none">{isPending ? 'Saving...' : 'Save Project'}</Button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6 p-8 technical-grid min-h-screen">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-4xl font-display uppercase tracking-tighter text-white">Projects_Module</h1>
          <p className="mt-1 text-muted-foreground font-mono text-sm">Grants, scholarships, travel awards, and technical projects.</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="grid grid-cols-3 gap-4 text-right font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            <div><p className="text-white text-lg font-display flex items-center gap-1 justify-end"><Clock className="w-4 h-4" />{stats.active}</p><p>Active</p></div>
            <div><p className="text-white text-lg font-display flex items-center gap-1 justify-end"><CheckCircle className="w-4 h-4" />{stats.completed}</p><p>Done</p></div>
            <div><p className="text-white text-lg font-display flex items-center gap-1 justify-end"><TrendingUp className="w-4 h-4" />{formatCurrency(stats.total)}</p><p>Total</p></div>
          </div>
          {canCreate && (
            <Button onClick={() => setShowCreate(true)} className="rounded-none font-mono text-xs uppercase tracking-[0.25em] shrink-0">
              <Plus className="w-4 h-4 mr-2" /> New Project
            </Button>
          )}
        </div>
      </motion.div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..." className="w-full bg-white/5 border border-white/10 pl-8 pr-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-white/30" />
        </div>
        <div className="flex gap-0 border border-white/10">
          {['ALL', ...STATUSES].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors ${statusFilter === s ? 'bg-white text-black' : 'text-muted-foreground hover:text-white'}`}>{s}</button>
          ))}
        </div>
      </div>

      {projectsQuery.isLoading && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 2xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-48 bg-white/5 border border-white/10 animate-pulse" />)}
        </div>
      )}

      {!projectsQuery.isLoading && filtered.length === 0 && (
        <Card className="brutalist-surface rounded-none">
          <CardContent className="py-12 text-center">
            <Award className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="font-display text-lg uppercase tracking-[0.25em] text-white">{projects.length === 0 ? 'No Projects Found' : 'No Projects Match Filters'}</p>
            <p className="mt-2 font-mono text-sm text-muted-foreground">{projects.length === 0 ? 'Create your first project to get started.' : 'Try adjusting your filters.'}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 2xl:grid-cols-3">
        {filtered.map((project, i) => (
          <motion.div key={project.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card className="brutalist-surface rounded-none overflow-hidden h-full flex flex-col group">
              <CardHeader className="border-b border-white/10 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="font-display text-base uppercase tracking-tighter text-white leading-tight">{project.title}</CardTitle>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge className={`rounded-none border text-[10px] ${STATUS_COLORS[project.status] ?? 'bg-white/10 text-white'}`}>{project.status}</Badge>
                    {canCreate && (
                      <>
                        <button onClick={() => openEdit(project)} className="text-muted-foreground hover:text-white transition-colors opacity-0 group-hover:opacity-100 p-0.5"><Pencil className="h-3 w-3" /></button>
                        <button onClick={() => setDeleteId(project.id)} className="text-red-400 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100 p-0.5"><Trash2 className="h-3 w-3" /></button>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-white/60">
                  <span>{CATEGORY_LABELS[project.category] ?? project.category}</span>
                  {project.society?.shortName && <span>• {project.society.shortName}</span>}
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-5 flex-1 flex flex-col">
                <p className="font-mono text-sm text-muted-foreground leading-relaxed flex-1 line-clamp-3">{project.description}</p>
                <div className="grid grid-cols-2 gap-3 font-mono text-xs text-muted-foreground mt-auto">
                  <div className="border border-white/10 bg-white/5 p-3">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-white/50">Sanctioned</p>
                    <p className="mt-1 text-white font-display">{formatCurrency(project.amountSanctioned)}</p>
                  </div>
                  <div className="border border-white/10 bg-white/5 p-3">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-white/50">Start Date</p>
                    <p className="mt-1 text-white font-display text-sm">{format(new Date(project.startDate), 'dd MMM yyyy')}</p>
                  </div>
                </div>
                <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">Body: {project.sanctioningBody}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Create_New_Project</DialogTitle></DialogHeader>
          <ProjectForm f={form} onSubmit={d => createMutation.mutate(d)} isPending={createMutation.isPending} onCancel={() => { setShowCreate(false); form.reset(); }} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editProject} onOpenChange={() => setEditProject(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit_Project — {editProject?.title}</DialogTitle></DialogHeader>
          <ProjectForm f={editForm} onSubmit={d => editProject && updateMutation.mutate({ id: editProject.id, data: d })} isPending={updateMutation.isPending} onCancel={() => setEditProject(null)} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Confirm_Delete_Project</DialogTitle></DialogHeader>
          <p className="font-mono text-sm text-muted-foreground mb-6">This will permanently delete the project record.</p>
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

export default ProjectsPage;
