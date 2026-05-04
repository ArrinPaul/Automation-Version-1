import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UserPlus, Trash2, RefreshCw, Search, Shield } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { normalizeCollection } from './phase4Helpers';
import { toast } from 'sonner';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

const ROLES = ['SB_FACULTY', 'SB_OB', 'SOCIETY_FACULTY', 'SOCIETY_CHAIR', 'SOCIETY_OB', 'MEMBER'] as const;

const registerSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'Minimum 6 characters'),
  name: z.string().min(2, 'Minimum 2 characters'),
  role: z.enum(ROLES),
  societyId: z.string().optional(),
});

const changeRoleSchema = z.object({
  newRole: z.enum(ROLES),
  societyId: z.string().optional(),
});

const ROLE_COLORS: Record<string, string> = {
  SB_FACULTY: 'bg-[hsl(75,100%,50%)]/20 text-[hsl(75,100%,50%)] border-[hsl(75,100%,50%)]/30',
  SB_OB: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  SOCIETY_FACULTY: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  SOCIETY_CHAIR: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  SOCIETY_OB: 'bg-white/10 text-white/70 border-white/20',
  MEMBER: 'bg-white/5 text-white/40 border-white/10',
};

const needsSociety = (r: string) => ['SOCIETY_FACULTY', 'SOCIETY_CHAIR', 'SOCIETY_OB', 'MEMBER'].includes(r);

type RegisterFormValues = z.infer<typeof registerSchema>;
type ChangeRoleValues = z.infer<typeof changeRoleSchema>;

interface SocietyOption { id: string; name: string; shortName: string; }

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  societyId?: string | null;
  society?: { id?: string; name?: string; shortName?: string } | null;
  createdAt?: string;
}

const UserManagementPage: React.FC = () => {
  const { profile } = useAuth();
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<UserRecord | null>(null);
  const [search, setSearch] = useState('');

  const usersQuery = useQuery<UserRecord[]>({
    queryKey: ['users-list'],
    queryFn: async () => {
      const res = await apiClient.get<unknown>('/auth/users');
      return normalizeCollection<UserRecord>(res.data);
    },
  });

  const societiesQuery = useQuery<SocietyOption[]>({
    queryKey: ['user-mgmt-societies'],
    queryFn: async () => {
      const res = await apiClient.get<unknown>('/societies');
      return normalizeCollection<SocietyOption>(res.data);
    },
  });

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'MEMBER' },
  });

  const editForm = useForm<ChangeRoleValues>({
    resolver: zodResolver(changeRoleSchema),
  });

  const selectedRole = form.watch('role');
  const editSelectedRole = editForm.watch('newRole');

  const createMutation = useMutation({
    mutationFn: (data: RegisterFormValues) => apiClient.post('/auth/register', {
      ...data,
      societyId: needsSociety(data.role) && data.societyId ? data.societyId : null,
    }),
    onSuccess: () => {
      toast.success('User provisioned successfully.');
      qc.invalidateQueries({ queryKey: ['users-list'] });
      setShowCreate(false);
      form.reset();
    },
    onError: (err) => {
      const msg = axios.isAxiosError(err) ? (err.response?.data?.error ?? err.response?.data?.message ?? err.message) : 'Failed to provision user';
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/auth/users/${id}`),
    onSuccess: () => {
      toast.success('User removed.');
      qc.invalidateQueries({ queryKey: ['users-list'] });
      setDeleteId(null);
    },
    onError: () => toast.error('Failed to remove user.'),
  });

  const changeRoleMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: ChangeRoleValues }) =>
      apiClient.patch('/auth/change-role', {
        userId,
        newRole: data.newRole,
        societyId: needsSociety(data.newRole) && data.societyId ? data.societyId : null,
      }),
    onSuccess: () => {
      toast.success('Role updated.');
      qc.invalidateQueries({ queryKey: ['users-list'] });
      setEditUser(null);
    },
    onError: () => toast.error('Failed to update role.'),
  });

  const users = usersQuery.data ?? [];
  const societies = societiesQuery.data ?? [];

  const filtered = users.filter(u =>
    !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()) || u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 p-8 technical-grid min-h-screen">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-display uppercase tracking-tighter text-white">User_Management</h1>
          <p className="mt-1 text-muted-foreground font-mono text-sm">Provision and manage system access accounts.</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="rounded-none font-mono text-xs uppercase tracking-[0.25em]">
          <UserPlus className="w-4 h-4 mr-2" /> Provision User
        </Button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {ROLES.map(role => {
          const count = users.filter(u => u.role === role).length;
          return (
            <Card key={role} className="bg-black/40 border-white/10 rounded-none p-4">
              <Badge className={`rounded-none border text-[10px] w-full justify-center mb-2 ${ROLE_COLORS[role]}`}>{role}</Badge>
              <p className="font-display text-2xl text-white text-center">{count}</p>
            </Card>
          );
        })}
      </div>

      {/* User Table */}
      <Card className="bg-black/40 border-white/10 rounded-none overflow-hidden">
        <CardHeader className="border-b border-white/10 flex flex-row items-center justify-between gap-4">
          <CardTitle className="font-mono text-xs uppercase tracking-[0.25em] text-accent flex items-center gap-2">
            <Shield className="w-3.5 h-3.5" /> System_Users ({filtered.length})
          </CardTitle>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="bg-white/5 border border-white/10 pl-7 pr-3 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-white/30 w-48" />
            </div>
            <button onClick={() => qc.invalidateQueries({ queryKey: ['users-list'] })} className="text-muted-foreground hover:text-white transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </CardHeader>
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="font-mono text-[10px] uppercase text-accent">Name</TableHead>
              <TableHead className="font-mono text-[10px] uppercase text-accent">Email</TableHead>
              <TableHead className="font-mono text-[10px] uppercase text-accent">Role</TableHead>
              <TableHead className="font-mono text-[10px] uppercase text-accent">Society</TableHead>
              <TableHead className="font-mono text-[10px] uppercase text-accent text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersQuery.isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i} className="border-white/5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <TableCell key={j}><div className="h-4 bg-white/5 animate-pulse rounded" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center font-mono py-8 text-muted-foreground">
                  {users.length === 0 ? 'No users found.' : 'No users match your search.'}
                </TableCell>
              </TableRow>
            ) : filtered.map((user, i) => (
              <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} className="border-white/5 hover:bg-white/5 transition-colors group">
                <TableCell className="font-mono text-sm text-white">{user.name}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{user.email}</TableCell>
                <TableCell>
                  <Badge className={`rounded-none border text-[10px] ${ROLE_COLORS[user.role] ?? 'bg-white/10 text-white'}`}>{user.role}</Badge>
                </TableCell>
                <TableCell className="font-mono text-xs text-white/70">{user.society?.shortName ?? '—'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditUser(user); editForm.reset({ newRole: user.role as typeof ROLES[number], societyId: user.societyId ?? '' }); }} className="font-mono text-[10px] uppercase text-accent hover:text-white transition-colors">Edit Role</button>
                    {user.id !== profile?.id && (
                      <button onClick={() => setDeleteId(user.id)} className="text-red-400 hover:text-red-300 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Provision_New_User</DialogTitle></DialogHeader>
          <form onSubmit={form.handleSubmit(d => createMutation.mutate(d))} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-accent">Full Name</label>
                <input {...form.register('name')} className="w-full bg-white/5 border border-white/10 p-2.5 text-white font-mono text-sm focus:outline-none focus:border-primary" placeholder="John Doe" />
                {form.formState.errors.name && <p className="text-destructive text-[10px] font-mono">{form.formState.errors.name.message}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-accent">Email</label>
                <input {...form.register('email')} type="email" className="w-full bg-white/5 border border-white/10 p-2.5 text-white font-mono text-sm focus:outline-none focus:border-primary" placeholder="user@ieee.org" />
                {form.formState.errors.email && <p className="text-destructive text-[10px] font-mono">{form.formState.errors.email.message}</p>}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-accent">Temporary Password</label>
              <input {...form.register('password')} type="password" className="w-full bg-white/5 border border-white/10 p-2.5 text-white font-mono text-sm focus:outline-none focus:border-primary" placeholder="Min. 6 characters" />
              {form.formState.errors.password && <p className="text-destructive text-[10px] font-mono">{form.formState.errors.password.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-accent">Role</label>
                <select {...form.register('role')} className="w-full bg-[#0A0A0C] border border-white/10 p-2.5 text-white font-mono text-sm focus:outline-none focus:border-primary">
                  {ROLES.map(r => <option key={r} value={r} className="bg-black">{r}</option>)}
                </select>
              </div>
              {needsSociety(selectedRole) && (
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-accent">Society</label>
                  <select {...form.register('societyId')} className="w-full bg-[#0A0A0C] border border-white/10 p-2.5 text-white font-mono text-sm focus:outline-none focus:border-primary">
                    <option value="" className="bg-black">Select Society</option>
                    {societies.map(s => <option key={s.id} value={s.id} className="bg-black">{s.shortName} — {s.name}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1 rounded-none" onClick={() => { setShowCreate(false); form.reset(); }}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending} className="flex-1 rounded-none">
                {createMutation.isPending ? 'Provisioning...' : 'Provision Account'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Change_Role — {editUser?.name}</DialogTitle></DialogHeader>
          <form onSubmit={editForm.handleSubmit(d => editUser && changeRoleMutation.mutate({ userId: editUser.id, data: d }))} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-accent">New Role</label>
              <select {...editForm.register('newRole')} className="w-full bg-[#0A0A0C] border border-white/10 p-2.5 text-white font-mono text-sm focus:outline-none focus:border-primary">
                {ROLES.map(r => <option key={r} value={r} className="bg-black">{r}</option>)}
              </select>
            </div>
            {needsSociety(editSelectedRole) && (
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-accent">Society</label>
                <select {...editForm.register('societyId')} className="w-full bg-[#0A0A0C] border border-white/10 p-2.5 text-white font-mono text-sm focus:outline-none focus:border-primary">
                  <option value="" className="bg-black">Select Society</option>
                  {societies.map(s => <option key={s.id} value={s.id} className="bg-black">{s.shortName} — {s.name}</option>)}
                </select>
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1 rounded-none" onClick={() => setEditUser(null)}>Cancel</Button>
              <Button type="submit" disabled={changeRoleMutation.isPending} className="flex-1 rounded-none">
                {changeRoleMutation.isPending ? 'Updating...' : 'Update Role'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Confirm_Remove_User</DialogTitle></DialogHeader>
          <p className="font-mono text-sm text-muted-foreground mb-6">This will permanently delete the user account from both the database and authentication system. This cannot be undone.</p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 rounded-none" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" className="flex-1 rounded-none" disabled={deleteMutation.isPending} onClick={() => deleteId && deleteMutation.mutate(deleteId)}>
              {deleteMutation.isPending ? 'Removing...' : 'Remove User'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagementPage;
